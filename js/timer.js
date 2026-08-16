// Pausentimer.
//
// Wichtig zur Signalgebung: iOS/Safari unterstützt die Vibration-API NICHT.
// Ein reiner navigator.vibrate()-Timer wäre auf dem iPhone also stumm. Deshalb
// ist der Ton das eigentliche Signal, und Vibration nur ein Bonus für Geräte,
// die sie können.
//
// Der AudioContext muss aus einer echten Nutzergeste heraus entstehen, sonst
// blockiert iOS ihn. Da der Timer immer durch das Abhaken eines Satzes startet,
// passt das genau.

import { s } from './store.js';

let audioCtx = null;
let laufend = null; // { endeMs, intervalId, dauerSek }
let balken = null;

/** Muss aus einer Nutzergeste aufgerufen werden, damit iOS den Ton später zulässt. */
export function audioFreischalten() {
  if (audioCtx) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return;
  }
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  try {
    audioCtx = new Ctx();
  } catch (e) {
    console.warn('Kein Audio verfügbar:', e);
  }
}

function piepen() {
  if (!audioCtx) return;
  if (!s().einstellungen.timerTonAn) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  // Drei kurze Töne — hörbar, aber nicht peinlich laut im Studio.
  [0, 0.22, 0.44].forEach((versatz, i) => {
    const osz = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osz.type = 'sine';
    osz.frequency.value = i === 2 ? 1100 : 880;
    const start = audioCtx.currentTime + versatz;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.28, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
    osz.connect(gain).connect(audioCtx.destination);
    osz.start(start);
    osz.stop(start + 0.2);
  });
}

function balkenErzeugen() {
  if (balken) return balken;
  balken = document.createElement('div');
  balken.className = 'timerbalken';
  balken.hidden = true;
  balken.innerHTML = `
    <div class="timerbalken-fortschritt"></div>
    <div class="timerbalken-inhalt">
      <span class="timerbalken-zeit">0:00</span>
      <div class="timerbalken-knoepfe">
        <button type="button" class="knopf knopf-klein" data-timer="plus">+30 s</button>
        <button type="button" class="knopf knopf-klein knopf-still" data-timer="stop">Fertig</button>
      </div>
    </div>`;
  document.body.appendChild(balken);
  // click statt touchstart: Ein touchstart-Handler mit preventDefault würde den
  // Pinch-Zoom auf der ganzen Seite mit abschießen.
  balken.addEventListener('click', (e) => {
    const aktion = e.target.closest('[data-timer]')?.dataset.timer;
    if (aktion === 'stop') stoppen();
    if (aktion === 'plus') verlaengern(30);
  });
  return balken;
}

/** Startet (oder ersetzt) den Pausentimer. */
export function starten(sekunden) {
  audioFreischalten();
  stoppen(true);
  const el = balkenErzeugen();
  laufend = { endeMs: Date.now() + sekunden * 1000, dauerSek: sekunden, intervalId: null };
  el.hidden = false;
  document.body.classList.add('timer-aktiv');
  aktualisieren();
  laufend.intervalId = setInterval(aktualisieren, 200);
}

function verlaengern(sekunden) {
  if (!laufend) return;
  laufend.endeMs += sekunden * 1000;
  laufend.dauerSek += sekunden;
  aktualisieren();
}

export function stoppen(still = false) {
  if (laufend?.intervalId) clearInterval(laufend.intervalId);
  laufend = null;
  if (balken) balken.hidden = true;
  document.body.classList.remove('timer-aktiv');
  if (!still && balken) balken.classList.remove('timerbalken-fertig');
}

function aktualisieren() {
  if (!laufend || !balken) return;
  const restMs = laufend.endeMs - Date.now();
  const restSek = Math.max(0, Math.ceil(restMs / 1000));
  const min = Math.floor(restSek / 60);
  const sek = String(restSek % 60).padStart(2, '0');
  balken.querySelector('.timerbalken-zeit').textContent = `${min}:${sek}`;

  const anteil = Math.max(0, Math.min(1, restMs / (laufend.dauerSek * 1000)));
  balken.querySelector('.timerbalken-fortschritt').style.transform = `scaleX(${anteil})`;

  if (restMs <= 0) {
    clearInterval(laufend.intervalId);
    laufend.intervalId = null;
    balken.classList.add('timerbalken-fertig');
    balken.querySelector('.timerbalken-zeit').textContent = 'Pause vorbei';
    piepen();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]); // auf iOS wirkungslos
    setTimeout(() => stoppen(), 6000);
  }
}
