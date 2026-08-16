// Training durchführen und protokollieren. Das Kernstück der App.
//
// Zwei Dinge bestimmen hier jede Gestaltungsentscheidung:
//
// 1. Bedienung mit einer Hand, verschwitzt, zwischen zwei Sätzen. Deshalb große
//    Felder, vorbefüllte Werte und ein Haken statt eines Formulars.
// 2. Die laufende Einheit wird nach JEDER Eingabe gespeichert. Safari wirft
//    Hintergrund-Tabs gnadenlos raus — ohne Zwischenspeicherung wäre nach einem
//    Anruf mitten im Training alles weg.

import { s, speichern, neueId } from '../store.js';
import { planFinden } from '../plans.js';
import { uebungFinden, MUSTER, KATEGORIEN } from '../exercises.js';
import {
  letzteLeistung,
  andereVarianteBekannt,
  saetzeFormatieren,
  satzFormatieren,
  datumKurz,
  zahlKurz,
} from '../history.js';
import { esc, beiKlick, gehe, zahl } from '../dom.js';
import { ausweichDialogOeffnen } from './swapSheet.js';
import { fotoAufnehmen, fotoAnzeigen } from './photoSheet.js';
import { fotoUrl, belegteSchluessel, fotoSchluessel, FOTO_ARTEN } from '../photos.js';
import * as timer from '../timer.js';

export function rendern(planId) {
  const zustand = s();
  const plan = planFinden(zustand, planId);
  if (!plan) return { titel: 'Unbekannt', html: '<p class="leer">Diesen Plan gibt es nicht.</p>' };

  const einheit = laufendeEinheitHolen(zustand, plan);

  return {
    titel: `${plan.name}<span class="unterzeile">Training läuft · ${gemachteSaetze(einheit)} von ${sollSaetze(plan)} Sätzen</span>`,
    kopfAktion: '<a class="textlink" href="#/">Später</a>',
    html: `
      ${plan.slots.map((slot) => slotRendern(zustand, slot, einheit)).join('')}

      <div class="abschnitt-titel">Notiz zur Einheit</div>
      <section class="karte">
        <textarea class="notiz" id="notiz" placeholder="z. B. Sitz Position 4, Schulter zwickt links, war müde …">${esc(einheit.notiz || '')}</textarea>
        <label class="schalter" style="margin-top:12px">
          <input type="checkbox" id="entlastung" ${einheit.entlastung ? 'checked' : ''} />
          <span>War eine Entlastungseinheit (bewusst leichter)</span>
        </label>
      </section>

      <button class="knopf knopf-haupt knopf-breit" id="beenden" style="margin-top:8px">
        Training beenden &amp; speichern
      </button>
      <button class="knopf knopf-still knopf-breit knopf-gefahr" id="verwerfen" style="margin-top:10px">
        Training verwerfen
      </button>
    `,
    nachRender(wurzel, neuZeichnen) {
      verdrahten(wurzel, zustand, plan, einheit, neuZeichnen);
    },
  };
}

// ── Laufende Einheit ─────────────────────────────────────────────────────────

/**
 * Holt die laufende Einheit oder legt eine neue an. Ein angefangenes Training
 * desselben Plans wird fortgesetzt, statt die bisherigen Sätze wegzuwerfen.
 */
function laufendeEinheitHolen(zustand, plan) {
  if (zustand.laufend && zustand.laufend.planId === plan.id) {
    // Slots, die seit dem Start dazugekommen sind, nachtragen.
    for (const slot of plan.slots) {
      if (!zustand.laufend.eintraege.some((e) => e.slotId === slot.id)) {
        zustand.laufend.eintraege.push(leererEintrag(slot));
      }
    }
    return zustand.laufend;
  }
  zustand.laufend = {
    id: neueId('einheit'),
    planId: plan.id,
    datum: new Date().toISOString(),
    notiz: '',
    entlastung: false,
    eintraege: plan.slots.map(leererEintrag),
  };
  speichern();
  return zustand.laufend;
}

function leererEintrag(slot) {
  return {
    slotId: slot.id,
    uebungId: slot.uebungId, // wird überschrieben, wenn du im Studio ausweichst
    saetze: Array.from({ length: slot.saetze }, () => ({ gewicht: '', wdh: '', rir: '' })),
  };
}

