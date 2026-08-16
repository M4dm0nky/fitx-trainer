// Trainingspläne.
//
// Ein Plan besteht aus SLOTS, nicht aus Geräten. Ein Slot ist eine Aufgabe
// ("Vertikales Drücken — Schulter") mit einem Standardgerät. Welches Gerät du
// tatsächlich benutzt, entscheidest du im Studio — deshalb hält der Slot nur
// die Vorgabe, und die Einheit speichert, was wirklich gemacht wurde.
//
// Volumen: rund 20 Arbeitssätze pro Einheit. Bei einem Rhythmus von alle zwei
// Tagen (≈ 3,5 Einheiten/Woche) landet jede Muskelgruppe damit bei 15–16 Sätzen
// pro Woche — im evidenzbasierten Korridor von 10–20. Ein Plan mit 25 Sätzen
// würde bei dieser Frequenz auf über 30 kommen und die Regeneration überfahren.

/** Erzeugt die beiden Standardpläne. Funktion statt Konstante, damit jeder
 *  Aufruf frische Objekte liefert und nichts versehentlich geteilt wird. */
export function STANDARD_PLAENE() {
  return [
    {
      id: 'plan-a',
      name: 'Oberkörper A',
      untertitel: 'horizontal',
      slots: [
        {
          id: 'a1',
          muster: 'druecken-horizontal',
          uebungId: 'hs-chest-press',
          saetze: 3,
          wdhVon: 6,
          wdhBis: 10,
          pauseSek: 150,
          rirZiel: '2 / 2 / 0–1',
        },
        {
          id: 'a2',
          muster: 'ziehen-horizontal',
          uebungId: 'hs-iso-row',
          saetze: 3,
          wdhVon: 8,
          wdhBis: 12,
          pauseSek: 150,
          rirZiel: '2 / 2 / 0–1',
        },
        {
          id: 'a3',
          muster: 'druecken-vertikal',
          uebungId: 'schulterpresse-pin',
          saetze: 3,
          wdhVon: 8,
          wdhBis: 12,
          pauseSek: 120,
          rirZiel: '2–3',
        },
        {
          id: 'a4',
          muster: 'brust-isolation',
          uebungId: 'butterfly-pin',
          saetze: 3,
          wdhVon: 10,
          wdhBis: 15,
          pauseSek: 90,
          rirZiel: '2',
        },
        {
          id: 'a5',
          muster: 'trizeps',
          uebungId: 'trizeps-kabel',
          saetze: 3,
          wdhVon: 10,
          wdhBis: 15,
          pauseSek: 90,
          rirZiel: '2',
        },
        {
          id: 'a6',
          muster: 'bauch-gerade',
          uebungId: 'kabel-crunch',
          saetze: 3,
          wdhVon: 10,
          wdhBis: 15,
          pauseSek: 75,
          rirZiel: '2',
        },
        {
          id: 'a7',
          muster: 'bauch-unten',
          uebungId: 'beinheben-station',
          saetze: 2,
          wdhVon: 10,
          wdhBis: 15,
          pauseSek: 75,
          rirZiel: '2',
        },
      ],
    },
    {
      id: 'plan-b',
      name: 'Oberkörper B',
      untertitel: 'vertikal',
      slots: [
        {
          id: 'b1',
          muster: 'ziehen-vertikal',
          uebungId: 'latzug-breit',
          saetze: 3,
          wdhVon: 8,
          wdhBis: 12,
          pauseSek: 150,
          rirZiel: '2 / 2 / 0–1',
        },
        {
          id: 'b2',
          muster: 'druecken-schraeg',
          uebungId: 'incline-press-pin',
          saetze: 3,
          wdhVon: 8,
          wdhBis: 12,
          pauseSek: 150,
          rirZiel: '2 / 2 / 0–1',
        },
        {
          id: 'b3',
          muster: 'ziehen-hoch',
          uebungId: 'hs-high-row',
          saetze: 3,
          wdhVon: 8,
          wdhBis: 12,
          pauseSek: 120,
          rirZiel: '2–3',
        },
        {
          id: 'b4',
          muster: 'bizeps',
          uebungId: 'kh-curl',
          saetze: 3,
          wdhVon: 8,
          wdhBis: 12,
          pauseSek: 90,
          rirZiel: '2',
        },
        {
          id: 'b5',
          muster: 'schulter-seitlich',
          uebungId: 'kabel-seitheben',
          saetze: 3,
          wdhVon: 12,
          wdhBis: 20,
          pauseSek: 75,
          rirZiel: '2',
        },
        {
          id: 'b6',
          muster: 'schulter-hinten',
          uebungId: 'reverse-butterfly',
          saetze: 3,
          wdhVon: 12,
          wdhBis: 20,
          pauseSek: 75,
          rirZiel: '2',
        },
        {
          id: 'b7',
          muster: 'bauch-seitlich',
          uebungId: 'rotary-torso',
          saetze: 2,
          wdhVon: 10,
          wdhBis: 15,
          pauseSek: 75,
          rirZiel: '2',
        },
      ],
    },
  ];
}

/** Plan per ID. */
export function planFinden(zustand, planId) {
  return zustand.plaene.find((p) => p.id === planId) || null;
}

/**
 * Welcher Plan ist als Nächstes dran?
 *
 * Bewusst NICHT nach Wochentag: Bei einem Rhythmus von alle zwei Tagen wandert
 * das Training durch die Woche, ein Kalenderbezug würde also ständig danebenliegen.
 * Stattdessen: der Plan, der zuletzt NICHT dran war.
 */
export function naechsterPlan(zustand) {
  const letzte = letzteEinheit(zustand);
  if (!letzte) return zustand.plaene[0];
  const index = zustand.plaene.findIndex((p) => p.id === letzte.planId);
  if (index === -1) return zustand.plaene[0];
  return zustand.plaene[(index + 1) % zustand.plaene.length];
}

/** Die zuletzt abgeschlossene Einheit (nach Datum, nicht nach Reihenfolge im Array). */
export function letzteEinheit(zustand) {
  if (!zustand.einheiten.length) return null;
  return zustand.einheiten.reduce((a, b) => (a.datum > b.datum ? a : b));
}

/** Volle Tage seit einem ISO-Datum. null, wenn kein Datum übergeben wurde. */
export function tageSeit(isoDatum) {
  if (!isoDatum) return null;
  const msProTag = 86400000;
  const dann = new Date(isoDatum);
  const heute = new Date();
  // Auf Tagesgrenzen normalisieren, damit "gestern Abend → heute früh" als 1 Tag zählt.
  const a = Date.UTC(dann.getFullYear(), dann.getMonth(), dann.getDate());
  const b = Date.UTC(heute.getFullYear(), heute.getMonth(), heute.getDate());
  return Math.round((b - a) / msProTag);
}

/**
 * Steht eine Entlastungswoche an?
 * Bei alle-zwei-Tage-Training über Monate hinweg lohnt sich etwa alle 6–8 Wochen
 * eine leichtere Woche. Das ist eine Erinnerung, kein Zwang.
 */
export function entlastungFaellig(zustand) {
  if (zustand.einheiten.length < 20) return false; // erst mal in Fahrt kommen
  const letzteEntlastung = zustand.einheiten
    .filter((e) => e.entlastung)
    .reduce((a, b) => (!a || a.datum > b.datum ? a : b), null);
  const bezug = letzteEntlastung
    ? letzteEntlastung.datum
    : zustand.einheiten.reduce((a, b) => (a.datum < b.datum ? a : b)).datum;
  return tageSeit(bezug) > 56; // 8 Wochen
}
