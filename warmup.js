// ==================== DATABASE MOBILITA' ====================
// Dizionario dei protocolli di riscaldamento suddivisi per macro-area
const mobilityDB = {
    "lower": [
        { name: "90/90 Hip Rotation (Mobilità Anche)", reps: "10 per lato" },
        { name: "Glute Bridge (Attivazione Glutei)", reps: "15 reps con fermo in alto 1s" },
        { name: "Cossack Squat / Affondi laterali", reps: "8 per lato (profondi)" },
        { name: "Ankle Mobility (Caviglia al muro)", reps: "10 flessioni per caviglia" }
    ],
    "upper_push": [
        { name: "Dislocazioni Spalle (con bastone o elastico)", reps: "15 reps lente" },
        { name: "Push-up sulle ginocchia o al muro", reps: "10 reps esplosive" },
        { name: "Estensioni Toraciche su Foam Roller", reps: "10 reps" },
        { name: "Rotazioni Esterne Cuffia (Elastico leggero)", reps: "15 per lato" }
    ],
    "upper_pull": [
        { name: "Cat-Cow (Gatto-Mucca)", reps: "12 reps fluide" },
        { name: "Scapular Pull-up (Retrazioni appesi)", reps: "10 reps (fermo 2s)" },
        { name: "Face Pull leggero o Band Pull-apart", reps: "15 reps" },
        { name: "Allungamento Dorsale in ginocchio", reps: "30 secondi per lato" }
    ],
    "core": [
        { name: "Bird-Dog", reps: "10 per lato (controllo totale)" },
        { name: "Plank Spalle Toccate (Shoulder Taps)", reps: "20 tocchi lenti" },
        { name: "Dead Bug", reps: "10 per lato" }
    ]
};

// ==================== LOGICA GENERAZIONE ====================
let currentWarmupDayKey = null;

// Funzione principale che apre il modale
function openWarmupModal(dayKey) {
    currentWarmupDayKey = dayKey;
    const dayData = currentRoutine.days[dayKey];
    
    // Aggiorna il titolo del modale
    document.getElementById('warmup-day-subtitle').innerText = `Protocollo per: ${dayData.title}`;

    // Se il warmup non esiste o la scheda era vuota quando è stato creato, lo generiamo
    if (!dayData.warmup || dayData.warmup.mobility.length === 0) {
        generateDayWarmup(dayKey);
    }
    
    // Renderizziamo il contenuto
    renderWarmupModalBody();
    
    document.getElementById('warmup-modal').classList.remove('hidden');
    document.getElementById('warmup-modal').classList.add('flex');
}

function closeWarmupModal() {
    document.getElementById('warmup-modal').classList.add('hidden');
    document.getElementById('warmup-modal').classList.remove('flex');
    currentWarmupDayKey = null;
}

function regenerateDayWarmup() {
    if (!currentWarmupDayKey) return;
    showCustomConfirm("Vuoi ricalcolare il riscaldamento analizzando gli esercizi attuali della scheda?", () => {
        generateDayWarmup(currentWarmupDayKey);
        renderWarmupModalBody();
    });
}

function generateDayWarmup(dayKey) {
    const dayExercises = currentRoutine.days[dayKey].exercises.filter(ex => !ex.deletedFromRoutine);
    
    // 1. Troviamo il primo esercizio per il ramping
    let rampingEx = null;
    let targetW = 0;
    if (dayExercises.length > 0) {
        rampingEx = dayExercises[0];
        targetW = getHistoricalMaxWeight(rampingEx.name); // Pesca il massimale storico
    }

    // 2. Analizziamo i distretti muscolari dell'intera giornata
    let scores = { lower: 0, upper_push: 0, upper_pull: 0, core: 0 };
    
    dayExercises.forEach(ex => {
        if (!ex.muscles) return;
        for (const [m, sc] of Object.entries(ex.muscles)) {
            if (m.includes('quads') || m.includes('glutes') || m.includes('hamstrings') || m.includes('calves') || m.includes('adductors')) scores.lower += sc;
            if (m.includes('chest') || m.includes('front-shoulder') || m.includes('triceps')) scores.upper_push += sc;
            if (m.includes('lats') || m.includes('traps') || m.includes('back-shoulder') || m.includes('biceps')) scores.upper_pull += sc;
            if (m.includes('abs') || m.includes('obliques') || m.includes('lowerback')) scores.core += sc;
        }
    });

    // 3. Selezioniamo le 2 macro-aree più allenate
    const sortedAreas = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    let primaryArea = sortedAreas[0][1] > 0 ? sortedAreas[0][0] : "core"; // Fallback su core se vuoto
    let secondaryArea = sortedAreas[1][1] > 0 ? sortedAreas[1][0] : null;

    // 4. Peschiamo gli esercizi di mobilità
    let selectedMobility = [];
    if (secondaryArea && secondaryArea !== primaryArea) {
        // Peschiamo 2 esercizi dalla primaria e 2 dalla secondaria
        selectedMobility.push(mobilityDB[primaryArea][0], mobilityDB[primaryArea][1]);
        selectedMobility.push(mobilityDB[secondaryArea][0], mobilityDB[secondaryArea][1]);
    } else {
        // Peschiamo 3-4 esercizi dalla singola area primaria
        selectedMobility = mobilityDB[primaryArea].slice(0, 4);
    }

    // 5. Salviamo nel database della routine
    currentRoutine.days[dayKey].warmup = {
        mobility: selectedMobility,
        rampingExerciseName: rampingEx ? rampingEx.name : null,
        targetWeight: targetW
    };
    
    saveAllRoutines();
}

