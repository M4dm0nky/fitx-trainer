// Verlauf einer einzelnen Übungsvariante.
//
// Bewusst je Variante und nicht je Bewegungsmuster: Ein Diagramm, das
// Kurzhantel- und Maschinengewichte in eine Linie zeichnet, zeigt Sprünge, die
// nichts mit deiner Kraft zu tun haben, sondern nur mit dem Gerätewechsel.

import { s } from '../store.js';
import { uebungFinden, KATEGORIEN, MUSTER } from '../exercises.js';
import { verlauf, verlaufsReihe, saetzeFormatieren, datumKurz, zahlKurz } from '../history.js';
import { esc } from '../dom.js';

export function rendern(uebungId) {
  const zustand = s();
  const uebung = uebungFinden(uebungId, zustand.eigeneUebungen);
  if (!uebung) return { titel: 'Unbekannt', html: '<p class="leer">Diese Übung gibt es nicht.</p>' };

  const zeilen = verlauf(zustand, uebungId);
  const reihe = verlaufsReihe(zustand, uebungId);

  return {
    titel: `${esc(uebung.name)}<span class="unterzeile">${esc(MUSTER[uebung.muster] || '')} · ${esc(KATEGORIEN[uebung.kategorie].kurz)}</span>`,
    kopfAktion: '<a class="textlink" href="#/">Start</a>',
    html: zeilen.length
      ? `
        <section class="karte">
          <div class="muster-label">
            ${reihe.nurWdh ? 'Beste Wiederholungszahl je Einheit' : 'Bestes Satzgewicht je Einheit'}
          </div>
          ${diagramm(reihe.punkte, reihe.nurWdh)}
          <p class="info-text" style="margin:0">
            ${zeilen.length} Einheiten aufgezeichnet.
            ${trendText(reihe.punkte, reihe.nurWdh)}
          </p>
        </section>

        <div class="abschnitt-titel">Alle Einheiten</div>
        <section class="karte">
          ${zeilen
            .map(
              (z) => `
              <div class="verlauf-zeile">
                <span class="verlauf-datum">${esc(datumKurz(z.datum))}</span>
                <span class="verlauf-werte">${esc(saetzeFormatieren(z.saetze, uebung))}</span>
              </div>`
            )
            .join('')}
        </section>`
      : `<p class="leer">
           Diese Variante hast du noch nie protokolliert.<br />
           Nach der ersten Einheit steht hier der Verlauf.
         </p>`,
  };
}

/** Schlichtes Liniendiagramm als Inline-SVG — kein externes Diagramm-Paket nötig. */
function diagramm(punkte, nurWdh) {
  if (punkte.length < 2) {
    return '<p class="info-text">Ab der zweiten Einheit wird hier eine Linie gezeichnet.</p>';
  }
  const breite = 320;
  const hoehe = 120;
  const rand = { oben: 12, unten: 22, links: 34, rechts: 8 };
  const werte = punkte.map((p) => p.wert);
  const min = Math.min(...werte);
  const max = Math.max(...werte);
  const spanne = max - min || 1;

  const x = (i) =>
    rand.links + (i / (punkte.length - 1)) * (breite - rand.links - rand.rechts);
  const y = (v) =>
    hoehe - rand.unten - ((v - min) / spanne) * (hoehe - rand.oben - rand.unten);

  const linie = punkte.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.wert).toFixed(1)}`).join(' ');
  const flaeche = `${linie} L${x(punkte.length - 1).toFixed(1)},${hoehe - rand.unten} L${x(0).toFixed(1)},${hoehe - rand.unten} Z`;
  const einheit = nurWdh ? '' : ' kg';

  return `
    <svg class="diagramm" viewBox="0 0 ${breite} ${hoehe}" preserveAspectRatio="none"
         role="img" aria-label="Verlauf">
      <line x1="${rand.links}" y1="${hoehe - rand.unten}" x2="${breite - rand.rechts}"
            y2="${hoehe - rand.unten}" stroke="currentColor" opacity=".18" />
      <path d="${flaeche}" fill="var(--akzent)" opacity=".12" />
      <path d="${linie}" fill="none" stroke="var(--akzent)" stroke-width="2"
            stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
      ${punkte
        .map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.wert).toFixed(1)}" r="2.6" fill="var(--akzent)" />`)
        .join('')}
      <text x="2" y="${rand.oben + 4}" font-size="10" fill="currentColor" opacity=".6">${esc(zahlKurz(max))}${einheit}</text>
      <text x="2" y="${hoehe - rand.unten}" font-size="10" fill="currentColor" opacity=".6">${esc(zahlKurz(min))}${einheit}</text>
    </svg>`;
}

function trendText(punkte, nurWdh) {
  if (punkte.length < 2) return '';
  const erst = punkte[0].wert;
  const letzt = punkte[punkte.length - 1].wert;
  const diff = letzt - erst;
  const wort = nurWdh ? 'Wiederholungen' : 'kg';
  if (Math.abs(diff) < 0.01) return `Gleicher Wert wie beim ersten Mal (${zahlKurz(erst)} ${wort}).`;
  const richtung = diff > 0 ? 'plus' : 'minus';
  return `Seit der ersten Einheit ${richtung} ${zahlKurz(Math.abs(diff))} ${wort}.`;
}
