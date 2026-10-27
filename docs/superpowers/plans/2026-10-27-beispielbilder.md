# Beispielbilder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Jede Übung bekommt einen Knopf „Bilder im Netz“. Wo es ein passendes, frei lizenziertes Foto gibt, kommt ein Beispielbild mit Urhebernennung dazu.

**Architecture:**
- Ein neues Modul `js/bilder.js` hält die Bilddaten und die Suchbegriffe. Es ist getrennt von `js/exercises.js`.
- Die Bilddateien liegen unter `bilder/`.
- Die Ansichten (Training, Ausweich-Dialog, Einstellungen, Foto-Vollbild) lesen nur über `beispielbild()`, `suchUrl()` und `bildnachweise()`.
- Die Bilder werden vorher von Commons geholt. Opus prüft sie von Hand.

**Tech Stack:** Vanilla-JS-ES-Module ohne Build. Tests in reinem Node (`node test\*.test.mjs`). Python 3.14 mit Pillow nur als Werkzeug zum Bilderholen (`C:\Users\madma\AppData\Local\Python\pythoncore-3.14-64\python.exe`, ohne `-I`).

Spec: [docs/superpowers/specs/2026-10-27-beispielbilder-design.md](../specs/2026-10-27-beispielbilder-design.md)

## Global Constraints
- **Erlaubte Lizenzen:** nur CC0, Public Domain, CC BY (jede Version), CC BY-SA (jede Version). Kein NC, kein ND, keine Herstellerbilder.
- **Bilddateien:** `bilder/<uebungId>.jpg`, höchstens 800 px lange Kante, JPEG mit Qualität 80, jede Datei unter 200 KB.
- **Regel 1:** kein `touchmove`, kein `preventDefault`, kein `touch-action: none` und keine Viewport-Änderung. Der Zoom-Grep darf nur Kommentare finden.
- **Regel 4:** In neuen Texten keine Standortangaben.
- **Werte aus Daten** kommen immer durch `esc()` ins HTML.
- **Kommentare** auf Deutsch, im Stil der vorhandenen Dateien.
- **Keine npm-Abhängigkeiten.**
- **Prozesse:** keine Server oder Hintergrundprozesse liegen lassen, kein `python - <<EOF`, jede Netzabfrage mit Timeout.

---

### Task 1: Kandidaten von Commons sammeln (läuft parallel zu Task 2)

**Files:**
- Create (nur Scratchpad, nicht im Repo): `…/scratchpad/bilder/suche.py`, `kandidaten.json`, `blatt-<kategorie>-<n>.jpg`

**Produces:** `kandidaten.json` mit `{ uebungId: [ { nr, titel, url, beschreibungsseite, urheber, lizenz, lizenzUrl, breite, hoehe } ] }`, höchstens 4 Kandidaten je Übung. Dazu Kontaktbögen: ein Raster mit Vorschaubildern, beschriftet mit `uebungId` und `nr`, höchstens 12 Übungen je Bogen.

- [ ] Für jede der 47 Übungen aus `js/exercises.js` 1–3 englische Suchbegriffe bilden. Beispiele: `hs-chest-press` → "Hammer Strength chest press", "plate loaded chest press"; `brustpresse-pin` → "chest press machine"; `kh-bankdruecken` → "dumbbell bench press".
- [ ] Commons-API mit User-Agent `fitx-trainer/1.0 (emailanmadmax@gmail.com)` und Timeout 20 s abfragen:
  `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=10&gsrsearch=<begriff>&prop=imageinfo&iiprop=url|extmetadata|size&iiurlwidth=300`
- [ ] Nach Lizenz filtern. Maßgeblich ist `extmetadata.LicenseShortName`: erlaubt sind „CC0“, „Public domain“, „CC BY *“, „CC BY-SA *“; NC/ND fliegt raus. Urheber aus `Artist` als reinen Text ohne HTML übernehmen. Nur JPEG/PNG mit mindestens 400 px.
- [ ] Vorschauen laden (`thumburl`) und die Kontaktbögen mit Pillow bauen.
- [ ] Bericht: Anzahl der Übungen mit mindestens einem Kandidaten und die Pfade der Bögen. Danach keine Prozesse mehr offen.

### Task 2: Modul `js/bilder.js` und Oberfläche (läuft parallel zu Task 1)

**Files:**
- Create: `js/bilder.js`
- Modify:
  - `js/views/workout.js` (`geraetFindenRendern`, `fotosVerdrahten`)
  - `js/views/photoSheet.js` (neu: `beispielAnzeigen`)
  - `js/views/swapSheet.js` (`miniaturenNachladen`)
  - `js/views/settings.js` (neuer Abschnitt)
  - `css/app.css`
