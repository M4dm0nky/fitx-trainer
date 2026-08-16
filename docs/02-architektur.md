# Architektur

Wie der Code aufgebaut ist und warum. Voraussetzung:
[01-zweck-und-hintergrund.md](01-zweck-und-hintergrund.md).

---

## Grundentscheidung: kein Build-Schritt

Vanilla JavaScript als ES-Module, CSS, HTML. Kein React, kein Vite, kein npm, keine
Abhängigkeiten.

**Warum:** GitHub Pages liefert die Dateien direkt aus — es gibt keine CI-Pipeline,
die kaputtgehen kann. Der Nutzer kann jede Datei selbst lesen und ändern. Und im
Studio mit schlechtem Empfang lädt eine 60-KB-Seite sofort. ES-Module funktionieren
nativ in mobilem Safari.

**Konsequenz:** ES-Module brauchen HTTP. Ein Doppelklick auf `index.html`
funktioniert **nicht** — es muss ein Server laufen, siehe
[04-weiterbauen.md](04-weiterbauen.md).

## Routing

Hash-basiert (`#/training/plan-a`), nicht History-API. GitHub Pages würde bei einem
direkten Aufruf von `/training/plan-a` ein 404 liefern, weil dort keine Datei liegt.
Mit dem Hash bleibt alles in der einen `index.html`, und der Zurück-Knopf des
iPhones funktioniert trotzdem.

---

## Modulkarte

| Datei | Aufgabe |
|---|---|
| `js/app.js` | Router, Einstiegspunkt, Render-Zyklus |
| `js/store.js` | localStorage, Schema-Migration, Backup-Export/Import |
| `js/exercises.js` | Übungsbibliothek — 47 Übungen in 14 Bewegungsmustern |
| `js/plans.js` | Standardpläne A/B, Slot-Struktur, Plan-Wechsel-Logik, Entlastung |
| `js/history.js` | „Letztes Mal", Verlauf, Formatierung — **immer je Variante** |
| `js/photos.js` | IndexedDB, Verkleinern, Backup-Anbindung |
| `js/timer.js` | Pausentimer mit Tonsignal |
| `js/dom.js` | `esc()`, Klick-Delegation, Navigation |
| `js/views/home.js` | Startbildschirm: welcher Plan ist dran? |
| `js/views/workout.js` | **Kernstück** — Training durchführen und protokollieren |
| `js/views/swapSheet.js` | „Gerät belegt?" — Alternativen mit Historie und Miniatur |
| `js/views/photoSheet.js` | Foto aufnehmen, Vollbild, Ersetzen, Löschen |
| `js/views/planEditor.js` | Slots umbauen, Standardgerät festlegen |
| `js/views/exerciseHistory.js` | Verlauf einer Variante mit Mini-Diagramm (Inline-SVG) |
| `js/views/settings.js` | Backup, eigene Übungen, Hintergrundwissen |

### Ansichts-Vertrag

Jede Ansicht exportiert `rendern(arg)` und gibt zurück:

```js
{
  titel: 'HTML für die Kopfzeile',
  kopfAktion: 'HTML für rechts oben',   // optional
  html: 'der Seiteninhalt',
  nachRender(wurzel, neuZeichnen) { }   // optional: Listener anhängen
}
```

`rendern()` ist **synchron** und darf nichts am DOM verändern. Das macht die
Ansichten in Node testbar — genau das nutzt `test/ansichten.test.mjs`.

---

## Kernkonzept: Slots statt Geräte

**Der wichtigste Gedanke der ganzen App.**

Ein Plan besteht nicht aus Geräten, sondern aus **Slots**. Ein Slot ist eine
Aufgabe, z. B. „Vertikales Drücken — Schulter", mit einem Standardgerät und
Vorgaben. Welches Gerät tatsächlich benutzt wird, entscheidet der Nutzer im Studio.

```
Slot a3: druecken-vertikal · 3 × 8–12 · RIR 2–3 · 120 s
  ├─ pin       schulterpresse-pin      ← Standard
  ├─ scheiben  hs-shoulder-press
  └─ frei      kh-schulterdruecken
```

Die Alternativen werden **nicht gepflegt, sondern abgeleitet**: `alternativenFinden()`
in `js/exercises.js` sucht alle Übungen mit demselben `muster` und gruppiert sie nach
Kategorie. Eine neue Übung in `exercises.js` taucht dadurch sofort als Ausweichoption
auf — es gibt keine zweite Liste, die man vergessen könnte.

## Datenmodell

### localStorage, Schlüssel `fitx-trainer-v1`

```js
{
  schemaVersion: 1,
  plaene: [{
    id, name, untertitel,
    slots: [{ id, muster, uebungId, saetze, wdhVon, wdhBis, pauseSek, rirZiel }]
  }],
  eigeneUebungen: [],        // vom Nutzer angelegte Geräte
  einheiten: [{
    id, planId, datum, notiz, entlastung,
    eintraege: [{
      slotId,
      uebungId,              // die TATSÄCHLICH gemachte Variante
      saetze: [{ gewicht, wdh, rir }]
    }]
  }],
  laufend: null,             // angefangene, noch nicht beendete Einheit
  einstellungen: { timerTonAn }
}
```

Drei Dinge sind hier absichtlich so:

- **`eintraege[].uebungId`** speichert, was wirklich gemacht wurde — nicht, was der
  Plan vorsah. Ohne dieses Feld wäre die ganze Ausweich-Funktion historisch wertlos.
