// ==================== CONFIGURAZIONE FIREBASE (fitprogress-23e53) ====================
const firebaseConfig = {
  apiKey: "AIzaSyCcZliSUu1hyZxtwhCtmGWiI5QNcSWiUAQ",
  authDomain: "fitprogress-23e53.firebaseapp.com",
  projectId: "fitprogress-23e53",
  storageBucket: "fitprogress-23e53.firebasestorage.app",
  messagingSenderId: "986438672711",
  appId: "1:986438672711:web:5595f501ab3831372eac62",
  measurementId: "G-BZPM1R3BY7"
};

let fbApp = null;
let fbAuth = null;
let fbDb = null;
let currentCloudUser = null;
let authModalMode = 'login';
let isSyncingToCloud = false;

function initFirebaseService() {
    try {
        if (typeof firebase !== 'undefined' && firebaseConfig.apiKey) {
            if (!firebase.apps.length) {
                fbApp = firebase.initializeApp(firebaseConfig);
            } else {
                fbApp = firebase.app();
            }
            fbAuth = firebase.auth();
            fbDb = firebase.firestore();

            fbAuth.onAuthStateChanged(async (user) => {
                currentCloudUser = user || null;
                updateCloudAccountUI();

                if (currentCloudUser) {
                    await pullUserDataFromCloudOnLogin(currentCloudUser.uid);
                    checkDailyMidnightSync(false);
                }
            });
        }
    } catch (err) {
        console.warn("Firebase non inizializzato:", err);
    }
}

// ==================== VARIABILI GLOBALI ====================
let selectedDbExercise = null;
let calCurrentDate = new Date();
let currentMapBaseDate = null;
let currentMapRange = 1;
let currentDomsFilters = [];

let selectedHomeFood = null;
let currentPortionSize = 'M';
let currentCondimentLevel = 'norm';
let selectedOnlineFood = null;
let onlineSearchResultsCache = [];
let selectedGymFood = null;
let currentGymMultiplier = 1;
let selectedCheatFood = null;
let currentCheatCombo = 'single';

function getHistKey(exName) { return 'hist_' + exName.toLowerCase().replace(/[^a-z0-9]/g, ''); }
function getTodayStr() { return new Date().toISOString().split('T')[0]; }

const defaultRoutineData = { name: "La Mia Scheda", days: { giorno1: { title: "Giorno 1", desc: "Inizia ad aggiungere esercizi", exercises: [] } } };

let allRoutines = JSON.parse(localStorage.getItem('all_saved_routines')) || { "default-routine-id": defaultRoutineData };
let activeRoutineId = localStorage.getItem('active_routine_id') || "default-routine-id";
if(!allRoutines[activeRoutineId]) activeRoutineId = Object.keys(allRoutines)[0];

function getSortedDayKeys(daysObj = currentRoutine.days) {
    if (!daysObj || typeof daysObj !== 'object') return [];
    return Object.keys(daysObj).sort((a, b) => {
        const titleA = (daysObj[a] && daysObj[a].title) ? String(daysObj[a].title) : '';
        const titleB = (daysObj[b] && daysObj[b].title) ? String(daysObj[b].title) : '';
        const matchA = titleA.match(/\d+/) || a.match(/\d+/);
        const matchB = titleB.match(/\d+/) || b.match(/\d+/);
        const numA = matchA ? parseInt(matchA[0], 10) : 999;
        const numB = matchB ? parseInt(matchB[0], 10) : 999;
        if (numA !== numB) return numA - numB;
        return a.localeCompare(b);
    });
}

function normalizeAllRoutinesDaysOrder() {
    if (!allRoutines || typeof allRoutines !== 'object') return;
    for (const rId of Object.keys(allRoutines)) {
        const rData = allRoutines[rId];
        if (!rData || !rData.days) continue;
        const sortedDays = {};
        getSortedDayKeys(rData.days).forEach(k => {
            sortedDays[k] = rData.days[k];
        });
        rData.days = sortedDays;
    }
    if (allRoutines[activeRoutineId]) {
        currentRoutine = allRoutines[activeRoutineId];
    }
}

function saveAllRoutines() {
    normalizeAllRoutinesDaysOrder();
    localStorage.setItem('all_saved_routines', JSON.stringify(allRoutines));
    localStorage.setItem('active_routine_id', activeRoutineId);
}
let currentRoutine = allRoutines[activeRoutineId];
normalizeAllRoutinesDaysOrder();
let chartInstances = {};
let confirmCallback = null;

function getCurrentTimeStr() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function migrateHistory() {
    for (const [rId, rData] of Object.entries(allRoutines)) {
        for (const [dk, d] of Object.entries(rData.days)) {
            d.exercises.forEach(ex => {
                const oldKey = `hist-${ex.id}`;
                const oldDataStr = localStorage.getItem(oldKey);
                if (oldDataStr) {
                    const hk = getHistKey(ex.name);
                    let oldData = JSON.parse(oldDataStr);
                    let newData = JSON.parse(localStorage.getItem(hk)) || [];
                    oldData.forEach(o => { if(!newData.some(n => n.date===o.date && n.sets===o.sets && n.reps===o.reps && n.weight===o.weight)) newData.push(o); });
                    newData.sort((a,b) => new Date(b.date) - new Date(a.date));
                    localStorage.setItem(hk, JSON.stringify(newData));
                    localStorage.removeItem(oldKey);
                }
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    migrateHistory();
    caricaProfilo();
    renderMeasurements();
    const today = new Date();
    document.getElementById('measure-date').valueAsDate = today;
    document.getElementById('prog-date').valueAsDate = today;
    document.getElementById('diet-date').valueAsDate = today;
    document.getElementById('diary-inspect-date').valueAsDate = today;
    initCalendarDropdowns();
    buildDaysNavigation();
    renderWorkouts();
    renderProgressioni();
    renderMonthlyCalendar();
    renderNutritionDashboard();
    updateProfileMetabolicSummary();
    updateCloudAccountUI();
    switchMainTab('workout');

    initFirebaseService();

    // Controllo automatico sincronizzazione ogni 15 minuti
    setInterval(() => {
        if (currentCloudUser) {
            autoSyncIfTimePassed();
        }
    }, 15 * 60 * 1000);

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && currentCloudUser) {
            autoSyncIfTimePassed();
        }
    });
});

// Sincronizzazione automatica intelligente basata su orario (es. 03:00) o ultima sync
async function autoSyncIfTimePassed() {
    const now = new Date();
    const meta = JSON.parse(localStorage.getItem('cloud_sync_meta')) || {};
    const lastSyncDate = meta.lastSyncDate;
    const todayStr = getTodayStr();

    // Se è passato un giorno o se sono le 3 del mattino
    if (lastSyncDate !== todayStr || (now.getHours() >= 3 && now.getHours() < 4)) {
        await syncToCloud(false);
    }
}

// ==================== AUTENTICAZIONE & CLOUD SYNC (SPARK OTTIMIZZATO) ====================
function updateCloudAccountUI() {
    const subEl = document.getElementById('cloud-acc-subtitle');
    const statusEl = document.getElementById('cloud-status-text');
    const lastSyncEl = document.getElementById('cloud-last-sync-text');
    const pillEl = document.getElementById('cloud-status-pill');
    const outBox = document.getElementById('cloud-logged-out-box');
    const inBox = document.getElementById('cloud-logged-in-box');

    const lastSyncMeta = JSON.parse(localStorage.getItem('cloud_sync_meta')) || null;
    if (lastSyncEl) {
        lastSyncEl.innerText = lastSyncMeta && lastSyncMeta.lastSyncAt
            ? `Ultimo sync: ${lastSyncMeta.lastSyncAt}`
            : 'Ultimo sync: Mai';
    }

    if (currentCloudUser) {
        if (subEl) subEl.innerText = `Connesso: ${currentCloudUser.email || 'Account attivo'}`;
        if (statusEl) statusEl.innerText = currentCloudUser.email || 'Utente Autenticato';
        if (pillEl) {
            pillEl.className = "text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40";
            pillEl.innerText = "Cloud Attivo";
        }
        if (outBox) outBox.classList.add('hidden');
        if (inBox) inBox.classList.remove('hidden');
    } else {
        if (subEl) subEl.innerText = "Modalità locale • Accedi per sincronizzare";
        if (statusEl) statusEl.innerText = "Ospite (Solo Locale)";
        if (pillEl) {
            pillEl.className = "text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700";
            pillEl.innerText = "Locale";
        }
        if (outBox) outBox.classList.remove('hidden');
        if (inBox) inBox.classList.add('hidden');
    }
}

function openAuthModal(mode = 'login') {
    switchAuthMode(mode);
    const errEl = document.getElementById('auth-error-msg');
    if (errEl) { errEl.classList.add('hidden'); errEl.innerText = ''; }
    document.getElementById('auth-modal').classList.remove('hidden');
    document.getElementById('auth-modal').classList.add('flex');
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('auth-modal').classList.remove('flex');
}

function switchAuthMode(mode) {
    authModalMode = mode;
    const tLogin = document.getElementById('auth-tab-login');
    const tReg = document.getElementById('auth-tab-register');
    const title = document.getElementById('auth-modal-title');
    const submitBtn = document.getElementById('auth-submit-btn');

    if (mode === 'login') {
        tLogin.className = "py-2 rounded-lg text-xs font-bold bg-blue-600 text-white transition-colors";
        tReg.className = "py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-colors";
        title.innerHTML = `<i class="fas fa-sign-in-alt text-blue-400"></i> Accedi al tuo Account`;
        submitBtn.innerText = "Accedi e Recupera Dati";
    } else {
        tReg.className = "py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white transition-colors";
        tLogin.className = "py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-colors";
        title.innerHTML = `<i class="fas fa-user-plus text-emerald-400"></i> Crea Nuovo Account`;
        submitBtn.innerText = "Registrati e Salva su Cloud";
    }
}

function showAuthError(msg) {
    const errEl = document.getElementById('auth-error-msg');
    if (!errEl) return;
    errEl.innerText = msg;
    errEl.classList.remove('hidden');
}

async function submitEmailAuth() {
    if (!fbAuth) return showAuthError("Servizio Firebase non disponibile. Controlla la connessione.");
    const email = (document.getElementById('auth-email').value || '').trim();
    const password = document.getElementById('auth-password').value || '';
    const btn = document.getElementById('auth-submit-btn');

    if (!email || !password) {
        return showAuthError("Inserisci sia email che password.");
    }
    if (password.length < 6) {
        return showAuthError("La password deve avere almeno 6 caratteri.");
    }

    btn.disabled = true;
    btn.innerText = "Attendere...";

    try {
        if (authModalMode === 'login') {
            await fbAuth.signInWithEmailAndPassword(email, password);
        } else {
            await fbAuth.createUserWithEmailAndPassword(email, password);
        }
        closeAuthModal();
    } catch (err) {
        let friendly = err.message || "Errore durante l'autenticazione.";
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
            friendly = "Email o password non corretti.";
        } else if (err.code === 'auth/email-already-in-use') {
            friendly = "Questa email è già registrata. Passa alla scheda Accedi.";
        } else if (err.code === 'auth/invalid-email') {
            friendly = "Indirizzo email non valido.";
        }
        showAuthError(friendly);
    } finally {
        btn.disabled = false;
        switchAuthMode(authModalMode);
    }
}

async function sendPasswordReset() {
    if (!fbAuth) return showAuthError("Servizio Firebase non disponibile.");
    const email = (document.getElementById('auth-email').value || '').trim();
    if (!email) {
        return showAuthError("Inserisci prima la tua email per ricevere il link di recupero.");
    }
    try {
        await fbAuth.sendPasswordResetEmail(email);
        showAuthError("Email di recupero inviata! Controlla anche la cartella Spam.");
    } catch (err) {
        showAuthError("Impossibile inviare l'email di recupero. Verifica l'indirizzo.");
    }
}

function handleGoogleLoginClick() {
    alert("Su APK Cordova/WebView il popup Google standard viene bloccato da Google. Usa l'accesso con Email e Password (già attivo e funzionante su APK), oppure configura un plugin nativo Google Sign-In con SHA-1 nella tua build.");
}

async function logoutCloudUser() {
    if (!fbAuth) return;
    showCustomConfirm("Vuoi uscire dall'account cloud? I dati locali resteranno su questo dispositivo.", async () => {
        try {
            await fbAuth.signOut();
            currentCloudUser = null;
            updateCloudAccountUI();
        } catch (err) {
            alert("Errore durante il logout.");
        }
    });
}

// Raccoglie i dati locali rilevanti per la sincronizzazione cloud
function collectLocalSnapshot() {
    const snapshot = {
        user_profile: JSON.parse(localStorage.getItem('user_profile') || 'null'),
        all_saved_routines: JSON.parse(localStorage.getItem('all_saved_routines') || 'null'),
        active_routine_id: localStorage.getItem('active_routine_id') || null,
        measurements_history: JSON.parse(localStorage.getItem('measurements_history') || '[]'),
        exercise_history: {},
        diet_logs: {},
        water_logs: {},
        exercise_prefs: {},
        updatedAt: new Date().toISOString(),
        lastSyncDate: getTodayStr()
    };

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        if (key.startsWith('hist_')) {
            snapshot.exercise_history[key] = JSON.parse(localStorage.getItem(key) || '[]');
        } else if (key.startsWith('diet_log_')) {
            snapshot.diet_logs[key] = JSON.parse(localStorage.getItem(key) || '[]');
        } else if (key.startsWith('water_log_')) {
            snapshot.water_logs[key] = parseInt(localStorage.getItem(key) || '0', 10);
        } else if (key.startsWith('order-') || key.endsWith('-sets') || key.endsWith('-reps') || key.endsWith('-rest')) {
            snapshot.exercise_prefs[key] = localStorage.getItem(key);
        }
    }

    return snapshot;
}

function applyCloudSnapshotToLocal(data) {
    if (!data) return;

    if (data.user_profile) {
        localStorage.setItem('user_profile', JSON.stringify(data.user_profile));
    }
    if (data.all_saved_routines) {
        localStorage.setItem('all_saved_routines', JSON.stringify(data.all_saved_routines));
        allRoutines = data.all_saved_routines;
    }
    if (data.active_routine_id && allRoutines[data.active_routine_id]) {
        activeRoutineId = data.active_routine_id;
        localStorage.setItem('active_routine_id', activeRoutineId);
    } else {
        activeRoutineId = Object.keys(allRoutines)[0];
        localStorage.setItem('active_routine_id', activeRoutineId);
    }
    currentRoutine = allRoutines[activeRoutineId];
    normalizeAllRoutinesDaysOrder();
    localStorage.setItem('all_saved_routines', JSON.stringify(allRoutines));

    if (Array.isArray(data.measurements_history)) {
        localStorage.setItem('measurements_history', JSON.stringify(data.measurements_history));
    }

    if (data.exercise_history && typeof data.exercise_history === 'object') {
        for (const [hk, arr] of Object.entries(data.exercise_history)) {
            localStorage.setItem(hk, JSON.stringify(arr || []));
        }
    }

    if (data.diet_logs && typeof data.diet_logs === 'object') {
        for (const [dk, arr] of Object.entries(data.diet_logs)) {
            localStorage.setItem(dk, JSON.stringify(arr || []));
        }
    }

    if (data.water_logs && typeof data.water_logs === 'object') {
        for (const [wk, val] of Object.entries(data.water_logs)) {
            localStorage.setItem(wk, String(val || 0));
        }
    }

    if (data.exercise_prefs && typeof data.exercise_prefs === 'object') {
        for (const [pk, val] of Object.entries(data.exercise_prefs)) {
            if (val !== null && val !== undefined) {
                localStorage.setItem(pk, String(val));
            }
        }
    }

    // Aggiorna tutte le schermate con i dati recuperati
    caricaProfilo();
    renderMeasurements();
    buildDaysNavigation();
    renderWorkouts();
    renderProgressioni();
    renderMonthlyCalendar();
    renderNutritionDashboard();
    updateProfileMetabolicSummary();
    reopenCurrentTab();
}

// Recupero dati forzato al login: se esistono dati sul Cloud, li scarica e sovrascrive il locale (fondamentale per APK)
async function pullUserDataFromCloudOnLogin(uid) {
    if (!fbDb || !uid) return;

    console.log("LOGIN RILEVATO: Recupero dati dal Cloud...");
    try {
        const docRef = fbDb.collection('users').doc(uid).collection('appData').doc('snapshot');
        const snap = await docRef.get();

        if (snap.exists && snap.data()) {
            const cloudData = snap.data();
            console.log("Dati cloud trovati. Applicazione forzata in locale...");

            // Applichiamo i dati del cloud come fonte primaria
            applyCloudSnapshotToLocal(cloudData);

            const nowStr = new Date().toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });
            localStorage.setItem('cloud_sync_meta', JSON.stringify({
                lastSyncDate: getTodayStr(),
                lastSyncAt: nowStr
            }));
            updateCloudAccountUI();

            // Ricarichiamo l'interfaccia per mostrare i dati
            // window.location.reload(); -> Rimosso per evitare il loop infinito di ricaricamento schermata
        } else {
            console.log("Cloud vuoto: nessun dato da recuperare.");
        }
    } catch (err) {
        console.warn("Errore durante il recupero forzato dal cloud:", err);
    }
}

// Controlla se è cambiata la data rispetto all'ultimo sync (gestione cambio giorno / mezzanotte)
async function checkDailyMidnightSync(showAlert = false) {
    if (!currentCloudUser || !fbDb) return;
    const todayStr = getTodayStr();
    const meta = JSON.parse(localStorage.getItem('cloud_sync_meta')) || {};
    if (meta.lastSyncDate !== todayStr) {
        await syncToCloud(showAlert);
    }
}

