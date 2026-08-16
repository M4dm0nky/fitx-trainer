# Unantastbare Regeln

**Vor jeder Änderung lesen.**

Diese vier Regeln sehen im Code teilweise aus wie Nachlässigkeiten oder Marotten.
Sie sind keine. Jede wurde bewusst so entschieden, und jede lässt sich in wenigen
Sekunden versehentlich brechen — meist bei etwas, das sich wie eine Verbesserung
anfühlt.

Deshalb steht bei jeder Regel nicht nur, *was* verboten ist, sondern *warum* und
*was konkret kaputtgeht*.

---

## Regel 1: Pinch-Zoom bleibt funktionsfähig

### Was verboten ist

| Verboten | Wo es hingehört |
|---|---|
| `user-scalable=no` | Viewport-Tag in `index.html` |
| `maximum-scale=1` | Viewport-Tag in `index.html` |
| `touch-action: none` global | `css/app.css` |
| `touchmove`-Handler mit `preventDefault()` | überall, besonders Overlays |
| `gesturestart`-Handler mit `preventDefault()` | überall |

Der korrekte Viewport-Tag lautet:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

### Warum

Der Nutzer trainiert im Studio, oft bei schlechtem Licht und mit verschwitzten
Händen. **Zoomen mit zwei Fingern war eine ausdrückliche Kernanforderung** — „man
muss zoomen können mit den Fingern, sodass man rein- und rauszoomen kann, wenn man
was nicht lesen kann."

### Wie es typischerweise bricht

Nicht durch Böswilligkeit, sondern durch Routine:

- Jemand ergänzt `user-scalable=no`, weil das in vielen Web-App-Vorlagen so steht
  und „App-artiger" wirkt.
- Jemand baut ein Bottom-Sheet und verhindert den „Scroll-Durchgriff" auf die Seite
  dahinter mit `touchmove` + `preventDefault()` — der Standardweg. Damit ist der
  Zoom auf der ganzen Seite tot.
- Jemand baut eine eigene Zoom- und Wischgeste für die Foto-Vollbildanzeige.

Die beiden Overlays `js/views/swapSheet.js` und `js/views/photoSheet.js` sind
deshalb die gefährlichsten Stellen. Beide scrollen ausschließlich per CSS
(`overflow-y: auto`) und haben **keinen einzigen Touch-Handler**. Die
Foto-Vollbildanzeige nutzt bewusst den normalen Seiten-Zoom von Safari statt einer
eigenen Geste.

Auch `js/dom.js` und `js/timer.js` verwenden absichtlich `click` statt `touchstart` —
ein `touchstart`-Handler mit `preventDefault()` hätte denselben Effekt.

### Prüfen

```powershell
Select-String -Path js\*.js,js\views\*.js,css\*.css,index.html `
  -Pattern 'user-scalable|maximum-scale|touch-action\s*:\s*none|preventDefault|touchmove|gesturestart'
