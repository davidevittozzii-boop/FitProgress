// ==================== SEZIONE REPORT PERSONALIZZABILE ====================
const reportState = {
    range: '30', // '7' | '30' | '90' | 'all' | 'custom'
    customStart: '',
    customEnd: '',
    selectedWorkoutDate: null,
    modules: {
        costanza: true,
        allenamento: true,
        carichi: true,
        misure: true,
        alimentazione: true
    }
};

let reportRadarChart = null;
let lastComputedReport = null;

// Scala Badge Volume Storico (calibrata su ~8-9 mesi di allenamento costante per arrivare a Stellare)
const VOLUME_BADGES = [
    { id: 'legno', name: 'Legno', minKg: 0, icon: '🪵', color: '#a8a29e', bg: 'from-stone-700 to-stone-900', border: 'border-stone-500/50', desc: 'Le fondamenta: ogni grande fisico parte dalla prima serie.' },
    { id: 'bronzo', name: 'Bronzo', minKg: 25000, icon: '🥉', color: '#d97706', bg: 'from-amber-800/80 to-stone-900', border: 'border-amber-600/50', desc: '~1 mese di spinta costante. Hai rotto il ghiaccio!' },
    { id: 'argento', name: 'Argento', minKg: 100000, icon: '🥈', color: '#cbd5e1', bg: 'from-slate-600/80 to-slate-900', border: 'border-slate-400/50', desc: '~2 mesi: 100 tonnellate sollevate, la disciplina è reale.' },
    { id: 'oro', name: 'Oro', minKg: 250000, icon: '🥇', color: '#facc15', bg: 'from-yellow-600/60 to-amber-950', border: 'border-yellow-400/60', desc: '~3-4 mesi: quarto di milione di chili, risultati visibili.' },
    { id: 'platino', name: 'Platino', minKg: 500000, icon: '🛡️', color: '#38bdf8', bg: 'from-sky-700/60 to-slate-900', border: 'border-sky-400/60', desc: '~5-6 mesi: mezzo milione di kg mossi con ghisa vera.' },
    { id: 'diamante', name: 'Diamante', minKg: 800000, icon: '💎', color: '#22d3ee', bg: 'from-cyan-600/60 to-blue-950', border: 'border-cyan-300/70', desc: '~7-8 mesi: resistenza d’élite, pochi arrivano fin qui.' },
    { id: 'stellare', name: 'Stellare', minKg: 1150000, icon: '🌟', color: '#c084fc', bg: 'from-purple-600/70 via-fuchsia-800/60 to-slate-950', border: 'border-purple-400/80', desc: '8-9+ mesi di dominio totale: grado massimo leggendario!' }
];

// Scala Badge per Singolo Gruppo Muscolare (~8-9 mesi per Stellare = 125.000 kg ponderati)
const MUSCLE_TIER_BADGES = [
    { id: 'legno', name: 'Legno', minKg: 0, icon: '🪵', color: '#5c4033', textClass: 'text-amber-600', glow: 'none' },
    { id: 'bronzo', name: 'Bronzo', minKg: 5000, icon: '🥉', color: '#b45309', textClass: 'text-amber-400', glow: '0 0 8px rgba(180,83,9,0.55)' },
    { id: 'argento', name: 'Argento', minKg: 18000, icon: '🥈', color: '#94a3b8', textClass: 'text-slate-300', glow: '0 0 8px rgba(148,163,184,0.55)' },
    { id: 'oro', name: 'Oro', minKg: 40000, icon: '🥇', color: '#facc15', textClass: 'text-yellow-300', glow: '0 0 10px rgba(250,204,21,0.65)' },
    { id: 'platino', name: 'Platino', minKg: 68000, icon: '🛡️', color: '#f8fafc', textClass: 'text-white', glow: '0 0 14px rgba(255,255,255,0.95)' },
    { id: 'diamante', name: 'Diamante', minKg: 95000, icon: '💎', color: '#3b82f6', textClass: 'text-blue-400', glow: '0 0 12px rgba(59,130,246,0.85)' },
    { id: 'stellare', name: 'Stellare', minKg: 125000, icon: '🌟', color: '#a855f7', textClass: 'text-purple-400', glow: '0 0 14px rgba(168,85,247,0.95)' }
];

// Oggetti reali per il paragone del volume sollevato in una sessione
const VOLUME_OBJECTS = [
    { max: 400, name: 'uno Scooter 125cc', weight: 130, icon: '🛵' },
    { max: 1100, name: 'un Pianoforte a coda', weight: 350, icon: '🎹' },
    { max: 2500, name: 'una Fiat 500', weight: 980, icon: '🚗' },
    { max: 5500, name: 'un SUV di lusso', weight: 2200, icon: '🚙' },
    { max: 10000, name: 'un Elefante Africano', weight: 5000, icon: '🐘' },
    { max: 16000, name: 'un T-Rex adulto', weight: 8000, icon: '🦖' },
    { max: 26000, name: 'un Autobus urbano', weight: 12500, icon: '🚌' },
    { max: 45000, name: 'un TIR a pieno carico', weight: 35000, icon: '🚛' },
    { max: Infinity, name: 'un Aereo Boeing 737', weight: 42000, icon: '✈️' }
];

// ==================== HELPER DATE E FORMATTAZIONE ====================
function parseLocalYMD(dateStr) {
    if (!dateStr) return new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function toLocalYMD(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function formatKg(val) {
    return Math.round(val || 0).toLocaleString('it-IT');
}

function getVolumeComparison(kg) {
    if (!kg || kg <= 0) {
        return { text: 'Registra almeno una serie per scoprire cosa hai sollevato!', icon: '🏋️', short: '0 kg' };
    }
    const match = VOLUME_OBJECTS.find(o => kg <= o.max) || VOLUME_OBJECTS[VOLUME_OBJECTS.length - 1];
    const ratio = kg / match.weight;
    const ratioStr = ratio >= 10 ? Math.round(ratio) : ratio.toFixed(1).replace('.', ',');
    const carCount = (kg / 1300).toFixed(1).replace('.', ',');

    let phrase = '';
    if (ratio < 0.85) {
        phrase = `Quasi quanto <b>${match.name}</b> (${formatKg(match.weight)} kg)!`;
    } else if (ratio <= 1.25) {
        phrase = `Equivale praticamente a sollevare <b>${match.name}</b> intero!`;
    } else {
        phrase = `Hai mosso l'equivalente di <b>${ratioStr}x ${match.name}</b> (circa ${carCount} automobili)!`;
    }

    return {
        text: phrase,
        icon: match.icon,
        short: `${ratioStr}x ${match.name.replace(/^(un'|un |una |uno )/, '')}`
    };
}

// ==================== CONTROLLI FILTRI E MODULI ====================
function setReportRange(range) {
    reportState.range = range;
    const customBox = document.getElementById('report-custom-dates-box');

    ['7', '30', '90', 'all', 'custom'].forEach(r => {
        const btn = document.getElementById(`rep-range-${r}`);
        if (!btn) return;
        if (r === range) {
            btn.className = "px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-blue-600 text-white shadow-lg border border-blue-400 transition-all shrink-0";
        } else {
            btn.className = "px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-500 transition-all shrink-0";
        }
    });

    if (customBox) {
        if (range === 'custom') {
            customBox.classList.remove('hidden');
            const endInput = document.getElementById('report-date-end');
            const startInput = document.getElementById('report-date-start');
            if (!endInput.value) endInput.value = getTodayStr();
            if (!startInput.value) {
                const d = new Date();
                d.setDate(d.getDate() - 30);
                startInput.value = toLocalYMD(d);
            }
            reportState.customStart = startInput.value;
            reportState.customEnd = endInput.value;
        } else {
            customBox.classList.add('hidden');
        }
    }

    reportState.selectedWorkoutDate = null;
    renderReportDashboard();
}

function applyCustomReportDates() {
    reportState.customStart = document.getElementById('report-date-start').value;
    reportState.customEnd = document.getElementById('report-date-end').value;
    reportState.selectedWorkoutDate = null;
    renderReportDashboard();
}

function toggleReportModule(modKey) {
    reportState.modules[modKey] = !reportState.modules[modKey];
    updateReportModulePills();
    applyReportModuleVisibility();
}

function updateReportModulePills() {
    const labels = {
        costanza: 'Costanza & Badge',
        allenamento: 'Giornate & Muscoli',
        carichi: 'Carichi & Stallo',
        misure: 'Misure',
        alimentazione: 'Alimentazione'
    };

    Object.keys(labels).forEach(k => {
        const btn = document.getElementById(`rep-mod-btn-${k}`);
        if (!btn) return;
        if (reportState.modules[k]) {
            btn.className = "px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold bg-emerald-600/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-1.5 transition-all";
            btn.innerHTML = `<i class="fas fa-check-circle text-emerald-400"></i> ${labels[k]}`;
        } else {
            btn.className = "px-2.5 py-1.5 rounded-xl text-[10px] font-bold bg-slate-900 text-slate-500 border border-slate-700/70 flex items-center gap-1.5 transition-all";
            btn.innerHTML = `<i class="far fa-circle"></i> ${labels[k]}`;
        }
    });
}

function applyReportModuleVisibility() {
    Object.keys(reportState.modules).forEach(k => {
        const sec = document.getElementById(`report-module-${k}`);
        if (!sec) return;
        if (reportState.modules[k]) sec.classList.remove('hidden');
        else sec.classList.add('hidden');
    });
}

function getReportDateBounds() {
    const today = new Date();
    const endStr = reportState.range === 'custom' && reportState.customEnd ? reportState.customEnd : toLocalYMD(today);
    let startStr = '2000-01-01';
    let label = 'Tutto lo Storico';

    if (reportState.range === '7') {
        const d = new Date(today);
        d.setDate(d.getDate() - 6);
        startStr = toLocalYMD(d);
        label = 'Ultimi 7 Giorni';
    } else if (reportState.range === '30') {
        const d = new Date(today);
        d.setDate(d.getDate() - 29);
        startStr = toLocalYMD(d);
        label = 'Ultimo Mese (30g)';
    } else if (reportState.range === '90') {
        const d = new Date(today);
        d.setDate(d.getDate() - 89);
        startStr = toLocalYMD(d);
        label = 'Ultimi 3 Mesi (90g)';
    } else if (reportState.range === 'custom') {
        startStr = reportState.customStart || toLocalYMD(new Date(today.getFullYear(), today.getMonth(), 1));
        label = `${formatDate(startStr)} ➔ ${formatDate(endStr)}`;
    }

    return { startStr, endStr, label };
}

// ==================== RACCOLTA DATI COMPLETA DA LOCALSTORAGE ====================
function buildExerciseLookupMap() {
    const map = {};
    if (typeof exerciseDB !== 'undefined') {
        exerciseDB.forEach(ex => {
            map[getHistKey(ex.name)] = { name: ex.name, category: ex.category || 'Custom', muscles: ex.muscles || {} };
        });
    }
    if (typeof allRoutines !== 'undefined') {
        Object.values(allRoutines).forEach(r => {
            Object.values(r.days || {}).forEach(d => {
                (d.exercises || []).forEach(ex => {
                    const hk = getHistKey(ex.name);
                    if (!map[hk]) {
                        map[hk] = { name: ex.name, category: 'Custom', muscles: ex.muscles || {} };
                    }
                });
            });
        });
    }
    return map;
}

function gatherAllWorkoutLogs() {
    const lookup = buildExerciseLookupMap();
    const allLogs = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith('hist_')) continue;
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        const meta = lookup[key] || {
            name: key.replace('hist_', '').toUpperCase(),
            category: 'Custom',
            muscles: {}
        };

        arr.forEach(l => {
            const sets = parseFloat(l.sets) || 0;
            const reps = parseFloat(l.reps) || 0;
            const weight = parseFloat(l.weight) || 0;
            if (!l.date || sets <= 0) return;
            const volume = sets * reps * weight;
            const oneRM = weight > 0 ? +(weight * (1 + reps / 30)).toFixed(1) : 0;
            allLogs.push({
                histKey: key,
                name: meta.name,
                category: meta.category,
                muscles: meta.muscles,
                date: l.date,
                sets,
                reps,
                weight,
                volume,
                oneRM,
                effort: l.effort || 'normal',
                note: l.note || ''
            });
        });
    }
    return allLogs;
}

