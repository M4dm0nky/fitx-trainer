# Weiterbauen

Die Praxis: lokal starten, testen, ausliefern — plus die Stolpersteine dieser
Umgebung, die sonst jeder erneut bezahlt.

---

## Lokal starten

```powershell
cd C:\Dropbox\Incomming\github\fitx-trainer
python -m http.server 8000
```

Am Rechner `http://localhost:8000` öffnen. Vom iPhone im selben WLAN über
`http://<IP-des-Rechners>:8000` — IP per `ipconfig` ermitteln.

**Ein Doppelklick auf `index.html` funktioniert nicht.** ES-Module brauchen HTTP;
über `file://` blockiert der Browser sie.

## Tests

```powershell
node test\logik.test.mjs        # 25 Prüfungen
node test\ansichten.test.mjs    # 17 Prüfungen
node test\fotos.test.mjs        # 13 Prüfungen
```

Keine Abhängigkeiten, kein `npm install` — reines Node.

### Was sie abdecken

| Datei | Inhalt |
|---|---|
| `logik` | Bibliothek (eindeutige IDs, gültige Muster, Erkennungstexte), Pläne (Satzzahlen, Wochenvolumen im Korridor, kein Beintraining), Plan-Wechsel, **Historie je Variante**, Formatierung |
| `ansichten` | rendert jede Ansicht gegen einen simulierten Speicher — fängt Laufzeitfehler, die eine Syntaxprüfung nicht sieht. Prüft auch `inputmode`, RIR-Platzhalter und HTML-Maskierung |
| `fotos` | Schlüsselbildung, Base64-Umwandlung, IndexedDB-Vertrag gegen eine Attrappe, Backup-Rundlauf |

### Was strukturell nicht abgedeckt werden kann

Kamera, echtes IndexedDB, `<canvas>`-Verkleinerung, EXIF-Drehung, Aussehen,
Touch-Verhalten. Siehe [00-projektstatus.md](00-projektstatus.md), Abschnitt
„Was ungetestet ist". Wer einen Fehler sucht, schaut dort zuerst.

### Zusätzliche Prüfungen von Hand

```powershell
# Syntaxprüfung aller Module (node --check braucht die Endung .mjs)
$tmp = Join-Path $env:TEMP ("chk-" + (Get-Random)); New-Item -ItemType Directory -Force $tmp | Out-Null
Get-ChildItem js -Recurse -Filter *.js | ForEach-Object {
  $z = Join-Path $tmp ($_.BaseName + '.mjs'); Copy-Item $_.FullName $z
  $null = node --check $z; if ($LASTEXITCODE) { "FEHLER: $($_.Name)" }
}

# Zoom-Regel (siehe 03-unantastbare-regeln.md)
Select-String -Path js\*.js,js\views\*.js,css\*.css,index.html `
  -Pattern 'user-scalable|maximum-scale|touch-action\s*:\s*none|preventDefault|touchmove|gesturestart'
```

---

## Ausliefern

```powershell
git add -A
git commit -m "..."
git push origin main
```

GitHub Pages baut automatisch aus `main` / `/ (root)`. Der Build dauert **20–40
Sekunden**. Erkennen, ob er durch ist:

```powershell
# Auf einen Marker aus der neuen Fassung prüfen
(Invoke-WebRequest 'https://m4dm0nky.github.io/fitx-trainer/js/photos.js' -UseBasicParsing).Content -match 'einMarkerAusDeinerAenderung'

