// Kleine DOM-Helfer.
//
// Die Views bauen ihr Markup als Zeichenkette. Das ist bei dieser Größe
// übersichtlicher als ein Framework — aber jeder Wert, der aus den Daten
// kommt, muss durch esc(), sonst zerlegt ein Übungsname mit "<" die Seite.

/** Maskiert Text für den Einbau in HTML. */
export function esc(wert) {
  return String(wert ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Wechselt die Ansicht. */
export function gehe(pfad) {
  location.hash = pfad;
}

/** Zurück zur Startseite, ohne einen Verlaufseintrag zu stapeln. */
export function zurueck() {
  if (history.length > 1) history.back();
  else gehe('#/');
}

/**
 * Registriert einen Klick-Handler per Delegation.
 * Bewusst 'click' und nicht 'touchstart': Touch-Handler, die preventDefault()
 * aufrufen, schalten auf iOS den Pinch-Zoom der Seite mit ab.
 */
export function beiKlick(wurzel, auswahl, handler) {
  wurzel.addEventListener('click', (e) => {
    const ziel = e.target.closest(auswahl);
    if (ziel && wurzel.contains(ziel)) handler(ziel, e);
  });
}

/** Zahl aus einem Eingabefeld, Komma wie Punkt behandelt. */
export function zahl(wert) {
  const n = parseFloat(String(wert).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}