// ==================== RENDER PRINCIPALE REPORT ====================
function renderReportDashboard() {
    updateReportModulePills();
    applyReportModuleVisibility();

    const rawBounds = getReportDateBounds();
    const allLogs = gatherAllWorkoutLogs();

    // Trova il primo allenamento in assoluto dello storico
    const allDatesSorted = Array.from(new Set(allLogs.map(l => l.date))).sort();
    const firstWorkoutDate = allDatesSorted.length > 0 ? allDatesSorted[0] : null;

    // Clampa la data di inizio al primo allenamento reale se la finestra scelta parte prima
    let effectiveStartStr = rawBounds.startStr;
    let displayLabel = rawBounds.label;
    if (firstWorkoutDate && effectiveStartStr < firstWorkoutDate && rawBounds.endStr >= firstWorkoutDate) {
        effectiveStartStr = firstWorkoutDate;
        if (reportState.range !== 'all') {
            displayLabel = `${rawBounds.label} (dal ${formatDate(firstWorkoutDate)})`;
        } else {
            displayLabel = `Dal ${formatDate(firstWorkoutDate)} ad oggi`;
        }
    }

    const bounds = {
        startStr: effectiveStartStr,
        endStr: rawBounds.endStr,
        label: displayLabel,
        firstWorkoutDate
    };

    const periodLogs = allLogs.filter(l => l.date >= bounds.startStr && l.date <= bounds.endStr);

    const subtitleEl = document.getElementById('report-active-period-badge');
    if (subtitleEl) subtitleEl.innerText = bounds.label;

    const costanzaData = renderCostanzaAndBadges(allLogs, periodLogs, bounds);
    const dayAnalysisData = renderDailyWorkoutDeepDive(periodLogs);
    const radarData = renderMuscleRadarSection(periodLogs);
    const mannequinData = renderMuscleBadgeMannequin(periodLogs);
    const overloadData = renderProgressiveOverloadAndStall(allLogs, periodLogs, bounds);
    const measuresData = renderMeasuresVariation(bounds);
    const nutritionData = renderNutritionReportSection(bounds);

    lastComputedReport = {
        bounds,
        costanzaData,
        dayAnalysisData,
        radarData,
        mannequinData,
        overloadData,
        measuresData,
        nutritionData
    };
}

// ==================== 1. COSTANZA, FUOCO STORICO & BADGE VOLUME ====================
function renderCostanzaAndBadges(allLogs, periodLogs, bounds) {
    const totalAllTimeKg = allLogs.reduce((acc, l) => acc + l.volume, 0);
    const periodTotalKg = periodLogs.reduce((acc, l) => acc + l.volume, 0);

    const allDates = Array.from(new Set(allLogs.map(l => l.date))).sort();
    const periodDates = Array.from(new Set(periodLogs.map(l => l.date))).sort();
let longestSessionStreak = 0;
    let currentStreak = 0;
    let activeStreak = 0;
    let activeFires = 0;

    for (let i = 0; i < allDates.length; i++) {
        if (i === 0) {
            currentStreak = 1;
            activeFires = 1;
        } else {
            const diffDays = Math.round((parseLocalYMD(allDates[i]) - parseLocalYMD(allDates[i - 1])) / (1000 * 60 * 60 * 24));

            // Streak: solo giorni di calendario consecutivi (senza saltare nemmeno 1 giorno)
            if (diffDays === 1) currentStreak++;
            else currentStreak = 1;

            // Fuochi: +1 a ogni allenamento; se ci sono 7+ giorni interi di stop (diffDays >= 8), spariscono tutti e riparti da 1
            if (diffDays - 1 >= 7) activeFires = 1;
            else activeFires++;
        }
        if (currentStreak > longestSessionStreak) longestSessionStreak = currentStreak;
    }

    if (allDates.length > 0) {
        const daysSinceLast = Math.round((parseLocalYMD(getTodayStr()) - parseLocalYMD(allDates[allDates.length - 1])) / (1000 * 60 * 60 * 24));
        if (daysSinceLast <= 1) activeStreak = currentStreak;
        // Se sei fermo da 7 giorni interi di fila ad oggi, spariscono tutti i fuochi
        if (daysSinceLast - 1 >= 7) activeFires = 0;
    }

    // Calcolo giorni effettivi (parte sempre dal 1° allenamento reale se successivo alla finestra)
    let rawSpanDays = 7;
    if (allDates.length > 0 && bounds.endStr >= bounds.startStr) {
        rawSpanDays = Math.round((parseLocalYMD(bounds.endStr) - parseLocalYMD(bounds.startStr)) / (1000 * 60 * 60 * 24)) + 1;
    }
    const spanDaysForAvg = Math.max(7, rawSpanDays);
    const avgPerWeek = periodDates.length > 0 ? +((periodDates.length / spanDaysForAvg) * 7).toFixed(1) : 0;

    let currentBadgeIdx = 0;
    for (let i = VOLUME_BADGES.length - 1; i >= 0; i--) {
        if (totalAllTimeKg >= VOLUME_BADGES[i].minKg) {
            currentBadgeIdx = i;
            break;
        }
    }
    const curBadge = VOLUME_BADGES[currentBadgeIdx];
    const nextBadge = VOLUME_BADGES[currentBadgeIdx + 1] || null;

    let pctToNext = 100;
    let remainingKg = 0;
    if (nextBadge) {
        const rangeSpan = nextBadge.minKg - curBadge.minKg;
        const progress = Math.max(0, totalAllTimeKg - curBadge.minKg);
        pctToNext = Math.min(100, Math.round((progress / rangeSpan) * 100));
        remainingKg = Math.max(0, Math.round(nextBadge.minKg - totalAllTimeKg));
    }

    const totalCount = allDates.length;
    let flameTierLabel = activeFires === 0 ? 'Fuoco Spento (7+ gg di stop)' : 'Scintilla Iniziale';
    if (activeFires >= 100) flameTierLabel = 'Fiamma Leggendaria';
    else if (activeFires >= 50) flameTierLabel = 'Fuoco Inarrestabile';
    else if (activeFires >= 20) flameTierLabel = 'Motore a Regime';
    else if (activeFires >= 5) flameTierLabel = 'Fiamma Accesa';
    const container = document.getElementById('report-costanza-body');
    if (container) {
        let badgesRoadmapHtml = VOLUME_BADGES.map((b, idx) => {
            const unlocked = idx <= currentBadgeIdx;
            return `<div class="flex flex-col items-center p-1.5 rounded-xl border ${unlocked ? 'bg-slate-800/90 ' + b.border : 'bg-slate-950/60 border-slate-800 opacity-40'}">
                <span class="text-base">${b.icon}</span>
                <span class="text-[8px] font-extrabold mt-0.5 ${unlocked ? 'text-white' : 'text-slate-500'}">${b.name}</span>
                <span class="text-[7px] text-slate-400">${b.minKg >= 1000 ? (b.minKg / 1000) + 't' : '0'}</span>
            </div>`;
        }).join('');

        container.innerHTML = `
            <div class="bg-gradient-to-br from-orange-950/60 via-slate-900 to-slate-950 rounded-2xl p-4 border border-orange-500/40 shadow-lg mb-3">
                <div class="flex items-center justify-between gap-3 mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-14 h-14 rounded-2xl ${activeFires > 0 ? 'bg-orange-500/20 border-orange-400/50 shadow-[0_0_20px_rgba(249,115,22,0.35)]' : 'bg-slate-800/60 border-slate-700 opacity-50'} border flex flex-col items-center justify-center">
                            <span class="text-2xl leading-none">${activeFires > 0 ? '🔥' : '💨'}</span>
                            <span class="text-xs font-black ${activeFires > 0 ? 'text-orange-300' : 'text-slate-400'} mt-0.5">${activeFires}</span>
                        </div>
                        <div>
                            <div class="text-[10px] font-bold text-orange-400 uppercase tracking-wider">I Tuoi Fuochi Attivi</div>
                            <div class="text-base font-extrabold text-white">${activeFires} ${activeFires === 1 ? 'Fuoco' : 'Fuochi'} • ${totalCount} Totali</div>
                            <div class="text-[11px] text-orange-200/80 font-semibold">${flameTierLabel} • Serie attiva: ${activeStreak}g</div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-2 text-center">
                    <div class="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                        <div class="text-[9px] font-bold text-slate-400 uppercase">Nel Periodo</div>
                        <div class="text-base font-extrabold text-white mt-0.5">${periodDates.length}</div>
                        <div class="text-[9px] text-orange-400">su ${rawSpanDays} giorni</div>
                    </div>
                    <div class="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                        <div class="text-[9px] font-bold text-slate-400 uppercase">Media / Sett.</div>
                        <div class="text-base font-extrabold text-emerald-400 mt-0.5">${avgPerWeek}</div>
                        <div class="text-[9px] text-slate-400">allenamenti</div>
                    </div>
                    <div class="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                        <div class="text-[9px] font-bold text-slate-400 uppercase">Record Streak</div>
                        <div class="text-base font-extrabold text-amber-400 mt-0.5">${longestSessionStreak}</div>
                        <div class="text-[9px] text-slate-400">di fila</div>
                    </div>
                </div>
            </div>

            <div class="bg-gradient-to-br ${curBadge.bg} rounded-2xl p-4 border ${curBadge.border} shadow-lg">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-2xl bg-slate-950/70 border ${curBadge.border} flex items-center justify-center text-2xl shadow-inner">
                            ${curBadge.icon}
                        </div>
                        <div>
                            <div class="text-[10px] font-bold uppercase tracking-wider" style="color:${curBadge.color}">Grado Volume Storico</div>
                            <div class="text-lg font-black text-white leading-tight">Grado ${curBadge.name}</div>
                            <div class="text-[10px] text-slate-300 mt-0.5">${curBadge.desc}</div>
                        </div>
                    </div>
                </div>

                <div class="bg-slate-950/75 rounded-xl p-3 border border-slate-800/80 mb-3">
                    <div class="flex justify-between items-baseline text-xs mb-1.5">
                        <span class="font-bold text-slate-300">Totale Sollevato: <b class="text-white">${formatKg(totalAllTimeKg)} kg</b></span>
                        <span class="text-[10px] font-extrabold" style="color:${curBadge.color}">${nextBadge ? pctToNext + '% verso ' + nextBadge.name : 'GRADO MAX 🏆'}</span>
                    </div>
                    <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-500" style="width:${pctToNext}%; background:${curBadge.color};"></div>
                    </div>
                    <div class="text-[10px] text-slate-400 mt-1.5">
                        ${nextBadge ? `Mancano <b class="text-slate-200">${formatKg(remainingKg)} kg</b> per sbloccare ${nextBadge.icon} <b>${nextBadge.name}</b> (traguardo: ${formatKg(nextBadge.minKg)} kg).` : 'Hai raggiunto la vetta assoluta della sala pesi!'}
                    </div>
                </div>

                <div class="grid grid-cols-7 gap-1">
                    ${badgesRoadmapHtml}
                </div>
            </div>
        `;
    }

    return {
        totalAllTimeKg,
        periodTotalKg,
        totalAllTimeWorkouts: totalCount,
        activeFires,
        periodWorkouts: periodDates.length,
        avgPerWeek,
        longestSessionStreak,
        activeStreak,
        curBadge,
        nextBadge,
        pctToNext
    };
}

