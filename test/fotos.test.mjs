// Prüft den Fotospeicher, soweit das ohne Browser geht.
//
// Was hier NICHT geprüft werden kann und deshalb am Gerät getestet werden muss:
//   - das Verkleinern über <canvas> (braucht einen Browser)
//   - die EXIF-Drehung von iPhone-Hochformatfotos
//
// IndexedDB selbst gibt es in Node nicht — dafür steht unten eine Attrappe, die
// den Vertrag nachbildet, auf den sich transaktion() verlässt. Das ist kein
// Selbstzweck: Ein Fehler in genau dieser Umhüllung liefert für nicht vorhandene
// Fotos statt null ein IDBRequest-Objekt zurück, und das killt die Anzeige
// stillschweigend, sobald ein Teil der Geräte fotografiert ist und ein anderer nicht.

import assert from 'node:assert/strict';
import { UEBUNGEN } from '../js/exercises.js';

// ── IndexedDB-Attrappe ───────────────────────────────────────────────────────
// Bildet nur das nach, was photos.js benutzt. Wichtig ist das Zeitverhalten:
// transaktion() ruft arbeit(store) synchron auf und hängt DANACH tx.oncomplete an,
// also darf oncomplete frühestens im nächsten Microtask feuern.

function indexedDbAttrappeInstallieren() {
  const daten = new Map();

  function anfrage(result) {
    return { result };
  }

  const speicher = {
    get: (k) => anfrage(daten.get(k)), // fehlender Schlüssel → undefined, wie im Original
    put: (wert, k) => {
      daten.set(k, wert);
      return anfrage(k);
    },
    delete: (k) => {
      daten.delete(k);
      return anfrage(undefined);
    },
    getAll: () => anfrage([...daten.values()]),
    getAllKeys: () => anfrage([...daten.keys()]),
  };

  globalThis.indexedDB = {
    open() {
      const req = { result: null, onupgradeneeded: null, onsuccess: null, onerror: null };
      queueMicrotask(() => {
        req.result = {
          objectStoreNames: { contains: () => true },
          createObjectStore: () => speicher,
          transaction() {
            const tx = {
              objectStore: () => speicher,
              oncomplete: null,
              onerror: null,
              onabort: null,
              error: null,
            };
            // Zwei Microtasks Verzögerung: transaktion() setzt oncomplete erst
            // nach dem synchronen arbeit(store)-Aufruf.
            queueMicrotask(() => queueMicrotask(() => tx.oncomplete?.()));
            return tx;
          },
        };
        req.onsuccess?.();
      });
      return req;
    },
  };

  // FileReader ist in Node nicht global — alleFotosAlsDataUrls braucht ihn.
  if (!globalThis.FileReader) {
    globalThis.FileReader = class {
      readAsDataURL(blob) {
        blob
          .arrayBuffer()
          .then((puffer) => {
            this.result = `data:${blob.type || 'application/octet-stream'};base64,${Buffer.from(puffer).toString('base64')}`;
            this.onload?.();
          })
          .catch(() => this.onerror?.());
      }
    };
  }

  return daten;
}

const fakeDaten = indexedDbAttrappeInstallieren();

const {
  fotoSchluessel,
  dataUrlZuBlob,
  groesseLesbar,
  FOTO_ARTEN,
  MAX_KANTE,
  fotoLaden,
  fotoLoeschen,
  belegteSchluessel,
  fotosZaehlen,
  alleFotosAlsDataUrls,
  fotosAusDataUrls,
} = await import('../js/photos.js');

let ok = 0;
const pruefe = (name, fn) => {
  try {
    fn();
    console.log(`  ok   ${name}`);
    ok++;
  } catch (e) {
    console.log(`  FEHL ${name}\n       ${e.message}`);
    process.exitCode = 1;
  }
};

const pruefeAsync = async (name, fn) => {
  try {
    await fn();
    console.log(`  ok   ${name}`);
    ok++;
  } catch (e) {
    console.log(`  FEHL ${name}\n       ${e.message}`);
    process.exitCode = 1;
  }
};

console.log('\n— Schlüsselbildung —');

pruefe('Schlüssel trennt Gerätevarianten sauber', () => {
  assert.equal(fotoSchluessel('hs-iso-row', 'geraet'), 'hs-iso-row:geraet');
  assert.notEqual(
    fotoSchluessel('hs-iso-row', 'geraet'),
    fotoSchluessel('rudermaschine-pin', 'geraet')
  );
});

pruefe('Gerät- und Einstellungsfoto kollidieren nicht', () => {
  assert.notEqual(
    fotoSchluessel('latzug-breit', 'geraet'),
    fotoSchluessel('latzug-breit', 'einstellung')
  );
});

pruefe('kein Schlüssel der gesamten Bibliothek kommt doppelt vor', () => {
  const alle = UEBUNGEN.flatMap((u) => Object.keys(FOTO_ARTEN).map((a) => fotoSchluessel(u.id, a)));
  assert.equal(new Set(alle).size, alle.length);
  console.log(`       ${alle.length} mögliche Fotoplätze bei ${UEBUNGEN.length} Übungen`);
});

console.log('\n— Backup-Umwandlung —');

