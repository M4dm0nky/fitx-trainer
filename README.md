# FitX Trainer

Trainingsplaner für FitX-Studios. Zwei Oberkörperpläne im Wechsel, Gewichtsprotokoll
mit „Letztes Mal"-Anzeige und Ausweichgeräte für den Fall, dass das Studio voll ist.

Läuft als statische Seite auf GitHub Pages. Kein Server, kein Konto, keine laufenden
Kosten — alle Daten bleiben im Browser deines iPhones.

---

## Auf dem iPhone einrichten

1. Die Seite in **Safari** öffnen (nicht Chrome — nur Safari kann Homescreen-Apps anlegen).
2. Auf das **Teilen-Symbol** unten tippen.
3. **„Zum Home-Bildschirm"** wählen.
4. Die App startet danach über das Icon, ohne Safari-Adressleiste.

Zwei Finger zum Zoomen funktionieren überall — falls du im Studio etwas nicht lesen
kannst, einfach aufziehen.

## So ist das Training gedacht

**Rhythmus:** alle zwei Tage, Plan A und B im Wechsel. Die App merkt sich, welcher
Plan zuletzt dran war, und schlägt automatisch den anderen vor. Weil du nicht an
festen Wochentagen trainierst, geht sie bewusst nicht nach dem Kalender.

**Plan A (horizontal):** Chest Press · Iso-Lateral Row · Schulterpresse · Butterfly ·
Trizeps · Kabel-Crunch · Beinheben

**Plan B (vertikal):** Latzug · Schrägdrücken · High Row · Bizeps-Curl · Seitheben ·
Reverse Butterfly · Rotary Torso

Je 20 Arbeitssätze, rund 50–55 Minuten. Bei 3,5 Einheiten pro Woche ergibt das 15–16
Sätze pro Muskelgruppe und Woche — der Bereich, in dem die Forschung den besten
Ertrag sieht.

**Kein Beintraining** — bewusst so.

## Die zwei wichtigsten Funktionen

### „Letztes Mal"

Beim Öffnen einer Übung steht ganz oben, womit du zuletzt gearbeitet hast. Die
Eingabefelder sind bereits damit vorbefüllt:

- Gleich geblieben? Einmal auf den Haken tippen — fertig.
- Mehr geschafft? Zahl anpassen, dann Haken.

Der Pausentimer startet automatisch mit.

### „Gerät belegt?"

Neben jeder Übung. Öffnet die Alternativen in allen drei Kategorien:

- **Freihantel** — Kurzhanteln, SZ-Stange, Multipresse, Klimmzug-/Dip-Station
- **Steckgewicht** — Technogym-Maschinen mit Pin, alle Kabelzüge
- **Scheiben** — Hammer Strength, wo Hantelscheiben aufgelegt werden

Bei jeder Alternative steht direkt deine eigene Historie dabei — du weißt also schon
beim Hingehen, was du auflegen musst.

**Wichtig:** Jede Gerätevariante hat ihre **eigene** Historie. 45 kg an der
Pin-Maschine, 2 × 16 kg Kurzhanteln und 40 kg Scheiben sind physikalisch nicht
dasselbe — andere Hebel, anderes Schlittengewicht, andere Stabilisation. Ein
gemeinsamer Verlauf würde Sprünge zeigen, die nichts mit deiner Kraft zu tun haben.

Standardmäßig gilt ein Wechsel **nur für heute**; der Plan bleibt unverändert. Wenn
dir eine Variante grundsätzlich besser liegt, kannst du sie als Standard übernehmen.

### „Gerät finden"

Aufklappbar bei jeder Übung — gegen das Problem, dass „HS Iso-Lateral Row" vor 200
Geräten nichts sagt.

**Erkennungstext:** Bauform, wie die Last angehängt wird (Pin, Scheiben, Kurzhantel),
und die Abgrenzung zum Verwechslungskandidaten. Das Wichtigste ist nicht „so sieht es
aus", sondern „nicht verwechseln mit …" — denn das eigentliche Risiko ist, versehentlich
ein anderes Gerät zu nehmen und damit die Historie zu verfälschen.

Bewusst **keine** Standortangaben wie „hinten links": Die Aufteilung unterscheidet sich
je Filiale, und eine falsche Wegbeschreibung ist schlimmer als gar keine. Ein Test
verhindert, dass sich solche Formulierungen einschleichen.

**Zwei eigene Fotos je Gerät:**

- **Gerät** — zum Wiederfinden. Zeigt nebenbei, wo es in *deinem* Studio steht.
- **Einstellung** — deine Sitzhöhe bzw. Hebelposition. Ersetzt Notizen wie
  „Sitz Position 4" durch etwas Eindeutiges.

Die Fotos hängen an der **Gerätevariante**, genau wie die Historie. Weichst du auf die
Kurzhantel aus, siehst du das Kurzhantel-Foto. Im „Gerät belegt?"-Dialog erscheinen die
Bilder als Miniaturen bei den Alternativen.

