# Beispielbilder und Bildersuche je Übung

**Stand:** 27.10.2026 · freigegeben vom Nutzer

## Ziel
Zu jeder Übung soll ein Vergleichsbild zu sehen sein, damit man das richtige Gerät findet: Steckgewicht-Maschine, Plate-Loaded mit Scheiben oder Hantel. Die eigenen Fotos bleiben zusätzlich bestehen.

## Rahmen: Regel 3 (keine fremden Produktfotos)
Das Repo ist öffentlich. Erlaubt sind nur Bilder von **Wikimedia Commons** unter **CC0, Public Domain, CC-BY oder CC-BY-SA**, mit Urhebernennung. Ausgeschlossen sind NC- und ND-Lizenzen, Herstellerbilder und Bilder ohne klare Lizenz. Jedes Bild prüft Opus von Hand: Zeigt es wirklich diese Geräteart? Passt kein Bild, bekommt die Übung keins. Ein falsches Bild ist schlimmer als keins, siehe Regel 2.

## Verhalten
- **„Gerät finden“** (Trainingsansicht):
  - Gibt es ein Beispielbild, steht es über den beiden eigenen Fotoplätzen, mit der Marke „Beispiel“ und darunter klein „Foto: Urheber · Lizenz“.
  - Antippen öffnet das Bild groß. Dafür wird die vorhandene Vollbildansicht genutzt, ohne die Knöpfe „Löschen“ und „Neu aufnehmen“. Zoomen geht nur über den Seiten-Zoom, siehe Regel 1.
- **Knopf „🔎 Bilder im Netz“** bei jeder Übung: öffnet `https://www.google.com/search?tbm=isch&q=<Suchbegriff>` in einem neuen Tab (`target="_blank" rel="noopener"`).
  - Der Suchbegriff ist der Gerätename in ausgeschriebener Form.
  - Ohne eigenen Eintrag wird er automatisch gebildet: „HS “ wird zu „Hammer Strength “, „KH-“ zu „Kurzhantel “, dazu kommt bei Bedarf „Maschine“ bzw. „Gym“.
- **Dialog „Gerät belegt?“:** Das Miniaturbild zeigt das eigene Gerätefoto. Fehlt es, erscheint das Beispielbild.
- **Einstellungen → „Bildnachweise“:** eine Liste aller Beispielbilder mit Übung, Urheber, Lizenz (verlinkt) und Commons-Seite (verlinkt).

## Technik
- Neues Modul `js/bilder.js`:
  - `BEISPIELBILDER = { [uebungId]: { datei, urheber, lizenz, lizenzUrl, quelle } }`
  - `SUCHBEGRIFFE = { [uebungId]: '…' }` für Ausnahmen
  - `beispielbild(uebungId)`: Eintrag oder `null`
  - `suchbegriff(uebung)` und `suchUrl(uebung)`
- Die Bilder liegen unter `bilder/<uebungId>.jpg`: auf höchstens 800 px lange Kante verkleinert, JPEG mit Qualität 80, also deutlich unter 150 KB je Bild.
- Die Bilddaten liegen bewusst getrennt von `js/exercises.js`. Die Bibliothek bleibt so lesbar, und die Bilddaten lassen sich als Ganzes erneuern.
- Eigene Übungen der Nutzer haben kein Beispielbild, nur den Suchknopf.

## Tests
- `test/logik.test.mjs`:
  - Jeder Eintrag hat `datei`, `urheber`, `lizenz` und `quelle`.
  - Die Lizenz ist eine erlaubte (CC0, PD, CC BY, CC BY-SA).
  - Die Datei existiert und ist kleiner als 200 KB.
  - Jede ID ist eine bekannte Übung.
  - Die Suchbegriffe enthalten kein „HS “ und kein „KH-“.
- `test/ansichten.test.mjs`:
  - Die Trainingsansicht zeigt den Suchlink mit `rel="noopener"`.
  - Für eine Übung mit Bild erscheinen das Beispielbild und die Nennung.
  - Die Einstellungen zeigen die Bildnachweise.
- Durchlauf im Headless-Edge: Abschnitt aufklappen, Bild ist geladen (`naturalWidth > 0`), Vollbild öffnet, Zoom-Grep sauber.

## Doku
- `docs/03-unantastbare-regeln.md`, Regel 3: freie Lizenz mit Nachweis ist erlaubt, Ablauf und Prüfung beschreiben.
- `docs/00-projektstatus.md` und `docs/04-weiterbauen.md`: neuen Stand und Testzahlen nachtragen.