// Sincronizzazione manuale ("Sincronizza ora") o automatica al cambio giorno
async function syncToCloud(showFeedback = true) {
    if (!fbDb || !currentCloudUser) {
        if (showFeedback) {
            alert("Accedi con il tuo account Email/Password per sincronizzare i dati sul cloud.");
        }
        return;
    }
    if (isSyncingToCloud) return;
    isSyncingToCloud = true;

    const btn = document.getElementById('btn-manual-sync');
    const origBtnHtml = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Sync...`;
    }

    try {
        const snapshot = collectLocalSnapshot();
        await fbDb.collection('users').doc(currentCloudUser.uid).collection('appData').doc('snapshot').set(snapshot, { merge: true });

        const nowStr = new Date().toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });
        localStorage.setItem('cloud_sync_meta', JSON.stringify({
            lastSyncDate: getTodayStr(),
            lastSyncAt: nowStr
        }));
        updateCloudAccountUI();

        if (showFeedback) {
            alert("Sincronizzazione cloud completata! Tutti i tuoi progressi sono al sicuro.");
        }
    } catch (err) {
        console.error("Errore sincronizzazione cloud:", err);
        if (showFeedback) {
            alert("Errore durante la sincronizzazione cloud. I tuoi dati restano salvati in locale.");
        }
    } finally {
        isSyncingToCloud = false;
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = origBtnHtml;
        }
    }
}

// ==================== NAVIGAZIONE PRINCIPALE ====================
function switchMainTab(tab) {
    ['profilo', 'workout', 'alimentazione', 'progressioni', 'report'].forEach(t => {
        const btn = document.getElementById(`nav-btn-${t}`);
        if (!btn) return;
        if(t === tab) btn.classList.replace('bottom-nav-inactive', 'bottom-nav-active');
        else btn.classList.replace('bottom-nav-active', 'bottom-nav-inactive');
        const content = document.getElementById(`main-tab-${t}-content`);
        if (content) content.style.display = 'none';
    });
    const activeContent = document.getElementById(`main-tab-${tab}-content`);
    if (activeContent) activeContent.style.display = 'block';

    const headerTitle = document.getElementById('main-header-title');
    const headerBtn = document.getElementById('header-action-btn');
    const dynNav = document.getElementById('dynamic-nav-container');
    const iconBadge = document.getElementById('header-icon-badge');

    if(tab === 'profilo') {
        headerTitle.innerText = "Area Personale";
        if(iconBadge) iconBadge.innerHTML = `<i class="fas fa-user text-sm"></i>`;
        headerBtn.classList.add('hidden'); headerBtn.classList.remove('flex');
        dynNav.classList.add('hidden');
        updateProfileMetabolicSummary();
        updateCloudAccountUI();
        renderMonthlyCalendar();
    } else if (tab === 'workout') {
        headerTitle.innerText = currentRoutine.name;
        if(iconBadge) iconBadge.innerHTML = `<i class="fas fa-dumbbell text-sm"></i>`;
        headerBtn.classList.remove('hidden'); headerBtn.classList.add('flex');
        dynNav.classList.remove('hidden');
        renderWorkouts();
        reopenCurrentTab();
    } else if (tab === 'alimentazione') {
        headerTitle.innerText = "Alimentazione";
        if(iconBadge) iconBadge.innerHTML = `<i class="fas fa-utensils text-sm"></i>`;
        headerBtn.classList.add('hidden'); headerBtn.classList.remove('flex');
        dynNav.classList.add('hidden');
        renderNutritionDashboard();
    } else if (tab === 'progressioni') {
        headerTitle.innerText = "Progressi e Carichi";
        if(iconBadge) iconBadge.innerHTML = `<i class="fas fa-chart-line text-sm"></i>`;
        headerBtn.classList.add('hidden'); headerBtn.classList.remove('flex');
        dynNav.classList.add('hidden');
        const progEnergyBtn = document.getElementById('prog-energy-btn');
        if (progEnergyBtn) {
            progEnergyBtn.className = `${getQuickEnergyStatus().btnClass} rounded-xl w-10 h-10 flex items-center justify-center transition-all hover:scale-105 shrink-0`;
        }
    } else if (tab === 'report') {
        headerTitle.innerText = "Report & Analisi";
        if(iconBadge) iconBadge.innerHTML = `<i class="fas fa-chart-pie text-sm"></i>`;
        headerBtn.classList.add('hidden'); headerBtn.classList.remove('flex');
        dynNav.classList.add('hidden');
        if (typeof renderReportDashboard === 'function') renderReportDashboard();
    }
}

// ==================== PROFILO, MASSA MAGRA & METABOLISMO ====================
function toggleLbmCalculator() {
    const box = document.getElementById('lbm-calc-box');
    if (!box) return;
    box.classList.toggle('hidden');
    if (!box.classList.contains('hidden')) {
        prefillLbmCalcFromProfile();
    }
}

function toggleCalcFianchiField() {
    const sesso = document.getElementById('calc-lbm-sesso').value;
    const wrap = document.getElementById('calc-lbm-fianchi-wrap');
    if (!wrap) return;
    if (sesso === 'F') wrap.classList.remove('opacity-50');
    else wrap.classList.add('opacity-50');
}

function prefillLbmCalcFromProfile() {
    const sesso = document.getElementById('prof-sesso').value || 'M';
    const altezza = document.getElementById('prof-altezza').value || '';
    const peso = document.getElementById('prof-peso').value || '';
    document.getElementById('calc-lbm-sesso').value = sesso;
    if (altezza) document.getElementById('calc-lbm-altezza').value = altezza;
    if (peso) document.getElementById('calc-lbm-peso').value = peso;

    const hist = JSON.parse(localStorage.getItem('measurements_history')) || [];
    if (hist.length > 0) {
        if (!document.getElementById('calc-lbm-vita').value && hist[0].vita) {
            document.getElementById('calc-lbm-vita').value = hist[0].vita;
        }
        if (!document.getElementById('calc-lbm-fianchi').value && hist[0].fianchi) {
            document.getElementById('calc-lbm-fianchi').value = hist[0].fianchi;
        }
    }
    toggleCalcFianchiField();
}

function eseguiCalcoloMassaMagra() {
    const sesso = document.getElementById('calc-lbm-sesso').value || 'M';
    const altezza = parseFloat(document.getElementById('calc-lbm-altezza').value);
    const peso = parseFloat(document.getElementById('calc-lbm-peso').value);
    const collo = parseFloat(document.getElementById('calc-lbm-collo').value);
    const vita = parseFloat(document.getElementById('calc-lbm-vita').value);
    const fianchi = parseFloat(document.getElementById('calc-lbm-fianchi').value);
    const resBox = document.getElementById('calc-lbm-result');

    if (!altezza || !peso || !collo || !vita || (sesso === 'F' && !fianchi)) {
        resBox.classList.remove('hidden');
        resBox.innerHTML = `<span class="text-rose-400 font-bold"><i class="fas fa-exclamation-circle mr-1"></i>Compila tutte le misure richieste.</span>`;
        return;
    }

    let bf = 0;
    if (sesso === 'M') {
        if (vita - collo <= 0) {
            resBox.classList.remove('hidden');
            resBox.innerHTML = `<span class="text-rose-400 font-bold">La vita deve essere maggiore del collo.</span>`;
            return;
        }
        bf = 495 / (1.0324 - 0.19077 * Math.log10(vita - collo) + 0.15456 * Math.log10(altezza)) - 450;
    } else {
        if (vita + fianchi - collo <= 0) {
            resBox.classList.remove('hidden');
            resBox.innerHTML = `<span class="text-rose-400 font-bold">Controlla le misure inserite.</span>`;
            return;
        }
        bf = 495 / (1.29579 - 0.35004 * Math.log10(vita + fianchi - collo) + 0.22100 * Math.log10(altezza)) - 450;
    }

    bf = Math.max(4, Math.min(60, bf));
    const lbm = +(peso * (1 - bf / 100)).toFixed(1);
    const bfRounded = +bf.toFixed(1);

    document.getElementById('prof-lbm').value = lbm;
    const bfBadge = document.getElementById('prof-bf-badge');
    if (bfBadge) {
        bfBadge.innerText = `BF stimata: ${bfRounded}%`;
        bfBadge.classList.remove('hidden');
    }

    resBox.classList.remove('hidden');
    resBox.innerHTML = `
        <div>
            <div class="font-extrabold text-emerald-300">Massa Magra: ${lbm} kg</div>
            <div class="text-[10px] text-slate-300">Massa Grassa: ${bfRounded}%</div>
        </div>
        <span class="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-lg text-[10px] font-bold">Pronta ✓</span>
    `;
}

function salvaProfiloEMisure(section) {
    const pExisting = JSON.parse(localStorage.getItem('user_profile')) || {};
    let profilo = { ...pExisting };

    if (section === 'personal') {
        profilo.nome = document.getElementById('prof-nome').value;
        profilo.cognome = document.getElementById('prof-cognome').value;
        localStorage.setItem('user_profile', JSON.stringify(profilo));
        const msg = document.getElementById('prof-personal-msg');
        msg.classList.remove('hidden'); setTimeout(() => msg.classList.add('hidden'), 3000);
        return;
    }

    if (section === 'kcal') {
        const pesoVal = parseFloat(document.getElementById('prof-peso').value);
        const lbmVal = parseFloat(document.getElementById('prof-lbm').value);
        let bfCalc = null;
        if (pesoVal > 0 && lbmVal > 0 && lbmVal < pesoVal) {
            bfCalc = +(((pesoVal - lbmVal) / pesoVal) * 100).toFixed(1);
        }

        profilo.sesso = document.getElementById('prof-sesso').value || 'M';
        profilo.eta = document.getElementById('prof-eta').value;
        profilo.peso = document.getElementById('prof-peso').value;
        profilo.altezza = document.getElementById('prof-altezza').value;
        profilo.attivita = document.getElementById('prof-attivita').value || '1.375';
        profilo.obiettivo = document.getElementById('prof-obiettivo').value || 'maint';
        profilo.lbm = lbmVal > 0 ? lbmVal : '';
        profilo.bf = bfCalc;
        profilo.collo = document.getElementById('calc-lbm-collo') ? document.getElementById('calc-lbm-collo').value : '';

        localStorage.setItem('user_profile', JSON.stringify(profilo));
        updateProfileMetabolicSummary();
        renderNutritionDashboard();
        const msg = document.getElementById('prof-msg');
        msg.classList.remove('hidden'); setTimeout(() => msg.classList.add('hidden'), 3000);
        return;
    }

    if (section === 'measures') {
        const date = document.getElementById('measure-date').value;
        const m = {
            date: date,
            spalle: document.getElementById('meas-spalle').value,
            petto: document.getElementById('meas-petto').value,
            braccia: document.getElementById('meas-braccia').value,
            vita: document.getElementById('meas-vita').value,
            fianchi: document.getElementById('meas-fianchi').value,
            cosce: document.getElementById('meas-cosce').value,
            polpacci: document.getElementById('meas-polpacci').value
        };

        if (date && (m.spalle || m.petto || m.braccia || m.vita || m.fianchi || m.cosce || m.polpacci)) {
            let hist = JSON.parse(localStorage.getItem('measurements_history')) || [];
            let existingIdx = hist.findIndex(x => x.date === date);
            if(existingIdx >= 0) hist[existingIdx] = m; else hist.unshift(m);
            hist.sort((a,b) => new Date(b.date) - new Date(a.date));
            localStorage.setItem('measurements_history', JSON.stringify(hist));
            ['spalle', 'petto', 'braccia', 'vita', 'fianchi', 'cosce', 'polpacci'].forEach(id => document.getElementById(`meas-${id}`).value = '');
            renderMeasurements();
        }
        const msg = document.getElementById('prof-meas-msg');
        msg.classList.remove('hidden'); setTimeout(() => msg.classList.add('hidden'), 3000);
        return;
    }
}

function caricaProfilo() {
    const p = JSON.parse(localStorage.getItem('user_profile'));
    if(p) {
        document.getElementById('prof-nome').value = p.nome || '';
        document.getElementById('prof-cognome').value = p.cognome || '';
        document.getElementById('prof-sesso').value = p.sesso || 'M';
        document.getElementById('prof-eta').value = p.eta || '';
        document.getElementById('prof-peso').value = p.peso || '';
        document.getElementById('prof-altezza').value = p.altezza || '';
        document.getElementById('prof-attivita').value = p.attivita || '1.375';
        document.getElementById('prof-obiettivo').value = p.obiettivo || 'maint';
        if (document.getElementById('prof-lbm')) document.getElementById('prof-lbm').value = p.lbm || '';
        if (document.getElementById('calc-lbm-collo') && p.collo) document.getElementById('calc-lbm-collo').value = p.collo;
        const bfBadge = document.getElementById('prof-bf-badge');
        if (bfBadge && p.bf) {
            bfBadge.innerText = `BF stimata: ${p.bf}%`;
            bfBadge.classList.remove('hidden');
        }
    }
}

function updateProfileMetabolicSummary() {
    const targets = calculateMacroTargets();
    const lbmEl = document.getElementById('prof-summary-lbm');
    const formEl = document.getElementById('prof-summary-formula');
    const bmrEl = document.getElementById('prof-summary-bmr');
    const tdeeEl = document.getElementById('prof-summary-tdee');
    if (!lbmEl || !bmrEl || !tdeeEl) return;

    if (!targets.valid) {
        lbmEl.innerText = '-- kg';
        bmrEl.innerText = '-- kcal';
        tdeeEl.innerText = '-- kcal';
        return;
    }

    lbmEl.innerText = targets.lbm ? `${targets.lbm} kg` : 'N/D';
    formEl.innerText = targets.formula;
    bmrEl.innerText = `${targets.bmr} kcal`;
    tdeeEl.innerText = `${targets.tdeeBase} kcal`;
}

function calculateMacroTargets() {
    const p = JSON.parse(localStorage.getItem('user_profile')) || {};
    const peso = parseFloat(p.peso), altezza = parseFloat(p.altezza), eta = parseFloat(p.eta);
    const sesso = p.sesso || 'M', act = parseFloat(p.attivita) || 1.375, goal = p.obiettivo || 'maint';
    const lbm = parseFloat(p.lbm);

    if ((!peso || !altezza || !eta) && !(lbm > 0 && peso > 0)) {
        return { valid: false, kcal: 2000, p: 130, c: 220, f: 65, bmr: 1600, tdeeBase: 2000, lbm: null, formula: 'Standard', goal: goal };
    }

    let bmr = 0;
    let formulaUsed = 'Mifflin-St Jeor';

    if (lbm > 0 && (!peso || lbm < peso)) {
        bmr = 370 + (21.6 * lbm);
        formulaUsed = 'Katch-McArdle';
    } else {
        bmr = (10 * peso) + (6.25 * altezza) - (5 * eta) + (sesso === 'M' ? 5 : -161);
    }

    let tdeeBase = bmr * act;
    let targetKcal = tdeeBase;

    const refWeight = (lbm > 0) ? lbm : peso;
    let protPerKg = (lbm > 0) ? 2.2 : 1.8;
    let fatPerKg = 0.9;

    if (goal === 'cut') {
        targetKcal = tdeeBase * 0.80;
        protPerKg = (lbm > 0) ? 2.4 : 2.0;
        fatPerKg = 0.8;
    } else if (goal === 'bulk') {
        targetKcal = tdeeBase * 1.15;
        protPerKg = (lbm > 0) ? 2.1 : 1.8;
        fatPerKg = 1.0;
    }

    targetKcal = Math.round(targetKcal);
    let targetP = Math.round(refWeight * protPerKg);
    let targetF = Math.round(peso * fatPerKg);
    let remainingKcal = targetKcal - (targetP * 4) - (targetF * 9);
    let targetC = Math.max(50, Math.round(remainingKcal / 4));

    return {
        valid: true,
        kcal: targetKcal,
        p: targetP,
        c: targetC,
        f: targetF,
        bmr: Math.round(bmr),
        tdeeBase: Math.round(tdeeBase),
        lbm: lbm > 0 ? lbm : null,
        formula: formulaUsed,
        goal: goal
    };
}

// ==================== STIMA KCAL BRUCIATE IN ALLENAMENTO ====================
function calculateWorkoutCaloriesForDate(dateStr) {
    const p = JSON.parse(localStorage.getItem('user_profile')) || {};
    const peso = parseFloat(p.peso) || 70;
    const lbm = parseFloat(p.lbm) || (peso * 0.82);
    const massFactor = Math.max(0.75, Math.min(1.45, lbm / 62));

    let totalSets = 0;
    let totalKcal = 0;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('hist_')) {
            const logs = JSON.parse(localStorage.getItem(key)) || [];
            const dayLogs = logs.filter(l => l.date === dateStr);
            if (dayLogs.length === 0) continue;

            let muscleMultiplier = 1.0;
            const dbEx = exerciseDB.find(e => getHistKey(e.name) === key);
            if (dbEx && dbEx.muscles) {
                const mSum = Object.values(dbEx.muscles).reduce((a, b) => a + b, 0);
                muscleMultiplier = 0.75 + Math.min(0.65, mSum * 0.08);
            }

            dayLogs.forEach(log => {
                const sets = parseInt(log.sets) || 0;
                const reps = parseInt(log.reps) || 10;
                if (sets <= 0) return;

                let effortMult = 1.0;
                if (log.effort === 'easy') effortMult = 0.85;
                else if (log.effort === 'hard') effortMult = 1.20;

                const repFactor = Math.max(0.8, Math.min(1.3, reps / 10));
                const kcalPerSet = 7.5 * massFactor * muscleMultiplier * effortMult * repFactor;

                totalSets += sets;
                totalKcal += sets * kcalPerSet;
            });
        }
    }

    if (totalSets > 0) {
        totalKcal += 25 * massFactor;
    }

    return { kcal: Math.round(totalKcal), sets: totalSets };
}

function getDietDateKey(customDateStr = null) { return 'diet_log_' + (customDateStr || document.getElementById('diet-date').value || getTodayStr()); }
function getWaterDateKey(customDateStr = null) { return 'water_log_' + (customDateStr || document.getElementById('diet-date').value || getTodayStr()); }
function updateWaterCount(delta) { const wKey = getWaterDateKey(); let cur = parseInt(localStorage.getItem(wKey)) || 0; cur = Math.max(0, cur + delta); localStorage.setItem(wKey, cur); renderNutritionDashboard(); }

function renderNutritionDashboard() {
    const targets = calculateMacroTargets();
    const warningEl = document.getElementById('diet-profile-warning');
    if (!targets.valid) warningEl.classList.remove('hidden'); else warningEl.classList.add('hidden');

    const currentDateStr = document.getElementById('diet-date').value || getTodayStr();
    const workoutBurn = calculateWorkoutCaloriesForDate(currentDateStr);
    const effectiveTargetKcal = targets.kcal + workoutBurn.kcal;

    const glasses = parseInt(localStorage.getItem(getWaterDateKey())) || 0;
    const liters = (glasses * 0.25).toFixed(2).replace(/\.00$/, '.0').replace(/(\.\d)0$/, '$1');
    document.getElementById('water-glasses-count').innerText = glasses;
    document.getElementById('water-liters-count').innerText = liters;
    document.getElementById('water-progress-bar').style.width = `${Math.min(100, (glasses / 8) * 100)}%`;

    const logs = JSON.parse(localStorage.getItem(getDietDateKey())) || [];
    let totKcal = 0, totP = 0, totC = 0, totF = 0;
    logs.forEach(item => { totKcal += item.kcal; totP += item.p; totC += item.c; totF += item.f; });

    document.getElementById('kcal-current').innerText = Math.round(totKcal);
    document.getElementById('kcal-target').innerText = effectiveTargetKcal;
    document.getElementById('macro-p-cur').innerText = Math.round(totP);
    document.getElementById('macro-p-tar').innerText = targets.p;
    document.getElementById('macro-c-cur').innerText = Math.round(totC);
    document.getElementById('macro-c-tar').innerText = targets.c + Math.round(workoutBurn.kcal / 4);
    document.getElementById('macro-f-cur').innerText = Math.round(totF);
    document.getElementById('macro-f-tar').innerText = targets.f;

    const kcalPct = Math.min(100, Math.round((totKcal / effectiveTargetKcal) * 100));
    const kcalBar = document.getElementById('kcal-progress-bar');
    const badge = document.getElementById('kcal-status-badge');
    kcalBar.style.width = `${kcalPct}%`;
    const ratio = totKcal / effectiveTargetKcal;

    if (ratio < 0.85) {
        kcalBar.className = "h-full bg-blue-500 transition-all duration-300 rounded-full";
        badge.className = "text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-700 text-slate-300";
        badge.innerText = `Mancano ${Math.max(0, effectiveTargetKcal - Math.round(totKcal))} kcal`;
    } else if (ratio <= 1.08) {
        kcalBar.className = "h-full bg-emerald-500 transition-all duration-300 rounded-full";
        badge.className = "text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-500/40";
        badge.innerText = "Target Raggiunto!";
    } else {
        kcalBar.className = "h-full bg-rose-500 transition-all duration-300 rounded-full";
        badge.className = "text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-900/60 text-rose-300 border border-rose-500/40";
        badge.innerText = `Sforato di ${Math.round(totKcal) - effectiveTargetKcal} kcal`;
    }

    document.getElementById('macro-p-bar').style.width = `${Math.min(100, (totP / targets.p) * 100)}%`;
    document.getElementById('macro-c-bar').style.width = `${Math.min(100, (totC / (targets.c + Math.round(workoutBurn.kcal / 4))) * 100)}%`;
    document.getElementById('macro-f-bar').style.width = `${Math.min(100, (totF / targets.f) * 100)}%`;

    const totalOut = targets.tdeeBase + workoutBurn.kcal;
    const netBalance = Math.round(totKcal) - totalOut;

    const elTdeeBase = document.getElementById('bal-tdee-base');
    if (elTdeeBase) {
        elTdeeBase.innerText = targets.tdeeBase;
        document.getElementById('bal-bmr-sub').innerText = `BMR: ${targets.bmr} (${targets.lbm ? 'Katch' : 'Mifflin'})`;
        document.getElementById('bal-workout-kcal').innerText = workoutBurn.kcal;
        document.getElementById('bal-workout-sets').innerText = `${workoutBurn.sets} serie oggi`;
        document.getElementById('bal-total-out').innerText = totalOut;

        const goalPill = document.getElementById('energy-goal-pill');
        const goalNames = { 'cut': '🔥 Obiettivo: Deficit (-20%)', 'maint': '⚖️ Obiettivo: Mantenimento', 'bulk': '💪 Obiettivo: Surplus (+15%)' };
        goalPill.innerText = goalNames[targets.goal] || 'Mantenimento';

        const netValEl = document.getElementById('bal-net-value');
        const netDescEl = document.getElementById('bal-net-desc');
        const netBoxEl = document.getElementById('bal-net-box');
        const techCommentEl = document.getElementById('bal-tech-comment');

        const sign = netBalance > 0 ? '+' : '';
        const stateWord = netBalance < -80 ? 'Deficit' : (netBalance > 80 ? 'Surplus' : 'Pareggio');
        netValEl.innerText = `${sign}${netBalance} kcal`;

        if (logs.length === 0) {
            netValEl.className = "text-base font-extrabold text-slate-400";
            netDescEl.innerText = "Registra i pasti di oggi per calcolare Surplus o Deficit reale.";
            netBoxEl.className = "bg-slate-900/95 p-3 rounded-xl border border-slate-700/70 flex justify-between items-center";
            techCommentEl.innerHTML = `<b>Analisi Nutrizionale:</b> Nessun pasto registrato per la data odierna. Inserisci almeno un pasto per sbloccare il commento tecnico e le soluzioni mirate.`;
        } else {
            let isGood = false;
            if (targets.goal === 'cut' && netBalance <= -150 && netBalance >= -800) isGood = true;
            else if (targets.goal === 'bulk' && netBalance >= 100 && netBalance <= 600) isGood = true;
            else if (targets.goal === 'maint' && Math.abs(netBalance) <= 200) isGood = true;

            if (isGood) {
                netValEl.className = "text-base font-extrabold text-emerald-400";
                netBoxEl.className = "bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/40 flex justify-between items-center";
                netDescEl.innerHTML = `<span class="text-emerald-300 font-bold">${stateWord} ideale</span> per la sessione di oggi!`;
                techCommentEl.innerHTML = `<i class="fas fa-check-circle text-emerald-400 mr-1"></i><b>Commento Tecnico:</b> Ottimo lavoro! L'apporto energetico e le scorte di glicogeno sono allineate perfettamente all'obiettivo. La prestazione muscolare non subirà cali energetici.`;
            } else {
                netValEl.className = "text-base font-extrabold text-amber-400";
                netBoxEl.className = "bg-slate-900/95 p-3 rounded-xl border border-amber-500/30 flex justify-between items-center";
                
                if (netBalance < 0) {
                    const diffMancanti = Math.abs(netBalance);
                    netDescEl.innerHTML = `Sei in <b>Deficit</b> di ${diffMancanti} kcal.`;
                    
                    if (targets.goal === 'bulk' || targets.goal === 'maint' || (targets.goal === 'cut' && diffMancanti > 400)) {
                        techCommentEl.innerHTML = `<i class="fas fa-info-circle text-amber-400 mr-1"></i><b>Commento Tecnico & Soluzione:</b> Sei sotto target energetico di ${diffMancanti} kcal. Per colmare il divario in modo pulito e naturale prima o dopo il workout, potresti aggiungere: <b>1 frutto maturo (es. banana) o 2 gallette di riso con un cucchiaino di miele</b> (+120/150 kcal di carbo rapidi), oppure integrare una porzione di frutta secca (mandorle/noci) se ti servono calorie dense.`;
                    } else {
                        techCommentEl.innerHTML = `<i class="fas fa-info-circle text-amber-400 mr-1"></i><b>Commento Tecnico:</b> Sei in deficit marcato (obiettivo definizione). Mantieni il focus, assicurati di coprire le proteine e sfrutta l'idratazione per gestire il senso di appetito.`;
                    }
                } else {
                    netDescEl.innerHTML = `Sei in <b>Surplus</b> di +${netBalance} kcal.`;
                    techCommentEl.innerHTML = `<i class="fas fa-arrow-up text-amber-400 mr-1"></i><b>Commento Tecnico:</b> Hai assunto più calorie del dispendio totale giornaliero. Se il tuo obiettivo è la massa (bulk) è perfetto; se sei in definizione, fai attenzione agli sgarri extra.`;
                }
            }
        }
    }

    const listContainer = document.getElementById('daily-meals-list'); listContainer.innerHTML = '';
    if (logs.length === 0) { listContainer.innerHTML = `<div class="text-center text-xs text-slate-500 py-8 bg-slate-800/80 rounded-2xl border border-slate-700 border-dashed">Nessun pasto registrato in questa data. Premi <b>Registra Pasto</b>!</div>`; return; }
    const mealOrder = ["Colazione", "Pranzo", "Cena", "Spuntino"];
    mealOrder.forEach(mealType => {
        const mealItems = logs.map((item, idx) => ({ ...item, originalIdx: idx })).filter(x => x.mealType === mealType);
        if (mealItems.length === 0) return;
        let subKcal = mealItems.reduce((acc, x) => acc + x.kcal, 0);
        let html = `<div class="bg-slate-800/90 rounded-2xl p-3.5 border border-slate-700/80 shadow-lg"><div class="flex justify-between items-center border-b border-slate-700/60 pb-2 mb-2.5"><h4 class="font-extrabold text-blue-400 text-sm">${mealType}</h4><span class="text-xs font-bold bg-slate-900 px-2.5 py-0.5 rounded-full text-slate-200 border border-slate-700">${Math.round(subKcal)} kcal</span></div><div class="space-y-2">`;
        mealItems.forEach(item => {
            let itemBadge = ''; if (item.isCheat) itemBadge = `<span class="bg-orange-600/30 border border-orange-500/50 text-orange-300 text-[9px] font-bold px-1.5 py-0.5 rounded ml-1.5">SGARRO</span>`; else if (item.isGym) itemBadge = `<span class="bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded ml-1.5">GYM</span>`;
            const timeTag = item.time ? `<span class="bg-slate-800 text-slate-300 border border-slate-600 text-[9px] font-mono px-1.5 py-0.5 rounded mr-1.5"><i class="far fa-clock mr-0.5 text-blue-400"></i>${item.time}</span>` : '';
            html += `<div class="flex justify-between items-center bg-slate-900/85 p-2.5 rounded-xl border ${item.isCheat ? 'border-orange-500/30' : (item.isGym ? 'border-emerald-500/30' : 'border-slate-700/50')}"><div class="flex-1 pr-2"><div class="text-xs font-bold text-slate-100 flex items-center flex-wrap">${timeTag}${item.name}${itemBadge}</div><div class="text-[10px] text-slate-400 mt-1">${item.details} • <span class="text-blue-400 font-semibold">P: ${item.p}g</span> | <span class="text-amber-400 font-semibold">C: ${item.c}g</span> | <span class="text-rose-400 font-semibold">G: ${item.f}g</span></div></div><div class="flex items-center gap-2"><span class="text-xs font-extrabold text-white whitespace-nowrap">${item.kcal} kcal</span><button onclick="deleteFoodLog(${item.originalIdx})" class="text-slate-500 hover:text-red-500 p-1"><i class="fas fa-times"></i></button></div></div>`;
        });
        html += `</div></div>`; listContainer.innerHTML += html;
    });
}