function getHistoricalMaxWeight(exName) {
    const hk = 'hist_' + exName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const logs = JSON.parse(localStorage.getItem(hk)) || [];
    if (logs.length === 0) return "";
    let max = 0;
    logs.forEach(l => {
        let w = parseFloat(l.weight);
        if (w > max) max = w;
    });
    return max > 0 ? max : "";
}

// ==================== RENDERIZZAZIONE WARM-UP ====================
function renderWarmupModalBody() {
    const data = currentRoutine.days[currentWarmupDayKey].warmup;
    const body = document.getElementById('warmup-modal-body');
    
    if (!data || data.mobility.length === 0) {
        body.innerHTML = `<div class="text-sm text-slate-400 text-center py-6">Nessun esercizio nella scheda. Aggiungi esercizi per generare un riscaldamento.</div>`;
        return;
    }

    // HTML Mobilità
    let mobHtml = `
        <div class="mb-5">
            <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5"><i class="fas fa-child text-blue-400"></i> Circuito Mobilità Specifica</h3>
            <div class="space-y-2">
    `;
  data.mobility.forEach((m, idx) => {
        mobHtml += `
            <div onclick="this.classList.toggle('checked')" class="warmup-check-row bg-slate-900/80 p-3 rounded-xl border border-slate-700/50 flex justify-between items-center cursor-pointer transition-all">
                <div class="flex-1 pr-2">
                    <div class="text-sm font-bold text-slate-200">${m.name}</div>
                    <div class="text-[11px] text-slate-400">${m.reps}</div>
                </div>
                <div class="flex items-center gap-3">
                   <!-- Tasto Cambia Esercizio -->
                    <button onclick="event.stopPropagation(); swapMobilityExercise(${idx})" title="Cambia esercizio" class="text-slate-500 hover:text-blue-400 transition-colors p-1 flex items-center justify-center">
                        <i class="fas fa-sync-alt text-xs"></i>
                    </button>
                    <!-- Check di completamento -->
                    <div class="w-6 h-6 rounded-full border-2 border-slate-600 flex items-center justify-center check-circle transition-colors shrink-0">
                        <i class="fas fa-check text-slate-900 text-xs opacity-0"></i>
                    </div>
                </div>
            </div>
        `;
    });
    mobHtml += `</div></div>`;

    // HTML Ramping (Serie di Avvicinamento)
    let rampHtml = '';
    if (data.rampingExerciseName) {
        rampHtml = `
            <div>
                <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5"><i class="fas fa-sort-amount-up text-orange-400"></i> Avvicinamento al Carico</h3>
                
                <div class="bg-slate-900 p-3.5 rounded-xl border border-orange-500/30 shadow-inner mb-3">
                    <div class="text-[10px] text-slate-400 mb-1">Primo esercizio multiarticolare:</div>
                    <div class="font-extrabold text-white text-sm mb-3 text-orange-400">${data.rampingExerciseName}</div>
                    
                    <div class="flex justify-between items-center gap-3">
                        <label class="text-xs font-bold text-slate-300">Carico Target Oggi (Kg):</label>
                        <input type="number" id="warmup-target-weight" value="${data.targetWeight}" step="0.5" oninput="updateRampingTable()" placeholder="Es. 80" class="w-20 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-extrabold text-center outline-none focus:border-orange-500">
                    </div>
                </div>
                
                <div id="ramping-table-container"></div>
            </div>
        `;
    }

    body.innerHTML = mobHtml + rampHtml;
    
    // Per gestire il CSS del click sulla checkbox
    document.querySelectorAll('.warmup-check-row').forEach(row => {
        row.addEventListener('click', function() {
            const icon = this.querySelector('.fa-check');
            const circle = this.querySelector('.check-circle');
            if (this.classList.contains('checked')) {
                icon.classList.remove('opacity-0');
                icon.classList.add('text-emerald-400');
                circle.classList.add('border-emerald-500');
                circle.classList.remove('border-slate-600');
            } else {
                icon.classList.add('opacity-0');
                icon.classList.remove('text-emerald-400');
                circle.classList.remove('border-emerald-500');
                circle.classList.add('border-slate-600');
            }
        });
    });

    if (data.rampingExerciseName) updateRampingTable();
}

