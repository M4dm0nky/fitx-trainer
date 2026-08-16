// Einstellungen: Backup, eigene Übungen, Hintergrundwissen.

import { s, speichern, backupExportieren, backupImportieren, neueId } from '../store.js';
import { MUSTER, KATEGORIEN, UEBUNGEN } from '../exercises.js';
import { esc, beiKlick } from '../dom.js';

export function rendern() {
  const zustand = s();
  const saetzeGesamt = zustand.einheiten.reduce(
    (n, e) => n + e.eintraege.reduce((m, ei) => m + ei.saetze.length, 0),
    0
  );

  return {
    titel: 'Mehr',
    kopfAktion: '<a class="textlink" href="#/">Start</a>',
    html: `
      <div class="abschnitt-titel">Deine Pläne</div>
      <section class="karte">
        ${zustand.plaene
          .map(
            (p) => `
            <div class="formzeile">
              <label>${esc(p.name)} <span style="color:var(--gedaempft)">· ${p.slots.length} Übungen</span></label>
              <a class="textlink" href="#/plan/${esc(p.id)}">bearbeiten</a>
            </div>`
          )
          .join('')}
      </section>

      <div class="abschnitt-titel">Datensicherung</div>
      <section class="karte">
        <p class="info-text" style="margin-top:0">
          Deine Trainingsdaten liegen ausschließlich im Speicher dieses Browsers — kein
          Server, kein Konto. Das ist gut für die Privatsphäre, heißt aber auch:
          <strong>Wenn du die Safari-Website-Daten löschst oder das Gerät wechselst, sind
          sie weg.</strong> Leg dir das Backup in iCloud Drive oder Dropbox.
        </p>
        <p class="info-text">
          Gespeichert: <strong>${zustand.einheiten.length} Einheiten</strong> mit ${saetzeGesamt} Sätzen.
        </p>
        <div class="fliess" style="margin-top:12px">
          <button class="knopf" id="export">Backup erstellen</button>
          <button class="knopf" id="import-knopf">Backup einspielen</button>
        </div>
        <input type="file" id="import" accept="application/json,.json" hidden />
      </section>

      <div class="abschnitt-titel">Eigene Übungen</div>
      <section class="karte">
        <p class="info-text" style="margin-top:0">
          Falls dein Studio ein Gerät hat, das in der Bibliothek fehlt. Ordne es einem
          Bewegungsmuster zu — dann taucht es automatisch als Ausweichoption auf, wenn
          das Standardgerät belegt ist.
        </p>
        ${
          zustand.eigeneUebungen.length
            ? zustand.eigeneUebungen
                .map(
                  (u) => `
                <div class="formzeile">
                  <label>${esc(u.name)}
                    <span style="color:var(--gedaempft)">· ${esc(KATEGORIEN[u.kategorie].kurz)}</span>
                  </label>
                  <button class="textlink knopf-gefahr" data-uebung-loeschen="${esc(u.id)}"
                          style="border:none;background:none">löschen</button>
                </div>`
                )
                .join('')
            : ''
        }
        <button class="knopf knopf-breit" id="neue-uebung" style="margin-top:12px">
          + Eigene Übung anlegen
        </button>
      </section>

      <div class="abschnitt-titel">Wie der Plan gedacht ist</div>
      <section class="karte">
        <p class="info-text" style="margin-top:0">
          <strong>Zwei Pläne im Wechsel.</strong> A betont horizontales Drücken und Ziehen,
          B vertikales. Bei einem Training alle zwei Tage belastest du dadurch Schulter-
          und Ellenbogengelenke nie zweimal hintereinander im selben Winkel.
        </p>
        <p class="info-text">
          <strong>Rund 20 Sätze pro Einheit.</strong> Bei etwa 3,5 Einheiten pro Woche macht
          das 15–16 Sätze je Muskelgruppe und Woche — der Bereich, in dem die Forschung
          den besten Ertrag sieht. Mehr ist nicht besser: Über 20 Sätze pro Muskelgruppe
          bringen kaum Zusatznutzen, kosten aber Regeneration.
        </p>
        <p class="info-text">
          <strong>RIR statt Muskelversagen.</strong> RIR heißt "Reps in Reserve" — wie viele
          Wiederholungen am Satzende noch möglich gewesen wären. Zwei bis drei reichen als
          Reiz. Jeden Satz auszureizen klingt engagierter, macht bei deiner Frequenz aber
          die übernächste Einheit kaputt.
        </p>
        <p class="info-text">
          <strong>Warum jede Gerätevariante ihre eigene Historie hat.</strong> Kurzhantel,
          Steckgewicht und Scheiben sind physikalisch nicht dasselbe — andere Hebel,
          anderes Eigengewicht des Schlittens, andere Stabilisationsanforderung. Ein
          gemeinsamer Verlauf würde Sprünge zeigen, die nichts mit deiner Kraft zu tun
          haben.
        </p>
        <p class="info-text">
          <strong>Zum Bauch, ehrlich.</strong> Bauchübungen bauen die Bauchmuskulatur auf —
          gezielt Fett am Bauch abzutrainieren funktioniert nach aktueller Studienlage
          nicht. Wo der Körper Fett abbaut, ist genetisch und hormonell bestimmt, und
          Fettabbau passiert immer im ganzen Körper über ein Kaloriendefizit. Bauchtraining
          steht trotzdem in beiden Plänen: Ein kräftiger Rumpf ist für sich genommen
          wertvoll und stabilisiert dich bei allen Drück- und Zugübungen.
        </p>
      </section>

      <div class="abschnitt-titel">Signalton</div>
      <section class="karte">
        <label class="schalter">
          <input type="checkbox" id="ton" ${zustand.einstellungen.timerTonAn ? 'checked' : ''} />
          <span>Ton am Ende der Pause</span>
        </label>
        <p class="info-text" style="margin-bottom:0">
          Der Ton ist auf dem iPhone das einzige verlässliche Signal — Safari unterstützt
          keine Vibration. Bei stummgeschaltetem Gerät bleibt er aus; dann hilft nur der
          Blick auf den Balken.
        </p>
      </section>

      <p class="info-text" style="text-align:center;margin:28px 0 0">
        ${UEBUNGEN.length} Übungen in ${Object.keys(MUSTER).length} Bewegungsmustern.
      </p>
    `,
    nachRender(wurzel, neuZeichnen) {
      verdrahten(wurzel, zustand, neuZeichnen);
    },
  };
}