function getLoggedDietDates() { let dateSet = new Set(); for (let i = 0; i < localStorage.length; i++) { let k = localStorage.key(i); if (k && k.startsWith('diet_log_')) { let arr = JSON.parse(localStorage.getItem(k)) || []; if (arr.length > 0) dateSet.add(k.replace('diet_log_', '')); } else if (k && k.startsWith('water_log_')) { let w = parseInt(localStorage.getItem(k)) || 0; if (w > 0) dateSet.add(k.replace('water_log_', '')); } } return Array.from(dateSet).sort((a, b) => new Date(b) - new Date(a)); }
function openFoodDiaryModal() { const currentSelected = document.getElementById('diet-date').value || getTodayStr(); document.getElementById('diary-inspect-date').value = currentSelected; renderDiaryLoggedDatesPills(); renderDiaryModalContent(); document.getElementById('food-diary-modal').classList.remove('hidden'); document.getElementById('food-diary-modal').classList.add('flex'); }
function closeFoodDiaryModal() { document.getElementById('food-diary-modal').classList.add('hidden'); document.getElementById('food-diary-modal').classList.remove('flex'); }
function renderDiaryLoggedDatesPills() {
    const pillsContainer = document.getElementById('diary-logged-dates-pills'); const dates = getLoggedDietDates(); pillsContainer.innerHTML = '';
    if (dates.length === 0) { pillsContainer.innerHTML = `<span class="text-[11px] text-slate-500 italic">Nessuna giornata salvata finora.</span>`; return; }
    dates.slice(0, 12).forEach(dStr => { const btn = document.createElement('button'); btn.className = "px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-700 text-blue-400 hover:bg-blue-600 hover:text-white shrink-0 transition-colors"; btn.innerText = formatDate(dStr); btn.onclick = () => { document.getElementById('diary-inspect-date').value = dStr; renderDiaryModalContent(); }; pillsContainer.appendChild(btn); });
}
function renderDiaryModalContent() {
    const dStr = document.getElementById('diary-inspect-date').value; const targets = calculateMacroTargets(); const logs = JSON.parse(localStorage.getItem(getDietDateKey(dStr))) || []; const glasses = parseInt(localStorage.getItem(getWaterDateKey(dStr))) || 0; const liters = (glasses * 0.25).toFixed(2).replace(/\.00$/, '.0').replace(/(\.\d)0$/, '$1');
    let totKcal = 0, totP = 0, totC = 0, totF = 0; logs.forEach(x => { totKcal += x.kcal; totP += x.p; totC += x.c; totF += x.f; });
    const workoutBurn = calculateWorkoutCaloriesForDate(dStr);
    const netBal = Math.round(totKcal) - (targets.tdeeBase + workoutBurn.kcal);
    const summaryEl = document.getElementById('diary-modal-summary'); summaryEl.innerHTML = `<div class="flex justify-between items-center border-b border-slate-800 pb-2 mb-2.5"><span class="text-xs font-bold text-slate-300">Riepilogo del ${formatDate(dStr)}</span><span class="text-sm font-extrabold text-white">${Math.round(totKcal)} <span class="text-xs font-normal text-slate-400">/ ${targets.kcal + workoutBurn.kcal} kcal</span></span></div><div class="grid grid-cols-4 gap-1.5 text-center text-xs"><div class="bg-slate-800/80 p-2 rounded-lg"><div class="text-[10px] text-blue-400 font-bold">Proteine</div><div class="font-bold text-white mt-0.5">${Math.round(totP)}g</div></div><div class="bg-slate-800/80 p-2 rounded-lg"><div class="text-[10px] text-amber-400 font-bold">Carbo</div><div class="font-bold text-white mt-0.5">${Math.round(totC)}g</div></div><div class="bg-slate-800/80 p-2 rounded-lg"><div class="text-[10px] text-rose-400 font-bold">Grassi</div><div class="font-bold text-white mt-0.5">${Math.round(totF)}g</div></div><div class="bg-slate-800/80 p-2 rounded-lg border border-cyan-500/30"><div class="text-[10px] text-cyan-400 font-bold"><i class="fas fa-tint mr-0.5"></i>Acqua</div><div class="font-bold text-cyan-300 mt-0.5">${glasses} bic. (${liters}L)</div></div></div><div class="mt-2 pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400"><span>🔥 Palestra: <b class="text-orange-400">+${workoutBurn.kcal} kcal</b></span><span>Bilancio: <b class="text-white">${netBal > 0 ? '+' : ''}${netBal} kcal</b></span></div>`;
    const mealsEl = document.getElementById('diary-modal-meals'); mealsEl.innerHTML = '';
    if (logs.length === 0) { mealsEl.innerHTML = `<div class="text-center text-xs text-slate-500 py-6 bg-slate-900/50 rounded-xl border border-slate-800">Nessun pasto registrato in questa data.</div>`; return; }
    const mealOrder = ["Colazione", "Pranzo", "Cena", "Spuntino"];
    mealOrder.forEach(mType => {
        const items = logs.filter(x => x.mealType === mType); if (items.length === 0) return;
        let block = `<div class="bg-slate-900 p-3 rounded-xl border border-slate-700/60"><div class="text-xs font-bold text-blue-400 mb-1.5">${mType}</div><div class="space-y-1.5">`;
        items.forEach(it => { const tBadge = it.time ? `<span class="text-[10px] font-mono text-blue-300 mr-1">[${it.time}]</span>` : ''; block += `<div class="flex justify-between items-center text-xs border-b border-slate-800 pb-1 last:border-none last:pb-0"><div class="pr-2"><span class="font-semibold text-slate-200">${tBadge}${it.name}</span><div class="text-[10px] text-slate-400">${it.details} (P:${it.p}g C:${it.c}g G:${it.f}g)</div></div><span class="font-bold text-slate-100 shrink-0">${it.kcal} kcal</span></div>`; });
        block += `</div></div>`; mealsEl.innerHTML += block;
    });
}
function loadDiaryDateIntoMainView() { const inspected = document.getElementById('diary-inspect-date').value; if (inspected) { document.getElementById('diet-date').value = inspected; renderNutritionDashboard(); } closeFoodDiaryModal(); }
function openFoodModal() { selectedHomeFood = null; selectedGymFood = null; selectedCheatFood = null; document.getElementById('food-meal-time').value = getCurrentTimeStr(); document.getElementById('home-food-config').classList.add('hidden'); document.getElementById('online-food-config').classList.add('hidden'); document.getElementById('gym-food-config').classList.add('hidden'); document.getElementById('cheat-food-config').classList.add('hidden'); document.getElementById('home-food-search').value = ''; document.getElementById('gym-food-search').value = ''; document.getElementById('cheat-food-search').value = ''; filterHomeFoodList(); filterGymFoodList(); filterCheatFoodList(); document.getElementById('food-modal').classList.remove('hidden'); document.getElementById('food-modal').classList.add('flex'); }
function closeFoodModal() { document.getElementById('food-modal').classList.add('hidden'); document.getElementById('food-modal').classList.remove('flex'); }
function switchFoodModalTab(mode) {
    const btnHome = document.getElementById('tab-btn-homefood'), btnOnline = document.getElementById('tab-btn-onlinefood'), btnGym = document.getElementById('tab-btn-gymfood'), btnCheat = document.getElementById('tab-btn-cheatfood');
    const inactiveClass = "py-2 px-1 rounded-lg text-[11px] font-bold text-slate-400 hover:text-white transition-all truncate";
    btnHome.className = btnOnline.className = btnGym.className = btnCheat.className = inactiveClass;
    document.getElementById('food-tab-home').classList.add('hidden'); document.getElementById('food-tab-online').classList.add('hidden'); document.getElementById('food-tab-gym').classList.add('hidden'); document.getElementById('food-tab-cheat').classList.add('hidden');
    if (mode === 'home') { btnHome.className = "py-2 px-1 rounded-lg text-[11px] font-bold bg-blue-600 text-white shadow transition-all truncate"; document.getElementById('food-tab-home').classList.remove('hidden'); } else if (mode === 'online') { btnOnline.className = "py-2 px-1 rounded-lg text-[11px] font-bold bg-blue-600 text-white shadow transition-all truncate"; document.getElementById('food-tab-online').classList.remove('hidden'); } else if (mode === 'gym') { btnGym.className = "py-2 px-1 rounded-lg text-[11px] font-bold bg-emerald-600 text-white shadow transition-all truncate"; document.getElementById('food-tab-gym').classList.remove('hidden'); } else if (mode === 'cheat') { btnCheat.className = "py-2 px-1 rounded-lg text-[11px] font-bold bg-orange-600 text-white shadow transition-all truncate"; document.getElementById('food-tab-cheat').classList.remove('hidden'); }
}
function filterHomeFoodList() {
    const cat = document.getElementById('home-food-cat').value, q = document.getElementById('home-food-search').value.toLowerCase().trim(); const listEl = document.getElementById('home-food-list'); listEl.innerHTML = '';
    const filtered = homeFoodDB.filter(item => (cat === 'Tutti' || item.cat === cat) && (!q || item.name.toLowerCase().includes(q)));
    if (filtered.length === 0) { listEl.innerHTML = `<div class="text-xs text-slate-500 text-center py-4">Nessun piatto trovato. Prova nelle altre schede.</div>`; return; }
    filtered.forEach(item => {
        const div = document.createElement('div'); div.className = "p-2.5 hover:bg-slate-800 cursor-pointer flex justify-between items-center transition-colors";
        div.innerHTML = `<div><div class="text-xs font-bold text-slate-200">${item.name}</div><div class="text-[10px] text-slate-400">${item.desc}</div></div><span class="text-xs font-semibold text-blue-400 shrink-0 ml-2">${item.kcal} kcal</span>`;
        div.onclick = () => selectHomeFoodItem(item); listEl.appendChild(div);
    });
}
function selectHomeFoodItem(item) {
    selectedHomeFood = item; document.getElementById('selected-home-food-name').innerText = item.name; document.getElementById('selected-home-food-desc').innerText = item.desc; document.getElementById('home-food-config').classList.remove('hidden');
    const guide = portionGuides[item.cat] || portionGuides["Secondi"];
    ['S', 'M', 'L', 'XL'].forEach(sz => { const subEl = document.getElementById(`size-sub-${sz}`); if (subEl && guide.sub[sz]) subEl.innerText = guide.sub[sz]; });
    setPortionSize('M'); setCondimentLevel('norm');
}
function setPortionSize(size) {
    currentPortionSize = size;
    ['S', 'M', 'L', 'XL'].forEach(s => { const btn = document.getElementById(`size-btn-${s}`); if (s === size) btn.classList.add('active'); else btn.classList.remove('active'); });
    if (selectedHomeFood) { const guide = portionGuides[selectedHomeFood.cat] || portionGuides["Secondi"]; const helperText = document.getElementById('portion-visual-text'); if (helperText && guide.help[size]) helperText.innerHTML = guide.help[size]; }
    updateHomeFoodPreview();
}
function setCondimentLevel(level) { currentCondimentLevel = level; ['low', 'norm', 'high'].forEach(l => { const btn = document.getElementById(`cond-btn-${l}`); if (l === level) btn.classList.add('active'); else btn.classList.remove('active'); }); updateHomeFoodPreview(); }
function getCalculatedHomeFoodMacros() {
    if (!selectedHomeFood) return { kcal: 0, p: 0, c: 0, f: 0 };
    const sizeMultipliers = { 'S': 0.5, 'M': 1.0, 'L': 1.5, 'XL': 2.0 }; const mult = sizeMultipliers[currentPortionSize] || 1.0;
    let p = Math.round(selectedHomeFood.p * mult), c = Math.round(selectedHomeFood.c * mult), f = Math.round(selectedHomeFood.f * mult);
    if (selectedHomeFood.cat !== "Frutta") { if (currentCondimentLevel === 'low') f = Math.max(0, f - 4); else if (currentCondimentLevel === 'high') f += 9; }
    let kcal = Math.round((p * 4) + (c * 4) + (f * 9)); return { kcal, p, c, f };
}
function updateHomeFoodPreview() { const res = getCalculatedHomeFoodMacros(); document.getElementById('preview-kcal').innerText = res.kcal; document.getElementById('preview-p').innerText = res.p + 'g'; document.getElementById('preview-c').innerText = res.c + 'g'; document.getElementById('preview-f').innerText = res.f + 'g'; }
function saveHomeFoodMeal() {
    if (!selectedHomeFood) return; const res = getCalculatedHomeFoodMacros(); const mealType = document.getElementById('food-meal-type').value; const mealTime = document.getElementById('food-meal-time').value || getCurrentTimeStr();
    const guide = portionGuides[selectedHomeFood.cat] || portionGuides["Secondi"]; const sizeLabel = guide.sub[currentPortionSize] || `Taglia ${currentPortionSize}`; const condLabels = { 'low': 'Cond. Leggero', 'norm': 'Cond. Normale', 'high': 'Cond. Ricco' };
    const newEntry = { mealType: mealType, time: mealTime, name: selectedHomeFood.name, details: `${currentPortionSize}: ${sizeLabel} (${condLabels[currentCondimentLevel]})`, kcal: res.kcal, p: res.p, c: res.c, f: res.f, isCheat: false, isGym: false };
    const key = getDietDateKey(); let logs = JSON.parse(localStorage.getItem(key)) || []; logs.push(newEntry); localStorage.setItem(key, JSON.stringify(logs)); closeFoodModal(); renderNutritionDashboard();
}
async function searchOnlineFood() {
    const q = document.getElementById('online-food-query').value.trim(); const resBox = document.getElementById('online-food-results'); if (q.length < 2) return;
    resBox.innerHTML = `<div class="text-xs text-blue-400 text-center py-6"><i class="fas fa-spinner fa-spin mr-2"></i>Ricerca nel database mondiale...</div>`;
    try {
        const url = `https://it.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=15`;
        const response = await fetch(url); const data = await response.json(); onlineSearchResultsCache = (data.products || []).filter(p => p.product_name && p.nutriments); resBox.innerHTML = '';
        if (onlineSearchResultsCache.length === 0) { resBox.innerHTML = `<div class="text-xs text-slate-400 text-center py-4">Nessun prodotto trovato. Prova con un termine più semplice.</div>`; return; }
        onlineSearchResultsCache.forEach(prod => {
            const name = prod.product_name_it || prod.product_name; const brand = prod.brands ? ` (${prod.brands.split(',')[0]})` : ''; const kcal100 = Math.round(prod.nutriments['energy-kcal_100g'] || (prod.nutriments['energy_100g'] / 4.184) || 0); const p100 = Math.round(prod.nutriments.proteins_100g || 0); const c100 = Math.round(prod.nutriments.carbohydrates_100g || 0); const f100 = Math.round(prod.nutriments.fat_100g || 0);
            const div = document.createElement('div'); div.className = "p-2.5 hover:bg-slate-800 cursor-pointer flex justify-between items-center";
            div.innerHTML = `<div class="pr-2 truncate"><div class="text-xs font-bold text-slate-200 truncate">${name}${brand}</div><div class="text-[10px] text-slate-400">Per 100g: P:${p100}g | C:${c100}g | G:${f100}g</div></div><span class="text-xs font-bold text-blue-400 shrink-0">${kcal100} kcal</span>`;
            div.onclick = () => selectOnlineProduct({ name: name + brand, kcal100, p100, c100, f100 }); resBox.appendChild(div);
        });
    } catch (err) { resBox.innerHTML = `<div class="text-xs text-red-400 text-center py-4">Errore di connessione. Usa le altre schede offline.</div>`; }
}
function selectOnlineProduct(prodObj) { selectedOnlineFood = prodObj; document.getElementById('selected-online-food-name').innerText = prodObj.name; document.getElementById('online-food-grams').value = 100; document.getElementById('online-food-config').classList.remove('hidden'); updateOnlineFoodPreview(); }
function updateOnlineFoodPreview() { if (!selectedOnlineFood) return; const g = parseFloat(document.getElementById('online-food-grams').value) || 0; const ratio = g / 100; document.getElementById('on-prev-kcal').innerText = Math.round(selectedOnlineFood.kcal100 * ratio); document.getElementById('on-prev-p').innerText = Math.round(selectedOnlineFood.p100 * ratio) + 'g'; document.getElementById('on-prev-c').innerText = Math.round(selectedOnlineFood.c100 * ratio) + 'g'; document.getElementById('on-prev-f').innerText = Math.round(selectedOnlineFood.f100 * ratio) + 'g'; }
function saveOnlineFoodMeal() {
    if (!selectedOnlineFood) return; const g = parseFloat(document.getElementById('online-food-grams').value) || 100; const ratio = g / 100; const mealType = document.getElementById('food-meal-type').value; const mealTime = document.getElementById('food-meal-time').value || getCurrentTimeStr();
    const newEntry = { mealType: mealType, time: mealTime, name: selectedOnlineFood.name, details: `${g}g pesati`, kcal: Math.round(selectedOnlineFood.kcal100 * ratio), p: Math.round(selectedOnlineFood.p100 * ratio), c: Math.round(selectedOnlineFood.c100 * ratio), f: Math.round(selectedOnlineFood.f100 * ratio), isCheat: false, isGym: false };
    const key = getDietDateKey(); let logs = JSON.parse(localStorage.getItem(key)) || []; logs.push(newEntry); localStorage.setItem(key, JSON.stringify(logs)); closeFoodModal(); renderNutritionDashboard();
}
function filterGymFoodList() {
    const cat = document.getElementById('gym-food-cat').value, q = document.getElementById('gym-food-search').value.toLowerCase().trim(); const listEl = document.getElementById('gym-food-list'); listEl.innerHTML = '';
    const filtered = gymFoodDB.filter(item => (cat === 'Tutti' || item.cat === cat) && (!q || item.name.toLowerCase().includes(q)));
    if (filtered.length === 0) { listEl.innerHTML = `<div class="text-xs text-slate-500 text-center py-4">Nessun prodotto fitness trovato.</div>`; return; }
    filtered.forEach(item => {
        const div = document.createElement('div'); div.className = "p-2.5 hover:bg-slate-800 cursor-pointer flex justify-between items-center transition-colors";
        div.innerHTML = `<div><div class="text-xs font-bold text-slate-200">${item.name}</div><div class="text-[10px] text-slate-400">${item.desc} • P:${item.p}g C:${item.c}g G:${item.f}g</div></div><span class="text-xs font-bold text-emerald-400 shrink-0 ml-2">${item.kcal} kcal</span>`;
        div.onclick = () => selectGymFoodItem(item); listEl.appendChild(div);
    });
}
function selectGymFoodItem(item) { selectedGymFood = item; document.getElementById('selected-gym-food-name').innerText = item.name; document.getElementById('selected-gym-food-desc').innerText = item.desc; document.getElementById('gym-food-config').classList.remove('hidden'); setGymMultiplier(1); }
function setGymMultiplier(mult) { currentGymMultiplier = mult; [0.5, 1, 1.5, 2].forEach(m => { const btn = document.getElementById(`gym-mult-${m}`); if (m === mult) btn.classList.add('active'); else btn.classList.remove('active'); }); updateGymFoodPreview(); }
function getCalculatedGymMacros() { if (!selectedGymFood) return { kcal: 0, p: 0, c: 0, f: 0 }; return { kcal: Math.round(selectedGymFood.kcal * currentGymMultiplier), p: Math.round(selectedGymFood.p * currentGymMultiplier), c: Math.round(selectedGymFood.c * currentGymMultiplier), f: Math.round(selectedGymFood.f * currentGymMultiplier) }; }
function updateGymFoodPreview() { const res = getCalculatedGymMacros(); document.getElementById('gym-prev-kcal').innerText = res.kcal; document.getElementById('gym-prev-p').innerText = res.p + 'g'; document.getElementById('gym-prev-c').innerText = res.c + 'g'; document.getElementById('gym-prev-f').innerText = res.f + 'g'; }
function saveGymFoodMeal() {
    if (!selectedGymFood) return; const res = getCalculatedGymMacros(); const mealType = document.getElementById('food-meal-type').value; const mealTime = document.getElementById('food-meal-time').value || getCurrentTimeStr();
    const newEntry = { mealType: mealType, time: mealTime, name: selectedGymFood.name, details: `Dose ${currentGymMultiplier}x`, kcal: res.kcal, p: res.p, c: res.c, f: res.f, isCheat: false, isGym: true };
    const key = getDietDateKey(); let logs = JSON.parse(localStorage.getItem(key)) || []; logs.push(newEntry); localStorage.setItem(key, JSON.stringify(logs)); closeFoodModal(); renderNutritionDashboard();
}
function filterCheatFoodList() {
    const cat = document.getElementById('cheat-food-cat').value, q = document.getElementById('cheat-food-search').value.toLowerCase().trim(); const listEl = document.getElementById('cheat-food-list'); listEl.innerHTML = '';
    const filtered = cheatFoodDB.filter(item => (cat === 'Tutti' || item.cat === cat) && (!q || item.name.toLowerCase().includes(q)));
    if (filtered.length === 0) { listEl.innerHTML = `<div class="text-xs text-slate-500 text-center py-4">Nessuno sgarro o drink trovato.</div>`; return; }
    filtered.forEach(item => {
        const div = document.createElement('div'); div.className = "p-2.5 hover:bg-slate-800 cursor-pointer flex justify-between items-center transition-colors";
        div.innerHTML = `<div><div class="text-xs font-bold text-slate-200">${item.name}</div><div class="text-[10px] text-slate-400">${item.cat} • P:${item.p}g C:${item.c}g G:${item.f}g</div></div><span class="text-xs font-bold text-orange-400 shrink-0 ml-2">${item.kcal} kcal</span>`;
        div.onclick = () => selectCheatFoodItem(item); listEl.appendChild(div);
    });
}
function selectCheatFoodItem(item) {
    selectedCheatFood = item; document.getElementById('selected-cheat-food-name').innerText = item.name; document.getElementById('selected-cheat-food-desc').innerText = item.desc; document.getElementById('cheat-food-config').classList.remove('hidden');
    if (item.isDrink) {
        document.getElementById('cheat-combo-label').innerHTML = `<i class="fas fa-glass-martini-alt text-orange-400 mr-1"></i>Quanti bicchieri / drink hai bevuto?`;
        document.getElementById('cheat-lbl-single').innerText = "1 Bicchiere"; document.getElementById('cheat-sub-single').innerText = "Dose singola";
        document.getElementById('cheat-lbl-medium').innerText = "2 Bicchieri"; document.getElementById('cheat-sub-medium').innerText = "Doppio giro";
        document.getElementById('cheat-lbl-large').innerText = "3 Bicchieri"; document.getElementById('cheat-sub-large').innerText = "Triplo giro";
    } else {
        document.getElementById('cheat-combo-label').innerHTML = `<i class="fas fa-utensils text-orange-400 mr-1"></i>Hai preso solo il piatto o il Menù completo?`;
        document.getElementById('cheat-lbl-single').innerText = "Singolo"; document.getElementById('cheat-sub-single').innerText = "Solo prodotto";
        document.getElementById('cheat-lbl-medium').innerText = "+ Menù Medio"; document.getElementById('cheat-sub-medium').innerText = "Patatine + Salse";
        document.getElementById('cheat-lbl-large').innerText = "+ Menù Grande"; document.getElementById('cheat-sub-large').innerText = "Pat. Grandi + Bibita";
    }
    setCheatCombo('single');
}
function setCheatCombo(comboType) { currentCheatCombo = comboType; ['single', 'medium', 'large'].forEach(c => { const btn = document.getElementById(`cheat-combo-${c}`); if (c === comboType) btn.classList.add('active'); else btn.classList.remove('active'); }); updateCheatFoodPreview(); }
function getCalculatedCheatMacros() {
    if (!selectedCheatFood) return { kcal: 0, p: 0, c: 0, f: 0 };
    let kcal = selectedCheatFood.kcal, p = selectedCheatFood.p, c = selectedCheatFood.c, f = selectedCheatFood.f;
    if (selectedCheatFood.isDrink) { const mult = currentCheatCombo === 'single' ? 1 : (currentCheatCombo === 'medium' ? 2 : 3); return { kcal: kcal * mult, p: p * mult, c: c * mult, f: f * mult }; } 
    else { if (currentCheatCombo === 'medium') { kcal += 380; p += 4; c += 46; f += 19; } else if (currentCheatCombo === 'large') { kcal += 640; p += 6; c += 96; f += 25; } return { kcal, p, c, f }; }
}
function updateCheatFoodPreview() { const res = getCalculatedCheatMacros(); document.getElementById('cheat-prev-kcal').innerText = res.kcal; document.getElementById('cheat-prev-p').innerText = res.p + 'g'; document.getElementById('cheat-prev-c').innerText = res.c + 'g'; document.getElementById('cheat-prev-f').innerText = res.f + 'g'; }
function saveCheatFoodMeal() {
    if (!selectedCheatFood) return; const res = getCalculatedCheatMacros(); const mealType = document.getElementById('food-meal-type').value; const mealTime = document.getElementById('food-meal-time').value || getCurrentTimeStr();
    let detailsText = '';
    if (selectedCheatFood.isDrink) { const drinkLabels = { 'single': '1 Bicchiere', 'medium': '2 Bicchieri', 'large': '3 Bicchieri' }; detailsText = drinkLabels[currentCheatCombo]; } 
    else { const comboLabels = { 'single': 'Singolo', 'medium': '+ Menù Medio', 'large': '+ Menù Grande' }; detailsText = comboLabels[currentCheatCombo]; }
    const newEntry = { mealType: mealType, time: mealTime, name: selectedCheatFood.name, details: detailsText, kcal: res.kcal, p: res.p, c: res.c, f: res.f, isCheat: true, isGym: false };
    const key = getDietDateKey(); let logs = JSON.parse(localStorage.getItem(key)) || []; logs.push(newEntry); localStorage.setItem(key, JSON.stringify(logs)); closeFoodModal(); renderNutritionDashboard();
}
function deleteFoodLog(idx) { const key = getDietDateKey(); let logs = JSON.parse(localStorage.getItem(key)) || []; logs.splice(idx, 1); localStorage.setItem(key, JSON.stringify(logs)); renderNutritionDashboard(); }