```

Erwartung: **ausschließlich Kommentartreffer.** Jeder Treffer in ausführbarem Code
ist ein Regelverstoß.

---

## Regel 2: Historie je Gerätevariante, nie je Bewegungsmuster

### Was verboten ist

Leistungsdaten oder Fotos verschiedener Geräte zusammenfassen — etwa „letztes
Schulterdrücken" statt „letztes Schulterdrücken an dieser Maschine".

Konkret: `letzteLeistung()` und `verlauf()` in `js/history.js` filtern auf
`eintrag.uebungId`. Das darf nie auf `muster` gelockert werden. Fotoschlüssel
(`fotoSchluessel()` in `js/photos.js`) folgen derselben Regel.

### Warum

45 kg an der Steckgewicht-Maschine, 2 × 16 kg Kurzhanteln und 40 kg Scheiben an der
Hammer Strength sind **physikalisch nicht dasselbe** — andere Hebel, anderes
Eigengewicht des Schlittens, andere Stabilisationsanforderung.

### Was kaputtgeht

Eine gemeinsame Historie wäre nicht bloß ungenau, sondern **irreführend**: Der
Nutzer geht zur Kurzhantel, liest „letztes Mal 45 kg" und fragt sich, was er falsch
macht. Oder er versucht es tatsächlich. Das Verlaufsdiagramm zeigte Sprünge, die
nichts mit seiner Kraft zu tun haben, sondern nur mit dem Gerätewechsel.

Die App ist gebaut, um Progression sichtbar zu machen. Eine Anzeige, die falsche
Vergleiche nahelegt, ist schlimmer als gar keine.

### Verwandte Regel

Wird eine Variante zum ersten Mal benutzt und existiert Historie für eine **andere**
Variante desselben Musters, blendet die App eine Warnung ein
(`andereVarianteBekannt()` in `js/history.js`): Das Gewicht lässt sich nicht
übertragen, zwischen den Kategorien liegen oft 30 % und mehr. Bitte beibehalten.

### Prüfen

`test/logik.test.mjs`, Abschnitt „Historie je Variante (Kernregel)" — insbesondere
„Kurzhantel liefert 16 kg — NICHT die 45 kg der Maschine".

---

## Regel 3: Keine fremden Produktfotos

### Was verboten ist

Bilder von Herstellern oder aus dem Netz ins Repo aufnehmen — Hammer Strength,
Technogym, Katalogbilder, Screenshots von Studio-Websites.

### Warum

Sie sind urheberrechtlich geschützt, und **das Repo ist öffentlich**. Frei
lizenzierte Bilder (Wikimedia) decken konkrete Gerätemodelle praktisch nicht ab.

### Die Alternative ist ohnehin besser

Der Nutzer fotografiert die Geräte selbst. Ein Foto aus **seinem** FitX zeigt
zusätzlich, wo das Gerät steht — das kann kein Katalogbild. Die Foto-Funktion ist
genau dafür gebaut.

### Falls der Wunsch aufkommt

„Nur als Platzhalter" oder „nur zum Testen" zählt nicht: Was im öffentlichen Repo
liegt, ist veröffentlicht. Ein selbst gezeichnetes Piktogramm wäre zulässig — aber
es hilft kaum, weil ein schematischer Chest Press und eine schematische Incline
Press nahezu gleich aussehen.

---

## Regel 4: Keine erfundenen Standortangaben

### Was verboten ist

In `erkennung`-Texten behaupten, wo ein Gerät steht: „hinten links", „in der Ecke",
„am hinteren Ende", „neben dem Eingang", „im ersten Stock".

### Warum

Die Geräteaufteilung unterscheidet sich je FitX-Filiale. Eine falsche
Wegbeschreibung ist schlimmer als gar keine — sie schickt den Nutzer durchs Studio
und untergräbt das Vertrauen in alle anderen Texte.

### Was stattdessen erlaubt ist

- **Bauform:** „zwei lange Schwenkarme, die seitlich vom Rahmen abstehen"
- **Wie die Last angehängt wird:** Pin ins Gewichtspaket, Scheiben auf Dorne,
  Kurzhanteln — das schnellste Unterscheidungsmerkmal überhaupt
- **Funktionaler Bereich:** „im Maschinenpark", „am Kabelzugturm",
  „im Freihantelbereich" — das ist keine Ortsbehauptung
- **Abgrenzung:** „Nicht verwechseln mit …" — der wertvollste Teil, weil das
  eigentliche Risiko nicht ist, gar kein Gerät zu finden, sondern das falsche zu
  nehmen und damit Regel 2 zu unterlaufen

Bewegungsrichtungen sind selbstverständlich erlaubt: „nach hinten ziehen" beschreibt
keine Position im Raum.

### Prüfen

`test/logik.test.mjs`, „Erkennungstexte erfinden keine Standortangaben" — prüft
gegen Muster wie `/\b(hinten|vorne)\s+(links|rechts)\b/`. Ein zweiter Test verlangt,
dass Plate-Loaded-Geräte die Scheiben und Pin-Geräte das Gewichtspaket erwähnen.

---

## Zusammenfassung zum Abhaken

Vor dem Ausliefern einer Änderung:

- [ ] Grep auf die verbotenen Zoom-Muster liefert nur Kommentare
- [ ] Keine Historie- oder Fotoabfrage arbeitet auf `muster` statt `uebungId`
- [ ] Keine fremden Bilddateien im Repo
- [ ] Neue `erkennung`-Texte ohne Ortsbehauptungen
- [ ] Alle Tests grün: `node test\logik.test.mjs`, `ansichten`, `fotos`