function updateRampingTable() {
    const val = parseFloat(document.getElementById('warmup-target-weight').value);
    const container = document.getElementById('ramping-table-container');
    
    // Salva il peso se lo modifichi manualmente, così resta nel Giorno salvato
    if(!isNaN(val) && currentWarmupDayKey) {
        currentRoutine.days[currentWarmupDayKey].warmup.targetWeight = val;
        saveAllRoutines();
    }

    if (isNaN(val) || val <= 0) {
        container.innerHTML = `<div class="text-[11px] text-slate-500 text-center py-2 italic">Inserisci il carico target in alto per calcolare le serie di avvicinamento.</div>`;
        return;
    }

    let sets = [];
    if (val < 30) {
        sets = [ { desc: "Set Preparatorio", reps: "10-12", pct: 0.5, note: "Metà del peso, movimento controllato" } ];
    } else if (val <= 70) {
        sets = [
            { desc: "Set 1 (Riscaldamento)", reps: "10", pct: 0.3, note: "A vuoto o leggerissimo" },
            { desc: "Set 2 (Attivazione)", reps: "5", pct: 0.7, note: "Volume basso per non stancarti" }
        ];
    } else {
        sets = [
            { desc: "Set 1 (Lubrificazione)", reps: "10-12", pct: 0, overrideWeight: 20, note: "Solo bilanciere" },
            { desc: "Set 2 (Riscaldamento)", reps: "5", pct: 0.5, note: "Metà carico" },
            { desc: "Set 3 (Ramping)", reps: "3", pct: 0.75, note: "Inizia a farsi sentire" },
            { desc: "Set 4 (Singola SNC)", reps: "1", pct: 0.9, note: "Sveglia il sistema nervoso, non stanca" }
        ];
    }

    let html = `<div class="bg-slate-900 rounded-xl border border-slate-700/50 overflow-hidden divide-y divide-slate-800">`;
    sets.forEach(s => {
        // Se c'è un override (es. il bilanciere vuoto è sempre ~20kg)
        let calcW = s.overrideWeight ? s.overrideWeight : Math.round((val * s.pct) / 2.5) * 2.5; 
        
        html += `
            <div class="p-3 flex items-center justify-between">
                <div>
                    <div class="text-xs font-bold text-slate-200">${s.desc}</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">${s.note}</div>
                </div>
                <div class="text-right">
                    <div class="font-extrabold text-white text-base">${calcW} <span class="text-xs text-slate-400 font-normal">kg</span></div>
                    <div class="text-[11px] text-orange-400 font-bold">x ${s.reps} reps</div>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
}
// Funzione per cambiare un singolo esercizio di mobilità
function swapMobilityExercise(idx) {
    if (!currentWarmupDayKey) return;
    
    const data = currentRoutine.days[currentWarmupDayKey].warmup;
    const currentEx = data.mobility[idx];

    // 1. Troviamo a quale categoria appartiene l'esercizio attuale
    let exCategory = null;
    for (const [cat, exercises] of Object.entries(mobilityDB)) {
        if (exercises.some(e => e.name === currentEx.name)) {
            exCategory = cat;
            break;
        }
    }

    if (exCategory) {
        const categoryExercises = mobilityDB[exCategory];
        
        // 2. Creiamo una lista degli esercizi attuali per non pescare dei doppioni
        const currentNames = data.mobility.map(m => m.name);
        
        // 3. Troviamo le alternative (stessa categoria, ma non presenti nel warmup)
        let alternatives = categoryExercises.filter(e => !currentNames.includes(e.name));

        // Se abbiamo finito le alternative uniche, peschiamo comunque uno diverso da quello attuale
        if (alternatives.length === 0) {
            alternatives = categoryExercises.filter(e => e.name !== currentEx.name);
        }

        // 4. Selezioniamo l'alternativa a caso e salviamo
        if (alternatives.length > 0) {
            const randomSub = alternatives[Math.floor(Math.random() * alternatives.length)];
            data.mobility[idx] = randomSub;
            
            // Salviamo la modifica nel database per renderla permanente
            saveAllRoutines(); 
            // Aggiorniamo la grafica in tempo reale
            renderWarmupModalBody();
        }
    }
}