// ==================== FUNZIONI CALENDARIO E SCHEDA ====================
function initCalendarDropdowns() {
    const yearSelect = document.getElementById('cal-year-select'); if(!yearSelect) return; const currentYear = new Date().getFullYear();
    for(let y = currentYear - 5; y <= currentYear + 5; y++) { let opt = document.createElement('option'); opt.value = y; opt.innerText = y; opt.className = "bg-slate-800 text-white"; yearSelect.appendChild(opt); }
}
function openExportModal() {
    let backup = {}; for (let i = 0; i < localStorage.length; i++) { backup[localStorage.key(i)] = localStorage.getItem(localStorage.key(i)); }
    document.getElementById('backup-text').value = JSON.stringify(backup); const btn = document.getElementById('backup-action-btn'); btn.innerText = "Copia negli appunti";
    btn.onclick = () => { document.getElementById('backup-text').select(); document.execCommand('copy'); btn.innerText = "Copiato!"; setTimeout(() => { btn.innerText = "Copia negli appunti"; }, 2000); };
    document.getElementById('backup-modal').classList.remove('hidden'); document.getElementById('backup-modal').classList.add('flex');
}
function openImportModal() {
    document.getElementById('backup-text').value = ""; const btn = document.getElementById('backup-action-btn'); btn.innerText = "Ripristina Dati";
    btn.onclick = () => {
        const dataStr = document.getElementById('backup-text').value.trim(); if(!dataStr) return;
        try {
            const backup = JSON.parse(dataStr);
            if (typeof backup === 'object') { showCustomConfirm("ATTENZIONE: Tutti i dati verranno sovrascritti. Procedere?", () => { localStorage.clear(); for (let key in backup) { localStorage.setItem(key, backup[key]); } alert("Dati ripristinati!"); location.reload(); }); }
        } catch(e) { alert("Errore durante l'importazione."); }
    };
    document.getElementById('backup-modal').classList.remove('hidden'); document.getElementById('backup-modal').classList.add('flex');
}
function closeBackupModal() { document.getElementById('backup-modal').classList.add('hidden'); document.getElementById('backup-modal').classList.remove('flex'); }

