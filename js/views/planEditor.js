// Plan bearbeiten: Slots umbauen, Vorgaben ändern, Standardgerät festlegen.
//
// Der Editor arbeitet auf Slots, nicht auf Geräten. Du legst also fest, WELCHE
// AUFGABE an dieser Stelle steht (z. B. "Bizeps-Isolation") und welches Gerät
// die Voreinstellung ist. Im Training kannst du davon jederzeit abweichen,
// ohne den Plan anzufassen.

import { s, speichern, neueId } from '../store.js';
import { planFinden } from '../plans.js';
import { uebungFinden, MUSTER, KATEGORIEN, alternativenFinden } from '../exercises.js';
import { esc, beiKlick, gehe } from '../dom.js';
import { ausweichDialogOeffnen } from './swapSheet.js';

export function rendern(planId) {
  const zustand = s();
  const plan = planFinden(zustand, planId);
  if (!plan) return { titel: 'Unbekannt', html: '<p class="leer">Diesen Plan gibt es nicht.</p>' };

  const saetzeGesamt = plan.slots.reduce((n, sl) => n + sl.saetze, 0);
  const dauer = Math.round(
    plan.slots.reduce((sek, sl) => sek + sl.saetze * (sl.pauseSek + 45), 0) / 60
  );

  return {
    titel: `${esc(plan.name)} bearbeiten<span class="unterzeile">${plan.slots.length} Übungen · ${saetzeGesamt} Sätze · ca. ${dauer} Min</span>`,
    kopfAktion: '<a class="textlink" href="#/">Fertig</a>',
    html: `
      ${
        saetzeGesamt > 24
          ? `<div class="merker">
               ${saetzeGesamt} Sätze pro Einheit sind bei deinem Rhythmus (alle zwei Tage)
               viel — das landet bei über 20 Sätzen pro Muskelgruppe und Woche. Wenn die
               Kraft stagniert, ist zu viel Volumen die häufigste Ursache.
             </div>`
          : ''
      }

      ${plan.slots.map((slot, i) => slotRendern(zustand, slot, i, plan.slots.length)).join('')}

      <button class="knopf knopf-breit" id="neuer-slot" style="margin-top:6px">
        + Übung hinzufügen
      </button>

      <div class="abschnitt-titel">Plan</div>
      <section class="karte">
        <div class="formzeile">
          <label for="planname">Name</label>
          <input type="text" id="planname" value="${esc(plan.name)}" />
        </div>
        <div class="formzeile">
          <button class="textlink knopf-gefahr" id="zuruecksetzen" style="border:none;background:none">
            Auf Standardplan zurücksetzen
          </button>
        </div>
      </section>
    `,
    nachRender(wurzel, neuZeichnen) {
      verdrahten(wurzel, zustand, plan, neuZeichnen);
    },
  };
}

function slotRendern(zustand, slot, index, anzahl) {
  const uebung = uebungFinden(slot.uebungId, zustand.eigeneUebungen);
  const varianten = alternativenFinden(slot.muster, zustand.eigeneUebungen).reduce(
    (n, g) => n + g.uebungen.length,
    0
  );

  return `
    <section class="karte" data-slot="${esc(slot.id)}">
      <div class="karte-kopf">
        <div class="karte-kopf-text">
          <div class="muster-label">${esc(MUSTER[slot.muster] || '')}</div>
          <div class="uebung-name">${esc(uebung ? uebung.name : 'Übung fehlt')}</div>
          <span class="kategorie-marke">${esc(uebung ? KATEGORIEN[uebung.kategorie].kurz : '')}</span>
          <span class="kategorie-marke">${varianten} Ausweichoptionen</span>
        </div>
        <button type="button" class="knopf-tausch" data-standard="${esc(slot.id)}">
          Gerät ändern
        </button>
      </div>

      <div class="formzeile">
        <label for="s-${esc(slot.id)}">Sätze</label>
        <input type="text" inputmode="numeric" id="s-${esc(slot.id)}"
               data-wert="saetze" value="${slot.saetze}" />
      </div>
      <div class="formzeile">
        <label>Wiederholungen von–bis</label>
        <input type="text" inputmode="numeric" data-wert="wdhVon" value="${slot.wdhVon}"
               aria-label="Wiederholungen von" style="width:64px" />
        <input type="text" inputmode="numeric" data-wert="wdhBis" value="${slot.wdhBis}"
               aria-label="Wiederholungen bis" style="width:64px" />
      </div>
      <div class="formzeile">
        <label>Pause (Sekunden)</label>
        <input type="text" inputmode="numeric" data-wert="pauseSek" value="${slot.pauseSek}" />
      </div>
      <div class="formzeile">
        <label>RIR-Ziel</label>
        <input type="text" data-wert="rirZiel" value="${esc(slot.rirZiel || '')}"
               placeholder="z. B. 2 oder 2 / 2 / 0–1" style="width:auto;flex:1;text-align:left" />
      </div>

      <div class="karte-fuss">
        <button class="textlink" data-hoch="${esc(slot.id)}" ${index === 0 ? 'disabled style="opacity:.35"' : ''}>
          ↑ nach oben
        </button>
        <button class="textlink" data-runter="${esc(slot.id)}" ${index === anzahl - 1 ? 'disabled style="opacity:.35"' : ''}>
          ↓ nach unten
        </button>
        <button class="textlink knopf-gefahr" data-loeschen="${esc(slot.id)}"
                style="margin-left:auto;border:none;background:none">
          Entfernen
        </button>
      </div>
    </section>`;
}