- **`laufend`** wird nach jeder Eingabe mitgeschrieben. Safari entsorgt
  Hintergrund-Tabs; ohne das wäre nach einem Anruf mitten im Training alles weg.
- **`schemaVersion`** existiert von Anfang an, damit spätere Formatänderungen
  migriert werden können, statt die Historie zu verlieren (`migrieren()` in
  `js/store.js`).

**Die Übungsbibliothek liegt bewusst NICHT im Speicher**, sondern im Code
(`exercises.js`). So erreichen Verbesserungen an Erkennungstexten und Hinweisen auch
Nutzer, die die App schon monatelang benutzen. Im Speicher liegt nur, was dem Nutzer
gehört.

### IndexedDB, Datenbank `fitx-trainer-fotos`

Schlüssel: `${uebungId}:${art}` mit `art ∈ { geraet, einstellung }` — also z. B.
`hs-iso-row:geraet`. Werte sind JPEG-Blobs.

**Warum nicht localStorage:** Der ist auf etwa 5 MB gedeckelt und nimmt nur
Zeichenketten. Fotos als Base64 würden das sofort sprengen und dabei die
Trainingshistorie mit hinausdrücken — also genau das Wichtigste zerstören.

**Warum die Trainingsdaten trotzdem in localStorage bleiben:** Sie sind klein,
synchron lesbar und der Kern der App. Sie auf eine asynchrone Schnittstelle
umzubauen, nur weil Fotos dazukommen, wäre der falsche Tausch.

Fotos werden vor dem Speichern auf **max. 1200 px längste Kante, JPEG-Qualität 0,75**
heruntergerechnet (`verkleinern()`). Ein iPhone-Foto hat sonst 3–5 MB; 94 mögliche
Fotoplätze wären deutlich über 300 MB und würden das Backup unbrauchbar machen.

---

## Der Render-Zyklus

**Unbedingt verstehen, bevor jemand asynchrone Nachlade-Logik ergänzt.**

`zeichnen()` in `js/app.js`:

1. `ansichtWaehlen()` liefert das Ansichtsobjekt
2. `app.innerHTML = ansicht.html` — ersetzt den **gesamten** Teilbaum
3. `ansicht.nachRender(app, () => zeichnen(true))` hängt Listener frisch an
4. Scrollposition wird wiederhergestellt, wenn `positionHalten` gesetzt ist

Zwei Folgerungen:

**Listener können sich nicht verdoppeln.** Weil der Teilbaum komplett ersetzt wird,
sind alte Knoten samt Listenern weg. `nachRender` darf also bedenkenlos anhängen.

**`neuZeichnen(true)` hält die Scrollposition.** Wird nur bei echten
Zustandsänderungen aufgerufen (Gerätetausch, Slot verschoben) — nicht bei jeder
Eingabe. Sonst spränge die Seite mitten im Training nach oben.

### Asynchrones Nachladen

Fotos kommen aus IndexedDB und sind damit asynchron, während `rendern()` synchron
ist. Lösung: Platzhalter rendern, danach befüllen.

- `fotoFelderFuellen()` in `workout.js` — läuft beim **Aufklappen** des Abschnitts
  „Gerät finden", nicht schon beim Rendern. Sonst wartete jede Trainingsansicht auf
  sieben IndexedDB-Abfragen.
- `miniaturenNachladen()` in `swapSheet.js` — läuft nach dem Einhängen des Dialogs
  und bricht ab, sobald `hinter.isConnected` falsch ist.

**Beide Schleifen sichern jedes Bild einzeln mit `try/catch` ab.** Das ist kein
Übervorsicht, sondern die Lehre aus dem Fehler in `86fce37`: Ein geworfener Fehler
beim ersten Bild ließ die restliche Schleife ausfallen — auch für Übungen, hinter
denen ein Foto lag.

---

## Wo die Erkennungstexte leben

Im Feld `erkennung` jeder Übung in `js/exercises.js`, neben `hinweis`. Klare
Aufgabenteilung:

- **`erkennung`** — braucht man, *bevor* man am Gerät ist: Bauform, wie die Last
  angehängt wird, Abgrenzung zum Verwechslungskandidaten
- **`hinweis`** — braucht man, *wenn* man davorsitzt: Einstellung, Bewegungsradius,
  typische Fehler

**Bewusst keine Kopie in dieser Dokumentation.** Eine zweite Fassung würde
auseinanderlaufen, sobald jemand einen Text nachschärft. Wer sie lesen will, öffnet
`js/exercises.js`.

Regeln für neue Erkennungstexte stehen in
[03-unantastbare-regeln.md](03-unantastbare-regeln.md), Regel 4 — und werden von
`test/logik.test.mjs` geprüft.

---

## Eine Übung hinzufügen

1. Eintrag in `UEBUNGEN` in `js/exercises.js` ergänzen — mit `id`, `name`,
   `kategorie`, `muster`, `muskel`, `erkennung`, `hinweis`
2. Das war's. `alternativenFinden()` nimmt sie automatisch als Ausweichoption auf.
3. `node test\logik.test.mjs` laufen lassen — geprüft werden unter anderem: eindeutige
   ID, bekanntes Muster, gültige Kategorie, Erkennungstext vorhanden und lang genug,
   keine erfundenen Ortsangaben, Kategorie im Text erwähnt

Soll die Übung als **Standard** in einem Plan stehen, zusätzlich die `uebungId` des
betreffenden Slots in `js/plans.js` ändern — und die Volumenrechnung aus
[01](01-zweck-und-hintergrund.md) im Blick behalten.
