// Datenhaltung im localStorage.
//
// Grundsatz: Die Übungsbibliothek liegt im Code (exercises.js), nicht im Speicher.
// So erreichen Verbesserungen an der Bibliothek dich auch dann, wenn du die App
// schon monatelang benutzt. Im Speicher liegt nur, was DIR gehört: deine Pläne,
// deine Trainingseinheiten und selbst angelegte Übungen.

import { STANDARD_PLAENE } from './plans.js';
import { alleFotosAlsDataUrls, fotosAusDataUrls } from './photos.js';

const SCHLUESSEL = 'fitx-trainer-v1';

/** Frischer Zustand beim allerersten Öffnen. */
function neuerZustand() {
  return {
    schemaVersion: 1,
    plaene: STANDARD_PLAENE(),
    eigeneUebungen: [],
    einheiten: [],
    // Angefangenes, noch nicht abgeschlossenes Training. Wird nach jeder Eingabe
    // mitgeschrieben, damit ein Anruf oder ein von Safari entsorgter Tab nicht
    // das halbe Training kostet.
    laufend: null,
    einstellungen: { timerTonAn: true },
  };
}

let zustand = null;

/** Lädt den Zustand (einmalig) und hält ihn im Speicher. */
export function laden() {
  if (zustand) return zustand;
  try {
    const roh = localStorage.getItem(SCHLUESSEL);
    zustand = roh ? migrieren(JSON.parse(roh)) : neuerZustand();
  } catch (e) {
    // Kaputte Daten dürfen die App nicht unbenutzbar machen. Lieber mit einem
    // frischen Zustand starten als mit einem weißen Bildschirm dastehen.
    console.error('Gespeicherte Daten unlesbar, starte neu:', e);
    zustand = neuerZustand();
  }
  return zustand;
}

/**
 * Hebt ältere Datenstände auf das aktuelle Schema.
 * Aktuell gibt es nur Version 1 — die Funktion existiert, damit spätere
 * Formatänderungen die Historie migrieren statt sie wegzuwerfen.
 */
function migrieren(daten) {
  const basis = neuerZustand();
  return {
    ...basis,
    ...daten,
    schemaVersion: 1,
    einstellungen: { ...basis.einstellungen, ...(daten.einstellungen || {}) },
  };
}

/** Schreibt den aktuellen Zustand zurück in den localStorage. */
export function speichern() {
  if (!zustand) return;
  try {
    localStorage.setItem(SCHLUESSEL, JSON.stringify(zustand));
  } catch (e) {
    // Passiert praktisch nur bei vollem Speicher oder im privaten Modus.
    console.error('Speichern fehlgeschlagen:', e);
    alert(
      'Die Daten konnten nicht gespeichert werden. Falls du Safari im privaten ' +
        'Modus benutzt: Dort ist der Speicher gesperrt. Bitte im normalen Modus öffnen.'
    );
  }
}

/** Bequemer Zugriff, damit Views nicht überall laden() aufrufen müssen. */
export function s() {
  return laden();
}

/** Kurze, eindeutige ID für neue Einträge. */
export function neueId(praefix = 'id') {
  return `${praefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Backup ───────────────────────────────────────────────────────────────────

/**
 * Erzeugt eine JSON-Datei zum Download (auf dem iPhone landet sie im Teilen-Dialog).
 *
 * Die Fotos wandern als Data-URLs mit hinein. Dadurch wird die Datei spürbar größer,
 * aber ein Backup, das die Fotos ausspart, wäre nach einem Gerätewechsel nur ein
 * halbes Backup — und die Fotos sind Arbeit, die du im Studio investiert hast.
 */
export async function backupExportieren() {
  const daten = JSON.stringify({ ...laden(), fotos: await alleFotosAlsDataUrls() }, null, 2);
  const blob = new Blob([daten], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitx-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Liest eine Backup-Datei ein. Validiert vorher grob, damit ein versehentlich
 * gewähltes Foto nicht die komplette Historie überschreibt.
 */
export function backupImportieren(datei) {
  return new Promise((erfuellen, ablehnen) => {
    const leser = new FileReader();
    leser.onload = async () => {
      try {
        const daten = JSON.parse(leser.result);
        if (!daten || !Array.isArray(daten.einheiten) || !Array.isArray(daten.plaene)) {
          throw new Error('Das sieht nicht nach einem FitX-Trainer-Backup aus.');
        }
        const anzahl = daten.einheiten.length;
        const fotos = Object.keys(daten.fotos || {}).length;
        const jetzt = laden().einheiten.length;
        const ok = confirm(
          `Backup enthält ${anzahl} Trainingseinheiten` +
            (fotos ? ` und ${fotos} Fotos` : ' (keine Fotos)') +
            `.\nAktuell gespeichert: ${jetzt} Einheiten.\n\n` +
            'Der aktuelle Stand wird vollständig ersetzt. Fortfahren?'
        );
        if (!ok) return erfuellen(false);

        // Fotos zuerst — schlägt IndexedDB fehl, sind wenigstens die
        // Trainingsdaten noch unangetastet und der Nutzer kann es erneut versuchen.
        if (daten.fotos) await fotosAusDataUrls(daten.fotos);

        const { fotos: _, ...ohneFotos } = daten; // Fotos gehören nicht in den localStorage
        zustand = migrieren(ohneFotos);
        speichern();
        erfuellen(true);
      } catch (e) {
        ablehnen(e);
      }
    };
    leser.onerror = () => ablehnen(new Error('Datei konnte nicht gelesen werden.'));
    leser.readAsText(datei);
  });
}