function eintragZu(einheit, slotId) {
  return einheit.eintraege.find((e) => e.slotId === slotId);
}

function gemachteSaetze(einheit) {
  return einheit.eintraege.reduce(
    (n, e) => n + e.saetze.filter((x) => Number(x.wdh) > 0).length,
    0
  );
}

function sollSaetze(plan) {
  return plan.slots.reduce((n, sl) => n + sl.saetze, 0);
}

// ── Eine Übungskarte ─────────────────────────────────────────────────────────

function slotRendern(zustand, slot, einheit) {
  const eintrag = eintragZu(einheit, slot.id);
  const uebung = uebungFinden(eintrag.uebungId, zustand.eigeneUebungen);
  const letzte = letzteLeistung(zustand, eintrag.uebungId);
  const gewechselt = eintrag.uebungId !== slot.uebungId;

  return `
    <section class="karte" data-slot="${esc(slot.id)}">
      <div class="karte-kopf">
        <div class="karte-kopf-text">
          <div class="muster-label">${esc(MUSTER[slot.muster] || '')}</div>
          <div class="uebung-name">${esc(uebung ? uebung.name : 'Übung fehlt')}</div>
          <span class="kategorie-marke">${esc(uebung ? KATEGORIEN[uebung.kategorie].kurz : '')}</span>
          ${gewechselt ? '<span class="kategorie-marke" style="color:var(--akzent)">heute getauscht</span>' : ''}
          <div class="vorgabe">
            ${slot.saetze} × ${slot.wdhVon}–${slot.wdhBis}
            ${slot.rirZiel ? ` · RIR ${esc(slot.rirZiel)}` : ''}
            · ${slot.pauseSek} s Pause
          </div>
        </div>
        <button type="button" class="knopf-tausch" data-tausch="${esc(slot.id)}">
          Gerät belegt?
        </button>
      </div>

      ${letztesMalRendern(zustand, slot, eintrag, uebung, letzte)}

      <div class="satz-kopfzeile" aria-hidden="true">
        <span>#</span><span>kg</span>
        <span>${uebung?.wdhEinheit === 'sek' ? 'Sek.' : 'Wdh.'}</span>
        <span>RIR</span><span></span>
      </div>

      ${eintrag.saetze
        .map((satz, i) => satzRendern(slot, eintrag, satz, i, letzte, uebung))
        .join('')}

      ${geraetFindenRendern(eintrag.uebungId, uebung)}

      <details class="hinweis">
        <summary>Ausführung</summary>
        <p>${esc(uebung ? uebung.hinweis : '')}</p>
      </details>

      <div class="karte-fuss">
        <a class="textlink" href="#/verlauf/${esc(eintrag.uebungId)}">Verlauf dieser Übung</a>
      </div>
    </section>`;
}

/**
 * Alles zum Wiederfinden an einer Stelle: Erkennungstext plus die beiden Fotos.
 * Bewusst getrennt vom Abschnitt "Ausführung" — das eine brauchst du auf dem Weg
 * zum Gerät, das andere erst, wenn du davorsitzt.
 *
 * Die Bilder werden erst beim Aufklappen geladen (siehe fotosNachladen), damit das
 * Rendern der Trainingsansicht nicht auf sieben IndexedDB-Abfragen wartet.
 */
function geraetFindenRendern(uebungId, uebung) {
  if (!uebung) return '';
  return `
    <details class="hinweis geraet-finden" data-fotos-fuer="${esc(uebungId)}">
      <summary>Gerät finden</summary>
      ${uebung.erkennung ? `<p>${esc(uebung.erkennung)}</p>` : ''}
      <div class="foto-reihe">
        ${Object.entries(FOTO_ARTEN)
          .map(
            ([art, label]) => `
            <button type="button" class="foto-feld" data-foto-slot="${esc(uebungId)}"
                    data-foto-art="${esc(art)}" aria-label="${esc(label)}-Foto">
              <span class="foto-platzhalter">＋<span>${esc(label)}</span></span>
            </button>`
          )
          .join('')}
      </div>
      <p class="foto-erklaerung">
        Eigene Fotos aus deinem Studio — sie zeigen dir auch, wo das Gerät steht.
        Das zweite Bild ist für deine Sitzhöhe bzw. Hebelposition gedacht.
      </p>
    </details>`;
}

