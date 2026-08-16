# Projektstatus

**Stand: 16.08.2026** · Commit `86fce37`

Dieses Dokument beantwortet „wo stehe ich?", bevor du Code liest. Wenn du das
Projekt kalt aufnimmst, fang hier an und lies dann [01-zweck-und-hintergrund.md](01-zweck-und-hintergrund.md).

---

## Auf einen Blick

| | |
|---|---|
| **Live** | https://m4dm0nky.github.io/fitx-trainer/ |
| **Repo** | https://github.com/M4dm0nky/fitx-trainer (öffentlich) |
| **Lokal** | `C:\Dropbox\Incomming\github\fitx-trainer` |
| **Umfang** | 15 JS-Module / ~2900 Zeilen, 3 Testdateien / ~670 Zeilen |
| **Tests** | 55 grün — Logik 25, Ansichten 17, Fotos 13 |
| **Build** | keiner. Vanilla JS als ES-Module, GitHub Pages liefert die Dateien direkt aus |

Alle Repos dieses Nutzers liegen unter `C:\Dropbox\Incomming\github\` — nicht im
Benutzerordner.

## Commit-Historie

| Commit | Inhalt |
|---|---|
| `92e1183` | Grundgerüst: zwei Pläne, Protokollierung, Ausweich-Dialog, Timer, Backup |
| `31e4da9` | Erkennungstexte für alle 47 Übungen + eigene Gerätefotos |
| `b02aeeb` | CSS-Korrektur: Miniaturbild per `display:none` statt `width:0` |
| `86fce37` | Code-Review-Fix: `transaktion()` lieferte `IDBRequest` statt `null` |

---

## Was funktioniert

**Trainingsprotokoll.** Zwei Oberkörperpläne (A horizontal, B vertikal) im Wechsel,
je 20 Arbeitssätze. Beim Öffnen einer Übung steht „Letztes Mal (12.08.): 45 kg × 10
· 45 kg × 9 · 40 kg × 10", die Eingabefelder sind damit vorbefüllt. Ein Tipp auf den
Haken übernimmt die Werte und startet den Pausentimer.

**Ausweichen bei belegtem Gerät.** Knopf „Gerät belegt?" bei jeder Übung zeigt
Alternativen in drei Kategorien (Freihantel / Steckgewicht / Plate-Loaded), jede mit
ihrer eigenen Historie und Miniaturbild. Wechsel gilt standardmäßig nur für die
laufende Einheit.

**Gerät finden.** Aufklappbarer Abschnitt mit Erkennungstext und zwei Fotoplätzen
(Gerät + Einstellung). Fotos nimmt der Nutzer selbst auf.

**Weiteres.** Plan-Editor (Slots hinzufügen, löschen, umsortieren, Vorgaben ändern),
Verlauf je Übungsvariante mit Mini-Diagramm, Backup als JSON inklusive Fotos,
Entlastungs-Erinnerung nach acht Wochen, Fortsetzen einer unterbrochenen Einheit.

**Robustheit.** Die laufende Einheit wird nach jeder Eingabe gespeichert — Safari
entsorgt Hintergrund-Tabs, ohne Zwischenspeicherung wäre nach einem Anruf mitten im
Training alles weg.

---

## Was ungetestet ist

**Wichtig für jeden, der hier weiterarbeitet.** Die 55 automatischen Tests laufen in
Node, ohne Browser. Erstellt wurde die App von einem Agenten ohne Browser, ohne
Kamera und ohne iPhone. Folgendes ist deshalb **nie in der echten Umgebung
ausgeführt worden**:

| Bereich | Warum ungetestet | Risiko |
|---|---|---|
| Kamera-Aufnahme | kein Gerät | iOS-Dialog könnte anders reagieren als erwartet |
| IndexedDB | in Node nicht vorhanden (Attrappe im Test bildet nur den Vertrag nach) | Verhalten bei vollem Speicher unbekannt |
| EXIF-Drehung | braucht echte iPhone-Fotos | Hochformatfotos könnten gedreht erscheinen |
| Verkleinern über `<canvas>` | braucht Browser | Dauer und Ergebnisqualität unbekannt |
| Aussehen, Touch-Verhalten | kein Browser | alles Visuelle ist unbestätigt |
| Pinch-Zoom in der Praxis | kein Gerät | strukturell abgesichert (siehe [03](03-unantastbare-regeln.md)), aber nicht erlebt |
| Pausenton | kein Audio | Web Audio auf iOS ist eigenwillig |

Das ist keine Koketterie: Wer hier Fehler sucht, sollte zuerst in dieser Liste
nachsehen, bevor er in der Logik gräbt.

## Prüfzettel für das nächste Training am Gerät

- [ ] Pinch-Zoom auf jedem Screen — besonders bei geöffnetem „Gerät belegt?"-Dialog
      und bei der Foto-Vollbildanzeige
- [ ] Antippen eines Gewichtsfelds löst **keinen** ungewollten Auto-Zoom aus
- [ ] Zwei, drei Geräte fotografieren, **eines bewusst auslassen** → erscheinen die
      vorhandenen Bilder trotzdem alle? (Genau das war der Fehler in `86fce37`)
- [ ] Hochformatfoto → steht es richtig herum?
- [ ] Einheit protokollieren, App schließen, neu öffnen → „Letztes Mal" korrekt?
- [ ] Startbildschirm schlägt danach den **anderen** Plan vor
- [ ] Pausentimer piept am Ende (Gerät nicht stumm)
- [ ] Backup erstellen und wieder einspielen → Fotos und Einheiten zurück

---

## Offene Punkte

**Keine bekannten Fehler.** Der letzte gefundene (`transaktion()` gab bei fehlendem
Schlüssel das Anfrageobjekt statt `null` zurück) ist in `86fce37` behoben und durch
Tests abgesichert.

**Bewusst nicht gebaut:**

- *Kein Beintraining.* Ausdrücklicher Wunsch des Nutzers, keine Lücke.
- *Keine Cloud-Synchronisation.* Daten bleiben auf dem Gerät; Backup läuft über eine
  Datei, die der Nutzer selbst ablegt.
- *Keine fremden Produktfotos.* Urheberrecht, siehe [03](03-unantastbare-regeln.md).
- *Kein Service Worker / Offline-Modus.* Bisher nicht gebraucht — die Seite ist
  klein und Safari hält sie im Cache. Wäre die naheliegendste Erweiterung, falls im
  Studio der Empfang stört.

**Denkbare Erweiterungen**, falls der Nutzer sie anspricht: Aufwärmsätze getrennt
protokollieren, 1RM-Schätzung aus Gewicht × Wiederholungen, Export als CSV,
mehr als zwei Pläne für einen längeren Zyklus.

---

## Weiterlesen

1. [01-zweck-und-hintergrund.md](01-zweck-und-hintergrund.md) — warum es die App gibt und warum die Pläne so aussehen
2. [02-architektur.md](02-architektur.md) — wie der Code aufgebaut ist
3. [03-unantastbare-regeln.md](03-unantastbare-regeln.md) — **vor jeder Änderung lesen**
4. [04-weiterbauen.md](04-weiterbauen.md) — lokal starten, testen, ausliefern