// ==================== 2. ANALISI APPROFONDITA GIORNATA + PARAGONE OGGETTI ====================
function renderDailyWorkoutDeepDive(periodLogs) {
    const container = document.getElementById('report-daily-body');
    if (!container) return { totalPeriodVolume: 0, bestDay: null };

    const byDate = {};
    periodLogs.forEach(l => {
        if (!byDate[l.date]) byDate[l.date] = [];
        byDate[l.date].push(l);
    });

    const datesDesc = Object.keys(byDate).sort((a, b) => b.localeCompare(a));
    const totalPeriodVolume = periodLogs.reduce((acc, l) => acc + l.volume, 0);

    if (datesDesc.length === 0) {
        container.innerHTML = `<div class="text-center text-xs text-slate-500 py-6 bg-slate-900/70 rounded-xl border border-slate-800 border-dashed">Nessun allenamento registrato in questo intervallo. Spingi in palestra e torna qui!</div>`;
        return { totalPeriodVolume: 0, bestDay: null };
    }

    if (!reportState.selectedWorkoutDate || !byDate[reportState.selectedWorkoutDate]) {
        reportState.selectedWorkoutDate = datesDesc[0];
    }

    let bestDay = { date: datesDesc[0], vol: 0 };
    datesDesc.forEach(d => {
        const v = byDate[d].reduce((s, x) => s + x.volume, 0);
        if (v > bestDay.vol) bestDay = { date: d, vol: v };
    });

    const selDate = reportState.selectedWorkoutDate;
    const dayLogs = byDate[selDate];
    const dayVol = dayLogs.reduce((s, x) => s + x.volume, 0);
    const daySets = dayLogs.reduce((s, x) => s + x.sets, 0);
    const dayReps = dayLogs.reduce((s, x) => s + (x.sets * x.reps), 0);
    const burn = typeof calculateWorkoutCaloriesForDate === 'function' ? calculateWorkoutCaloriesForDate(selDate) : { kcal: 0 };
    const comp = getVolumeComparison(dayVol);

    const exGroups = {};
    const musclesSet = new Set();
    dayLogs.forEach(l => {
        if (!exGroups[l.name]) exGroups[l.name] = { name: l.name, category: l.category, sets: 0, vol: 0, maxW: 0, items: [] };
        exGroups[l.name].sets += l.sets;
        exGroups[l.name].vol += l.volume;
        if (l.weight > exGroups[l.name].maxW) exGroups[l.name].maxW = l.weight;
        exGroups[l.name].items.push(l);
        if (l.category && l.category !== 'Custom') musclesSet.add(l.category);
    });

    const datePillsHtml = datesDesc.slice(0, 14).map(d => {
        const active = d === selDate;
        return `<button onclick="selectReportWorkoutDate('${d}')" class="px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all ${active ? 'bg-blue-600 text-white shadow border border-blue-400' : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'}">${formatDate(d)}</button>`;
    }).join('');

    const exListHtml = Object.values(exGroups).map(g => {
        const detailLine = g.items.map(it => {
            const dot = it.effort === 'easy' ? '🟢' : (it.effort === 'hard' ? '🔴' : '🟡');
            return `<span class="bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800 text-[10px] font-semibold text-slate-200">${it.sets}x${it.reps} @ <b class="text-emerald-400">${it.weight}kg</b> ${dot}</span>`;
        }).join(' ');
        return `<div class="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/60">
            <div class="flex justify-between items-center mb-1.5">
                <span class="text-xs font-extrabold text-slate-100 truncate pr-2">${g.name}</span>
                <span class="text-[11px] font-extrabold text-blue-400 shrink-0">${formatKg(g.vol)} kg</span>
            </div>
            <div class="flex flex-wrap gap-1">${detailLine}</div>
        </div>`;
    }).join('');

    const periodComp = getVolumeComparison(totalPeriodVolume);

    container.innerHTML = `
        <div class="bg-slate-950/80 p-3 rounded-xl border border-blue-500/30 mb-3 flex items-center justify-between gap-2">
            <div>
                <div class="text-[10px] font-bold text-blue-400 uppercase">Volume Totale nel Periodo</div>
                <div class="text-lg font-black text-white">${formatKg(totalPeriodVolume)} kg</div>
                <div class="text-[10px] text-slate-300 mt-0.5">${periodComp.icon} ${periodComp.text}</div>
            </div>
        </div>

        <div class="mb-3">
            <div class="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Seleziona una Giornata da Ispezionare:</div>
            <div class="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">${datePillsHtml}</div>
        </div>

        <div class="bg-slate-900/80 rounded-2xl p-3.5 border border-slate-700/80 space-y-3">
            <div class="flex justify-between items-center border-b border-slate-800 pb-2">
                <div>
                    <div class="text-xs font-extrabold text-white"><i class="far fa-calendar-check text-emerald-400 mr-1.5"></i>Sessione del ${formatDate(selDate)}</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">Focus: ${musclesSet.size ? Array.from(musclesSet).join(' • ') : 'Allenamento Personalizzato'}</div>
                </div>
                <span class="text-xs font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-xl">${formatKg(dayVol)} kg</span>
            </div>

            <div class="bg-gradient-to-r from-indigo-950/80 to-slate-950 p-3 rounded-xl border border-indigo-500/40 flex items-center gap-3">
                <div class="text-3xl shrink-0">${comp.icon}</div>
                <div class="text-[11px] text-indigo-100 leading-snug">
                    <div class="text-[9px] font-bold uppercase text-indigo-400 tracking-wider mb-0.5">Paragone Potenza Sessione</div>
                    ${comp.text}
                </div>
            </div>

            <div class="grid grid-cols-3 gap-2 text-center">
                <div class="bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <div class="text-[9px] font-bold text-blue-400 uppercase">Serie Tot.</div>
                    <div class="text-sm font-extrabold text-white">${daySets}</div>
                </div>
                <div class="bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <div class="text-[9px] font-bold text-amber-400 uppercase">Ripetizioni</div>
                    <div class="text-sm font-extrabold text-white">${dayReps}</div>
                </div>
                <div class="bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <div class="text-[9px] font-bold text-orange-400 uppercase">Stima Kcal</div>
                    <div class="text-sm font-extrabold text-orange-300">~${burn.kcal}</div>
                </div>
            </div>

            <div class="space-y-2">${exListHtml}</div>
        </div>
    `;

    return { totalPeriodVolume, bestDay, periodComp };
}