function letztesMalRendern(zustand, slot, eintrag, uebung, letzte) {
  if (letzte) {
    return `
      <div class="letztes-mal">
        <span class="marke">Letztes Mal · ${esc(datumKurz(letzte.datum))}</span>
        <span class="werte">${esc(saetzeFormatieren(letzte.saetze, uebung))}</span>
      </div>`;
  }

  // Diese Variante ist neu. Wenn für dieselbe Aufgabe schon eine ANDERE Variante
  // Historie hat, ist der Hinweis wichtig: Die Gewichte lassen sich nicht
  // übertragen — andere Hebel, anderes Schlittengewicht, andere Stabilisation.
  const anderes = andereVarianteBekannt(zustand, slot.muster, eintrag.uebungId);
  return `
    <div class="letztes-mal letztes-mal-neu">
      <span class="marke">Erstes Mal an diesem Gerät</span>
      <span>Startgewicht schätzen — die letzten zwei bis drei Wiederholungen sollen
      deutlich anstrengend sein.</span>
      ${
        anderes
          ? `<div class="hinweis-warnung">
               Du hast diese Aufgabe schon an einem anderen Gerätetyp gemacht. Übernimm
               das Gewicht <strong>nicht</strong> — zwischen Kurzhantel, Steckgewicht und
               Scheiben liegen oft 30 % und mehr.
             </div>`
          : ''
      }
    </div>`;
}

function satzRendern(slot, eintrag, satz, i, letzte, uebung) {
  // Vorbefüllung aus der letzten Einheit derselben Variante. Gibt es dort weniger
  // Sätze, gilt der letzte — beim vierten Satz willst du wissen, was im dritten lief.
  const referenz = letzte?.saetze[Math.min(i, letzte.saetze.length - 1)] || null;
  const platzGewicht = referenz && Number(referenz.gewicht) ? zahlKurz(referenz.gewicht) : '';
  const platzWdh = referenz ? String(referenz.wdh) : '';
  const erledigt = Number(satz.wdh) > 0;

  const wert = (v) => (v === '' || v === null || v === undefined ? '' : esc(v));

  return `
    <div class="satz ${erledigt ? 'satz-erledigt' : ''}" data-satz="${i}">
      <span class="satz-nr">${i + 1}</span>
      <span class="feld">
        <input type="text" inputmode="decimal" data-feld="gewicht"
               value="${wert(satz.gewicht)}" placeholder="${esc(platzGewicht)}"
               aria-label="Gewicht Satz ${i + 1}" />
        <span class="feld-marke">kg</span>
      </span>
      <span class="feld">
        <input type="text" inputmode="numeric" data-feld="wdh"
               value="${wert(satz.wdh)}" placeholder="${esc(platzWdh)}"
               aria-label="Wiederholungen Satz ${i + 1}" />
      </span>
      <span class="feld">
        <input type="text" inputmode="numeric" data-feld="rir"
               value="${wert(satz.rir)}" placeholder="${esc(rirPlatzhalter(slot, i))}"
               aria-label="RIR Satz ${i + 1}" />
      </span>
      <button type="button" class="satz-haken" data-haken="${i}"
              aria-label="Satz ${i + 1} abhaken">${erledigt ? '✓' : '○'}</button>
    </div>`;
}

/**
 * Das RIR-Ziel des Slots als Platzhalter. Bei "2 / 2 / 0–1" bekommt jeder Satz
 * seinen eigenen Wert — der letzte Satz darf härter sein als die davor.
 */
function rirPlatzhalter(slot, i) {
  if (!slot.rirZiel) return '';
  const teile = slot.rirZiel.split('/').map((t) => t.trim());
  return teile.length > 1 ? teile[Math.min(i, teile.length - 1)] : teile[0];
}

// ── Interaktion ──────────────────────────────────────────────────────────────

// ── Fotos ────────────────────────────────────────────────────────────────────