- Test: `test/logik.test.mjs`, `test/ansichten.test.mjs`

**Produces (`js/bilder.js`):**
```js
export const BEISPIELBILDER = {};   // { [uebungId]: { datei, urheber, lizenz, lizenzUrl, quelle } } — Task 4 füllt es
export const SUCHBEGRIFFE = {};     // { [uebungId]: 'Hammer Strength Iso-Lateral Chest Press' } — Ausnahmen
export const ERLAUBTE_LIZENZ = /^(CC0|Public domain|CC BY(-SA)? [\d.]+)/i;
export function beispielbild(uebungId) { return BEISPIELBILDER[uebungId] || null; }
export function suchbegriff(uebung) { /* SUCHBEGRIFFE[id] ?? name: 'HS ' → 'Hammer Strength ', 'KH-' → 'Kurzhantel ', ' Maschine' bleibt; bei kategorie 'pin'|'scheiben' ohne 'Maschine'/'Machine' im Namen ' Gerät' anhängen */ }
export function suchUrl(uebung) { return 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(suchbegriff(uebung)); }
export function bildnachweise(uebungen) { /* [{ uebungId, name, ...eintrag }] für alle Einträge mit Bild, sortiert nach name */ }
```

- [ ] **Tests zuerst** (`logik`):
  - `suchbegriff` für „HS Chest Press“ ergibt „Hammer Strength Chest Press“, für „KH-Curl“ „Kurzhantel Curl“.
  - Kein Suchbegriff einer der 47 Übungen enthält `HS ` oder `KH-`.
  - `suchUrl` beginnt mit `https://www.google.com/search?tbm=isch&q=` und ist kodiert.
  - Integrität für **jeden** Eintrag in `BEISPIELBILDER`:
    - Die ID steht in `UEBUNGEN`.
    - `datei`, `urheber`, `lizenz` und `quelle` sind nicht leer.
    - `ERLAUBTE_LIZENZ` passt.
    - `quelle` beginnt mit `https://commons.wikimedia.org/`.
    - Die Datei existiert (`fs.statSync(new URL('../' + datei, import.meta.url))`) und ist kleiner als 200 KB.

    Bei leerem Objekt läuft dieser Test einfach durch.
  - Rot laufen lassen, implementieren, Grün zeigen.
- [ ] **Tests zuerst** (`ansichten`), dabei im Test temporär `BEISPIELBILDER['hs-chest-press'] = { datei: 'bilder/hs-chest-press.jpg', urheber: 'Test Person', lizenz: 'CC BY-SA 4.0', lizenzUrl: 'https://creativecommons.org/licenses/by-sa/4.0', quelle: 'https://commons.wikimedia.org/wiki/File:X.jpg' }` setzen und hinterher wieder löschen:
  - Die Trainingsansicht enthält `data-beispiel="hs-chest-press"`, `src="bilder/hs-chest-press.jpg"`, „Test Person“ und „CC BY-SA 4.0“.
  - Sie enthält genau 7 Suchlinks (`class="bildsuche"`) mit `target="_blank"` und `rel="noopener"`.
  - Die Einstellungen enthalten „Bildnachweise“ und „Test Person“. Ohne Einträge stattdessen den Satz „Noch keine Beispielbilder hinterlegt.“
  - Ein Urheber mit `<b>` erscheint maskiert.
- [ ] **Umsetzung** `geraetFindenRendern(uebungId, uebung)`:
  - Vor der `foto-reihe`, wenn `beispielbild(uebungId)` existiert:
    `<button type="button" class="beispiel-feld" data-beispiel="ID"><img src="DATEI" alt="Beispiel: NAME" loading="lazy" /><span class="foto-marke">Beispiel</span></button><p class="bildnachweis">Foto: URHEBER · <a href="LIZENZURL" target="_blank" rel="noopener">LIZENZ</a> · <a href="QUELLE" target="_blank" rel="noopener">Wikimedia Commons</a></p>`
  - Nach der `foto-reihe` immer: `<a class="knopf knopf-klein bildsuche" href="SUCHURL" target="_blank" rel="noopener">🔎 Bilder im Netz</a>`
  - Alle Werte gehen durch `esc()`.
