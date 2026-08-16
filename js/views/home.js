// Startbildschirm: Welcher Plan ist heute dran?

import { s } from '../store.js';
import { naechsterPlan, letzteEinheit, tageSeit, entlastungFaellig, planFinden } from '../plans.js';
import { uebungFinden, MUSTER } from '../exercises.js';
import { relativTage } from '../history.js';
import { esc, beiKlick, gehe } from '../dom.js';

export function rendern() {
  const zustand = s();
  const vorschlag = naechsterPlan(zustand);
  const letzte = letzteEinheit(zustand);
  const tage = letzte ? tageSeit(letzte.datum) : null;
  const letzterPlan = letzte ? planFinden(zustand, letzte.planId) : null;
  const andere = zustand.plaene.filter((p) => p.id !== vorschlag.id);

  const uebungsListe = vorschlag.slots
    .map((slot) => {
      const u = uebungFinden(slot.uebungId, zustand.eigeneUebungen);
      return `<li>${esc(u ? u.name : MUSTER[slot.muster])} <span style="opacity:.7">${slot.saetze} × ${slot.wdhVon}–${slot.wdhBis}</span></li>`;
    })
    .join('');

  const saetzeGesamt = vorschlag.slots.reduce((n, sl) => n + sl.saetze, 0);

  return {
    titel: 'FitX Trainer',
    kopfAktion: '<a class="textlink" href="#/einstellungen">Mehr</a>',
    html: `
      ${laufendesTrainingRendern(zustand)}

      ${
        entlastungFaellig(zustand)
          ? `<div class="merker">
               <strong>Entlastungswoche wäre dran.</strong> Seit über acht Wochen kein
               leichterer Block. Gleiche Übungen, gleiche Gewichte, aber jeder Satz mit
               RIR 4–5 und ein Satz weniger — danach greifen die schweren Sätze wieder
               besser.
             </div>`
          : ''
      }

      <section class="karte start-karte">
        ${
          letzte
            ? `<p class="start-meta" style="margin:0 0 12px">
                 Letztes Training: <strong>${esc(letzterPlan ? letzterPlan.name : '—')}</strong>
                 · ${esc(relativTage(tage))}
               </p>`
            : `<p class="start-meta" style="margin:0 0 12px">
                 Noch kein Training aufgezeichnet. Los geht's mit Plan A.
               </p>`
        }
        <div class="start-vorschlag">Heute dran</div>
        <div class="start-plan">${esc(vorschlag.name)}</div>
        <div class="start-meta">
          ${esc(vorschlag.untertitel || '')} · ${vorschlag.slots.length} Übungen ·
          ${saetzeGesamt} Sätze
        </div>

        <ul class="start-uebungen">${uebungsListe}</ul>

        <div style="margin-top:18px">
          <button class="knopf knopf-haupt knopf-breit" data-start="${esc(vorschlag.id)}">
            Training starten
          </button>
        </div>

        <div class="karte-fuss">
          ${andere
            .map(
              (p) =>
                `<button class="textlink" data-start="${esc(p.id)}">stattdessen ${esc(p.name)}</button>`
            )
            .join('')}
          <a class="textlink" href="#/plan/${esc(vorschlag.id)}" style="margin-left:auto">
            Plan bearbeiten
          </a>
        </div>
      </section>

      ${
        tage !== null && tage > 4
          ? `<div class="merker">
               Letzte Einheit ist ${tage} Tage her. Nach längerer Pause die ersten ein bis
               zwei Einheiten bewusst mit RIR 3–4 fahren — der Muskelkater aus einem zu
               harten Wiedereinstieg kostet dich mehr Trainingstage, als er bringt.
             </div>`
          : ''
      }

      <div class="abschnitt-titel">Verlauf</div>
      <section class="karte">
        ${
          zustand.einheiten.length
            ? letzteEinheiten(zustand)
            : `<p class="info-text" style="margin:0">
                 Nach dem ersten Training stehen hier deine letzten Einheiten — und in
                 jeder Übung siehst du dann, womit du zuletzt gearbeitet hast.
               </p>`
        }
      </section>
    `,
    nachRender(wurzel) {
      beiKlick(wurzel, '[data-start]', (el) => gehe(`#/training/${el.dataset.start}`));
    },
  };
}

/**
 * Ein angefangenes Training gehört ganz nach oben. Wenn Safari den Tab im
 * Hintergrund entsorgt hat, ist das hier der Weg zurück ins laufende Training —
 * ohne diesen Einstieg wäre die Zwischenspeicherung wertlos.
 */
function laufendesTrainingRendern(zustand) {
  const laufend = zustand.laufend;
  if (!laufend) return '';
  const plan = planFinden(zustand, laufend.planId);
  if (!plan) return '';
  const gemacht = laufend.eintraege.reduce(
    (n, e) => n + e.saetze.filter((x) => Number(x.wdh) > 0).length,
    0
  );
  return `
    <div class="merker" style="border-left-color:var(--akzent)">
      <strong>${esc(plan.name)} läuft noch</strong> — ${gemacht} Sätze protokolliert.
      <div style="margin-top:10px">
        <button class="knopf knopf-haupt knopf-breit" data-start="${esc(plan.id)}">
          Training fortsetzen
        </button>
      </div>
    </div>`;
}

function letzteEinheiten(zustand) {
  const jüngste = [...zustand.einheiten].sort((a, b) => (a.datum < b.datum ? 1 : -1)).slice(0, 8);
  return jüngste
    .map((e) => {
      const plan = planFinden(zustand, e.planId);
      const saetze = e.eintraege.reduce(
        (n, ei) => n + ei.saetze.filter((x) => Number(x.wdh) > 0).length,
        0
      );
      const d = new Date(e.datum);
      const datum = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
      return `<div class="verlauf-zeile">
        <span class="verlauf-datum">${esc(datum)}</span>
        <span class="verlauf-werte">
          ${esc(plan ? plan.name : '—')}${e.entlastung ? ' · Entlastung' : ''}
          <span style="font-weight:400;opacity:.7"> · ${saetze} Sätze</span>
        </span>
      </div>`;
    })
    .join('');
}