function buildDaysNavigation() {
    const navContainer = document.getElementById('dynamic-nav-container'); navContainer.innerHTML = ''; const dayKeys = getSortedDayKeys();
    dayKeys.forEach((dKey, index) => {
        const isOnlyDay = dayKeys.length === 1;
        navContainer.innerHTML += `<div class="flex items-center bg-transparent shrink-0"><button onclick="switchDayTab('${dKey}')" id="btn-${dKey}" class="nav-btn ${index === 0 ? 'active' : 'inactive'} pl-4 ${isOnlyDay ? 'pr-4' : 'pr-2'} py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors"><span>${currentRoutine.days[dKey].title}</span>${!isOnlyDay ? `<span onclick="event.stopPropagation(); requestDeleteDay('${dKey}')" class="text-slate-300/70 hover:text-red-400 p-1 rounded-full flex items-center justify-center"><i class="fas fa-times text-[10px]"></i></span>` : ''}</button></div>`;
    });
    navContainer.innerHTML += `<button onclick="addNewDayToRoutine()" class="nav-btn inactive w-8 h-8 rounded-xl text-xs shrink-0 flex items-center justify-center hover:bg-slate-700 transition-colors"><i class="fas fa-plus"></i></button>`;
}
function switchDayTab(dayKey) {
    document.querySelectorAll('.nav-btn').forEach(btn => { if (btn.id && btn.id.startsWith('btn-giorno')) { btn.classList.remove('active'); btn.classList.add('inactive'); } });
    const activeBtn = document.getElementById(`btn-${dayKey}`); if(activeBtn) { activeBtn.classList.remove('inactive'); activeBtn.classList.add('active'); }
    document.querySelectorAll('.giorno-tab').forEach(giorno => giorno.style.display = 'none'); const targetGiorno = document.getElementById(`tab-${dayKey}`); if(targetGiorno) { targetGiorno.style.display = 'block'; targetGiorno.classList.add('active'); }
}
function reopenCurrentTab() { const activeSub = document.querySelector('.nav-btn.active'); if(activeSub && activeSub.id.startsWith('btn-giorno')) { switchDayTab(activeSub.id.replace('btn-', '')); } else { const first = getSortedDayKeys()[0]; if (first) switchDayTab(first); } }

function addNewDayToRoutine() { let nextNum = 1; while(currentRoutine.days[`giorno${nextNum}`]) { nextNum++; } const newDayKey = `giorno${nextNum}`; currentRoutine.days[newDayKey] = { title: `Giorno ${nextNum}`, desc: "Sessione di allenamento", exercises: [] }; saveAllRoutines(); buildDaysNavigation(); renderWorkouts(); renderProgressioni(); switchDayTab(newDayKey); }
function requestDeleteDay(dk) {
    showCustomConfirm("Vuoi eliminare l'intera giornata?", () => {
        delete currentRoutine.days[dk]; let newDays = {}; let counter = 1;
        for (const oldKey of getSortedDayKeys(currentRoutine.days)) {
            let newKey = `giorno${counter}`; let dayData = currentRoutine.days[oldKey];
            if (dayData.title.startsWith("Giorno ")) { dayData.title = `Giorno ${counter}`; } newDays[newKey] = dayData;
            if (oldKey !== newKey) { let oldOrder = localStorage.getItem(`order-${activeRoutineId}-${oldKey}`); if (oldOrder) { localStorage.setItem(`order-${activeRoutineId}-${newKey}`, oldOrder); localStorage.removeItem(`order-${activeRoutineId}-${oldKey}`); } }
            counter++;
        }
        currentRoutine.days = newDays; saveAllRoutines(); buildDaysNavigation(); renderWorkouts(); renderProgressioni();
        const firstDay = getSortedDayKeys()[0]; if (firstDay) { switchDayTab(firstDay); }
    });
}

function renderMeasurements() {
    const c = document.getElementById('measurements-history'); const hist = JSON.parse(localStorage.getItem('measurements_history')) || []; c.innerHTML = '';
    if (hist.length === 0) { c.innerHTML = `<div class="text-xs text-slate-500 text-center py-4 bg-slate-900/60 rounded-xl border border-slate-700/60">Nessuna misurazione salvata.</div>`; return; }
    hist.forEach((m, i) => {
        const badges = [
            m.spalle ? `<span class="bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 text-[11px]"><b class="text-blue-400">Spalle:</b> ${m.spalle}cm</span>` : '',
            m.petto ? `<span class="bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 text-[11px]"><b class="text-blue-400">Petto:</b> ${m.petto}cm</span>` : '',
            m.braccia ? `<span class="bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 text-[11px]"><b class="text-amber-400">Braccia:</b> ${m.braccia}cm</span>` : '',
            m.vita ? `<span class="bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 text-[11px]"><b class="text-emerald-400">Vita:</b> ${m.vita}cm</span>` : '',
            m.fianchi ? `<span class="bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 text-[11px]"><b class="text-emerald-400">Fianchi:</b> ${m.fianchi}cm</span>` : '',
            m.cosce ? `<span class="bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 text-[11px]"><b class="text-rose-400">Cosce:</b> ${m.cosce}cm</span>` : '',
            m.polpacci ? `<span class="bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 text-[11px]"><b class="text-rose-400">Polpacci:</b> ${m.polpacci}cm</span>` : ''
        ].filter(d => d !== '').join(' ');
        c.innerHTML += `<div class="bg-slate-900/90 rounded-xl p-3 border border-slate-700/70 flex justify-between items-start"><div><div class="text-xs font-extrabold text-white mb-2 flex items-center gap-1.5"><i class="far fa-calendar text-blue-400"></i> ${formatDate(m.date)}</div><div class="flex flex-wrap gap-1.5 text-slate-200">${badges}</div></div><button onclick="deleteMeasurement(${i})" class="text-slate-500 hover:text-red-500 p-1 ml-2"><i class="fas fa-trash-alt text-xs"></i></button></div>`;
    });
}
function deleteMeasurement(i) { showCustomConfirm("Eliminare la misurazione?", () => { let hist = JSON.parse(localStorage.getItem('measurements_history')) || []; hist.splice(i, 1); localStorage.setItem('measurements_history', JSON.stringify(hist)); renderMeasurements(); }); }

function openRoutinesManager() { renderRoutinesList(); document.getElementById('routines-modal').classList.remove('hidden'); document.getElementById('routines-modal').classList.add('flex'); }
function closeRoutinesManager() { document.getElementById('routines-modal').classList.add('hidden'); document.getElementById('routines-modal').classList.remove('flex'); }
function renderRoutinesList() {
    const lc = document.getElementById('routines-list-container'); lc.innerHTML = '';
    for (const [rId, rData] of Object.entries(allRoutines)) {
        const isActive = rId === activeRoutineId; const dCount = Object.keys(rData.days).length;
        lc.innerHTML += `<div onclick="switchActiveRoutine('${rId}')" class="bg-slate-900 border ${isActive ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-700 hover:border-slate-500'} cursor-pointer rounded-2xl p-3.5 flex items-center justify-between"><div><h4 class="font-extrabold text-slate-100">${rData.name} ${isActive ? '<span class="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full ml-2">Attiva</span>' : ''}</h4><p class="text-xs text-slate-400 mt-0.5">${dCount} giornate configurate</p></div><div class="flex items-center gap-2">${Object.keys(allRoutines).length > 1 ? `<button onclick="event.stopPropagation(); deleteRoutine('${rId}')" class="text-red-500 hover:text-red-400 p-2"><i class="fas fa-trash"></i></button>` : ''}</div></div>`;
    }
}
function switchActiveRoutine(rId) { activeRoutineId=rId; currentRoutine=allRoutines[rId]; saveAllRoutines(); closeRoutinesManager(); document.getElementById('main-header-title').innerText = currentRoutine.name; buildDaysNavigation(); renderWorkouts(); renderProgressioni(); switchDayTab(getSortedDayKeys()[0]); }
function createNewRoutine() {
    const n = document.getElementById('new-routine-name').value; const dc = parseInt(document.getElementById('new-routine-days').value)||4;
    if(!n) return alert("Inserisci un nome.");
    const nId = 'routine-'+Date.now(); let nDays = {}; for(let i=1; i<=dc; i++) nDays[`giorno${i}`] = { title: `Giorno ${i}`, desc: "Sessione di allenamento", exercises: [] };
    allRoutines[nId] = { name: n, days: nDays }; activeRoutineId = nId; currentRoutine = allRoutines[nId];
    saveAllRoutines(); closeRoutinesManager(); document.getElementById('main-header-title').innerText = currentRoutine.name; buildDaysNavigation(); renderWorkouts(); renderProgressioni(); switchDayTab('giorno1');
}
function deleteRoutine(rId) { showCustomConfirm("Eliminare scheda?", () => { delete allRoutines[rId]; activeRoutineId=Object.keys(allRoutines)[0]; currentRoutine=allRoutines[activeRoutineId]; saveAllRoutines(); renderRoutinesList(); closeRoutinesManager(); document.getElementById('main-header-title').innerText = currentRoutine.name; buildDaysNavigation(); renderWorkouts(); renderProgressioni(); switchDayTab(getSortedDayKeys()[0]); }); }

function handleExerciseSearch(q) {
    const dp = document.getElementById('add-ex-dropdown'); dp.innerHTML = ''; selectedDbExercise = null;
    if (!q || q.trim().length<2) { dp.classList.add('hidden'); return; }
    const res = exerciseDB.filter(ex => ex.name.toLowerCase().includes(q.toLowerCase()));
    if(res.length>0) {
        res.forEach(r => {
            const i=document.createElement('div'); i.className="px-3 py-2 border-b border-slate-600 hover:bg-slate-600 cursor-pointer text-sm text-slate-200"; i.innerText=r.name;
            i.onclick=()=>selectExerciseFromDb(r); dp.appendChild(i);
        });
        dp.classList.remove('hidden');
    } else dp.classList.add('hidden');
}
function selectExerciseFromDb(obj) { document.getElementById('add-ex-name').value = obj.name; document.getElementById('add-ex-dropdown').classList.add('hidden'); selectedDbExercise = obj; }
function openAddModal(dk) { document.getElementById('add-ex-day').value=dk; document.getElementById('add-ex-name').value=''; document.getElementById('add-ex-dropdown').classList.add('hidden'); document.getElementById('add-ex-sets').value='3'; document.getElementById('add-ex-reps').value='10'; document.getElementById('add-ex-rest').value='90'; selectedDbExercise=null; document.getElementById('add-ex-modal').classList.remove('hidden'); document.getElementById('add-ex-modal').classList.add('flex'); }
function closeAddModal() { document.getElementById('add-ex-modal').classList.add('hidden'); document.getElementById('add-ex-modal').classList.remove('flex'); }
function openLibraryModal() { renderLibrary(); document.getElementById('library-modal').classList.remove('hidden'); document.getElementById('library-modal').classList.add('flex'); }
function closeLibraryModal() { document.getElementById('library-modal').classList.add('hidden'); document.getElementById('library-modal').classList.remove('flex'); }

function renderLibrary() {
    const container = document.getElementById('library-list-container'); container.innerHTML = ''; const grouped = {};
    exerciseDB.forEach(ex => { const cat = ex.category || "Altri"; if(!grouped[cat]) grouped[cat] = []; grouped[cat].push(ex); });
    for (const [cat, exList] of Object.entries(grouped)) {
        const safeCat = cat.replace(/\s/g, '');
        let html = `<div class="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden"><button onclick="toggleAccordion('cat-${safeCat}')" class="w-full flex justify-between items-center p-4 bg-slate-800 hover:bg-slate-700 text-left font-bold text-slate-200 transition-colors outline-none">${cat}<i class="fas fa-chevron-down text-slate-400 transition-transform" id="cat-${safeCat}-icon"></i></button><div id="cat-${safeCat}" class="accordion-content bg-slate-900/50"><div class="flex flex-col">`;
        exList.forEach(ex => { html += `<div onclick="selectFromLibrary('${ex.name}')" class="p-3 border-t border-slate-700/50 text-sm text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer transition-colors pl-6">${ex.name}</div>`; });
        html += `</div></div></div>`; container.innerHTML += html;
    }
}
function selectFromLibrary(exName) { const ex = exerciseDB.find(e => e.name === exName); if (ex) { selectExerciseFromDb(ex); closeLibraryModal(); } }

function saveNewExercise() {
    const dk=document.getElementById('add-ex-day').value; const n=document.getElementById('add-ex-name').value.trim();
    if(!n) return alert("Inserisci nome.");
    const existingIdx = currentRoutine.days[dk].exercises.findIndex(e => e.name.toLowerCase() === n.toLowerCase() && e.deletedFromRoutine);
    if (existingIdx !== -1) {
        currentRoutine.days[dk].exercises[existingIdx].deletedFromRoutine = false;
    } else {
        let nEx = { id: 'custom-'+Date.now(), name: n, defaultSets: document.getElementById('add-ex-sets').value||'3', defaultReps: document.getElementById('add-ex-reps').value||'10', defaultRest: document.getElementById('add-ex-rest').value||'90', tech: "Esercizio personalizzato.", muscles: {} };
        if(selectedDbExercise && selectedDbExercise.name===n) { nEx.tech=selectedDbExercise.tech; nEx.muscles=selectedDbExercise.muscles; }
        currentRoutine.days[dk].exercises.push(nEx);
    }
    saveAllRoutines(); closeAddModal(); renderWorkouts(); renderProgressioni(); switchDayTab(dk);
}

function requestDeleteFromRoutine(dk, eId) {
    showCustomConfirm("Eliminare questo esercizio dalla scheda?", () => {
        const i = currentRoutine.days[dk].exercises.findIndex(e=>e.id===eId);
        if(i!==-1) {
            if (currentRoutine.days[dk].exercises[i].isSwapSub) currentRoutine.days[dk].exercises.splice(i, 1);
            else currentRoutine.days[dk].exercises[i].deletedFromRoutine = true;
            saveAllRoutines(); renderWorkouts(); renderProgressioni(); switchDayTab(dk);
        }
    });
}
function requestDeleteHistory(hk, eId) { showCustomConfirm("Cancellare tutto lo storico per questo esercizio?", () => { localStorage.removeItem(hk); renderProgressioni(); renderMonthlyCalendar(); renderNutritionDashboard(); const cc=document.getElementById(`chart-container-${eId}`); if(cc&&!cc.classList.contains('hidden')) toggleChart(eId, hk); }); }
function showCustomConfirm(msg, cb) { document.getElementById('confirm-msg').innerText=msg; confirmCallback=cb; document.getElementById('custom-confirm-modal').classList.remove('hidden'); document.getElementById('custom-confirm-modal').classList.add('flex'); }
function closeConfirm() { document.getElementById('custom-confirm-modal').classList.add('hidden'); document.getElementById('custom-confirm-modal').classList.remove('flex'); confirmCallback=null; }
function confirmYes() { if(confirmCallback) confirmCallback(); closeConfirm(); }