- [ ] `fotosVerdrahten`: `beiKlick(wurzel, '[data-beispiel]', …)` ruft `beispielAnzeigen(uebung.name, eintrag)` aus `photoSheet.js` auf.
- [ ] `photoSheet.js`: `export function beispielAnzeigen(uebungName, bild)` öffnet dasselbe Vollbild-Overlay wie `fotoAnzeigen`. Unterschiede:
  - kein `fotoUrl`, sondern `src = bild.datei`
  - nur der Knopf „Schließen“
  - darunter die Nennung wie oben

  Vorher prüfen, wie `fotoAnzeigen` das Overlay baut, und den Overlay-Teil wiederverwenden, statt ihn zu kopieren (ggf. eine kleine interne Funktion herausziehen). Kein Touch-Handler.
- [ ] `swapSheet.js` `miniaturenNachladen`: Liefert `fotoUrl(id,'geraet')` nichts, wird stattdessen `beispielbild(id)?.datei` genutzt.
- [ ] `settings.js`: Abschnitt `<div class="abschnitt-titel">Bildnachweise</div><section class="karte">…</section>` als letzter Abschnitt.
  - Inhalt: Liste aus `bildnachweise(UEBUNGEN)`, je Zeile Name, Urheber, Lizenz-Link und Commons-Link.
  - Davor der Satz: „Beispielbilder von Wikimedia Commons unter freier Lizenz. Deine eigenen Fotos bleiben nur auf deinem Gerät.“
  - Ohne Einträge den Leer-Satz.
- [ ] CSS:
  - `.beispiel-feld` im Stil von `.foto-feld`, volle Breite, 4:3, `object-fit: cover`, abgerundet
  - `.bildnachweis` mit 12 px, gedämpfter Farbe, Umbruch erlaubt
  - `.bildsuche` mit `display:inline-flex` und `margin-top:10px`
  - Akzentrahmen für das Beispielbild, gedämpft
- [ ] Alle vier Testdateien grün, Zoom-Grep sauber. Nicht committen, Opus committet.

### Task 3: Bilder auswählen (Opus selbst)
- [ ] Die Kontaktbögen aus Task 1 ansehen. Je Übung höchstens einen Kandidaten wählen, und nur wenn er **eindeutig** die richtige Geräteart zeigt: Steckgewicht mit Gewichtspaket, Plate-Loaded mit Scheibendornen, Hantel bzw. Station bei Freihantel. Im Zweifel keinen.
- [ ] Die Auswahl als `{ uebungId: nr }` in `…/scratchpad/bilder/auswahl.json` schreiben.

### Task 4: Bilder einbauen
**Files:** Create `bilder/*.jpg`. Modify `js/bilder.js` (nur `BEISPIELBILDER`).
- [ ] Für jede Auswahl das Original über `url` laden (Timeout, User-Agent wie in Task 1).
- [ ] Mit Pillow bearbeiten: `ImageOps.exif_transpose`, nach RGB, lange Kante auf 800 px, JPEG mit Qualität 80 und `optimize=True`. Ziel ist `bilder/<uebungId>.jpg`.
- [ ] Den `BEISPIELBILDER`-Eintrag mit `datei`, `urheber` (Text, ohne HTML, gekürzt auf höchstens 80 Zeichen), `lizenz` (LicenseShortName), `lizenzUrl` und `quelle` (Beschreibungsseite) schreiben.
- [ ] `node test\logik.test.mjs` muss grün sein, weil die Integritätsprüfung jetzt echt greift. Mit Absicht einmal `lizenz: 'CC BY-NC 4.0'` eintragen: Der Test muss rot werden. Danach zurücksetzen.

### Task 5: Doku, Prüfung, Auslieferung (Opus)
- [ ] `docs/03-unantastbare-regeln.md`, Regel 3 ergänzen: freie Lizenz plus Nachweis in `js/bilder.js`, erlaubte Lizenzen, Prüfung über den Logik-Test.
- [ ] `docs/00-projektstatus.md` und `docs/04-weiterbauen.md` aktualisieren (Funktion, Testzahlen, Dateiliste mit `js/bilder.js` und `bilder/`).
- [ ] Alle vier Tests grün, Zoom-Grep sauber.
- [ ] Headless-Edge-Durchlauf (Kopie im Scratchpad, Server danach beenden):
  - „Gerät finden“ einer Übung mit Bild aufklappen: `naturalWidth > 0`
  - Klick auf das Beispielbild öffnet das Overlay
  - Suchlink vorhanden
  - Einstellungen zeigen die Bildnachweise
  - Dazu ein Screenshot zur Sichtprüfung
- [ ] Ein Commit auf `feature/beispielbilder`, Fast-Forward nach `main`, Push. Danach den Pages-Build per Marker abwarten.
