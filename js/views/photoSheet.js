// Foto aufnehmen und ansehen.
//
// Zoom-Hinweis: Die Vollbildanzeige ist genau die Art Komponente, die man üblicherweise
// mit touchmove + preventDefault baut, um eigenes Zoomen und Wischen zu bauen. Damit
// wäre der Pinch-Zoom der ganzen Seite tot. Hier stattdessen: schlichtes Overlay, Bild
// auf max-width 100 %, das Zoomen übernimmt der normale Seiten-Zoom von Safari.
// Kein einziger Touch-Handler in dieser Datei.

import { fotoSpeichern, fotoLoeschen, fotoUrl, urlVergessen, FOTO_ARTEN } from '../photos.js';
import { esc } from '../dom.js';

/**
 * Öffnet den iOS-Auswahldialog und speichert das gewählte Bild.
 *
 * Bewusst OHNE das capture-Attribut: So bietet iOS sowohl "Foto aufnehmen" als auch
 * "Aus Mediathek wählen" an. Mit capture wäre die Mediathek gesperrt — unpraktisch,
 * wenn das Foto schon auf dem Gerät liegt.
 */
export function fotoAufnehmen(uebungId, art, fertig) {
  const feld = document.createElement('input');
  feld.type = 'file';
  feld.accept = 'image/*';
  feld.hidden = true;
  document.body.appendChild(feld);

  feld.addEventListener('change', async () => {
    const datei = feld.files?.[0];
    feld.remove();
    if (!datei) return;

    const anzeige = ladeanzeige('Foto wird gespeichert …');
    try {
      urlVergessen(uebungId, art);
      await fotoSpeichern(uebungId, art, datei);
      fertig?.();
    } catch (e) {
      console.error(e);
      alert(speicherFehlerText(e));
    } finally {
      anzeige.remove();
    }
  });

  // Bricht der Nutzer den Auswahldialog ab, feuert 'change' auf iOS nicht
  // zuverlässig — das Feld bliebe für immer im Dokument hängen. Beim nächsten
  // Fokus der Seite aufräumen, falls bis dahin nichts gewählt wurde.
  window.addEventListener(
    'focus',
    () => setTimeout(() => { if (!feld.files?.length) feld.remove(); }, 1000),
    { once: true }
  );

  feld.click();
}

/** Vollbildanzeige mit Ersetzen und Löschen. */
export async function fotoAnzeigen(uebungId, art, uebungName, fertig) {
  const url = await fotoUrl(uebungId, art);
  if (!url) return fotoAufnehmen(uebungId, art, fertig);

  const hinter = document.createElement('div');
  hinter.className = 'blatt-hinter foto-voll';
  hinter.innerHTML = `
    <div class="foto-voll-inhalt" role="dialog" aria-label="Foto ansehen">
      <div class="foto-voll-kopf">
        <span class="foto-voll-titel">${esc(uebungName)} · ${esc(FOTO_ARTEN[art])}</span>
        <button type="button" class="knopf knopf-klein knopf-still" data-foto="zu">Schließen</button>
      </div>
      <img src="${url}" alt="${esc(uebungName)} — ${esc(FOTO_ARTEN[art])}" class="foto-voll-bild" />
      <p class="foto-voll-tipp">Mit zwei Fingern aufziehen zum Vergrößern.</p>
      <div class="blatt-knoepfe">
        <button type="button" class="knopf" data-foto="ersetzen">Neues Foto aufnehmen</button>
        <button type="button" class="knopf knopf-still knopf-gefahr" data-foto="loeschen">
          Foto löschen
        </button>
      </div>
    </div>`;

  function schliessen() {
    hinter.remove();
  }

  hinter.addEventListener('click', async (e) => {
    if (e.target === hinter) return schliessen();
    const aktion = e.target.closest('[data-foto]')?.dataset.foto;
    if (!aktion) return;

    if (aktion === 'zu') return schliessen();

    if (aktion === 'ersetzen') {
      schliessen();
      return fotoAufnehmen(uebungId, art, fertig);
    }

    if (aktion === 'loeschen') {
      if (!confirm('Foto löschen?')) return;
      urlVergessen(uebungId, art);
      await fotoLoeschen(uebungId, art);
      schliessen();
      fertig?.();
    }
  });

  document.body.appendChild(hinter);
}

/**
 * Unterscheidet die beiden realistischen Ursachen. "Speicher ist voll" und
 * "privater Modus" verlangen völlig verschiedene Reaktionen — eine Sammelmeldung
 * schickt dich in die falsche Richtung.
 */
function speicherFehlerText(fehler) {
  if (fehler?.name === 'QuotaExceededError') {
    return (
      'Der Speicher ist voll — das Foto wurde nicht gesichert.\n\n' +
      'Unter „Mehr" siehst du, wie viel die Fotos belegen. Lösch ein paar, die du ' +
      'nicht mehr brauchst, oder gib auf dem iPhone Speicher frei.'
    );
  }
  return (
    'Das Foto konnte nicht gespeichert werden.\n\n' +
    'Falls du Safari im privaten Modus benutzt: Dort ist der Speicher gesperrt. ' +
    'Bitte im normalen Modus öffnen und die App über das Home-Symbol starten.'
  );
}

/** Kurze Rückmeldung, während das Verkleinern läuft — das dauert spürbar. */
function ladeanzeige(text) {
  const el = document.createElement('div');
  el.className = 'ladeanzeige';
  el.textContent = text;
  document.body.appendChild(el);
  return el;
}