function openDomsModal() { document.getElementById('doms-modal').classList.remove('hidden'); document.getElementById('doms-modal').classList.add('flex'); }
function closeDomsModal() { document.getElementById('doms-modal').classList.add('hidden'); document.getElementById('doms-modal').classList.remove('flex'); }
function applyDomsFilter() { currentDomsFilters = Array.from(document.querySelectorAll('.doms-chk:checked')).map(cb => cb.value); closeDomsModal(); renderWorkouts(); renderProgressioni(); reopenCurrentTab(); }
function removeDomsFilter() { currentDomsFilters = []; document.querySelectorAll('.doms-chk').forEach(cb => cb.checked = false); closeDomsModal(); renderWorkouts(); renderProgressioni(); reopenCurrentTab(); }
function isHitByDoms(exMuscles) { if (!exMuscles || currentDomsFilters.length === 0) return false; for (let m of currentDomsFilters) { if (exMuscles[m] >= 1) return true; } return false; }
function findDomsSubstitute(originalEx, dayExercises) {
    let dayMuscles = new Set();
    dayExercises.forEach(e => { if (e.muscles) Object.keys(e.muscles).forEach(m => dayMuscles.add(m)); });
    currentDomsFilters.forEach(m => dayMuscles.delete(m));
    let candidates = exerciseDB.filter(dbEx => {
        if (isHitByDoms(dbEx.muscles)) return false;
        let hitsAllowedMuscle = false;
        if (dbEx.muscles) { for (let m of dayMuscles) { if (dbEx.muscles[m] >= 1) { hitsAllowedMuscle = true; break; } } }
        return hitsAllowedMuscle;
    });
    if (candidates.length === 0) return { name: "Recupero / Stretching", tech: "I tuoi muscoli hanno bisogno di riposo.", muscles: {} };
    return candidates[0];
}

function openSwapModal(dk, exId) {
    const ex = currentRoutine.days[dk].exercises.find(e => e.id === exId);
    let primary = null; let max = 0;
    if(ex.muscles) { for(const [m, sc] of Object.entries(ex.muscles)) { if(sc > max) { max = sc; primary = m; } } }
    const listEl = document.getElementById('swap-list'); listEl.innerHTML = '';
    if(!primary) {
        listEl.innerHTML = '<p class="text-sm text-slate-400">Nessuna alternativa trovata per questo esercizio personalizzato.</p>';
    } else {
        let alts = exerciseDB.filter(e => e.name !== ex.name && e.muscles && e.muscles[primary] >= 2);
        alts.forEach(alt => { listEl.innerHTML += `<div class="bg-slate-900 p-3 rounded-xl border border-slate-700/50 mb-2 flex justify-between items-center"><span class="text-sm text-slate-200 font-bold">${alt.name}</span><button onclick="confirmSwap('${dk}', '${exId}', '${alt.name.replace(/'/g, "\\\\'")}')" class="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-colors shadow">Scegli</button></div>`; });
    }
    document.getElementById('swap-modal').classList.remove('hidden'); document.getElementById('swap-modal').classList.add('flex');
}
function closeSwapModal() { document.getElementById('swap-modal').classList.add('hidden'); document.getElementById('swap-modal').classList.remove('flex'); }

function confirmSwap(dk, exId, newName) {
    let dbEx = exerciseDB.find(e => e.name === newName);
    if(dbEx) {
        const targetDate = document.getElementById('prog-date').value || getTodayStr();
        let origEx = currentRoutine.days[dk].exercises.find(e => e.id === exId);
        let nEx = { id: 'swap-'+Date.now(), name: dbEx.name, defaultSets: origEx ? origEx.defaultSets : '3', defaultReps: origEx ? origEx.defaultReps : '10', defaultRest: origEx ? origEx.defaultRest : '90', tech: dbEx.tech, muscles: dbEx.muscles, isSwapSub: true, swapDate: targetDate };
        let idx = currentRoutine.days[dk].exercises.findIndex(e => e.id === exId);
        if(idx !== -1) currentRoutine.days[dk].exercises.splice(idx + 1, 0, nEx); else currentRoutine.days[dk].exercises.push(nEx);
        saveAllRoutines(); renderWorkouts(); renderProgressioni(); switchDayTab(dk); closeSwapModal();
    }
}

function getExerciseCategoryBadge(exName) {
    const found = exerciseDB.find(e => e.name === exName); const cat = found ? found.category : "Custom";
    const colors = { "Petto": "text-blue-400 bg-blue-500/10 border-blue-500/30", "Dorso e Lombari": "text-cyan-400 bg-cyan-500/10 border-cyan-500/30", "Gambe": "text-rose-400 bg-rose-500/10 border-rose-500/30", "Spalle": "text-amber-400 bg-amber-500/10 border-amber-500/30", "Braccia": "text-purple-400 bg-purple-500/10 border-purple-500/30", "Addome e Core": "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", "Custom": "text-slate-400 bg-slate-700/40 border-slate-600/50" };
    return `<span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${colors[cat] || colors["Custom"]}">${cat}</span>`;
}

function getQuickEnergyStatus() {
    const logs = JSON.parse(localStorage.getItem(getDietDateKey())) || [];
    const water = parseInt(localStorage.getItem(getWaterDateKey())) || 0;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const mealsGrouped = {};
    logs.forEach(log => {
        if (!mealsGrouped[log.mealType]) mealsGrouped[log.mealType] = { time: log.time, f: 0, c: 0, kcal: 0, isCheat: false };
        if (log.time && log.time > mealsGrouped[log.mealType].time) mealsGrouped[log.mealType].time = log.time;
        mealsGrouped[log.mealType].f += log.f;
        mealsGrouped[log.mealType].c += log.c;
        mealsGrouped[log.mealType].kcal += log.kcal;
        if (log.isCheat) mealsGrouped[log.mealType].isCheat = true;
    });

    let minTimeDiff = Infinity;
    let mealStats = null;
    for (const data of Object.values(mealsGrouped)) {
        if (!data.time) continue;
        const [h, m] = data.time.split(':').map(Number);
        let diff = currentMinutes - (h * 60 + m);
        if (diff < 0) diff = 0;
        if (diff >= 0 && diff < minTimeDiff) { minTimeDiff = diff; mealStats = data; }
    }

    if (!mealStats || minTimeDiff > 360) return { btnClass: 'bg-rose-900/60 text-rose-400 border border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.4)]' };
    
    const isHeavy = mealStats.isCheat || mealStats.f > 25 || mealStats.kcal > 800;
    if (minTimeDiff < 45 || (minTimeDiff < 90 && isHeavy)) return { btnClass: 'bg-rose-900/60 text-rose-400 border border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.4)]' };
    else if (minTimeDiff >= 90 && minTimeDiff <= 180 && mealStats.c > 40 && !isHeavy && water >= 4) return { btnClass: 'bg-emerald-900/60 text-emerald-400 border border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]' };
    else if (minTimeDiff >= 60 && minTimeDiff <= 240) return { btnClass: 'bg-green-900/60 text-green-400 border border-green-500/50 shadow-[0_0_8px_rgba(74,222,128,0.4)]' };
    else return { btnClass: 'bg-amber-900/60 text-amber-400 border border-amber-500/50 shadow-[0_0_8px_rgba(251,191,36,0.4)]' };
}

function renderWorkouts() {
    const c = document.getElementById('workout-container'); c.innerHTML = '';
    const targetDate = document.getElementById('prog-date').value || getTodayStr();

    for (const key of getSortedDayKeys()) {
        const data = currentRoutine.days[key];
        let sOrder = JSON.parse(localStorage.getItem(`order-${activeRoutineId}-${key}`));
        let eList = data.exercises.filter(ex => { if (ex.deletedFromRoutine) return false; if (ex.isSwapSub && ex.swapDate !== targetDate) return false; return true; });
        if(sOrder) { eList.sort((a,b)=>{ let iA=sOrder.indexOf(a.id); let iB=sOrder.indexOf(b.id); return (iA===-1?999:iA)-(iB===-1?999:iB); }); }
        
        let displayList = [];
        eList.forEach(ex => {
            if(currentDomsFilters.length > 0 && isHitByDoms(ex.muscles)) { let sub = findDomsSubstitute(ex, eList); displayList.push({...sub, id: ex.id, isDomsSub: true, originalName: ex.name, defaultSets: ex.defaultSets, defaultReps: ex.defaultReps, defaultRest: ex.defaultRest}); } 
            else { displayList.push(ex); }
        });

        const filterBtnClass = currentDomsFilters.length > 0 ? 'bg-amber-500 text-slate-900 shadow-lg' : 'bg-slate-900 hover:bg-slate-700 text-amber-400 border border-slate-700';
        const energyBtn = getQuickEnergyStatus();
        
        let html = `<div id="tab-${key}" class="giorno-tab tab-content">
            <div class="mb-4 bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 shadow-xl flex justify-between items-start">
                <div>
                    <div class="flex items-center gap-2"><h2 class="text-lg font-extrabold text-white">${data.title}</h2><span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">${displayList.length} Esercizi</span></div>
                    <p class="text-xs text-slate-400 mt-0.5">${data.desc}</p>
                    <button onclick="openWarmupModal('${key}')" class="mt-3 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-colors"><i class="fas fa-fire-alt"></i> Smart Warm-up</button>
                </div>
                <div class="flex gap-2">
                    <button onclick="openPreWorkoutAdvisorModal()" title="Check Energia" class="${energyBtn.btnClass} rounded-xl w-10 h-10 flex items-center justify-center transition-all hover:scale-105"><i class="fas fa-bolt text-sm"></i></button>
                    <button onclick="openDomsModal()" title="Filtro DOMS" class="${filterBtnClass} rounded-xl w-10 h-10 flex items-center justify-center transition-colors shadow"><i class="fas fa-filter text-sm"></i></button>
                    <button onclick="openAddModal('${key}')" title="Aggiungi Esercizio" class="bg-blue-600 hover:bg-blue-500 text-white rounded-xl w-10 h-10 flex items-center justify-center shadow-lg transition-colors"><i class="fas fa-plus"></i></button>
                </div>
            </div>
            <div class="space-y-3.5" id="list-${key}">`;
            
        if (displayList.length === 0) {
            html += `<div class="text-center text-xs text-slate-400 py-10 bg-slate-800/80 rounded-2xl border border-slate-700 border-dashed">Nessun esercizio in questa giornata. Premi il tasto <b class="text-blue-400">+</b> in alto a destra per iniziare.</div>`;
        } else {
            displayList.forEach(ex => {
                let badge = getExerciseCategoryBadge(ex.name);
                if(ex.isDomsSub) badge += `<span class="bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full">SOSTITUTIVO DOMS</span>`;
                else if(ex.isSwapSub) badge += `<span class="bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full">SOSTITUTIVO OGGI</span>`;
                
                let isSub = ex.isDomsSub || ex.isSwapSub; let borderColor = isSub ? 'border-amber-500/50' : 'border-slate-700/80';
                const curSets = localStorage.getItem(`${ex.id}-sets`) || ex.defaultSets; const curReps = localStorage.getItem(`${ex.id}-reps`) || ex.defaultReps; const curRest = localStorage.getItem(`${ex.id}-rest`) || ex.defaultRest;
                
                html += `<div class="bg-slate-800/90 rounded-2xl overflow-hidden shadow-xl border ${borderColor} flex flex-col draggable-item" data-id="${ex.id}">
                    <div class="flex items-stretch p-3.5 pb-2.5">
                        <div class="drag-handle pr-3 flex items-center justify-center cursor-grab text-slate-500 hover:text-blue-400"><i class="fas fa-grip-vertical text-lg"></i></div>
                        <div class="flex-1 cursor-pointer" onclick="toggleAccordion('${ex.id}-acc')">
                            <div class="flex flex-wrap items-center gap-1.5 mb-1">${badge}</div>
                            <h3 class="font-extrabold text-slate-100 text-sm leading-snug">${ex.name}</h3>
                        </div>
                        <div class="flex items-center gap-1.5 pl-2">
                            ${!isSub ? `<button onclick="event.stopPropagation(); openSwapModal('${key}', '${ex.id}')" title="Macchinario occupato" class="text-blue-400 w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-700/70 hover:bg-slate-700 flex items-center justify-center"><i class="fas fa-exchange-alt text-xs"></i></button>` : ''}
                            <button onclick="event.stopPropagation(); requestDeleteFromRoutine('${key}', '${ex.id}')" class="text-rose-400 w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-700/70 hover:bg-slate-700 flex items-center justify-center"><i class="fas fa-times text-xs"></i></button>
                            <button onclick="toggleAccordion('${ex.id}-acc')" class="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-900/80 border border-slate-700/70 text-slate-300"><i class="fas fa-chevron-down text-xs transition-transform" id="${ex.id}-acc-icon"></i></button>
                        </div>
                    </div>

                    <div id="${ex.id}-acc" class="accordion-content px-3.5">
                        <div class="p-3 my-1 bg-slate-900/90 rounded-xl border border-slate-700/60 text-xs text-slate-300">
                            ${ex.isDomsSub ? `<span class="text-amber-400 font-bold block mb-1">Sostituisce: ${ex.originalName}</span>` : ''}
                            <span class="text-emerald-400 font-bold uppercase text-[10px] tracking-wider block mb-0.5"><i class="fas fa-check-circle mr-1"></i>Tecnica & Focus:</span>${ex.tech}
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2.5 px-3.5 pb-3.5 pt-1">
                        <div class="bg-slate-900/85 p-2.5 rounded-xl border border-slate-700/50 flex justify-between items-center">
                            <div>
                                <div class="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Serie x Rip</div>
                                <div class="flex items-center gap-1.5 mt-0.5">
                                    <span id="${ex.id}-sr-display" class="font-extrabold text-white text-base">${curSets}x${curReps}</span>
                                    <input type="text" id="${ex.id}-sr-input" class="editable-input hidden text-sm" value="${curSets}x${curReps}" onblur="saveSR('${ex.id}')" onkeypress="handleEnter(event, this)">
                                </div>
                            </div>
                            <button onclick="editSR('${ex.id}')" class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-blue-400 flex items-center justify-center"><i class="fas fa-pen text-[10px]"></i></button>
                        </div>

                        <div class="bg-slate-900/85 p-2.5 rounded-xl border border-slate-700/50 flex justify-between items-center">
                            <div>
                                <div class="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Recupero</div>
                                <div class="flex items-center gap-1.5 mt-0.5">
                                    <span id="${ex.id}-rest-display" class="font-extrabold text-white text-base">${curRest}"</span>
                                    <input type="text" id="${ex.id}-rest-input" class="editable-input hidden text-sm" value="${curRest}" onblur="saveRest('${ex.id}')" onkeypress="handleEnter(event, this)">
                                </div>
                            </div>
                            <button onclick="editRest('${ex.id}')" class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 flex items-center justify-center"><i class="fas fa-pen text-[10px]"></i></button>
                        </div>
                    </div>
                </div>`;
            });
        }
        html += `</div></div>`; c.innerHTML += html;
    }
    getSortedDayKeys().forEach(k => {
        const l=document.getElementById(`list-${k}`);
        if(l) new Sortable(l, { handle:'.drag-handle', animation:150, ghostClass:'sortable-ghost', onEnd:function(){ const nO=Array.from(l.querySelectorAll('.draggable-item')).map(i=>i.getAttribute('data-id')); localStorage.setItem(`order-${activeRoutineId}-${k}`, JSON.stringify(nO)); renderProgressioni(); }});
    });
}

function toggleAccordion(id) { const c=document.getElementById(id); const i=document.getElementById(id+'-icon'); if(c.classList.contains('open')){c.classList.remove('open');if(i)i.style.transform='rotate(0deg)';}else{c.classList.add('open');if(i)i.style.transform='rotate(180deg)';} }
function editSR(id) { document.getElementById(`${id}-sr-display`).classList.add('hidden'); const i=document.getElementById(`${id}-sr-input`); i.classList.remove('hidden'); i.focus(); }
function saveSR(id) { const v=document.getElementById(`${id}-sr-input`).value; localStorage.setItem(`${id}-sets`, v.split('x')[0]||"0"); localStorage.setItem(`${id}-reps`, v.split('x')[1]||"0"); document.getElementById(`${id}-sr-display`).innerText=v; document.getElementById(`${id}-sr-input`).classList.add('hidden'); document.getElementById(`${id}-sr-display`).classList.remove('hidden'); renderProgressioni(); }
function editRest(id) { document.getElementById(`${id}-rest-display`).classList.add('hidden'); const i=document.getElementById(`${id}-rest-input`); i.classList.remove('hidden'); i.focus(); }
function saveRest(id) { const v=document.getElementById(`${id}-rest-input`).value.replace('"',''); localStorage.setItem(`${id}-rest`, v); document.getElementById(`${id}-rest-display`).innerText=v+'"'; document.getElementById(`${id}-rest-input`).classList.add('hidden'); document.getElementById(`${id}-rest-display`).classList.remove('hidden'); }
function handleEnter(e, el) { if(e.key==='Enter') el.blur(); }

function scrollToProgDay(dayKey) {
    const targetEl = document.getElementById(`prog-section-${dayKey}`);
    if (!targetEl) return;
    document.querySelectorAll('.jump-pill').forEach(btn => { btn.className = "jump-pill px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:border-blue-500 flex items-center gap-1.5"; });
    const activePill = document.getElementById(`jump-pill-${dayKey}`);
    if (activePill) { activePill.className = "jump-pill px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white border border-blue-400 shadow-lg flex items-center gap-1.5"; }
    const yOffset = -125; const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset; window.scrollTo({ top: y, behavior: 'smooth' });
}