function verdrahten(wurzel, zustand, plan, neuZeichnen) {
  wurzel.addEventListener('input', (e) => {
    const feld = e.target.closest('[data-wert]');
    if (feld) {
      const slot = plan.slots.find((sl) => sl.id === feld.closest('[data-slot]').dataset.slot);
      const schluessel = feld.dataset.wert;
      slot[schluessel] =
        schluessel === 'rirZiel' ? feld.value : Math.max(1, parseInt(feld.value, 10) || 1);
      speichern();
      return;
    }
    if (e.target.id === 'planname') {
      plan.name = e.target.value;
      speichern();
    }
  });

  beiKlick(wurzel, '[data-standard]', (knopf) => {
    const slot = plan.slots.find((sl) => sl.id === knopf.dataset.standard);
    ausweichDialogOeffnen({
      muster: slot.muster,
      aktuelleId: slot.uebungId,
      beiWahl(neueId) {
        slot.uebungId = neueId;
        speichern();
        neuZeichnen();
      },
    });
  });

  beiKlick(wurzel, '[data-hoch]', (knopf) => verschieben(plan, knopf.dataset.hoch, -1, neuZeichnen));
  beiKlick(wurzel, '[data-runter]', (knopf) => verschieben(plan, knopf.dataset.runter, 1, neuZeichnen));

  beiKlick(wurzel, '[data-loeschen]', (knopf) => {
    if (plan.slots.length <= 1) return alert('Ein Plan braucht mindestens eine Übung.');
    if (!confirm('Diese Übung aus dem Plan entfernen?')) return;
    plan.slots = plan.slots.filter((sl) => sl.id !== knopf.dataset.loeschen);
    speichern();
    neuZeichnen();
  });

  wurzel.querySelector('#neuer-slot')?.addEventListener('click', () => {
    musterWaehlen((muster) => {
      const erste = alternativenFinden(muster, zustand.eigeneUebungen)[0]?.uebungen[0];
      if (!erste) return;
      plan.slots.push({
        id: neueId('slot'),
        muster,
        uebungId: erste.id,
        saetze: 3,
        wdhVon: 8,
        wdhBis: 12,
        pauseSek: 90,
        rirZiel: '2',
      });
      speichern();
      neuZeichnen();
    });
  });

  wurzel.querySelector('#zuruecksetzen')?.addEventListener('click', async () => {
    if (!confirm(`"${plan.name}" auf den Standardplan zurücksetzen? Deine Trainingshistorie bleibt erhalten.`))
      return;
    const { STANDARD_PLAENE } = await import('../plans.js');
    const standard = STANDARD_PLAENE().find((p) => p.id === plan.id);
    if (!standard) return;
    Object.assign(plan, standard);
    speichern();
    neuZeichnen();
  });
}

function verschieben(plan, slotId, richtung, neuZeichnen) {
  const i = plan.slots.findIndex((sl) => sl.id === slotId);
  const j = i + richtung;
  if (i < 0 || j < 0 || j >= plan.slots.length) return;
  [plan.slots[i], plan.slots[j]] = [plan.slots[j], plan.slots[i]];
  speichern();
  neuZeichnen();
}

/** Auswahl des Bewegungsmusters für eine neue Übung. */
function musterWaehlen(beiWahl) {
  const hinter = document.createElement('div');
  hinter.className = 'blatt-hinter';
  hinter.innerHTML = `
    <div class="blatt" role="dialog" aria-label="Übung hinzufügen">
      <div class="blatt-griff"></div>
      <h2>Welche Aufgabe?</h2>
      <p class="blatt-erklaerung">
        Du wählst das Bewegungsmuster. Das konkrete Gerät legst du danach fest — und
        kannst im Training jederzeit darauf ausweichen.
      </p>
      ${Object.entries(MUSTER)
        .map(
          ([id, name]) => `
          <button type="button" class="wahl" data-muster="${esc(id)}">
            <span class="wahl-text"><span class="wahl-name">${esc(name)}</span></span>
          </button>`
        )
        .join('')}
      <div class="blatt-knoepfe">
        <button type="button" class="knopf knopf-still" data-abbruch>Abbrechen</button>
      </div>
    </div>`;
  hinter.addEventListener('click', (e) => {
    if (e.target === hinter || e.target.closest('[data-abbruch]')) return hinter.remove();
    const wahl = e.target.closest('[data-muster]');
    if (wahl) {
      hinter.remove();
      beiWahl(wahl.dataset.muster);
    }
  });
  document.body.appendChild(hinter);
}

export { gehe };