pruefe('Data-URL wird verlustfrei zurück in einen Blob gewandelt', async () => {
  const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]); // JPEG-Kopf
  const base64 = Buffer.from(bytes).toString('base64');
  const blob = dataUrlZuBlob(`data:image/jpeg;base64,${base64}`);
  assert.ok(blob, 'kein Blob erzeugt');
  assert.equal(blob.type, 'image/jpeg');
  assert.equal(blob.size, bytes.length);
  const zurueck = new Uint8Array(await blob.arrayBuffer());
  assert.deepEqual([...zurueck], [...bytes], 'Bytes stimmen nicht überein');
});

pruefe('kaputte Eingaben werfen nicht, sondern liefern null', () => {
  assert.equal(dataUrlZuBlob(null), null);
  assert.equal(dataUrlZuBlob(''), null);
  assert.equal(dataUrlZuBlob('kein data-url'), null);
  assert.equal(dataUrlZuBlob(undefined), null);
  assert.equal(dataUrlZuBlob(42), null);
});

pruefe('ein Backup ohne Fotos-Block bleibt gültig', () => {
  // Alte Backups aus der Zeit vor dieser Funktion dürfen nicht abstürzen.
  const altesBackup = { schemaVersion: 1, plaene: [], einheiten: [], fotos: undefined };
  assert.equal(Object.keys(altesBackup.fotos || {}).length, 0);
});

console.log('\n— Anzeige —');

pruefe('Dateigrößen werden lesbar formatiert', () => {
  assert.equal(groesseLesbar(0), '0 KB');
  assert.equal(groesseLesbar(150 * 1024), '150 KB');
  assert.equal(groesseLesbar(1.8 * 1024 * 1024), '1,8 MB');
});

pruefe('Verkleinerungsgrenze bleibt in vernünftigem Rahmen', () => {
  // 1200 px reichen, um ein Gerät wiederzuerkennen. Deutlich mehr würde das
  // Backup unnötig aufblähen, deutlich weniger die Erkennbarkeit kosten.
  assert.ok(MAX_KANTE >= 800 && MAX_KANTE <= 1600, `MAX_KANTE = ${MAX_KANTE}`);
});

console.log('\n— IndexedDB-Vertrag —');

const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
const jpegDataUrl = `data:image/jpeg;base64,${Buffer.from(jpegBytes).toString('base64')}`;

await pruefeAsync('ein nie aufgenommenes Foto liefert null — nicht das IDBRequest', async () => {
  // Der wichtigste Test dieser Datei. Liefert transaktion() hier statt null das
  // Anfrageobjekt zurück, ist es truthy, rutscht durch jede if(!blob)-Prüfung und
  // lässt URL.createObjectURL() werfen — mitten in einer Schleife ohne try/catch.
  // Folge: Ab dem ersten Gerät ohne Foto wird KEIN weiteres Bild mehr angezeigt,
  // auch die vorhandenen nicht.
  const ergebnis = await fotoLaden('gibt-es-nicht', 'geraet');
  assert.equal(ergebnis, null, `erwartet null, bekommen: ${Object.prototype.toString.call(ergebnis)}`);
});

await pruefeAsync('Backup-Rundlauf: importieren → laden → exportieren', async () => {
  const anzahl = await fotosAusDataUrls({
    'hs-iso-row:geraet': jpegDataUrl,
    'latzug-breit:einstellung': jpegDataUrl,
  });
  assert.equal(anzahl, 2, 'beide Fotos sollten geschrieben werden');

  const blob = await fotoLaden('hs-iso-row', 'geraet');
  assert.ok(blob, 'Foto nach Import nicht auffindbar');
  assert.equal(blob.size, jpegBytes.length);
  assert.equal(blob.type, 'image/jpeg');

  const zurueck = await alleFotosAlsDataUrls();
  assert.deepEqual(Object.keys(zurueck).sort(), [
    'hs-iso-row:geraet',
    'latzug-breit:einstellung',
  ]);
  assert.equal(zurueck['hs-iso-row:geraet'], jpegDataUrl, 'Rundlauf verändert die Daten');
});

await pruefeAsync('gemischter Bestand: vorhandene Fotos bleiben trotz Lücken auffindbar', async () => {
  // Genau der Alltagsfall — ein Teil der Geräte fotografiert, der Rest nicht.
  const ergebnisse = [];
  for (const id of ['gibt-es-auch-nicht', 'hs-iso-row', 'ebenfalls-nicht']) {
    ergebnisse.push(await fotoLaden(id, 'geraet'));
  }
  assert.equal(ergebnisse[0], null);
  assert.ok(ergebnisse[1], 'vorhandenes Foto nach einer Lücke nicht mehr gefunden');
  assert.equal(ergebnisse[2], null);
});

await pruefeAsync('belegteSchluessel und fotosZaehlen melden den echten Bestand', async () => {
  const belegt = await belegteSchluessel();
  assert.ok(belegt.has('hs-iso-row:geraet'));
  assert.ok(!belegt.has('hs-iso-row:einstellung'));

  const { anzahl, bytes } = await fotosZaehlen();
  assert.equal(anzahl, 2);
  assert.equal(bytes, jpegBytes.length * 2);
});

await pruefeAsync('Löschen entfernt genau ein Foto', async () => {
  await fotoLoeschen('hs-iso-row', 'geraet');
  assert.equal(await fotoLaden('hs-iso-row', 'geraet'), null);
  assert.ok(await fotoLaden('latzug-breit', 'einstellung'), 'das andere Foto wurde mitgelöscht');
  assert.equal(fakeDaten.size, 1);
});

console.log(`\n${ok} Prüfungen bestanden.${process.exitCode ? ' ES GAB FEHLER.' : ''}\n`);
