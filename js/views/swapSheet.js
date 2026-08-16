// Ausweich-Dialog: "Gerät belegt?"
//
// Zeigt alle Übungen mit demselben Bewegungsmuster, gruppiert nach Kategorie —
// und zu jeder Variante direkt deine eigene Historie. Der Sinn: Du entscheidest
// schon hier, wohin du gehst, und weißt dabei bereits, was du auflegen musst.
//
// Zoom-Hinweis: Dieser Dialog ist genau die Art Komponente, die üblicherweise
// mit touchmove + preventDefault gebaut wird, um "Scroll-Durchgriff" zu
// verhindern. Das würde den Pinch-Zoom der Seite mit abschalten. Hier scrollt
// deshalb nur der Container per CSS (overflow-y), ohne jeden Touch-Handler.

import { s } from '../store.js';
import { alternativenFinden, KATEGORIEN, MUSTER, uebungFinden } from '../exercises.js';
import { letzteLeistung, saetzeFormatieren, datumKurz } from '../history.js';
import { esc, beiKlick } from '../dom.js';

/**
 * @param {object} optionen
 * @param {string} optionen.muster        Bewegungsmuster des Slots
 * @param {string} optionen.aktuelleId    gerade gewählte Übung
 * @param {(id:string, alsStandard:boolean)=>void} optionen.beiWahl
 */
export function ausweichDialogOeffnen({ muster, aktuelleId, beiWahl }) {
  const zustand = s();
  const gruppen = alternativenFinden(muster, zustand.eigeneUebungen);
  let gewaehlt = aktuelleId;

  const hinter = document.createElement('div');
  hinter.className = 'blatt-hinter';
  hinter.innerHTML = `
    <div class="blatt" role="dialog" aria-label="Gerät wechseln">
      <div class="blatt-griff"></div>
      <h2>${esc(MUSTER[muster] || 'Übung wechseln')}</h2>
      <p class="blatt-erklaerung">
        Gewichte sind zwischen den Kategorien nicht vergleichbar — jede Variante hat
        deshalb ihre eigene Historie.
      </p>
      ${gruppen.map(gruppeRendern).join('')}
      <div class="blatt-knoepfe">
        <button type="button" class="knopf knopf-haupt" data-wahl="heute">
          Nur für heute wechseln
        </button>
        <button type="button" class="knopf" data-wahl="standard">
          Als Standard in den Plan übernehmen
        </button>
        <button type="button" class="knopf knopf-still" data-wahl="abbruch">Abbrechen</button>
      </div>
    </div>`;

  function gruppeRendern(gruppe) {
    return `
      <div class="gruppe-titel">${esc(KATEGORIEN[gruppe.kategorie].lang)}</div>
      ${gruppe.uebungen.map(zeileRendern).join('')}`;
  }

  function zeileRendern(uebung) {
    const letzte = letzteLeistung(zustand, uebung.id);
    const historie = letzte
      ? `zuletzt ${esc(saetzeFormatieren(letzte.saetze, uebung))} &nbsp;(${esc(datumKurz(letzte.datum))})`
      : '<span class="wahl-historie-leer">noch nie gemacht</span>';
    const aktiv = uebung.id === aktuelleId;
    return `
      <button type="button" class="wahl ${aktiv ? 'wahl-aktiv' : ''}" data-uebung="${esc(uebung.id)}">
        <span class="wahl-text">
          <span class="wahl-name">${esc(uebung.name)}</span>
          <span class="wahl-historie">${historie}</span>
        </span>
        <span class="wahl-haken" aria-hidden="true">${aktiv ? '✓' : ''}</span>
      </button>`;
  }

  function schliessen() {
    hinter.remove();
  }

  // Klick auf den Hintergrund schließt — aber nur, wenn wirklich daneben getippt wurde.
  hinter.addEventListener('click', (e) => {
    if (e.target === hinter) schliessen();
  });

  beiKlick(hinter, '[data-uebung]', (el) => {
    gewaehlt = el.dataset.uebung;
    hinter.querySelectorAll('.wahl').forEach((w) => {
      const aktiv = w.dataset.uebung === gewaehlt;
      w.classList.toggle('wahl-aktiv', aktiv);
      w.querySelector('.wahl-haken').textContent = aktiv ? '✓' : '';
    });
  });

  beiKlick(hinter, '[data-wahl]', (el) => {
    const aktion = el.dataset.wahl;
    if (aktion === 'abbruch') return schliessen();
    schliessen();
    beiWahl(gewaehlt, aktion === 'standard');
  });

  document.body.appendChild(hinter);
}

/** Kurzform der Kategorie für die Marke auf der Übungskarte. */
export function kategorieKurz(uebungId, eigeneUebungen) {
  const u = uebungFinden(uebungId, eigeneUebungen);
  return u ? KATEGORIEN[u.kategorie].kurz : '';
}