/**
 * Füllt die Fotofelder eines Abschnitts. Wird beim Aufklappen aufgerufen und nach
 * jeder Änderung erneut — absichtlich nicht über neuZeichnen(), weil das die ganze
 * Ansicht neu bauen und dabei alle aufgeklappten Abschnitte wieder schließen würde.
 */
async function fotoFelderFuellen(abschnitt) {
  const felder = abschnitt.querySelectorAll('[data-foto-slot]');
  for (const feld of felder) {
    const { fotoSlot: uebungId, fotoArt: art } = feld.dataset;
    const url = await fotoUrl(uebungId, art);
    if (url) {
      feld.classList.add('foto-feld-belegt');
      feld.innerHTML = `<img src="${url}" alt="" loading="lazy" />
        <span class="foto-marke">${esc(FOTO_ARTEN[art])}</span>`;
    } else {
      feld.classList.remove('foto-feld-belegt');
      feld.innerHTML = `<span class="foto-platzhalter">＋<span>${esc(FOTO_ARTEN[art])}</span></span>`;
    }
  }
}

/**
 * Markiert in der zugeklappten Überschrift, ob schon ein Foto da ist. Ohne das
 * müsstest du jeden Abschnitt aufklappen, um zu sehen, wo noch eines fehlt.
 */
async function fotoMarkenSetzen(wurzel) {
  const belegt = await belegteSchluessel();
  wurzel.querySelectorAll('[data-fotos-fuer]').forEach((abschnitt) => {
    const uebungId = abschnitt.dataset.fotosFuer;
    const hat = Object.keys(FOTO_ARTEN).some((art) => belegt.has(fotoSchluessel(uebungId, art)));
    const summary = abschnitt.querySelector('summary');
    if (summary) {
      summary.textContent = hat ? 'Gerät finden · Foto vorhanden' : 'Gerät finden · noch kein Foto';
    }
  });
}

function fotosVerdrahten(wurzel, zustand) {
  fotoMarkenSetzen(wurzel);

  // Bilder erst beim Aufklappen laden, nicht schon beim Rendern der Ansicht.
  wurzel.querySelectorAll('[data-fotos-fuer]').forEach((abschnitt) => {
    abschnitt.addEventListener('toggle', () => {
      if (abschnitt.open && !abschnitt.dataset.geladen) {
        abschnitt.dataset.geladen = '1';
        fotoFelderFuellen(abschnitt);
      }
    });
  });

  beiKlick(wurzel, '[data-foto-slot]', (feld) => {
    const { fotoSlot: uebungId, fotoArt: art } = feld.dataset;
    const uebung = uebungFinden(uebungId, zustand.eigeneUebungen);
    const abschnitt = feld.closest('[data-fotos-fuer]');
    const danach = () => {
      fotoFelderFuellen(abschnitt);
      fotoMarkenSetzen(wurzel);
    };
    if (feld.classList.contains('foto-feld-belegt')) {
      fotoAnzeigen(uebungId, art, uebung?.name || '', danach);
    } else {
      fotoAufnehmen(uebungId, art, danach);
    }
  });
}

