// Fotospeicher.
//
// Warum IndexedDB und nicht localStorage: localStorage ist auf etwa 5 MB gedeckelt
// und nimmt nur Zeichenketten. Fotos als Base64 würden das sofort sprengen und
// dabei die Trainingshistorie mit hinausdrücken — also genau das Wichtigste an der
// App zerstören. IndexedDB nimmt Blobs direkt und hat bei einer Homescreen-Web-App
// faktisch keine relevante Grenze.
//
// Die Trainingsdaten bleiben bewusst in localStorage: klein, synchron lesbar, und
// der Kern der App. Die will ich nicht auf eine asynchrone Schnittstelle umbauen,
// nur weil Fotos dazukommen.

const DB_NAME = 'fitx-trainer-fotos';
const SPEICHER = 'fotos';
const DB_VERSION = 1;

/** Die beiden Fotoarten je Übung. */
export const FOTO_ARTEN = {
  geraet: 'Gerät',
  einstellung: 'Einstellung',
};

/**
 * Schlüssel für ein Foto.
 *
 * Fotos hängen an der ÜBUNGSVARIANTE, nicht am Bewegungsmuster — genau wie die
 * Historie. Weichst du auf die Kurzhantel aus, siehst du das Kurzhantel-Foto und
 * nicht das der Maschine.
 */
export function fotoSchluessel(uebungId, art) {
  return `${uebungId}:${art}`;
}

let dbVersprechen = null;

function db() {
  if (dbVersprechen) return dbVersprechen;
  dbVersprechen = new Promise((erfuellen, ablehnen) => {
    if (!globalThis.indexedDB) return ablehnen(new Error('IndexedDB nicht verfügbar'));
    const anfrage = indexedDB.open(DB_NAME, DB_VERSION);
    anfrage.onupgradeneeded = () => {
      const datenbank = anfrage.result;
      if (!datenbank.objectStoreNames.contains(SPEICHER)) {
        datenbank.createObjectStore(SPEICHER);
      }
    };
    anfrage.onsuccess = () => erfuellen(anfrage.result);
    anfrage.onerror = () => ablehnen(anfrage.error);
  });
  return dbVersprechen;
}

function transaktion(modus, arbeit) {
  return db().then(
    (datenbank) =>
      new Promise((erfuellen, ablehnen) => {
        const tx = datenbank.transaction(SPEICHER, modus);
        const speicher = tx.objectStore(SPEICHER);
        let ergebnis;
        try {
          ergebnis = arbeit(speicher);
        } catch (e) {
          return ablehnen(e);
        }
        tx.oncomplete = () => erfuellen(ergebnis?.result ?? ergebnis);
        tx.onerror = () => ablehnen(tx.error);
        tx.onabort = () => ablehnen(tx.error);
      })
  );
}

// ── Lesen und Schreiben ──────────────────────────────────────────────────────

/** Speichert ein Foto — verkleinert es vorher. */
export async function fotoSpeichern(uebungId, art, datei) {
  const klein = await verkleinern(datei);
  await transaktion('readwrite', (s) => s.put(klein, fotoSchluessel(uebungId, art)));
  return klein;
}

/** Liefert das Foto als Blob oder null. */
export async function fotoLaden(uebungId, art) {
  try {
    return (await transaktion('readonly', (s) => s.get(fotoSchluessel(uebungId, art)))) || null;
  } catch (e) {
    console.warn('Foto nicht lesbar:', e);
    return null;
  }
}

export function fotoLoeschen(uebungId, art) {
  return transaktion('readwrite', (s) => s.delete(fotoSchluessel(uebungId, art)));
}

/** Alle Schlüssel, die überhaupt ein Foto haben — für Vorschau-Markierungen. */
export async function belegteSchluessel() {
  try {
    const schluessel = await transaktion('readonly', (s) => s.getAllKeys());
    return new Set(schluessel || []);
  } catch {
    return new Set();
  }
}

/** Anzahl und Gesamtgröße — für die ehrliche Größenangabe in den Einstellungen. */
export async function fotosZaehlen() {
  try {
    const blobs = (await transaktion('readonly', (s) => s.getAll())) || [];
    return {
      anzahl: blobs.length,
      bytes: blobs.reduce((n, b) => n + (b?.size || 0), 0),
    };
  } catch {
    return { anzahl: 0, bytes: 0 };
  }
}

// ── Backup ───────────────────────────────────────────────────────────────────

/** Alle Fotos als { schluessel: dataURL } — so wandern sie in die Backup-Datei. */
export async function alleFotosAlsDataUrls() {
  let schluessel = [];
  let blobs = [];
  try {
    schluessel = (await transaktion('readonly', (s) => s.getAllKeys())) || [];
    blobs = (await transaktion('readonly', (s) => s.getAll())) || [];
  } catch {
    return {};
  }
  const ergebnis = {};
  for (let i = 0; i < schluessel.length; i++) {
    if (blobs[i]) ergebnis[schluessel[i]] = await blobTextUrl(blobs[i]);
  }
  return ergebnis;
}