Praktisch entstehen die Fotos nicht auf einen Schlag, sondern nebenbei: beim nächsten
Training jeweils das Gerät fotografieren, an dem du gerade stehst.

Fremde Produktfotos sind bewusst nicht enthalten — Bilder von Hammer Strength und
Technogym sind urheberrechtlich geschützt und dürfen nicht in ein öffentliches Repo.

## Datensicherung

Trainingsdaten liegen im `localStorage`, Fotos in `IndexedDB` — beides nur auf diesem
Gerät. Das heißt konkret:

- **Safari-Website-Daten löschen → alles weg.**
- **Gerätewechsel → Daten bleiben auf dem alten Gerät.**

Deshalb: unter **Mehr → Backup erstellen** regelmäßig eine JSON-Datei erzeugen und in
iCloud Drive oder Dropbox ablegen. Die Fotos sind darin enthalten, die Datei wird dadurch
einige MB groß. Zurückspielen geht über **Backup einspielen**.

**Immer über das Homescreen-Icon starten, nicht über ein Safari-Lesezeichen.** Safari
löscht bei normalen Websites nach sieben Tagen ohne Nutzung sämtliche Skript-Daten (ITP).
Home-Screen-Web-Apps haben einen eigenen Nutzungszähler und sind davon ausgenommen — und
bekommen bis zu 60 % des Gerätespeichers statt der üblichen 20 %.

Nicht im privaten Safari-Modus benutzen — dort ist der Speicher gesperrt.

## Signalton

Der Pausentimer meldet sich mit einem Ton. **Vibration funktioniert auf dem iPhone
nicht** — Safari unterstützt die Vibration-API schlicht nicht. Bei stummgeschaltetem
Gerät bleibt also nur der Blick auf den Fortschrittsbalken.

---

## Lokal testen

```bash
python -m http.server 8000
```

Dann `http://localhost:8000` am Rechner öffnen. Vom iPhone aus im selben WLAN über
`http://<IP-des-Rechners>:8000` (IP per `ipconfig` ermitteln).

ES-Module brauchen HTTP — ein direkter Doppelklick auf `index.html` funktioniert nicht.

## Tests

```bash
node test/logik.test.mjs      # Bibliothek, Pläne, Volumen, Historie je Variante
node test/ansichten.test.mjs  # rendert jede Ansicht gegen einen simulierten Speicher
node test/fotos.test.mjs      # Schlüsselbildung, Base64-Umwandlung fürs Backup
```

Keine Abhängigkeiten, kein `npm install` — reines Node. 50 Prüfungen.

Die wichtigste darin: Wenn du an der Pin-Maschine 45 kg gemacht hast und danach auf die
Kurzhantel ausweichst, darf dort **nicht** 45 kg auftauchen. Genau das wird explizit
getestet.

Nicht abgedeckt (braucht ein echtes Gerät): IndexedDB selbst, das Verkleinern über
`<canvas>` und die EXIF-Drehung von iPhone-Hochformatfotos.

## Auf GitHub Pages veröffentlichen

```bash
git init
git add -A
git commit -m "FitX Trainer"
git branch -M main
git remote add origin https://github.com/<DEIN-NAME>/fitx-trainer.git
git push -u origin main
```

Danach im Repo: **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`**.

Nach ein bis zwei Minuten erreichbar unter
`https://<DEIN-NAME>.github.io/fitx-trainer/`.

## Aufbau des Codes

| Datei | Aufgabe |
|---|---|
| `js/exercises.js` | Übungsbibliothek — je Gerätetyp ein eigener Eintrag |
| `js/plans.js` | Standardpläne A/B, Wechsel-Logik, Entlastungserinnerung |
| `js/store.js` | localStorage, Schema-Migration, Backup |
| `js/history.js` | „Letztes Mal" und Verlauf — **immer je Variante** |
| `js/timer.js` | Pausentimer mit Tonsignal |
| `js/views/workout.js` | Das Trainings-Kernstück |
| `js/views/swapSheet.js` | Ausweich-Dialog „Gerät belegt?" |

Ein Plan besteht aus **Slots**, nicht aus Geräten. Ein Slot ist eine Aufgabe
(„Vertikales Drücken — Schulter") mit einem Standardgerät. Die Ausweichoptionen leitet
die App über das Feld `muster` automatisch ab: alle Übungen mit demselben
Bewegungsmuster, gruppiert nach Kategorie. Eine neue Übung in `exercises.js` taucht
dadurch sofort als Alternative auf, ohne dass irgendwo eine Liste gepflegt werden muss.

### Beim Ändern beachten

Der Viewport-Tag in `index.html` steht bewusst **ohne** `user-scalable=no` und **ohne**
`maximum-scale`. Beides würde den Pinch-Zoom abschalten. Ebenso: kein globales
`touch-action: none` im CSS und keine `touchmove`/`gesturestart`-Handler mit
`preventDefault()` — das ist der übliche Weg, wie Bottom-Sheets den Seiten-Zoom
unbeabsichtigt mit abschießen.
