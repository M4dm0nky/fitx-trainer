# Zweck und Hintergrund

Warum es diese App gibt, für wen sie gebaut ist und warum die Trainingspläne so
aussehen, wie sie aussehen. Ohne diese Randbedingungen greift jede Änderung ins
Leere — sie stehen nirgends im Code.

---

## Der Nutzer

| | |
|---|---|
| Studio | FitX |
| Rhythmus | **alle zwei Tage**, nicht an festen Wochentagen (≈ 3,5 Einheiten/Woche) |
| Trainingsstand | fortgeschritten |
| Beine | **kein Beintraining**, ausdrücklich gewünscht |
| Ziel | Muskelaufbau Oberkörper plus Bauchtraining |
| Dauer | ca. 60 Minuten an den Geräten |
| Nutzung | ausschließlich iPhone, über ein Homescreen-Icon |

Der Rhythmus ist die folgenreichste dieser Angaben. Ursprünglich war von „montags
und mittwochs" die Rede — das war ein Beispiel, gemeint war der Zwei-Tage-Takt. Die
gesamte Volumenrechnung hängt daran.

## Die zwei Probleme

**1. Ohne Protokoll keine Progression.** Beim nächsten Training weiß man nicht mehr,
mit welchem Gewicht und wie vielen Wiederholungen man zuletzt gearbeitet hat. Damit
fehlt die Grundlage für progressive Überlastung — den einzigen Mechanismus, der über
Monate zuverlässig Muskeln aufbaut. Papierzettel und Notizen-App lösen das schlecht,
weil das Nachschlagen zwischen zwei Sätzen zu umständlich ist.

Daraus folgt die wichtigste Gestaltungsregel der App: **„Letztes Mal" steht ganz
oben und die Eingabefelder sind damit vorbefüllt.** Gleich geblieben heißt: einmal
tippen. Das ist der Unterschied zwischen einer App, die benutzt wird, und einer, die
nach zwei Wochen liegen bleibt.

**2. Das Studio ist unterschiedlich voll.** Ist das vorgesehene Gerät belegt,
braucht man sofort eine gleichwertige Alternative — über die drei Gerätekategorien
hinweg. Ein Plan, der stur ein bestimmtes Gerät vorschreibt, ist im vollen Studio
wertlos. Und wer sich dann irgendein ähnlich aussehendes Gerät nimmt, zerstört
unbemerkt die Historie.

Daraus folgt die zweite Gestaltungsregel: **Ein Plan besteht aus Aufgaben, nicht aus
Geräten.** Siehe [02-architektur.md](02-architektur.md), Abschnitt „Slots".

---

## Die drei Gerätekategorien

Der Schlüssel zum Verständnis der ganzen Ausweich-Logik.

| Kategorie | Kürzel | Was dazugehört |
|---|---|---|
| Freihantel | `frei` | Kurzhanteln bis 60 kg, SZ-/Langhantel, Bänke, Multipresse, Klimmzug- und Dip-Station |
| Steckgewicht | `pin` | Technogym-Maschinen mit Steckbolzen, alle Kabelzugtürme |
| Scheiben (Plate-Loaded) | `scheiben` | Hammer Strength: Chest Press, Incline Press, Iso-Lateral Row, High Row, Lat Pulldown, Shoulder Press, Dip |

FitX-Studios sind stark standardisiert: über 200 Geräte, im Wesentlichen von
**Hammer Strength** (Plate-Loaded) und **Technogym** (Steckgewicht), dazu
Kabelzugtürme, Multipresse und Kurzhanteln bis 60 kg.

**Warum die Kategorie so wichtig ist:** 45 kg an der Steckgewicht-Maschine, 2 × 16 kg
Kurzhanteln und 40 kg Scheiben an der Hammer Strength sind physikalisch nicht
dasselbe — andere Hebel, anderes Eigengewicht des Schlittens, andere
Stabilisationsanforderung. Deshalb hat jede Variante ihre eigene Historie. Siehe
[03-unantastbare-regeln.md](03-unantastbare-regeln.md), Regel 2.

---

## Warum die Pläne so aussehen

### Zwei Pläne im Wechsel: A horizontal, B vertikal

Bei 3,5 Einheiten pro Woche und zwei Plänen läuft jeder Plan etwa **1,75-mal
wöchentlich**. Beide decken den gesamten Oberkörper ab, aber über unterschiedliche
Bewegungsrichtungen: A betont horizontales Drücken und Ziehen, B vertikales.

Das ist kein Schönheitsprinzip, sondern Gelenkschutz: So wird die Schulter nie
zweimal hintereinander im selben Winkel belastet.