# Oder direkt den Build-Status
gh api repos/M4dm0nky/fitx-trainer/pages/builds/latest
```

Danach am iPhone neu laden.

**`.nojekyll` bitte im Repo lassen.** Ohne die Datei verarbeitet Jekyll den Ordner
und kann Dateien verschlucken.

---

## Stolpersteine dieser Umgebung

Alle beim Bau der App tatsächlich aufgetreten und Zeit gekostet.

### PowerShell hängt beim Piping eine BOM an

Text per Pipe an ein natives Programm zu schicken, fügt eine Byte Order Mark hinzu.
Das ließ zweimal Befehle scheitern:

- `gh api ... --input -` → `Problems parsing JSON (HTTP 400)`
- `git credential fill` → `refusing to work with credential missing protocol field`

**Lösung:** Nie per Pipe, sondern über eine Datei:

```powershell
gh api --method POST repos/.../pages --input pages.json
```

### Das Arbeitsverzeichnis springt zurück

`Set-Location` hält nicht zuverlässig über Befehle hinweg — teilweise wird das
Verzeichnis auf den Ausgangspunkt zurückgesetzt. **Immer absolute Pfade** oder
`git -C <pfad>` benutzen.

### Laufende Server sperren Ordner

Ein laufender `python -m http.server` verhindert `Move-Item` auf das Verzeichnis
(„Der Prozess kann nicht auf die Datei zugreifen"). Vorher beenden:

```powershell
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
```

Gelegentlich hilft ein zweiter Versuch nach ein, zwei Sekunden — Dropbox und die
Dateiüberwachung von VSCode greifen kurzzeitig zu.

### `gh auth login` ist interaktiv

Braucht Tastatureingaben und einen Browser mit Einmal-Code. Nicht automatisierbar —
der Nutzer muss das in einem eigenen Fenster erledigen.

### Neu installierte Programme fehlen im PATH

Nach `winget install` kennt ein bereits geöffnetes Fenster den neuen PATH-Eintrag
nicht. Entweder neues Fenster öffnen oder den vollen Pfad benutzen
(`"C:\Program Files\GitHub CLI\gh.exe"`).

### Umlaute in Commit-Nachrichten

Mehrzeilige Nachrichten mit Anführungszeichen zerlegt PowerShell. Über eine Datei
gehen: `git commit -F nachricht.txt`.

---

## Entscheidungslog

Was verworfen wurde und warum. Damit niemand dieselbe Alternative erneut vorschlägt,
ohne den Grund zu kennen.

| Verworfen | Grund |
|---|---|
| **Push/Pull-Split** | Jede Muskelgruppe nur 1,75-mal pro Woche statt 3,5-mal. Bei zwei Plänen und Zwei-Tage-Takt die schlechtere Wahl. |
| **23–25 Sätze je Einheit** | Ergäbe über 30 Sätze pro Muskelgruppe und Woche — jenseits der Regeneration. Siehe Rechenweg in [01](01-zweck-und-hintergrund.md). |
| **Fremde Produktfotos** | Urheberrecht, Repo ist öffentlich. Siehe [03](03-unantastbare-regeln.md), Regel 3. |
| **Fotos im localStorage** | 5-MB-Deckel; die Fotos würden die Trainingshistorie verdrängen. |
| **Wochentagsbasierter Planvorschlag** | Der Nutzer trainiert alle zwei Tage, nicht an festen Tagen. Der Vorschlag kommt aus der Historie (`naechsterPlan()`). |
| **React / Vite / npm** | Kein Build-Schritt = keine Pipeline, die kaputtgeht. Die App ist klein genug. |
| **History-API-Routing** | GitHub Pages liefert bei Direktaufruf 404. Hash-Routing löst das. |
| **`capture`-Attribut am Datei-Feld** | Würde die Mediathek sperren; so bietet iOS „Aufnehmen" **und** „Mediathek". |
| **Vibration als Timer-Signal** | Safari unterstützt die Vibration-API nicht. Ton ist das einzige verlässliche Signal. |

---

## Der Code-Review-Fund (lehrreich)

In `86fce37` behoben. Wert, ihn zu kennen, weil das Fehlermuster wiederkommen kann.

**Der Fehler:** `transaktion()` in `js/photos.js` gab `ergebnis?.result ?? ergebnis`
zurück. Bei einem fehlenden Schlüssel liefert IndexedDB laut Spezifikation eine
**erfolgreiche** Anfrage mit `result === undefined`. Der `??`-Rückfall machte daraus
also das `IDBRequest`-Objekt selbst.

**Die Folgekette:** `fotoLaden()` gab statt `null` ein truthy Objekt zurück →
`fotoUrl()` rutschte durch seine `if (!blob)`-Prüfung → `URL.createObjectURL()` warf
einen `TypeError` mitten in einer Schleife ohne `try/catch` → ab dem ersten Gerät
ohne Foto wurde **kein einziges weiteres Bild mehr angezeigt**, auch die vorhandenen
nicht.

**Warum er so schwer zu finden war:** Bei null Fotos passierte nichts Sichtbares
(die Platzhalter standen ohnehin da). Bei allen Fotos ebenfalls nicht. Kaputt war
ausschließlich der **gemischte** Zustand — also genau der, den die Anleitung
empfiehlt („beim nächsten Training jeweils das Gerät fotografieren, an dem du gerade
stehst").

**Die Lehre:** Die ursprünglichen Tests sparten IndexedDB aus, mit der Begründung
„gibt es in Node nicht". Das stimmte, war aber die falsche Schlussfolgerung — eine
40-Zeilen-Attrappe des Vertrags hätte gereicht und den Fehler sofort gezeigt. Sie
steht jetzt in `test/fotos.test.mjs`. Wenn eine Schnittstelle nicht testbar
erscheint, lohnt die Frage, ob nicht wenigstens ihr *Vertrag* nachbildbar ist.

---

## Vor dem Ausliefern

- [ ] Alle drei Testdateien grün
- [ ] Zoom-Grep liefert nur Kommentare
- [ ] Bei Planänderungen: Volumenrechnung geprüft (der Logik-Test macht das mit)
- [ ] Bei neuen Übungen: `erkennung` ohne Ortsbehauptungen
- [ ] Nach dem Push: Build abgewartet und am iPhone neu geladen
