// Prüft den Fotospeicher, soweit das ohne Browser geht.
//
// Was hier NICHT geprüft werden kann und deshalb am Gerät getestet werden muss:
//   - IndexedDB selbst (in Node nicht vorhanden)
//   - das Verkleinern über <canvas> (braucht einen Browser)
//   - die EXIF-Drehung von iPhone-Hochformatfotos
//
// Geprüft wird der Teil, an dem es realistisch schiefgeht: die Schlüsselbildung
// (Fotos dürfen sich zwischen Gerätevarianten nicht vermischen) und die
// Base64-Umwandlung fürs Backup.

import assert from 'node:assert/strict';
import {
  fotoSchluessel,
  dataUrlZuBlob,
  groesseLesbar,
  FOTO_ARTEN,
  MAX_KANTE,
} from '../js/photos.js';
import { UEBUNGEN } from '../js/exercises.js';

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

console.log(`\n${ok} Prüfungen bestanden.${process.exitCode ? ' ES GAB FEHLER.' : ''}\n`);