function selectReportWorkoutDate(dateStr) {
    reportState.selectedWorkoutDate = dateStr;
    renderReportDashboard();
}

// ==================== 3. GRAFICO RADAR GRUPPI MUSCOLARI ====================
function renderMuscleRadarSection(periodLogs) {
    const groups = { Petto: 0, Dorso: 0, Gambe: 0, Spalle: 0, Braccia: 0, Addome: 0 };
    let rearDeltSets = 0;
    let frontDeltSets = 0;

    periodLogs.forEach(l => {
        const m = l.muscles || {};
        const hasDetailed = Object.keys(m).length > 0;

        if (hasDetailed) {
            if ((m['front-chest-upper'] || 0) + (m['front-chest-lower'] || 0) > 0) groups.Petto += l.sets;
            if ((m['back-lats'] || 0) + (m['back-traps'] || 0) + (m['back-lowerback'] || 0) > 0) groups.Dorso += l.sets;
            if ((m['front-quads'] || 0) + (m['back-hamstrings'] || 0) + (m['back-glutes'] || 0) + (m['front-adductors'] || 0) + (m['front-calves'] || 0) + (m['back-calves'] || 0) > 0) groups.Gambe += l.sets;
            if ((m['front-shoulder'] || 0) + (m['back-shoulder'] || 0) > 0) groups.Spalle += l.sets;
            if ((m['front-biceps'] || 0) + (m['back-triceps'] || 0) + (m['front-forearm'] || 0) > 0) groups.Braccia += l.sets;
            if ((m['front-abs'] || 0) + (m['front-abs-lower'] || 0) + (m['front-obliques'] || 0) > 0) groups.Addome += l.sets;

            if ((m['back-shoulder'] || 0) >= 1) rearDeltSets += l.sets;
            if ((m['front-shoulder'] || 0) >= 1) frontDeltSets += l.sets;
        } else {
            if (l.category === 'Petto') groups.Petto += l.sets;
            else if (l.category === 'Dorso e Lombari') groups.Dorso += l.sets;
            else if (l.category === 'Gambe') groups.Gambe += l.sets;
            else if (l.category === 'Spalle') groups.Spalle += l.sets;
            else if (l.category === 'Braccia') groups.Braccia += l.sets;
            else if (l.category === 'Addome e Core') groups.Addome += l.sets;
        }
    });

    const canvas = document.getElementById('report-radar-chart');
    if (canvas && typeof Chart !== 'undefined') {
        if (reportRadarChart) reportRadarChart.destroy();
        reportRadarChart = new Chart(canvas.getContext('2d'), {
            type: 'radar',
            data: {
                labels: Object.keys(groups),
                datasets: [{
                    label: 'Serie Allenanti',
                    data: Object.values(groups),
                    backgroundColor: 'rgba(59, 130, 246, 0.25)',
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    pointBackgroundColor: '#60a5fa',
                    pointBorderColor: '#0f172a',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    r: {
                        beginAtZero: true,
                        grid: { color: 'rgba(148, 163, 184, 0.15)' },
                        angleLines: { color: 'rgba(148, 163, 184, 0.15)' },
                        pointLabels: { color: '#e2e8f0', font: { size: 11, weight: 'bold' } },
                        ticks: { display: false }
                    }
                }
            }
        });
    }

    const diagnosisEl = document.getElementById('report-radar-diagnosis');
    if (diagnosisEl) {
        const entries = Object.entries(groups);
        const totalSets = entries.reduce((s, [, v]) => s + v, 0);

        if (totalSets === 0) {
            diagnosisEl.innerHTML = `<span class="text-slate-400">Nessuna serie registrata nel periodo per analizzare il bilanciamento muscolare.</span>`;
        } else {
            entries.sort((a, b) => b[1] - a[1]);
            const top = entries[0];
            const low = entries[entries.length - 1];
            let rearWarning = '';
            if (frontDeltSets >= 6 && rearDeltSets < frontDeltSets * 0.35) {
                rearWarning = `<div class="mt-1.5 text-amber-300"><i class="fas fa-exclamation-triangle mr-1"></i><b>Occhio ai Deltoidi Posteriori:</b> hai fatto ${frontDeltSets} serie sui fasci anteriori/laterali ma solo ${rearDeltSets} sui posteriori (es. Face Pull o Alzate 90°).</div>`;
            }

            diagnosisEl.innerHTML = `
                <div class="grid grid-cols-2 gap-2 mb-2">
                    <div class="bg-slate-900 p-2 rounded-xl border border-emerald-500/30 text-center">
                        <div class="text-[9px] font-bold text-emerald-400 uppercase">Più Allenato</div>
                        <div class="text-xs font-extrabold text-white">${top[0]} (${top[1]} serie)</div>
                    </div>
                    <div class="bg-slate-900 p-2 rounded-xl border border-rose-500/30 text-center">
                        <div class="text-[9px] font-bold text-rose-400 uppercase">Più Trascurato</div>
                        <div class="text-xs font-extrabold text-white">${low[0]} (${low[1]} serie)</div>
                    </div>
                </div>
                <div class="text-[11px] text-slate-300">
                    ${low[1] === 0 ? `⚠️ Attenzione: non hai ancora registrato serie dirette per <b>${low[0]}</b> in questo periodo.` : `Buona distribuzione generale; se vuoi un fisico proporzionato, dai un po' più di volume a <b>${low[0]}</b>.`}
                    ${rearWarning}
                </div>
            `;
        }
    }

    return { groups };
}

// ==================== 3B. MANICHINO GRADI VOLUME PER SINGOLO MUSCOLO ====================
function getIntensityVolumeMultiplier(score) {
    const num = Number(score) || 0;
    if (num >= 3) return 1.0; // Intensità 3 -> 100% del volume
    if (num === 2) return 0.6; // Intensità 2 -> 60% del volume
    if (num === 1) return 0.3; // Intensità 1 -> 30% del volume
    return 0;
}

function getMuscleBadgeByVolume(volKg) {
    let current = MUSCLE_TIER_BADGES[0];
    let next = null;
    for (let i = 0; i < MUSCLE_TIER_BADGES.length; i++) {
        if (volKg >= MUSCLE_TIER_BADGES[i].minKg) {
            current = MUSCLE_TIER_BADGES[i];
            next = MUSCLE_TIER_BADGES[i + 1] || null;
        }
    }
    const missingKg = next ? Math.max(0, Math.ceil(next.minKg - volKg)) : 0;
    let pctToNext = 100;
    if (next) {
        const span = Math.max(1, next.minKg - current.minKg);
        pctToNext = Math.min(100, Math.max(0, Math.round(((volKg - current.minKg) / span) * 100)));
    }
    return { current, next, missingKg, pctToNext };
}

function renderMuscleBadgeLegend() {
    const legendEl = document.getElementById('report-muscle-badge-legend');
    if (!legendEl) return;

    legendEl.innerHTML = MUSCLE_TIER_BADGES.map(b => `
        <div class="bg-slate-950/90 border border-slate-800 rounded-xl p-2 flex items-center gap-2">
            <span class="w-3.5 h-3.5 rounded-full shrink-0 border border-white/25" style="background:${b.color}; box-shadow:${b.glow};"></span>
            <div class="min-w-0">
                <div class="text-[10px] font-extrabold text-white truncate">${b.icon} ${b.name}</div>
                <div class="text-[9px] text-slate-400 font-mono">${b.minKg === 0 ? '0 kg' : formatKg(b.minKg) + '+ kg'}</div>
            </div>
        </div>
    `).join('');
}

function renderMuscleBadgeMannequin(periodLogs) {
    renderMuscleBadgeLegend();

    const muscleKeys = [
        'front-chest-upper', 'front-chest-lower', 'front-shoulder', 'front-biceps',
        'front-forearm', 'front-abs', 'front-abs-lower', 'front-obliques',
        'front-quads', 'front-adductors', 'back-traps', 'back-lats',
        'back-lowerback', 'back-shoulder', 'back-triceps', 'back-glutes',
        'back-hamstrings', 'front-calves', 'back-calves'
    ];

    const totals = {};
    muscleKeys.forEach(k => { totals[k] = 0; });

    periodLogs.forEach(l => {
        const m = l.muscles || {};
        Object.entries(m).forEach(([mKey, score]) => {
            if (!Object.prototype.hasOwnProperty.call(totals, mKey)) return;
            const mult = getIntensityVolumeMultiplier(score);
            totals[mKey] += (l.volume || 0) * mult;
        });
    });

    // Unifica i 18 gruppi esatti del manichino (Polpacci unificati per evitare duplicati)
    const displayMuscles = [
        { layerId: 'rep-layer-chest-upper', label: 'Petto Alto', vol: totals['front-chest-upper'] || 0 },
        { layerId: 'rep-layer-chest-lower', label: 'Petto Basso', vol: totals['front-chest-lower'] || 0 },
        { layerId: 'rep-layer-shoulders-front', label: 'Spalle Ant/Lat', vol: totals['front-shoulder'] || 0 },
        { layerId: 'rep-layer-biceps', label: 'Bicipiti', vol: totals['front-biceps'] || 0 },
        { layerId: 'rep-layer-forearms', label: 'Avambracci', vol: totals['front-forearm'] || 0 },
        { layerId: 'rep-layer-abs-upper', label: 'Addome Alto', vol: totals['front-abs'] || 0 },
        { layerId: 'rep-layer-abs-lower', label: 'Addome Basso', vol: totals['front-abs-lower'] || 0 },
        { layerId: 'rep-layer-obliques', label: 'Obliqui', vol: totals['front-obliques'] || 0 },
        { layerId: 'rep-layer-quads', label: 'Quadricipiti', vol: totals['front-quads'] || 0 },
        { layerId: 'rep-layer-adductors', label: 'Adduttori', vol: totals['front-adductors'] || 0 },
        { layerId: 'rep-layer-traps', label: 'Trapezi', vol: totals['back-traps'] || 0 },
        { layerId: 'rep-layer-lats', label: 'Dorsali', vol: totals['back-lats'] || 0 },
        { layerId: 'rep-layer-lowerback', label: 'Lombari', vol: totals['back-lowerback'] || 0 },
        { layerId: 'rep-layer-shoulders-rear', label: 'Spalle Post.', vol: totals['back-shoulder'] || 0 },
        { layerId: 'rep-layer-triceps', label: 'Tricipiti', vol: totals['back-triceps'] || 0 },
        { layerId: 'rep-layer-glutes', label: 'Glutei', vol: totals['back-glutes'] || 0 },
        { layerId: 'rep-layer-hamstrings', label: 'Femorali', vol: totals['back-hamstrings'] || 0 },
        { layerId: 'rep-layer-calves', label: 'Polpacci', vol: Math.max(totals['front-calves'] || 0, totals['back-calves'] || 0) }
    ];

    displayMuscles.forEach(item => {
        const layer = document.getElementById(item.layerId);
        if (!layer) return;
        const img = layer.querySelector('img');
        if (!img) return;

        if (item.vol <= 0) {
            layer.style.opacity = '0';
            layer.style.visibility = 'hidden';
            img.style.filter = 'none';
        } else {
            const { current } = getMuscleBadgeByVolume(item.vol);
            layer.style.visibility = 'visible';
            layer.style.opacity = '0.92';
            img.style.filter = `drop-shadow(1000px 0 0 ${current.color}) ${current.glow !== 'none' ? 'drop-shadow(' + current.glow + ')' : ''}`;
        }
    });

    const listEl = document.getElementById('report-muscle-mannequin-list');
    if (listEl) {
        const sorted = displayMuscles.filter(x => x.vol > 0).sort((a, b) => b.vol - a.vol);

        if (sorted.length === 0) {
            listEl.innerHTML = `<div class="text-xs text-slate-500 text-center py-4 bg-slate-900/70 rounded-xl border border-slate-800">Nessun volume muscolare registrato nel periodo scelto.</div>`;
        } else {
            listEl.innerHTML = sorted.map(item => {
                const { current, next, missingKg, pctToNext } = getMuscleBadgeByVolume(item.vol);
                const nextBadgeHtml = next
                    ? `<div class="mt-1.5">
                            <div class="flex justify-between items-center text-[10px] mb-1">
                                <span class="text-slate-300">Mancano <b class="text-white">${formatKg(missingKg)} kg</b> per ${next.icon} <b class="text-slate-100">${next.name}</b></span>
                                <span class="font-bold text-slate-400">${pctToNext}%</span>
                            </div>
                            <div class="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                <div class="h-full rounded-full transition-all duration-300" style="width:${pctToNext}%; background:${current.color};"></div>
                            </div>
                       </div>`
                    : `<div class="mt-1 text-[10px] font-extrabold text-purple-300">🌟 Grado Massimo Stellare Raggiunto!</div>`;

                return `<div class="bg-slate-900/95 p-3 rounded-xl border border-slate-700/70">
                    <div class="flex justify-between items-center gap-2">
                        <div class="text-xs font-extrabold text-white flex items-center gap-2">
                            <span class="w-3 h-3 rounded-full inline-block shrink-0" style="background:${current.color}; box-shadow:${current.glow};"></span>
                            <span>${item.label}</span>
                        </div>
                        <div class="text-right shrink-0">
                            <span class="text-xs font-black ${current.textClass}">${current.icon} ${current.name}</span>
                            <span class="text-[11px] font-bold text-slate-300 ml-1.5">(${formatKg(item.vol)} kg)</span>
                        </div>
                    </div>
                    ${nextBadgeHtml}
                </div>`;
            }).join('');
        }
    }

    return { totals, displayMuscles };
}

// ==================== 4. SOVRACCARICO PROGRESSIVO, PR & RILEVATORE STALLO ====================
function renderProgressiveOverloadAndStall(allLogs, periodLogs, bounds) {
    const container = document.getElementById('report-overload-body');
    if (!container) return { progressing: [], stalled: [], prs: [] };

    const activeRoutineExNames = new Set();
    if (typeof currentRoutine !== 'undefined' && currentRoutine.days) {
        Object.values(currentRoutine.days).forEach(d => {
            (d.exercises || []).forEach(ex => {
                if (!ex.deletedFromRoutine && !ex.isSwapSub) activeRoutineExNames.add(ex.name);
            });
        });
    }

    const byEx = {};
    allLogs.forEach(l => {
        if (!byEx[l.name]) byEx[l.name] = [];
        byEx[l.name].push(l);
    });

    const progressing = [];
    const stalled = [];
    const prs = [];

    Object.entries(byEx).forEach(([exName, logs]) => {
        const sorted = [...logs]
            .filter(l => l.date <= bounds.endStr)
            .sort((a, b) => a.date.localeCompare(b.date));
        if (sorted.length === 0) return;

        const inRoutine = activeRoutineExNames.has(exName);

        // PR nel periodo selezionato vs storico precedente
        const periodOnly = sorted.filter(l => l.date >= bounds.startStr && l.date <= bounds.endStr);
        const beforePeriod = sorted.filter(l => l.date < bounds.startStr);
        if (periodOnly.length > 0) {
            const maxPeriod1RM = Math.max(...periodOnly.map(x => x.oneRM));
            const maxPeriodW = Math.max(...periodOnly.map(x => x.weight));
            const prevBest1RM = beforePeriod.length > 0 ? Math.max(...beforePeriod.map(x => x.oneRM)) : 0;
            if (maxPeriod1RM > 0 && (beforePeriod.length === 0 || maxPeriod1RM > prevBest1RM)) {
                prs.push({
                    name: exName,
                    oneRM: maxPeriod1RM,
                    maxWeight: maxPeriodW,
                    gain: prevBest1RM > 0 ? +(maxPeriod1RM - prevBest1RM).toFixed(1) : null
                });
            }
        }

        // Raggruppa per seduta (data distinta), prendendo carico massimo e miglior score della giornata
        const seenDays = {};
        sorted.forEach(l => {
            const sc = l.oneRM || l.volume;
            if (!seenDays[l.date]) {
                seenDays[l.date] = { date: l.date, sc, w: l.weight, vol: l.volume };
            } else {
                if (l.weight > seenDays[l.date].w) seenDays[l.date].w = l.weight;
                if (sc > seenDays[l.date].sc) seenDays[l.date].sc = sc;
                if (l.volume > seenDays[l.date].vol) seenDays[l.date].vol = l.volume;
            }
        });
        const dayArr = Object.values(seenDays).sort((a, b) => a.date.localeCompare(b.date));
        if (dayArr.length < 2) return;

        // 1. RADAR STALLO: solo esercizi dove il carico non aumenta da 3 o più sedute consecutive (>= 3)
        let refW = dayArr[0].w;
        let sessionsNoRaise = 0;
        let lastRaiseDate = dayArr[0].date;

        for (let i = 1; i < dayArr.length; i++) {
            const w = dayArr[i].w;
            const prevDayW = dayArr[i - 1].w;
            if (w > refW) {
                refW = w;
                sessionsNoRaise = 0;
                lastRaiseDate = dayArr[i].date;
            } else if (w > prevDayW && prevDayW < refW * 0.92) {
                // Ripresa progressiva dopo uno scarico reale (>8% di riduzione carico)
                refW = w;
                sessionsNoRaise = 0;
                lastRaiseDate = dayArr[i].date;
            } else {
                sessionsNoRaise++;
            }
        }

        const latestDayAll = dayArr[dayArr.length - 1];
        const isStalled = (inRoutine || periodOnly.length > 0) && refW > 0 && sessionsNoRaise >= 3;

        if (isStalled) {
            stalled.push({
                name: exName,
                curW: latestDayAll.w,
                refW,
                sessionsNoRaise,
                lastRaiseDate,
                inRoutine
            });
            return;
        }

        // 2. ESERCIZI IN CRESCITA: calcolata rigorosamente sul range temporale selezionato in alto
        const periodDays = dayArr.filter(d => d.date >= bounds.startStr && d.date <= bounds.endStr);
        const beforePeriodDays = dayArr.filter(d => d.date < bounds.startStr);
        if (periodDays.length === 0) return;

        let baseline = null;
        let latest = null;
        let basisText = '';

        if (periodDays.length >= 2) {
            // Confronta la prima seduta e l'ultima seduta dentro la finestra temporale selezionata
            baseline = periodDays[0];
            latest = periodDays[periodDays.length - 1];
            basisText = `dal ${formatDate(baseline.date)} al ${formatDate(latest.date)}`;
        } else if (periodDays.length === 1 && beforePeriodDays.length > 0) {
            // Se nel range (es. 7 giorni) c'è 1 sola seduta, confrontala con la seduta subito precedente al range
            baseline = beforePeriodDays[beforePeriodDays.length - 1];
            latest = periodDays[0];
            basisText = `vs seduta prec. (${formatDate(baseline.date)})`;
        } else {
            return;
        }

        const curScore = latest.sc;
        const prevScore = baseline.sc;
        const pctDiff = prevScore > 0 ? +(((curScore - prevScore) / prevScore) * 100).toFixed(1) : 0;
        const weightDiff = +(latest.w - baseline.w).toFixed(1);

        if (pctDiff >= 1.5 || weightDiff > 0) {
            progressing.push({
                name: exName,
                pctDiff: Math.max(0, pctDiff),
                curW: latest.w,
                prevW: baseline.w,
                weightDiff,
                basisText,
                inRoutine
            });
        }
    });

    progressing.sort((a, b) => (b.pctDiff - a.pctDiff) || (b.weightDiff - a.weightDiff));
    stalled.sort((a, b) => b.sessionsNoRaise - a.sessionsNoRaise);
    prs.sort((a, b) => (b.gain || 0) - (a.gain || 0));

    const totalEvaluated = progressing.length + stalled.length;
    const overloadIndex = totalEvaluated > 0 ? Math.round((progressing.length / totalEvaluated) * 100) : 0;

    let statusPill = `<span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">Dati insufficienti</span>`;
    if (totalEvaluated > 0) {
        if (overloadIndex >= 65) statusPill = `<span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">🚀 In Forte Crescita (${overloadIndex}%)</span>`;
        else if (overloadIndex >= 35) statusPill = `<span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/50">⚖️ Progressione Mista (${overloadIndex}%)</span>`;
        else statusPill = `<span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/50">⚠️ Rischio Stallo (${overloadIndex}%)</span>`;
    }

    const stallHtml = stalled.length > 0
        ? stalled.map(s => `
            <div class="flex justify-between items-center bg-rose-950/30 border border-rose-500/30 p-2.5 rounded-xl">
                <div class="pr-2">
                    <div class="text-xs font-extrabold text-rose-200">${s.name} ${s.inRoutine ? '<span class="text-[8px] bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded ml-1">IN SCHEDA</span>' : ''}</div>
                    <div class="text-[10px] text-slate-400">Carico fermo a <b>${s.curW} kg</b> da <b>${s.sessionsNoRaise} sedute</b> (ultimo aumento: ${formatDate(s.lastRaiseDate)})</div>
                </div>
                <span class="text-[10px] font-black text-rose-400 bg-rose-950/80 border border-rose-500/40 px-2 py-0.5 rounded-lg shrink-0">${s.sessionsNoRaise} sedute</span>
            </div>`).join('')
        : `<div class="text-xs text-emerald-300 bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-xl text-center font-semibold"><i class="fas fa-check-circle mr-1"></i>Nessun esercizio ha il carico fermo da 3 o più sedute! Continua così.</div>`;

    const progHtml = progressing.length > 0
        ? progressing.slice(0, 8).map(p => `
            <div class="flex justify-between items-center bg-emerald-950/25 border border-emerald-500/30 p-2.5 rounded-xl">
                <div class="pr-2">
                    <div class="text-xs font-extrabold text-slate-100">${p.name}</div>
                    <div class="text-[10px] text-slate-400">${p.prevW} kg ➔ <b class="text-emerald-400">${p.curW} kg</b> (${p.basisText})</div>
                </div>
                <span class="text-xs font-black text-emerald-400 shrink-0">${p.pctDiff > 0 ? '+' + p.pctDiff + '%' : '+' + p.weightDiff + ' kg'}</span>
            </div>`).join('')
        : `<div class="text-xs text-slate-500 text-center py-2">Nessuna crescita registrata nel periodo selezionato (${bounds.label}).</div>`;

    const prsHtml = prs.length > 0
        ? prs.slice(0, 5).map(pr => `
            <div class="bg-slate-950 p-2.5 rounded-xl border border-amber-500/30 flex justify-between items-center">
                <div>
                    <div class="text-xs font-extrabold text-white"><span class="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded mr-1.5">PR</span>${pr.name}</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">Carico max: <b>${pr.maxWeight} kg</b> • 1RM stimato: <b class="text-amber-300">${pr.oneRM} kg</b></div>
                </div>
                ${pr.gain ? `<span class="text-xs font-black text-amber-400 shrink-0">+${pr.gain} kg</span>` : `<span class="text-[10px] font-bold text-blue-400 shrink-0">Record</span>`}
            </div>`).join('')
        : `<div class="text-xs text-slate-500 text-center py-2">Nessun nuovo PR battuto in questo intervallo.</div>`;

    container.innerHTML = `
        <div class="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-700/70 mb-3">
            <div>
                <div class="text-[10px] font-bold text-slate-400 uppercase">Indice Sovraccarico</div>
                <div class="text-xs text-slate-200 mt-0.5"><b>${progressing.length}</b> in crescita • <b>${stalled.length}</b> in stallo (≥3 sedute)</div>
            </div>
            ${statusPill}
        </div>

        <div class="mb-4">
            <div class="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider mb-2"><i class="fas fa-exclamation-triangle mr-1"></i>Radar Stallo Esercizi (Carico fermo da 3+ sedute)</div>
            <div class="space-y-2">${stallHtml}</div>
            ${stalled.length > 0 ? `<div class="mt-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 leading-relaxed"><i class="fas fa-lightbulb text-amber-400 mr-1"></i><b>Come sbloccare lo stallo:</b> prova ad aggiungere 1-2 ripetizioni prima di alzare il peso, rallenta la fase negativa (3 secondi) o valuta una settimana di scarico se senti stanchezza accumulata.</div>` : ''}
        </div>

        <div class="mb-4">
            <div class="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider mb-2"><i class="fas fa-arrow-trend-up mr-1"></i>Esercizi in Crescita (${bounds.label})</div>
            <div class="space-y-2">${progHtml}</div>
        </div>

        <div>
            <div class="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider mb-2"><i class="fas fa-trophy mr-1"></i>Bacheca Record Personali (PR) del Periodo</div>
            <div class="space-y-2">${prsHtml}</div>
        </div>
    `;

    return { overloadIndex, progressing, stalled, prs };
}

// ==================== 5. VARIAZIONE CIRCONFERENZE ====================
function renderMeasuresVariation(bounds) {
    const container = document.getElementById('report-measures-body');
    if (!container) return { hasData: false, deltas: [] };

    const hist = (JSON.parse(localStorage.getItem('measurements_history')) || [])
        .filter(m => m.date)
        .sort((a, b) => a.date.localeCompare(b.date));

    let inRange = hist.filter(m => m.date >= bounds.startStr && m.date <= bounds.endStr);
    let fallbackNote = '';
    if (inRange.length < 2 && hist.length >= 2) {
        inRange = [hist[0], hist[hist.length - 1]];
        fallbackNote = `<div class="text-[10px] text-amber-300 bg-amber-950/30 border border-amber-500/30 rounded-xl p-2 mb-3"><i class="fas fa-info-circle mr-1"></i>Meno di 2 misurazioni nel periodo scelto: confronto la tua prima e ultima misurazione storica.</div>`;
    }

    if (inRange.length < 2) {
        container.innerHTML = `<div class="text-center text-xs text-slate-500 py-6 bg-slate-900/70 rounded-xl border border-slate-800 border-dashed">Servono almeno <b>2 misurazioni corporee</b> salvate nel Profilo per confrontare i centimetri guadagnati o persi!</div>`;
        return { hasData: false, deltas: [] };
    }

    const first = inRange[0];
    const last = inRange[inRange.length - 1];
    const profile = JSON.parse(localStorage.getItem('user_profile')) || {};
    const goal = profile.obiettivo || 'maint';

    const fields = [
        { key: 'spalle', label: 'Spalle', goodUp: true },
        { key: 'petto', label: 'Petto', goodUp: true },
        { key: 'braccia', label: 'Braccia', goodUp: true },
        { key: 'vita', label: 'Vita', goodUp: false },
        { key: 'fianchi', label: 'Fianchi', goodUp: false },
        { key: 'cosce', label: 'Cosce', goodUp: true },
        { key: 'polpacci', label: 'Polpacci', goodUp: true }
    ];

    const deltas = [];
    let cardsHtml = '';

    fields.forEach(f => {
        const v1 = parseFloat(first[f.key]);
        const v2 = parseFloat(last[f.key]);
        if (!v1 || !v2) return;
        const diff = +(v2 - v1).toFixed(1);
        deltas.push({ label: f.label, v1, v2, diff });

        let color = 'text-slate-300';
        if (diff !== 0) {
            if (f.key === 'vita') {
                color = diff < 0 ? 'text-emerald-400' : (goal === 'cut' ? 'text-rose-400' : 'text-amber-400');
            } else {
                color = diff > 0 ? 'text-emerald-400' : 'text-rose-400';
            }
        }
        const sign = diff > 0 ? '+' : '';
        cardsHtml += `<div class="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/60 text-center">
            <div class="text-[9px] font-bold text-slate-400 uppercase">${f.label}</div>
            <div class="text-sm font-extrabold text-white mt-0.5">${v2} cm</div>
            <div class="text-[10px] font-black ${color} mt-0.5">${sign}${diff} cm</div>
            <div class="text-[8px] text-slate-500">da ${v1} cm</div>
        </div>`;
    });

    let vTaperHtml = '';
    if (parseFloat(last.spalle) > 0 && parseFloat(last.vita) > 0) {
        const vt = (parseFloat(last.spalle) / parseFloat(last.vita)).toFixed(2);
        vTaperHtml = `<div class="mt-3 bg-slate-950 p-3 rounded-xl border border-purple-500/30 flex justify-between items-center">
            <div>
                <div class="text-[10px] font-bold text-purple-400 uppercase">Indice V-Taper (Spalle / Vita)</div>
                <div class="text-[10px] text-slate-400">Riferimento estetico atletico: ~1.60</div>
            </div>
            <div class="text-base font-black text-white">${vt}</div>
        </div>`;
    }

    container.innerHTML = `
        ${fallbackNote}
        <div class="text-[11px] text-slate-300 mb-2.5 flex justify-between items-center bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800">
            <span>Confronto diretto:</span>
            <span class="font-extrabold text-blue-400">${formatDate(first.date)} ➔ ${formatDate(last.date)}</span>
        </div>
        <div class="grid grid-cols-3 gap-2">${cardsHtml || '<div class="col-span-3 text-xs text-slate-500 text-center">Nessun campo in comune tra le due date.</div>'}</div>
        ${vTaperHtml}
    `;

    return { hasData: deltas.length > 0, firstDate: first.date, lastDate: last.date, deltas };
}

// ==================== 6. ALIMENTAZIONE, MACRO, ACQUA & BILANCIO ENERGETICO ====================
function renderNutritionReportSection(bounds) {
    const container = document.getElementById('report-nutrition-body');
    if (!container) return { hasData: false };

    const profile = JSON.parse(localStorage.getItem('user_profile')) || {};
    const peso = parseFloat(profile.peso) || 0;
    const targets = typeof calculateMacroTargets === 'function' ? calculateMacroTargets() : { tdeeBase: 2000, goal: 'maint', kcal: 2000 };

    const dietDates = [];
    let sumKcal = 0, sumP = 0, sumC = 0, sumF = 0, sumBurn = 0;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith('diet_log_')) continue;
        const dStr = key.replace('diet_log_', '');
        if (dStr < bounds.startStr || dStr > bounds.endStr) continue;
        const items = JSON.parse(localStorage.getItem(key) || '[]');
        if (items.length === 0) continue;

        dietDates.push(dStr);
        items.forEach(it => {
            sumKcal += (it.kcal || 0);
            sumP += (it.p || 0);
            sumC += (it.c || 0);
            sumF += (it.f || 0);
        });
        const wBurn = typeof calculateWorkoutCaloriesForDate === 'function' ? calculateWorkoutCaloriesForDate(dStr).kcal : 0;
        sumBurn += (targets.tdeeBase + wBurn);
    }

    let waterDays = 0, sumWaterGlasses = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith('water_log_')) continue;
        const dStr = key.replace('water_log_', '');
        if (dStr < bounds.startStr || dStr > bounds.endStr) continue;
        const g = parseInt(localStorage.getItem(key) || '0', 10);
        if (g > 0) {
            waterDays++;
            sumWaterGlasses += g;
        }
    }

    const avgLiters = waterDays > 0 ? +((sumWaterGlasses / waterDays) * 0.25).toFixed(2) : 0;

    if (dietDates.length === 0) {
        container.innerHTML = `<div class="text-center text-xs text-slate-500 py-6 bg-slate-900/70 rounded-xl border border-slate-800 border-dashed">Nessun pasto registrato in questo periodo. Compila il diario in <b>Alimentazione</b> per vedere le tue medie!</div>`;
        return { hasData: false, avgLiters };
    }

    const n = dietDates.length;
    const avgKcal = Math.round(sumKcal / n);
    const avgP = Math.round(sumP / n);
    const avgC = Math.round(sumC / n);
    const avgF = Math.round(sumF / n);
    const avgBurn = Math.round(sumBurn / n);
    const avgNet = avgKcal - avgBurn;
    const protPerKg = peso > 0 ? (avgP / peso).toFixed(2) : null;

    const goalNames = { cut: 'Dimagrimento / Definizione', maint: 'Mantenimento / Ricomposizione', bulk: 'Aumento Massa Muscolare' };
    let coherent = false;
    let verdictText = '';

    if (targets.goal === 'cut') {
        if (avgNet <= -150 && avgNet >= -750) {
            coherent = true;
            verdictText = `Perfetto! Hai mantenuto un <b>deficit medio di ${Math.abs(avgNet)} kcal/giorno</b>, ideale per perdere grasso preservando i muscoli.`;
        } else if (avgNet > -150) {
            verdictText = `Attenzione: il tuo obiettivo è <b>Definizione</b>, ma il bilancio medio è ${avgNet > 0 ? '+' : ''}${avgNet} kcal. Riduci leggermente carbo o grassi per creare un vero deficit.`;
        } else {
            verdictText = `Deficit molto spinto (${avgNet} kcal/g): rischi calo di forza in palestra. Valuta di mangiare un po' di più nei giorni di allenamento.`;
        }
    } else if (targets.goal === 'bulk') {
        if (avgNet >= 100 && avgNet <= 550) {
            coherent = true;
            verdictText = `Ottimo! Il tuo <b>surplus medio di +${avgNet} kcal/giorno</b> è pulito e coerente per costruire massa muscolare limitando l'accumulo di grasso.`;
        } else if (avgNet < 100) {
            verdictText = `Attenzione: sei in obiettivo <b>Massa</b>, ma stai mangiando in media ${avgNet} kcal rispetto a ciò che bruci. Senza surplus è difficile crescere!`;
        } else {
            verdictText = `Surplus molto alto (+${avgNet} kcal/g): potresti accumulare grasso in eccesso. Punta a +200/+400 kcal sopra il dispendio.`;
        }
    } else {
        if (Math.abs(avgNet) <= 200) {
            coherent = true;
            verdictText = `Equilibrio centrato! Bilancio medio di <b>${avgNet > 0 ? '+' : ''}${avgNet} kcal/giorno</b>, perfetto per mantenimento e ricomposizione corporea.`;
        } else {
            verdictText = `Il tuo obiettivo è <b>Mantenimento</b>, ma la media si discosta di ${avgNet > 0 ? '+' : ''}${avgNet} kcal/g dal dispendio totale.`;
        }
    }

    container.innerHTML = `
        <div class="text-[10px] text-slate-400 mb-2.5">Medie calcolate su <b class="text-white">${n} giorni</b> registrati (Acqua su ${waterDays} giorni).</div>

        <div class="grid grid-cols-2 gap-2.5 mb-3">
            <div class="bg-slate-900/90 p-3 rounded-xl border border-slate-700/60">
                <div class="text-[9px] font-bold text-slate-400 uppercase">Media Calorie / Giorno</div>
                <div class="text-lg font-black text-white mt-0.5">${avgKcal} <span class="text-xs font-normal text-slate-400">kcal</span></div>
            </div>
            <div class="bg-slate-900/90 p-3 rounded-xl border border-cyan-500/30">
                <div class="text-[9px] font-bold text-cyan-400 uppercase"><i class="fas fa-tint mr-1"></i>Media Acqua</div>
                <div class="text-lg font-black text-cyan-300 mt-0.5">${avgLiters} <span class="text-xs font-normal text-slate-400">L/giorno</span></div>
            </div>
        </div>

        <div class="grid grid-cols-3 gap-2 mb-3 text-center">
            <div class="bg-slate-900/90 p-2.5 rounded-xl border border-blue-500/30">
                <div class="text-[9px] font-bold text-blue-400 uppercase">Proteine</div>
                <div class="text-sm font-extrabold text-white mt-0.5">${avgP} g</div>
                <div class="text-[9px] font-bold text-blue-300 mt-0.5">${protPerKg ? protPerKg + ' g/kg' : 'Inserisci peso'}</div>
            </div>
            <div class="bg-slate-900/90 p-2.5 rounded-xl border border-amber-500/30">
                <div class="text-[9px] font-bold text-amber-400 uppercase">Carbo</div>
                <div class="text-sm font-extrabold text-white mt-0.5">${avgC} g</div>
                <div class="text-[9px] text-slate-400 mt-0.5">energia/g</div>
            </div>
            <div class="bg-slate-900/90 p-2.5 rounded-xl border border-rose-500/30">
                <div class="text-[9px] font-bold text-rose-400 uppercase">Grassi</div>
                <div class="text-sm font-extrabold text-white mt-0.5">${avgF} g</div>
                <div class="text-[9px] text-slate-400 mt-0.5">ormoni/g</div>
            </div>
        </div>

        <div class="rounded-2xl p-3.5 border ${coherent ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-amber-950/25 border-amber-500/40'}">
            <div class="flex justify-between items-center mb-2">
                <span class="text-[10px] font-extrabold uppercase tracking-wider ${coherent ? 'text-emerald-400' : 'text-amber-400'}">
                    ${coherent ? '✅ Coerente con l\'Obiettivo' : '⚠️ Verifica Bilancio Medio'}
                </span>
                <span class="text-[10px] font-bold text-slate-300">${goalNames[targets.goal] || 'Mantenimento'}</span>
            </div>
            <div class="grid grid-cols-3 gap-1.5 text-center bg-slate-950/80 p-2 rounded-xl border border-slate-800 mb-2">
                <div><div class="text-[8px] text-slate-400 uppercase">Assunte</div><div class="text-xs font-extrabold text-white">${avgKcal}</div></div>
                <div><div class="text-[8px] text-slate-400 uppercase">Bruciate*</div><div class="text-xs font-extrabold text-orange-300">${avgBurn}</div></div>
                <div><div class="text-[8px] text-slate-400 uppercase">Bilancio</div><div class="text-xs font-black ${avgNet >= 0 ? 'text-blue-400' : 'text-emerald-400'}">${avgNet > 0 ? '+' : ''}${avgNet}</div></div>
            </div>
            <div class="text-[11px] text-slate-200 leading-snug">${verdictText}</div>
            <div class="text-[9px] text-slate-500 mt-1">*Bruciate = TDEE Base (${targets.tdeeBase} kcal) + media kcal palestra dei giorni analizzati.</div>
        </div>
    `;

    return { hasData: true, avgKcal, avgP, protPerKg, avgC, avgF, avgLiters, avgBurn, avgNet, coherent };
}