function setEffort(exId, level) {
    document.getElementById(`inp-effort-${exId}`).value = level;
    
    const labelEl = document.getElementById(`effort-label-${exId}`);
    if (labelEl) {
        if (level === 'easy') {
            labelEl.innerText = 'SFORZO: LEGGERO';
            labelEl.className = 'text-[8px] font-bold uppercase mb-0.5 tracking-wider text-emerald-400';
        } else if (level === 'hard') {
            labelEl.innerText = 'SFORZO: PESANTE';
            labelEl.className = 'text-[8px] font-bold uppercase mb-0.5 tracking-wider text-rose-400';
        } else {
            labelEl.innerText = 'SFORZO: NORMALE';
            labelEl.className = 'text-[8px] font-bold uppercase mb-0.5 tracking-wider text-amber-400';
        }
    }

    ['easy', 'normal', 'hard'].forEach(l => {
        const btn = document.getElementById(`eff-${l.substring(0,4)}-${exId}`);
        if (l === level) {
            btn.classList.replace('opacity-40', 'opacity-100');
            btn.classList.replace('scale-90', 'scale-110');
            if(!btn.classList.contains('bg-slate-800')) btn.classList.add('bg-slate-800', 'shadow');
        } else {
            btn.classList.replace('opacity-100', 'opacity-40');
            btn.classList.replace('scale-110', 'scale-90');
            btn.classList.remove('bg-slate-800', 'shadow');
        }
    });
}

function renderProgressioni() {
    const progEnergyBtn = document.getElementById('prog-energy-btn');
    if (progEnergyBtn) {
        progEnergyBtn.className = `${getQuickEnergyStatus().btnClass} rounded-xl w-10 h-10 flex items-center justify-center transition-all hover:scale-105 shrink-0`;
    }
    const c = document.getElementById('prog-list'); c.innerHTML = '';
    const jumpBar = document.getElementById('prog-days-jump-bar');
    if (jumpBar) jumpBar.innerHTML = '';

    const targetDate = document.getElementById('prog-date').value;
    let firstRenderedDay = null;
    
    for (const dk of getSortedDayKeys()) {
        const data = currentRoutine.days[dk];
        let sO = JSON.parse(localStorage.getItem(`order-${activeRoutineId}-${dk}`));
        let eList = data.exercises.filter(ex => {
            if (ex.isSwapSub && ex.swapDate !== targetDate) return false;
            return true;
        });
        if(sO) eList.sort((a,b)=>{let iA=sO.indexOf(a.id);let iB=sO.indexOf(b.id);return (iA===-1?999:iA)-(iB===-1?999:iB);});
        
        let displayList = [];
        eList.forEach(ex => {
            if(currentDomsFilters.length > 0 && isHitByDoms(ex.muscles)) {
                let sub = findDomsSubstitute(ex, eList);
                displayList.push({...sub, id: ex.id, isDomsSub: true, originalName: ex.name, deletedFromRoutine: ex.deletedFromRoutine, defaultSets: ex.defaultSets, defaultReps: ex.defaultReps});
            } else {
                displayList.push(ex);
            }
        });
        
        exerciseDB.forEach(dbEx => {
            const hk = getHistKey(dbEx.name);
            const hist = JSON.parse(localStorage.getItem(hk)) || [];
            const logsForDate = hist.filter(h => h.date === targetDate && h.isSubstitute);
            if (logsForDate.length > 0) {
                if (!displayList.some(e => e.name === dbEx.name)) {
                    displayList.push({...dbEx, id: 'hist-sub-'+Math.random(), isPastSub: true});
                }
            }
        });
        
        let activeNames = displayList.filter(e => !e.deletedFromRoutine && !e.isPastSub).map(e => e.name);
        let vE = displayList.filter(ex=>{
            const h = JSON.parse(localStorage.getItem(getHistKey(ex.name)))||[];
            if (!ex.deletedFromRoutine || ex.isPastSub) return true;
            return h.length > 0 && !activeNames.includes(ex.name);
        });
        
        if(vE.length === 0) continue;

        if (!firstRenderedDay) firstRenderedDay = dk;

        if (jumpBar) {
            const isFirst = (dk === firstRenderedDay);
            jumpBar.innerHTML += `<button id="jump-pill-${dk}" onclick="scrollToProgDay('${dk}')" class="jump-pill px-3.5 py-1.5 rounded-xl text-xs font-bold ${isFirst ? 'bg-blue-600 text-white border border-blue-400 shadow-lg' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-blue-500'} flex items-center gap-1.5">
                <i class="fas fa-bolt text-[10px] ${isFirst ? 'text-amber-300' : 'text-blue-400'}"></i> ${data.title}
            </button>`;
        }

        let dHtml = `<div id="prog-section-${dk}" class="mb-8 scroll-mt-32">
            <div class="flex items-center justify-between bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700/70 mb-3.5">
                <span class="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-2"><i class="fas fa-layer-group"></i> ${data.title}</span>
                <span class="text-[10px] font-bold text-slate-400">${vE.length} esercizi</span>
            </div>
            <div class="space-y-4">`;

        vE.forEach(ex => {
            const hk = getHistKey(ex.name);
            const h = JSON.parse(localStorage.getItem(hk))||[];
            let hH = '';
            let coachBadge = '';

            if(h.length > 0) {
                const lastLog = h[0];
                if (lastLog.effort === 'easy') {
                    let oldW = parseFloat(lastLog.weight) || 0;
                    let suggestedW = oldW;
                    if (oldW > 0) {
                        if (oldW <= 25) suggestedW += 1;
                        else if (oldW <= 50) suggestedW += 2;
                        else suggestedW += 2.5;
                        
                        coachBadge = `<button onclick="document.getElementById('inp-weight-${ex.id}').value='${suggestedW}';" title="L'ultima volta era Facile!" class="ml-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse border border-amber-300">⚡ PROVA ${suggestedW}kg</button>`;
                    }
                }

                h.forEach((l,i) => {
                    let effortDot = '🟡';
                    if (l.effort === 'easy') effortDot = '🟢';
                    else if (l.effort === 'hard') effortDot = '🔴';

                    hH += `<div class="flex justify-between items-center text-xs border-b border-slate-800 py-2 last:border-none last:pb-0 w-full">
                        <div class="flex-1">
                            <div class="flex justify-between items-center pr-2">
                                <span class="text-slate-400 font-semibold">${formatDate(l.date)}</span>
                                <div class="flex items-center">
                                    <span class="bg-blue-500/15 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded-md font-bold mr-1">${l.sets}x${l.reps}</span>
                                    <span class="font-extrabold text-emerald-400 text-sm">${l.weight} kg</span>
                                    <span class="text-[10px] ml-1.5" title="Sforzo percepito">${effortDot}</span>
                                </div>
                            </div>
                            ${l.note ? `<div class="text-[11px] text-slate-400 italic mt-1"><i class="far fa-comment-dots text-blue-400 mr-1"></i>${l.note}</div>` : ''}
                        </div>
                        <button onclick="deleteLog('${hk}', ${i})" class="text-slate-500 hover:text-red-500 p-1 ml-1"><i class="fas fa-times"></i></button>
                    </div>`;
                });
            } else {
                hH = `<div class="text-xs text-slate-500 text-center py-2">Nessuna serie registrata nei giorni passati.</div>`;
            }
            
            let badgeHtml = (ex.isDomsSub || ex.isPastSub || ex.isSwapSub) ? `<span class="ml-1.5 text-[9px] bg-amber-500 text-slate-900 font-extrabold px-2 py-0.5 rounded-full shadow">SOSTITUTIVO</span>` : '';
            if(ex.deletedFromRoutine && !ex.isPastSub && !ex.isDomsSub && !ex.isSwapSub) badgeHtml = `<span class="ml-1.5 text-[9px] bg-rose-900/60 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">ARCHIVIATO</span>`;

            const targetSets = localStorage.getItem(`${ex.id}-sets`) || ex.defaultSets || '';
            const targetReps = localStorage.getItem(`${ex.id}-reps`) || ex.defaultReps || '';
            const targetHint = (targetSets && targetReps) ? `<span class="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">Scheda: ${targetSets}x${targetReps}</span>` : '';

            dHtml += `<div class="bg-slate-800/90 rounded-2xl p-3.5 border ${ex.isDomsSub || ex.isPastSub || ex.isSwapSub ? 'border-amber-500/50' : 'border-slate-700/80'} shadow-xl ${ex.deletedFromRoutine && !ex.isPastSub ? 'opacity-75' : ''}">
                
                <div class="bg-slate-900/95 rounded-xl p-3.5 border border-blue-500/30 shadow-inner mb-3">
                    <div class="flex justify-between items-start mb-3 border-b border-slate-800 pb-2.5">
                        <div class="pr-2">
                            <div class="flex flex-wrap items-center gap-1 mb-1">${getExerciseCategoryBadge(ex.name)}${badgeHtml}${coachBadge}</div>
                            <h4 class="font-extrabold text-white text-sm leading-snug">${ex.name}</h4>
                        </div>
                        ${targetHint}
                    </div>

                    <div class="grid grid-cols-3 gap-2.5 mb-3">
                        <div class="text-center">
                            <label class="text-[10px] font-bold text-blue-400 uppercase mb-1 block">Serie</label>
                            <input type="number" id="inp-sets-${ex.id}" class="prog-empty-input w-full rounded-xl p-2 text-white font-extrabold text-base text-center outline-none">
                        </div>
                        <div class="text-center">
                            <label class="text-[10px] font-bold text-amber-400 uppercase mb-1 block">Reps</label>
                            <input type="number" id="inp-reps-${ex.id}" class="prog-empty-input w-full rounded-xl p-2 text-white font-extrabold text-base text-center outline-none">
                        </div>
                        <div class="text-center">
                            <label class="text-[10px] font-bold text-emerald-400 uppercase mb-1 block">Carico (Kg)</label>
                            <input type="number" step="0.5" id="inp-weight-${ex.id}" class="prog-empty-input w-full rounded-xl p-2 text-white font-extrabold text-base text-center outline-none">
                        </div>
                    </div>

                    <div class="flex items-end gap-1.5">
                        <button onclick="toggleNote('note-${ex.id}')" title="Aggiungi Nota" class="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl w-10 h-10 flex items-center justify-center shrink-0 transition-colors"><i class="fas fa-comment-medical text-blue-400"></i></button>
                        
                        <div class="flex flex-col items-center shrink-0">
                            <div id="effort-label-${ex.id}" class="text-[8px] font-bold text-amber-400 uppercase mb-0.5 tracking-wider">SFORZO: NORMALE</div>
                            <div class="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-700 h-10">
                                <button onclick="setEffort('${ex.id}', 'easy')" id="eff-easy-${ex.id}" title="Facile" class="w-8 h-8 rounded-lg text-sm opacity-40 hover:opacity-100 transition-all scale-90">🟢</button>
                                <button onclick="setEffort('${ex.id}', 'normal')" id="eff-norm-${ex.id}" title="Giusto" class="w-8 h-8 rounded-lg text-sm opacity-100 bg-slate-800 shadow transition-all scale-110">🟡</button>
                                <button onclick="setEffort('${ex.id}', 'hard')" id="eff-hard-${ex.id}" title="Pesante" class="w-8 h-8 rounded-lg text-sm opacity-40 hover:opacity-100 transition-all scale-90">🔴</button>
                                <input type="hidden" id="inp-effort-${ex.id}" value="normal">
                            </div>
                        </div>

                        <button onclick="saveProgression('${ex.id}', '${hk}', ${ex.isDomsSub || ex.isPastSub || ex.isSwapSub || false})" id="btn-save-${ex.id}" class="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl h-10 text-xs shadow-lg transition-colors flex items-center justify-center gap-1.5"><i class="fas fa-plus-circle"></i> Salva</button>
                    </div>
                    
                    <input type="text" id="note-${ex.id}" placeholder="Scrivi una nota tecnica o sensazione..." class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs hidden mt-2.5 outline-none focus:border-blue-500">
                </div>

                <div class="px-1 mt-4">
                    <div class="flex justify-between items-center mb-1.5">
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"><i class="fas fa-history mr-1 text-slate-500"></i>Storico Registrazioni</span>
                        <button onclick="requestDeleteHistory('${hk}', '${ex.id}')" title="Svuota storico esercizio" class="text-[10px] text-slate-500 hover:text-red-400 flex items-center gap-1"><i class="fas fa-trash-alt"></i> Svuota</button>
                    </div>
                    <div class="bg-slate-900/70 rounded-xl p-2.5 border border-slate-700/50 mb-2.5 max-h-40 overflow-y-auto no-scrollbar">${hH}</div>

                    <button onclick="toggleChart('${ex.id}', '${hk}')" class="w-full py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-700/50 text-center text-xs font-bold text-blue-400 transition-colors"><i class="fas fa-chart-area mr-1"></i> Analisi Grafica 1RM & Volume</button>
                    <div id="chart-container-${ex.id}" class="hidden mt-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-700"><canvas id="chart-${ex.id}"></canvas></div>
                </div>
            </div>`;
        });
        dHtml += `</div></div>`;
        c.innerHTML += dHtml;
    }

    if (c.innerHTML === '') {
        c.innerHTML = `<div class="text-center text-xs text-slate-400 py-10 bg-slate-800/80 rounded-2xl border border-slate-700 border-dashed">Aggiungi prima degli esercizi nella sezione <b>Scheda</b> per registrare i tuoi progressi.</div>`;
    }
}

function toggleNote(id) { const el=document.getElementById(id); el.classList.toggle('hidden'); if(!el.classList.contains('hidden')) el.focus(); }

