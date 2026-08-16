// Historie-Abfragen.
//
// Die zentrale Regel dieser Datei: Historie wird PRO ÜBUNGSVARIANTE geführt,
// niemals pro Slot. 45 kg an der Steckgewicht-Maschine, 2 × 16 kg Kurzhanteln
// und 40 kg Scheiben an der Hammer Strength sind physikalisch nicht dasselbe —
// andere Hebel, anderes Schlittengewicht, andere Stabilisationsanforderung.
//
// Würde man das zusammenwerfen, wäre die "Letztes Mal"-Anzeige nicht bloß
// ungenau, sondern irreführend: Du gehst zur Kurzhantel, siehst 45 kg und
// fragst dich, was du falsch machst. Genau deshalb speichert jede Einheit die
// tatsächlich benutzte uebungId mit.

import { uebungFinden } from './exercises.js';

/**
 * Die letzte Einheit, in der genau diese Übungsvariante gemacht wurde.
 * @returns {{datum: string, saetze: Array}|null}
 */
export function letzteLeistung(zustand, uebungId) {
  let treffer = null;
  for (const einheit of zustand.einheiten) {
    for (const eintrag of einheit.eintraege) {
      if (eintrag.uebungId !== uebungId) continue;
      if (!eintrag.saetze.some(istGefuellt)) continue; // leer angelegte Sätze zählen nicht
      if (!treffer || einheit.datum > treffer.datum) {
        treffer = { datum: einheit.datum, saetze: eintrag.saetze.filter(istGefuellt) };
      }
    }
  }
  return treffer;
}

/** Alle Einheiten mit dieser Variante, neueste zuerst. Für den Verlaufs-Screen. */
export function verlauf(zustand, uebungId) {
  const zeilen = [];
  for (const einheit of zustand.einheiten) {
    for (const eintrag of einheit.eintraege) {
      if (eintrag.uebungId !== uebungId) continue;
      const saetze = eintrag.saetze.filter(istGefuellt);
      if (saetze.length) zeilen.push({ datum: einheit.datum, saetze });
    }
  }
  return zeilen.sort((a, b) => (a.datum < b.datum ? 1 : -1));
}

/** Ein Satz zählt als protokolliert, sobald Wiederholungen drinstehen. */
export function istGefuellt(satz) {
  return satz && Number(satz.wdh) > 0;
}

/**
 * Gab es für dasselbe Bewegungsmuster schon eine ANDERE Variante?
 * Wenn ja, blendet der Workout-Screen bei einer neuen Variante den Hinweis ein,
 * dass sich die Gewichte zwischen Gerätetypen nicht übertragen lassen — das ist
 * genau der Fehler, den man sonst beim ersten Mal macht.
 */
export function andereVarianteBekannt(zustand, muster, aktuelleUebungId) {
  return zustand.einheiten.some((einheit) =>
    einheit.eintraege.some((eintrag) => {
      if (eintrag.uebungId === aktuelleUebungId) return false;
      if (!eintrag.saetze.some(istGefuellt)) return false;
      const u = uebungFinden(eintrag.uebungId, zustand.eigeneUebungen);
      return u && u.muster === muster;
    })
  );
}

/**
 * Bestes Satzgewicht je Einheit — die Datenreihe für das Mini-Diagramm.
 * Bei Körpergewichtsübungen ohne Zusatzlast fällt das auf Wiederholungen zurück,
 * weil dort die Wiederholungszahl der Fortschritt ist.
 */
export function verlaufsReihe(zustand, uebungId) {
  const uebung = uebungFinden(uebungId, zustand.eigeneUebungen);
  const zeilen = verlauf(zustand, uebungId).reverse(); // chronologisch
  // Boolean() ist hier nicht kosmetisch: Ohne den Zwang liefert die Kette bei
  // Übungen ohne koerpergewicht-Feld `undefined` statt `false`, und die Anzeige
  // entscheidet dann anhand eines Werts, der weder wahr noch falsch ist.
  const nurWdh = Boolean(
    uebung?.koerpergewicht && zeilen.every((z) => z.saetze.every((s) => !Number(s.gewicht)))
  );
  return {
    nurWdh,
    punkte: zeilen.map((z) => ({
      datum: z.datum,
      wert: nurWdh
        ? Math.max(...z.saetze.map((s) => Number(s.wdh) || 0))
        : Math.max(...z.saetze.map((s) => Number(s.gewicht) || 0)),
    })),
  };
}

// ── Formatierung ─────────────────────────────────────────────────────────────

/** "45 kg × 10 · 45 kg × 9 · 40 kg × 10" */
export function saetzeFormatieren(saetze, uebung) {
  return saetze.map((s) => satzFormatieren(s, uebung)).join(' · ');
}

/** Ein einzelner Satz. Körpergewicht ohne Zusatzlast wird als "KG" gezeigt. */
export function satzFormatieren(satz, uebung) {
  const einheit = uebung?.wdhEinheit === 'sek' ? 's' : '';
  const wdh = einheit ? `${satz.wdh} ${einheit}` : `× ${satz.wdh}`;
  const gewicht = Number(satz.gewicht);
  if (!gewicht) {
    return uebung?.koerpergewicht ? `KG ${wdh}` : wdh;
  }
  return `${zahlKurz(gewicht)} kg ${wdh}`;
}

/** 45 statt 45.0, aber 47.5 bleibt 47,5. */
export function zahlKurz(n) {
  return String(Math.round(n * 100) / 100).replace('.', ',');
}

/** "12.08." — kurz, weil es neben dem Gewicht steht und nicht ablenken soll. */
export function datumKurz(iso) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.`;
}

/** "vor 2 Tagen" / "heute" / "gestern" */
export function relativTage(tage) {
  if (tage === null) return '';
  if (tage <= 0) return 'heute';
  if (tage === 1) return 'gestern';
  return `vor ${tage} Tagen`;
}