**Verworfen: Push/Pull.** Bei einem Push- und einem Pull-Tag träfe jede
Muskelgruppe nur 1,75-mal pro Woche Reiz statt 3,5-mal. Höhere Frequenz ist bei
gleichem Wochenvolumen mindestens gleichwertig, oft leicht überlegen — Push/Pull
wäre hier also die schlechtere Wahl.

### 20 Sätze je Einheit — der Rechenweg

**Das ist die Zahl, die man kennen muss, bevor man einen Plan ändert.**

```
Wochenvolumen je Muskelgruppe = (Sätze in Plan A + Sätze in Plan B) × 1,75
```

Bei je 20 Arbeitssätzen pro Einheit ergibt das:

| Muskelgruppe | Sätze/Woche (direkt) |
|---|---|
| Brust | ≈ 15,8 |
| Rücken | ≈ 15,8 |
| Schultern | ≈ 15,8 |
| Bauch | ≈ 12,3 |
| Trizeps | ≈ 5,3 direkt (plus alle Drückübungen) |
| Bizeps | ≈ 5,3 direkt (plus alle Zugübungen) |

Der evidenzbasierte Korridor liegt bei **10–20 Sätzen pro Muskelgruppe und Woche**.
Alles passt.

**Verworfen: 23–25 Sätze je Einheit.** Ein üblicher Zweimal-die-Woche-Plan hat diese
Größenordnung. Bei 3,5 Einheiten käme man damit auf **über 30 Sätze pro
Muskelgruppe** — jenseits dessen, was sich regenerieren lässt, und ein zuverlässiger
Weg in Stagnation oder Gelenkbeschwerden.

`test/logik.test.mjs` prüft den Korridor automatisch mit („Wochenvolumen je
Muskelgruppe liegt zwischen 10 und 20 Sätzen"). Wer Sätze hinzufügt und den Test
brechen sieht, hat genau die Warnung erhalten, für die er da ist.

### RIR statt Muskelversagen

RIR = *Reps in Reserve*, also wie viele Wiederholungen am Satzende noch möglich
gewesen wären.

- **RIR 2–3** auf den meisten Sätzen
- **RIR 0–1** nur auf dem letzten Satz der ersten beiden Übungen

Aus der Forschung: Wenn am Satzende nicht mehr als zwei bis drei Wiederholungen
möglich gewesen wären, ist der Reiz bereits ausreichend. Training bis zum
vollständigen Muskelversagen bringt keinen Zusatznutzen, kostet aber Regeneration.

Bei einem Zwei-Tage-Takt ist das keine Bequemlichkeit, sondern die Voraussetzung
dafür, dass die übernächste Einheit überhaupt noch produktiv ist. Deshalb hat jeder
Satz im Protokoll ein RIR-Feld, und das Ziel des Slots steht als Platzhalter darin.

### Wiederholungsbereiche

5–20 Wiederholungen erzeugen vergleichbaren Hypertrophie-Reiz. 6–12 ist der
praktikabelste Bereich, 12–20 für Isolationsübungen sowie Schulter und Bauch.

### Übungsvielfalt

Zwei bis drei gut gewählte Übungen decken eine Muskelgruppe ab. Sechzehn Varianten
bringen nichts außer verbrauchter Zeit.

**Wichtig:** Die Ausweichoptionen im „Gerät belegt?"-Dialog sind **kein zusätzliches
Volumen**, sondern Ersatz für dieselbe Aufgabe. Wer sie als „mehr Übungen" versteht,
missversteht die Funktion.

### Entlastungswoche

Etwa alle 6–8 Wochen eine leichtere Woche: gleiche Übungen, gleiche Gewichte, aber
RIR 4–5 und ein Satz weniger je Übung. Die App erinnert daran, wenn seit der letzten
markierten Entlastungseinheit mehr als 56 Tage vergangen sind (`entlastungFaellig()`
in `js/plans.js`).

---

## Zum Thema Bauch — bitte so lassen

Bauchübungen bauen die Bauchmuskulatur auf. **Gezielter Fettabbau am Bauch („Spot
Reduction") funktioniert nach aktueller Studienlage nicht.** Wo der Körper Fett
abbaut, ist genetisch und hormonell bestimmt; Fettabbau passiert global über ein
Kaloriendefizit.

Der Nutzer hatte ursprünglich „Fokus auf Muskelaufbau und Bauch" formuliert. Die
ehrliche Einordnung wurde von Anfang an mitgegeben und steht im Info-Bereich der App
(`js/views/settings.js`).

**Bitte nicht zu einem Werbeversprechen glätten.** Bauchtraining steht trotzdem fest
in beiden Plänen — ein kräftiger Rumpf ist für sich genommen wertvoll und
stabilisiert bei allen Drück- und Zugübungen. Das ist die Begründung, die trägt.