function verdrahten(wurzel, zustand, plan, einheit, neuZeichnen) {
  fotosVerdrahten(wurzel, zustand);

  // Eingaben laufend sichern. 'input' statt 'change', damit auch ein
  // weggewischter Tab nichts kostet.
  wurzel.addEventListener('input', (e) => {
    const feld = e.target.closest('[data-feld]');
    if (feld) {
      const zeile = feld.closest('[data-satz]');
      const karte = feld.closest('[data-slot]');
      const eintrag = eintragZu(einheit, karte.dataset.slot);
      eintrag.saetze[Number(zeile.dataset.satz)][feld.dataset.feld] = feld.value.trim();
      speichern();
      return;
    }
    if (e.target.id === 'notiz') {
      einheit.notiz = e.target.value;
      speichern();
    }
  });

  wurzel.addEventListener('change', (e) => {
    if (e.target.id === 'entlastung') {
      einheit.entlastung = e.target.checked;
      speichern();
    }
  });

  // Satz abhaken. Erst hier startet der Pausentimer — und weil der Klick eine
  // echte Nutzergeste ist, darf iOS an dieser Stelle den Ton freischalten.
  beiKlick(wurzel, '[data-haken]', (knopf) => {
    const zeile = knopf.closest('[data-satz]');
    const karte = knopf.closest('[data-slot]');
    const slot = plan.slots.find((sl) => sl.id === karte.dataset.slot);
    const eintrag = eintragZu(einheit, slot.id);
    const index = Number(zeile.dataset.satz);
    const satz = eintrag.saetze[index];

    if (Number(satz.wdh) > 0) {
      // Abwählen: Werte bleiben stehen, nur der Haken geht weg.
      satz.wdh = '';
      zeile.classList.remove('satz-erledigt');
      knopf.textContent = '○';
      speichern();
      kopfZaehlerAktualisieren(einheit, plan);
      return;
    }

    // Leere Felder aus dem Platzhalter füllen — genau der Fall "war wie letztes Mal".
    zeile.querySelectorAll('[data-feld]').forEach((f) => {
      if (!f.value && f.placeholder) {
        f.value = f.placeholder;
        satz[f.dataset.feld] = f.placeholder;
      }
    });
    if (!Number(satz.wdh)) {
      zeile.querySelector('[data-feld="wdh"]').focus();
      return; // ohne Wiederholungen gibt es nichts abzuhaken
    }

    zeile.classList.add('satz-erledigt');
    knopf.textContent = '✓';
    speichern();
    kopfZaehlerAktualisieren(einheit, plan);
    timer.starten(slot.pauseSek);
  });

  // Gerät belegt → Ausweichdialog
  beiKlick(wurzel, '[data-tausch]', (knopf) => {
    const slotId = knopf.dataset.tausch;
    const slot = plan.slots.find((sl) => sl.id === slotId);
    const eintrag = eintragZu(einheit, slotId);
    ausweichDialogOeffnen({
      muster: slot.muster,
      aktuelleId: eintrag.uebungId,
      beiWahl(neueUebungId, alsStandard) {
        if (neueUebungId === eintrag.uebungId && !alsStandard) return;
        // Bereits protokollierte Sätze gehören zur alten Variante. Sie hier zu
        // behalten würde die Historie verfälschen, deshalb werden sie geleert —
        // aber nur, wenn wirklich gewechselt wird.
        if (neueUebungId !== eintrag.uebungId) {
          eintrag.uebungId = neueUebungId;
          eintrag.saetze = eintrag.saetze.map(() => ({ gewicht: '', wdh: '', rir: '' }));
        }
        if (alsStandard) slot.uebungId = neueUebungId;
        speichern();
        neuZeichnen();
      },
    });
  });

  wurzel.querySelector('#beenden')?.addEventListener('click', () => {
    const gemacht = gemachteSaetze(einheit);
    if (!gemacht) {
      alert('Noch kein Satz protokolliert — es gibt nichts zu speichern.');
      return;
    }
    const offen = sollSaetze(plan) - gemacht;
    if (offen > 0 && !confirm(`${offen} Sätze sind noch offen. Trotzdem beenden?`)) return;

    // Nur wirklich gemachte Sätze wandern in die Historie.
    einheit.eintraege = einheit.eintraege
      .map((e) => ({ ...e, saetze: e.saetze.filter((x) => Number(x.wdh) > 0) }))
      .filter((e) => e.saetze.length);
    einheit.datum = new Date().toISOString();

    zustand.einheiten.push(einheit);
    zustand.laufend = null;
    speichern();
    timer.stoppen();
    gehe('#/');
  });

  wurzel.querySelector('#verwerfen')?.addEventListener('click', () => {
    if (!confirm('Das laufende Training wird gelöscht. Sicher?')) return;
    zustand.laufend = null;
    speichern();
    timer.stoppen();
    gehe('#/');
  });
}

function kopfZaehlerAktualisieren(einheit, plan) {
  const el = document.querySelector('#titel .unterzeile');
  if (el) el.textContent = `Training läuft · ${gemachteSaetze(einheit)} von ${sollSaetze(plan)} Sätzen`;
}

export { satzFormatieren };