function saveProgression(exId, hk, isSubstitute) {
    const d=document.getElementById('prog-date').value; 
    const s=document.getElementById(`inp-sets-${exId}`).value; 
    const r=document.getElementById(`inp-reps-${exId}`).value; 
    const w=document.getElementById(`inp-weight-${exId}`).value; 
    const n=document.getElementById(`note-${exId}`).value; 
    const effort=document.getElementById(`inp-effort-${exId}`).value; 
    const b=document.getElementById(`btn-save-${exId}`);
    
    if(!d||!s||!r||!w){ b.classList.replace('bg-blue-600','bg-red-600'); setTimeout(()=>b.classList.replace('bg-red-600','bg-blue-600'),1500); return; }
    
    let h=JSON.parse(localStorage.getItem(hk))||[];
    h.unshift({date:d, sets:s, reps:r, weight:w, note:n, isSubstitute: !!isSubstitute, effort: effort});
    h.sort((a,b)=>new Date(b.date)-new Date(a.date)); 
    localStorage.setItem(hk, JSON.stringify(h));
    
    setEffort(exId, 'normal');
    
    renderProgressioni(); renderMonthlyCalendar(); renderNutritionDashboard();
}
function deleteLog(hk, i) { let h=JSON.parse(localStorage.getItem(hk))||[]; h.splice(i,1); localStorage.setItem(hk, JSON.stringify(h)); renderProgressioni(); renderMonthlyCalendar(); renderNutritionDashboard(); }
function formatDate(ds) { if(!ds) return ''; const p = ds.split('-'); if(p.length===3) return `${p[2]}/${p[1]}`; const d=new Date(ds); return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}`; }
function toggleChart(eId, hk) { const c=document.getElementById(`chart-container-${eId}`); if(c.classList.contains('hidden')){c.classList.remove('hidden');renderChart(eId, hk);}else{c.classList.add('hidden');if(chartInstances[eId])chartInstances[eId].destroy();} }
function renderChart(eId, hk) {
    let h=JSON.parse(localStorage.getItem(hk))||[]; if(h.length===0)return; let cD=[...h].sort((a,b)=>new Date(a.date)-new Date(b.date)); const l=[],d1=[],dV=[];
    cD.forEach(x=>{ l.push(formatDate(x.date)); const p=parseFloat(x.weight), r=parseFloat(x.reps), s=parseFloat(x.sets); d1.push((p*(1+(r/30))).toFixed(1)); dV.push((s*r*p).toFixed(0)); });
    const ctx=document.getElementById(`chart-${eId}`).getContext('2d'); if(chartInstances[eId])chartInstances[eId].destroy();
    chartInstances[eId]=new Chart(ctx,{type:'line',data:{labels:l,datasets:[{label:'1RM (Kg)',data:d1,borderColor:'#3b82f6',yAxisID:'y'},{label:'Volume (Kg)',data:dV,borderColor:'#f59e0b',yAxisID:'y1'}]},options:{responsive:true,scales:{y:{type:'linear',position:'left'},y1:{type:'linear',position:'right',grid:{drawOnChartArea:false}}}}});
}

// ==================== CALENDARIO E MAPPA MUSCOLARE ====================
function getWorkoutDates() { let dates = new Set(); for (let i = 0; i < localStorage.length; i++) { let key = localStorage.key(i); if (key.startsWith('hist_')) { let history = JSON.parse(localStorage.getItem(key)) || []; history.forEach(log => dates.add(log.date)); } } return dates; }
function jumpToDate() { const m = parseInt(document.getElementById('cal-month-select').value); const y = parseInt(document.getElementById('cal-year-select').value); calCurrentDate.setMonth(m); calCurrentDate.setFullYear(y); document.getElementById('cal-selected-info').classList.add('hidden'); document.getElementById('cal-selected-info').classList.remove('flex'); renderMonthlyCalendar(); }
function changeCalendarMonth(direction) { calCurrentDate.setMonth(calCurrentDate.getMonth() + direction); document.getElementById('cal-selected-info').classList.add('hidden'); document.getElementById('cal-selected-info').classList.remove('flex'); renderMonthlyCalendar(); }
function renderMonthlyCalendar() {
    const y = calCurrentDate.getFullYear(); const m = calCurrentDate.getMonth();
    const monthSelect = document.getElementById('cal-month-select'); const yearSelect = document.getElementById('cal-year-select');
    if (monthSelect) monthSelect.value = m; if (yearSelect && yearSelect.querySelector(`option[value="${y}"]`)) { yearSelect.value = y; }
    const firstDay = new Date(y, m, 1).getDay(); const daysInMonth = new Date(y, m + 1, 0).getDate();
    let startDay = firstDay === 0 ? 6 : firstDay - 1;
    const grid = document.getElementById('monthly-calendar-grid'); grid.innerHTML = '';
    const workedOutDates = getWorkoutDates();
    for(let i=0; i<startDay; i++) { grid.innerHTML += `<div></div>`; }
    for(let d=1; d<=daysInMonth; d++) {
        let dateStr = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        let isActive = workedOutDates.has(dateStr);
        let classes = isActive ? 'bg-emerald-500 text-slate-950 font-extrabold hover:scale-105 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'text-slate-400 bg-slate-900/70 border border-slate-700/50 hover:bg-slate-700';
        let dayHtml = `<div class="aspect-square flex items-center justify-center rounded-xl cursor-pointer transition-all ${classes}" onclick="selectCalendarDate('${dateStr}', ${isActive})">${d}</div>`;
        grid.innerHTML += dayHtml;
    }
}
function selectCalendarDate(dateStr, isActive) { const infoBox = document.getElementById('cal-selected-info'); if(isActive) { document.getElementById('cal-selected-date').innerText = "Allenamento del " + formatDate(dateStr); document.getElementById('cal-view-workout-btn').onclick = () => { openMuscleMap(dateStr); }; infoBox.classList.remove('hidden'); infoBox.classList.add('flex'); } else { infoBox.classList.add('hidden'); infoBox.classList.remove('flex'); } }

function openMuscleMap(specificDate = null) { currentMapBaseDate = specificDate || document.getElementById('prog-date').value; if(!currentMapBaseDate) return; setMapRange(1); document.getElementById('muscle-modal').classList.remove('hidden'); document.getElementById('muscle-modal').classList.add('flex'); }
function closeMuscleMap() { document.getElementById('muscle-modal').classList.add('hidden'); document.getElementById('muscle-modal').classList.remove('flex'); }
function setMapRange(range) {
    currentMapRange = range;
    ['btn-range-1', 'btn-range-3', 'btn-range-7'].forEach(id => { const btn = document.getElementById(id); btn.classList.remove('bg-blue-600', 'text-white', 'shadow'); btn.classList.add('bg-slate-800', 'text-slate-300'); });
    const activeBtn = document.getElementById(`btn-range-${range}`); activeBtn.classList.remove('bg-slate-800', 'text-slate-300'); activeBtn.classList.add('bg-blue-600', 'text-white', 'shadow');
    renderMapWithRange();
}
function renderMapWithRange() {
    let s = {}; let exerciseListHtml = ''; let targetDates = [];
    let parts = currentMapBaseDate.split('-'); let baseD = new Date(parts[0], parts[1]-1, parts[2]);
    for(let i=0; i<currentMapRange; i++) { let d = new Date(baseD); d.setDate(d.getDate() - i); let y = d.getFullYear(); let m = String(d.getMonth() + 1).padStart(2, '0'); let day = String(d.getDate()).padStart(2, '0'); targetDates.push(`${y}-${m}-${day}`); }
    
    if(currentMapRange === 1) { document.getElementById('map-date-display').innerText = formatDate(targetDates[0]); }
    else { document.getElementById('map-date-display').innerText = `${formatDate(targetDates[targetDates.length-1])} ➔ ${formatDate(targetDates[0])}`; }

    let exercisesByDate = {}; targetDates.forEach(td => exercisesByDate[td] = []); let processedKeys = new Set();
    for(const [dk, d] of Object.entries(currentRoutine.days)){
        d.exercises.forEach(ex => {
            const hk = getHistKey(ex.name); if (processedKeys.has(hk)) return; processedKeys.add(hk);
            const l = JSON.parse(localStorage.getItem(hk)) || [];
            // Usa sempre i muscoli aggiornati da exerciseDB se l'esercizio esiste in libreria
            const dbMatch = exerciseDB.find(e => e.name.toLowerCase() === ex.name.toLowerCase());
            const activeMuscles = (dbMatch && dbMatch.muscles) ? dbMatch.muscles : ex.muscles;

            targetDates.forEach(td => {
                const todaysLogs = l.filter(h => h.date === td);
                if(todaysLogs.length > 0) {
                    exercisesByDate[td].push({ name: ex.name, logs: todaysLogs });
                    todaysLogs.forEach(log => {
                        const st = parseInt(log.sets) || 0;
                        if(st > 0 && activeMuscles){
                            for(const [m, sc] of Object.entries(activeMuscles)) s[m] = (s[m] || 0) + (sc * st);
                        }
                    });
                }
            });
        });
    }
    
    exerciseDB.forEach(dbEx => {
        const hk = getHistKey(dbEx.name); if (processedKeys.has(hk)) return; const l = JSON.parse(localStorage.getItem(hk)) || [];
        targetDates.forEach(td => {
            const todaysLogs = l.filter(h => h.date === td && h.isSubstitute);
            if(todaysLogs.length > 0) {
                exercisesByDate[td].push({ name: dbEx.name + " (Sostitutivo)", logs: todaysLogs });
                todaysLogs.forEach(log => { const st = parseInt(log.sets) || 0; if(st > 0 && dbEx.muscles){ for(const [m,sc] of Object.entries(dbEx.muscles)) s[m] = (s[m]||0) + (sc*st); } });
            }
        });
    });

    targetDates.forEach(td => {
        if(exercisesByDate[td].length > 0) {
            exerciseListHtml += `<div class="mt-3 mb-2 font-bold text-blue-400 text-xs border-b border-slate-700 pb-1 uppercase tracking-wider">${formatDate(td)}</div>`;
            exercisesByDate[td].forEach(item => {
                exerciseListHtml += `<div class="bg-slate-900 p-3 rounded-xl border border-slate-700/50 mb-2"><div class="font-bold text-slate-200 text-xs border-b border-slate-800 pb-1 mb-2">${item.name}</div>`;
                item.logs.forEach(log => { exerciseListHtml += `<div class="flex justify-between items-center text-xs text-slate-400 mt-1"><span class="bg-slate-800 px-2 py-0.5 rounded text-blue-300 font-bold">${log.sets} x ${log.reps}</span><span class="font-extrabold text-emerald-400">${log.weight} Kg</span></div>`; });
                exerciseListHtml += `</div>`;
            });
        }
    });

    const listContainer = document.getElementById('map-exercise-list');
    if(exerciseListHtml === '') { listContainer.innerHTML = '<div class="text-xs text-slate-500 text-center italic py-2">Nessun allenamento in questo periodo.</div>'; }
    else { listContainer.innerHTML = exerciseListHtml; }

    const updateMaskGlow = (id, score) => {
        const layer = document.getElementById(id); if(!layer) return; const img = layer.querySelector('img');
        if(!score || score <= 0) {
            layer.style.opacity = '0';
            layer.style.visibility = 'hidden';
            img.style.filter = 'none';
        } else {
            let color = score <= 4 ? '#facc15' : (score <= 9 ? '#f97316' : '#ef4444');
            layer.style.visibility = 'visible';
            img.style.filter = `drop-shadow(1000px 0 0 ${color})`;
            layer.style.opacity = score <= 4 ? '0.6' : (score <= 9 ? '0.8' : '0.95');
        }
    };

    updateMaskGlow('layer-chest-upper', s['front-chest-upper'] || 0);
    updateMaskGlow('layer-chest-lower', s['front-chest-lower'] || 0);
    updateMaskGlow('layer-shoulders-front', s['front-shoulder'] || 0);
    updateMaskGlow('layer-biceps', s['front-biceps'] || 0);
    updateMaskGlow('layer-forearms', s['front-forearm'] || 0);
    updateMaskGlow('layer-abs-upper', s['front-abs'] || 0);
    updateMaskGlow('layer-abs-lower', s['front-abs-lower'] || 0);
    updateMaskGlow('layer-obliques', s['front-obliques'] || 0);
    updateMaskGlow('layer-quads', s['front-quads'] || 0);
    updateMaskGlow('layer-adductors', s['front-adductors'] || 0);
    updateMaskGlow('layer-traps', s['back-traps'] || 0);
    updateMaskGlow('layer-lats', s['back-lats'] || 0);
    updateMaskGlow('layer-lowerback', s['back-lowerback'] || 0);
    updateMaskGlow('layer-shoulders-rear', s['back-shoulder'] || 0);
    updateMaskGlow('layer-triceps', s['back-triceps'] || 0);
    updateMaskGlow('layer-glutes', s['back-glutes'] || 0);
    updateMaskGlow('layer-hamstrings', s['back-hamstrings'] || 0);
    updateMaskGlow('layer-calves', Math.max(s['front-calves'] || 0, s['back-calves'] || 0));
}

// ==================== PRE-WORKOUT ADVISOR ====================
function openPreWorkoutAdvisorModal() {
    document.getElementById('preworkout-advisor-modal').classList.remove('hidden');
    document.getElementById('preworkout-advisor-modal').classList.add('flex');
    renderAdvisorContent();
}

function closePreWorkoutAdvisorModal() {
    document.getElementById('preworkout-advisor-modal').classList.add('hidden');
    document.getElementById('preworkout-advisor-modal').classList.remove('flex');
}

function renderAdvisorContent() {
    const content = document.getElementById('preworkout-advisor-content');
    
    const logs = JSON.parse(localStorage.getItem(getDietDateKey())) || [];
    const water = parseInt(localStorage.getItem(getWaterDateKey())) || 0;
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const mealsGrouped = {};
    logs.forEach(log => {
        if (!mealsGrouped[log.mealType]) mealsGrouped[log.mealType] = { items: [], time: log.time };
        if (log.time && log.time > mealsGrouped[log.mealType].time) mealsGrouped[log.mealType].time = log.time;
        mealsGrouped[log.mealType].items.push(log);
    });

    let mostRecentMeal = null;
    let minTimeDiff = Infinity;
    let mealStats = { kcal: 0, p: 0, c: 0, f: 0, isCheat: false, name: '', timeStr: '', items: [] };

    for (const [mealType, data] of Object.entries(mealsGrouped)) {
        if (!data.time) continue;
        const [h, m] = data.time.split(':').map(Number);
        const mealMinutes = h * 60 + m;
        let diff = currentMinutes - mealMinutes;
        
        if (diff < 0) diff = 0; 
        
        if (diff >= 0 && diff < minTimeDiff) {
            minTimeDiff = diff;
            mostRecentMeal = mealType;
            
            mealStats = data.items.reduce((acc, item) => {
                acc.kcal += item.kcal;
                acc.p += item.p;
                acc.c += item.c;
                acc.f += item.f;
                if (item.isCheat) acc.isCheat = true;
                return acc;
            }, { kcal: 0, p: 0, c: 0, f: 0, isCheat: false });
            mealStats.name = mealType;
            mealStats.timeStr = data.time;
            mealStats.items = data.items; 
        }
    }

    let title, message, adviceHtml, colorClass, bgClass, icon;

    if (!mostRecentMeal || minTimeDiff > 360) {
        title = 'Riserva in Ebollizione 🔴';
        colorClass = 'text-rose-500';
        bgClass = 'bg-rose-900/30 border-rose-500/50';
        icon = 'fa-battery-empty';
        message = !mostRecentMeal ? "Non hai ancora mangiato nulla oggi." : `Non mangi da oltre ${Math.floor(minTimeDiff/60)} ore.`;
        adviceHtml = `<b class="text-rose-400">Consiglio:</b> Le tue scorte di glicogeno potrebbero essere basse. Assumi una fonte di carbo rapida e naturale (es. 1 banana matura, 2 datteri o 1 cucchiaio di miele) prima di spingere.`;
    } else {
        const isHeavy = mealStats.isCheat || mealStats.f > 25 || mealStats.kcal > 800;
        
        if (minTimeDiff < 45 || (minTimeDiff < 90 && isHeavy)) {
            title = 'Digestione in Corso 🔴';
            colorClass = 'text-rose-500';
            bgClass = 'bg-rose-900/30 border-rose-500/50';
            icon = 'fa-fire';
            message = `Hai mangiato <b>${mealStats.name}</b> da soli ${minTimeDiff} minuti. ${isHeavy ? 'Il pasto era anche bello sostanzioso.' : ''}`;
            adviceHtml = `<b class="text-rose-400">Consiglio:</b> Il sangue è nello stomaco. Aspetta almeno altri ${isHeavy ? '45-60' : '20-30'} minuti, fai molta mobilità o rischi nausea.`;
        } 
        else if (minTimeDiff >= 90 && minTimeDiff <= 180 && mealStats.c > 40 && !isHeavy && water >= 4) {
            title = 'Energia Ottimale 🌟';
            colorClass = 'text-emerald-400';
            bgClass = 'bg-emerald-900/40 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]';
            icon = 'fa-battery-full';
            message = `Condizioni perfette! <b>${mealStats.name}</b> digerito (da ${Math.floor(minTimeDiff/60)}h e ${minTimeDiff%60}m) con ottimi carbo e idratazione.`;
            adviceHtml = `<b class="text-emerald-400">Consiglio:</b> Sei al tuo picco glicemico e digestivo. Spacca tutto!`;
        }
        else if (minTimeDiff >= 60 && minTimeDiff <= 240) {
            title = 'Pronto all\'Azione 🟢';
            colorClass = 'text-green-500';
            bgClass = 'bg-green-900/30 border-green-500/50';
            icon = 'fa-check-circle';
            message = `Hai digerito <b>${mealStats.name}</b> (${Math.floor(minTimeDiff/60)}h e ${minTimeDiff%60}m fa).`;
            adviceHtml = `<b class="text-green-400">Consiglio:</b> Buona energia. Se l'allenamento sarà molto lungo e intenso e sudi molto, puoi sorseggiare acqua con limone e un pizzico di sale.`;
        }
        else {
            title = 'Energia in Calo 🟡';
            colorClass = 'text-amber-400';
            bgClass = 'bg-amber-900/30 border-amber-500/50';
            icon = 'fa-battery-half';
            message = `L'ultimo pasto (<b>${mealStats.name}</b>) risale a ${Math.floor(minTimeDiff/60)} ore fa.`;
            adviceHtml = `<b class="text-amber-400">Consiglio:</b> Stai entrando in fase di deplezione. Valuta uno snack leggero e naturale (es. una mela o 1 galletta di riso) se ti senti stanco.`;
        }
    }
    
    let hydrationAdvice = '';
    if (water === 0) {
        hydrationAdvice = `<div class="mt-2 text-cyan-300 pt-2 border-t border-slate-700/50"><i class="fas fa-exclamation-triangle text-cyan-400 mr-1"></i><b>Allarme Idratazione:</b> Non hai registrato nemmeno un bicchiere d'acqua oggi! Bevi almeno 500ml prima di iniziare.</div>`;
    } else if (water < 4) {
        hydrationAdvice = `<div class="mt-2 text-cyan-200 pt-2 border-t border-slate-700/50"><i class="fas fa-tint text-cyan-400 mr-1"></i><b>Idratazione Bassa:</b> Hai bevuto poco (${water} bicchier${water === 1 ? 'e' : 'i'}). Cerca di bere qualche sorso durante il riscaldamento.</div>`;
    } else {
        hydrationAdvice = `<div class="mt-2 text-emerald-300 pt-2 border-t border-slate-700/50"><i class="fas fa-tint text-cyan-400 mr-1"></i><b>Idratazione Ottima:</b> Hai bevuto ${water} bicchieri d'acqua, i tuoi muscoli sono ben idratati!</div>`;
    }

    let itemsHtml = '';
    if (mealStats.items && mealStats.items.length > 0) {
        itemsHtml = `<div class="mt-3 pt-3 border-t border-slate-700/50 space-y-1.5 w-full text-left">
            <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cosa hai mangiato:</div>`;
        mealStats.items.forEach(item => {
            itemsHtml += `<div class="flex justify-between items-center text-[10px] text-slate-300">
                <span class="truncate pr-2">• ${item.name}</span>
                <span class="text-slate-500 shrink-0">${item.kcal} kcal</span>
            </div>`;
        });
        itemsHtml += `</div>`;
    }

    content.innerHTML = `
        <div class="rounded-xl border ${bgClass} p-4 mb-4 text-center transition-all duration-300">
            <i class="fas ${icon} ${colorClass} text-4xl mb-2"></i>
            <h3 class="font-extrabold text-white text-lg">${title}</h3>
            <p class="text-xs text-slate-300 mt-1">${message}</p>
        </div>
        
        ${mostRecentMeal ? `
        <div class="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/50 mb-4 flex flex-col shadow-inner">
            <div class="flex justify-between items-start mb-1">
                <div>
                    <div class="text-xs font-bold text-slate-200">Ultimo Pasto: <span class="text-blue-400">${mealStats.name}</span></div>
                    <div class="text-[10px] text-slate-400 mt-0.5">Ore ${mealStats.timeStr} • ${mealStats.kcal} kcal totali</div>
                </div>
                <div class="flex gap-1 text-[9px] font-bold">
                    <span class="bg-slate-950 text-blue-400 px-1.5 py-0.5 rounded border border-slate-700/60">P: ${mealStats.p}g</span>
                    <span class="bg-slate-950 text-amber-400 px-1.5 py-0.5 rounded border border-slate-700/60">C: ${mealStats.c}g</span>
                    <span class="bg-slate-950 text-rose-400 px-1.5 py-0.5 rounded border border-slate-700/60">G: ${mealStats.f}g</span>
                </div>
            </div>
            ${itemsHtml}
        </div>` : ''}

        <div class="bg-slate-950/80 p-3.5 rounded-xl border border-slate-700/60 text-[11px] text-slate-300 leading-relaxed">
            ${adviceHtml}
            ${hydrationAdvice}
        </div>
    `;
}