function verdrahten(wurzel, zustand, neuZeichnen) {
  wurzel.querySelector('#export')?.addEventListener('click', backupExportieren);

  const dateiFeld = wurzel.querySelector('#import');
  wurzel.querySelector('#import-knopf')?.addEventListener('click', () => dateiFeld.click());
  dateiFeld?.addEventListener('change', async () => {
    const datei = dateiFeld.files?.[0];
    if (!datei) return;
    try {
      const ok = await backupImportieren(datei);
      if (ok) {
        alert('Backup eingespielt.');
        location.hash = '#/';
        location.reload();
      }
    } catch (e) {
      alert(`Import fehlgeschlagen: ${e.message}`);
    }
    dateiFeld.value = '';
  });

  wurzel.querySelector('#ton')?.addEventListener('change', (e) => {
    zustand.einstellungen.timerTonAn = e.target.checked;
    speichern();
  });

  beiKlick(wurzel, '[data-uebung-loeschen]', (knopf) => {
    const id = knopf.dataset.uebungLoeschen;
    const benutzt = zustand.plaene.some((p) => p.slots.some((sl) => sl.uebungId === id));
    if (benutzt) return alert('Diese Übung steht noch in einem Plan. Dort erst ersetzen.');
    if (!confirm('Übung löschen? Bereits aufgezeichnete Sätze bleiben in der Historie.')) return;
    zustand.eigeneUebungen = zustand.eigeneUebungen.filter((u) => u.id !== id);
    speichern();
    neuZeichnen();
  });

  wurzel.querySelector('#neue-uebung')?.addEventListener('click', () => {
    const name = prompt('Name der Übung (z. B. "Brustpresse Panatta"):');
    if (!name?.trim()) return;

    const musterListe = Object.entries(MUSTER);
    const musterWahl = prompt(
      'Welche Aufgabe erfüllt sie? Nummer eingeben:\n\n' +
        musterListe.map(([, n], i) => `${i + 1}. ${n}`).join('\n')
    );
    const muster = musterListe[parseInt(musterWahl, 10) - 1]?.[0];
    if (!muster) return;

    const katListe = Object.entries(KATEGORIEN);
    const katWahl = prompt(
      'Gerätekategorie? Nummer eingeben:\n\n' + katListe.map(([, k], i) => `${i + 1}. ${k.lang}`).join('\n')
    );
    const kategorie = katListe[parseInt(katWahl, 10) - 1]?.[0];
    if (!kategorie) return;

    zustand.eigeneUebungen.push({
      id: neueId('eigen'),
      name: name.trim(),
      kategorie,
      muster,
      muskel: 'sonstige',
      hinweis: 'Selbst angelegte Übung.',
    });
    speichern();
    neuZeichnen();
  });
}