// ==================== 7. SCHEDA CONDIVISIBILE (WRAPPED / STRAVA STYLE) ====================
function drawRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function openShareableReportModal() {
    if (!lastComputedReport) renderReportDashboard();
    const modal = document.getElementById('report-share-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    renderShareableCanvasCard();
}

function closeShareableReportModal() {
    const modal = document.getElementById('report-share-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function renderShareableCanvasCard() {
    const canvas = document.getElementById('report-share-canvas');
    if (!canvas || !lastComputedReport) return;
    const ctx = canvas.getContext('2d');
    const W = 1080;
    const H = 1350;
    canvas.width = W;
    canvas.height = H;

    const r = lastComputedReport;
    const prof = JSON.parse(localStorage.getItem('user_profile')) || {};
    const userName = [prof.nome, prof.cognome].filter(Boolean).join(' ') || 'Atleta FitProgress';

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#020617');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    const glow1 = ctx.createRadialGradient(900, 180, 20, 900, 180, 420);
    glow1.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
    glow1.addColorStop(1, 'rgba(59, 130, 246, 0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, W, H);

    const glow2 = ctx.createRadialGradient(180, 1150, 20, 180, 1150, 450);
    glow2.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
    glow2.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('FITPROGRESS • REPORT WRAPPED', 70, 95);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 58px sans-serif';
    ctx.fillText(userName.toUpperCase(), 70, 165);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(`PERIODO: ${r.bounds.label.toUpperCase()}`, 70, 215);

    drawRoundRect(ctx, W - 340, 70, 270, 96, 28);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fill();
    ctx.strokeStyle = r.costanzaData.curBadge.color;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('GRADO STORICO', W - 310, 108);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px sans-serif';
    ctx.fillText(`${r.costanzaData.curBadge.icon} ${r.costanzaData.curBadge.name.toUpperCase()}`, W - 310, 148);

    drawRoundRect(ctx, 70, 265, W - 140, 235, 34);
    ctx.fillStyle = 'rgba(30, 41, 59, 0.78)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('GHISA SOLLEVATA NEL PERIODO', 110, 325);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 84px sans-serif';
    ctx.fillText(`${formatKg(r.costanzaData.periodTotalKg)} KG`, 110, 415);

    const comp = getVolumeComparison(r.costanzaData.periodTotalKg);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(`${comp.icon} Equivalente a: ${comp.short}`, 110, 468);

    const boxW = (W - 170) / 2;
    const boxH = 190;
    const startY = 535;

    const cards = [
        {
            title: '🔥 FUOCO STORICO',
            val: `${r.costanzaData.activeFires} WORKOUT`,
            sub: `${r.costanzaData.periodWorkouts} nel periodo • ${r.costanzaData.avgPerWeek}/sett.`,
            accent: '#f97316'
        },
        {
            title: '📈 SOVRACCARICO',
            val: `${r.overloadData.overloadIndex || 0}% CRESCITA`,
            sub: `${r.overloadData.prs.length} PR battuti • ${r.overloadData.stalled.length} in stallo`,
            accent: '#10b981'
        },
        {
            title: '🍽️ NUTRIZIONE MEDIA',
            val: r.nutritionData.hasData ? `${r.nutritionData.avgKcal} KCAL/G` : 'N/D',
            sub: r.nutritionData.hasData ? `Pro: ${r.nutritionData.avgP}g (${r.nutritionData.protPerKg || '-'} g/kg) • 💧 ${r.nutritionData.avgLiters}L` : 'Registra i pasti nel diario',
            accent: '#38bdf8'
        },
        {
            title: '📏 MISURE CORPOREE',
            val: r.measuresData.hasData ? `${r.measuresData.deltas.length} ZONE MONITORATE` : 'N/D',
            sub: r.measuresData.hasData ? r.measuresData.deltas.slice(0, 2).map(d => `${d.label} ${d.diff > 0 ? '+' : ''}${d.diff}cm`).join(' • ') : 'Salva 2 misure nel Profilo',
            accent: '#a855f7'
        }
    ];

    cards.forEach((c, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x = 70 + col * (boxW + 30);
        const y = startY + row * (boxH + 30);

        drawRoundRect(ctx, x, y, boxW, boxH, 28);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fill();
        ctx.strokeStyle = c.accent;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = c.accent;
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(c.title, x + 32, y + 52);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 42px sans-serif';
        ctx.fillText(c.val, x + 32, y + 115);

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(c.sub, x + 32, y + 158);
    });

    drawRoundRect(ctx, 70, 985, W - 140, 210, 30);
    ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('🏆 HIGHLIGHT & RECORD DEL PERIODO', 110, 1042);

    if (r.overloadData.prs.length > 0) {
        const topPr = r.overloadData.prs[0];
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 44px sans-serif';
        ctx.fillText(topPr.name.slice(0, 26), 110, 1108);
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(`Carico Max: ${topPr.maxWeight} kg  •  1RM Stimato: ${topPr.oneRM} kg`, 110, 1158);
    } else {
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 38px sans-serif';
        ctx.fillText(`Volume Storico Totale: ${formatKg(r.costanzaData.totalAllTimeKg)} kg`, 110, 1110);
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(`Record Streak: ${r.costanzaData.longestSessionStreak} allenamenti consecutivi 🔥`, 110, 1158);
    }

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('Generato con FitProgress App • #ConsistencyWins', 70, 1285);
}

function downloadShareableCardPNG() {
    const canvas = document.getElementById('report-share-canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `FitProgress-Report-${getTodayStr()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function buildShareableTextSummary() {
    if (!lastComputedReport) return '';
    const r = lastComputedReport;
    const comp = getVolumeComparison(r.costanzaData.periodTotalKg);
    let txt = `🏋️‍♂️ *FITPROGRESS REPORT (${r.bounds.label})*\n`;
    txt += `🏅 Grado Storico: ${r.costanzaData.curBadge.icon} *${r.costanzaData.curBadge.name}* (${formatKg(r.costanzaData.totalAllTimeKg)} kg totali)\n`;
    txt += `🔥 Fuoco Storico: *${r.costanzaData.activeFires}* allenamenti completati (${r.costanzaData.periodWorkouts} nel periodo • ${r.costanzaData.avgPerWeek}/sett.)\n`;
    txt += `💪 Volume del periodo: *${formatKg(r.costanzaData.periodTotalKg)} kg* (${comp.icon} ${comp.short})\n`;
    if (r.overloadData.prs.length > 0) {
        const pr = r.overloadData.prs[0];
        txt += `🏆 Top PR: *${pr.name}* — ${pr.maxWeight} kg (1RM: ${pr.oneRM} kg)\n`;
    }
    if (r.nutritionData.hasData) {
        txt += `🍽️ Media Diet: *${r.nutritionData.avgKcal} kcal/g* (P: ${r.nutritionData.avgP}g${r.nutritionData.protPerKg ? ' / ' + r.nutritionData.protPerKg + 'g/kg' : ''} • C: ${r.nutritionData.avgC}g • G: ${r.nutritionData.avgF}g • 💧 ${r.nutritionData.avgLiters}L)\n`;
    }
    if (r.measuresData.hasData) {
        const mSummary = r.measuresData.deltas.map(d => `${d.label}: ${d.diff > 0 ? '+' : ''}${d.diff}cm`).join(', ');
        txt += `📏 Misure: ${mSummary}\n`;
    }
    return txt;
}

async function nativeShareReportCard() {
    const text = buildShareableTextSummary();
    const canvas = document.getElementById('report-share-canvas');

    if (navigator.share && canvas) {
        try {
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const file = new File([blob], `FitProgress-Report-${getTodayStr()}.png`, { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ title: 'Il mio Report FitProgress', text, files: [file] });
                return;
            }
            await navigator.share({ title: 'Il mio Report FitProgress', text });
            return;
        } catch (err) {
            console.log('Share annullata o non supportata:', err);
        }
    }
    copyShareableReportText();
}

function copyShareableReportText() {
    const text = buildShareableTextSummary();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            alert("Report testuale copiato! Ora puoi incollarlo su WhatsApp o mandarlo al tuo coach.");
        }).catch(() => {
            prompt("Copia il testo del report:", text);
        });
    } else {
        prompt("Copia il testo del report:", text);
    }
}