/** Schreibt Fotos aus einem Backup zurück. Bestehende werden ersetzt. */
export async function fotosAusDataUrls(objekt) {
  if (!objekt || typeof objekt !== 'object') return 0;
  let n = 0;
  for (const [schluessel, dataUrl] of Object.entries(objekt)) {
    const blob = dataUrlZuBlob(dataUrl);
    if (!blob) continue;
    await transaktion('readwrite', (s) => s.put(blob, schluessel));
    n++;
  }
  return n;
}

function blobTextUrl(blob) {
  return new Promise((erfuellen) => {
    const leser = new FileReader();
    leser.onload = () => erfuellen(leser.result);
    leser.onerror = () => erfuellen(null);
    leser.readAsDataURL(blob);
  });
}

/** data:image/jpeg;base64,… → Blob. Gibt null zurück, wenn die Zeichenkette nicht passt. */
export function dataUrlZuBlob(dataUrl) {
  if (typeof dataUrl !== 'string') return null;
  const treffer = /^data:([^;,]+)(;base64)?,(.*)$/s.exec(dataUrl);
  if (!treffer) return null;
  const [, typ, base64, nutzlast] = treffer;
  try {
    if (base64) {
      const roh = atob(nutzlast);
      const bytes = new Uint8Array(roh.length);
      for (let i = 0; i < roh.length; i++) bytes[i] = roh.charCodeAt(i);
      return new Blob([bytes], { type: typ });
    }
    return new Blob([decodeURIComponent(nutzlast)], { type: typ });
  } catch {
    return null;
  }
}

// ── Verkleinern ──────────────────────────────────────────────────────────────

export const MAX_KANTE = 1200;
export const JPEG_QUALITAET = 0.75;

/**
 * Rechnet ein Foto auf eine vernünftige Größe herunter.
 *
 * Ein iPhone-Foto hat 3–5 MB. Ungefiltert gespeichert wären 94 Fotos deutlich über
 * 300 MB — das würde nicht nur Platz kosten, sondern auch das Backup unbrauchbar
 * groß machen. 1200 px reichen locker, um ein Gerät wiederzuerkennen.
 */
export async function verkleinern(datei) {
  const bild = await bildLaden(datei);
  const groesste = Math.max(bild.width, bild.height);
  const faktor = groesste > MAX_KANTE ? MAX_KANTE / groesste : 1;
  const breite = Math.round(bild.width * faktor);
  const hoehe = Math.round(bild.height * faktor);

  const leinwand = document.createElement('canvas');
  leinwand.width = breite;
  leinwand.height = hoehe;
  leinwand.getContext('2d').drawImage(bild, 0, 0, breite, hoehe);
  bild.close?.();

  const blob = await new Promise((erfuellen) =>
    leinwand.toBlob(erfuellen, 'image/jpeg', JPEG_QUALITAET)
  );
  // Falls toBlob wider Erwarten scheitert, lieber das Original behalten als nichts.
  return blob || datei;
}

function bildLaden(datei) {
  // createImageBitmap dreht das Bild anhand der EXIF-Daten korrekt — ohne das
  // stehen Hochformat-Fotos vom iPhone auf dem Kopf oder seitlich.
  if (globalThis.createImageBitmap) {
    return createImageBitmap(datei, { imageOrientation: 'from-image' }).catch(() =>
      ueberImgElement(datei)
    );
  }
  return ueberImgElement(datei);
}

function ueberImgElement(datei) {
  return new Promise((erfuellen, ablehnen) => {
    const url = URL.createObjectURL(datei);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      erfuellen(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      ablehnen(new Error('Bild konnte nicht gelesen werden'));
    };
    img.src = url;
  });
}

// ── Anzeige ──────────────────────────────────────────────────────────────────

const urlZwischenspeicher = new Map();

/**
 * Object-URL für die Anzeige. Wird zwischengespeichert, damit ein Neuzeichnen der
 * Trainingsansicht nicht bei jedem Satz neue URLs erzeugt und den Speicher vollmüllt.
 */
export async function fotoUrl(uebungId, art) {
  const schluessel = fotoSchluessel(uebungId, art);
  if (urlZwischenspeicher.has(schluessel)) return urlZwischenspeicher.get(schluessel);
  const blob = await fotoLaden(uebungId, art);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlZwischenspeicher.set(schluessel, url);
  return url;
}

/** Nach Ersetzen oder Löschen aufrufen, sonst zeigt die Ansicht das alte Bild. */
export function urlVergessen(uebungId, art) {
  const schluessel = fotoSchluessel(uebungId, art);
  const url = urlZwischenspeicher.get(schluessel);
  if (url) {
    URL.revokeObjectURL(url);
    urlZwischenspeicher.delete(schluessel);
  }
}

/** Bytes lesbar machen: 1834782 → "1,8 MB" */
export function groesseLesbar(bytes) {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}
