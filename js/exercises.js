// Übungsbibliothek.
//
// Aufbau: Jede Übung ist eine KONKRETE Ausführung an einem KONKRETEN Gerätetyp.
// "Schulterdrücken" gibt es deshalb dreimal — einmal je Kategorie. Das ist Absicht:
// Die Gewichte sind zwischen den Kategorien nicht vergleichbar, also braucht jede
// Variante eine eigene Identität und damit eine eigene Historie.
//
// Das Feld `muster` gruppiert Übungen, die dieselbe Aufgabe erfüllen. Daraus leitet
// die App die Ausweichoptionen ab, wenn ein Gerät belegt ist — ohne dass irgendwo
// eine separate Liste gepflegt werden muss.

/** Die drei Gerätekategorien bei FitX. */
export const KATEGORIEN = {
  frei: { kurz: 'Freihantel', lang: 'Freihantel' },
  pin: { kurz: 'Steckgewicht', lang: 'Steckgewicht (Pin / Kabelzug)' },
  scheiben: { kurz: 'Scheiben', lang: 'Scheiben (Plate-Loaded)' },
};

/** Reihenfolge, in der Kategorien im Ausweich-Dialog erscheinen. */
export const KATEGORIE_REIHENFOLGE = ['pin', 'scheiben', 'frei'];

/** Bewegungsmuster = die Aufgabe, die ein Slot im Plan erfüllt. */
export const MUSTER = {
  'druecken-horizontal': 'Horizontales Drücken — Brust',
  'druecken-schraeg': 'Schrägdrücken — obere Brust',
  'brust-isolation': 'Brust-Isolation',
  'ziehen-horizontal': 'Horizontales Ziehen — Rücken Mitte',
  'ziehen-vertikal': 'Vertikales Ziehen — Latissimus',
  'ziehen-hoch': 'Ziehen hoch — oberer Rücken',
  'druecken-vertikal': 'Vertikales Drücken — Schulter',
  'schulter-seitlich': 'Schulter seitlich',
  'schulter-hinten': 'Schulter hinten',
  trizeps: 'Trizeps-Isolation',
  bizeps: 'Bizeps-Isolation',
  'bauch-gerade': 'Bauch — gerade',
  'bauch-unten': 'Bauch — unterer Anteil',
  'bauch-seitlich': 'Bauch — seitlich / Rotation',
};

// koerpergewicht: true  → 0 kg bedeutet "nur Körpergewicht", nicht "kein Wert"
// wdhEinheit: 'sek'     → gezählt wird Zeit statt Wiederholungen

export const UEBUNGEN = [
  // ── Horizontales Drücken — Brust ───────────────────────────────────────────
  {
    id: 'hs-chest-press',
    name: 'HS Chest Press',
    kategorie: 'scheiben',
    muster: 'druecken-horizontal',
    muskel: 'brust',
    hinweis:
      'Sitzhöhe so wählen, dass die Griffe auf Höhe der unteren Brust stehen — stehen sie zu hoch, wandert die Last in die Schulter. Schulterblätter nach hinten unten ziehen und dort halten. Nicht ganz durchstrecken, Spannung auf der Brust lassen.',
  },
  {
    id: 'brustpresse-pin',
    name: 'Brustpresse Maschine',
    kategorie: 'pin',
    muster: 'druecken-horizontal',
    muskel: 'brust',
    hinweis:
      'Rückenlehne so einstellen, dass die Griffe auf Brusthöhe liegen. Ellenbogen etwa 45–60° zum Körper, nicht auf 90° abspreizen — das ist der häufigste Grund für Schulterbeschwerden an diesem Gerät.',
  },
  {
    id: 'kh-bankdruecken',
    name: 'KH-Bankdrücken flach',
    kategorie: 'frei',
    muster: 'druecken-horizontal',
    muskel: 'brust',
    hinweis:
      'Hinweis: Gewicht ist pro Hantel notiert, nicht die Summe. Schulterblätter zusammen und in die Bank drücken, leichtes Hohlkreuz ist erwünscht. Hanteln nicht oben zusammenschlagen — sie bleiben etwa schulterbreit.',
  },
  {
    id: 'multipresse-bankdruecken',
    name: 'Multipresse Bankdrücken',
    kategorie: 'frei',
    muster: 'druecken-horizontal',
    muskel: 'brust',
    hinweis:
      'Bank so stellen, dass die Stange auf Höhe der unteren Brust läuft. Vorteil gegenüber freier Langhantel: Du kannst näher ans Muskelversagen gehen, weil die Sicherungshaken jederzeit greifen.',
  },

  // ── Schrägdrücken — obere Brust ────────────────────────────────────────────
  {
    id: 'incline-press-pin',
    name: 'Incline Press Maschine',
    kategorie: 'pin',
    muster: 'druecken-schraeg',
    muskel: 'brust',
    hinweis:
      'Zielt auf den oberen Brustanteil, der beim Flachdrücken zu kurz kommt. Ellenbogen leicht angelegt lassen, Bewegung endet, wenn die Oberarme etwa parallel zum Boden sind.',
  },
  {
    id: 'hs-incline-press',
    name: 'HS Incline Press',
    kategorie: 'scheiben',
    muster: 'druecken-schraeg',
    muskel: 'brust',
    hinweis:
      'Griffe sollten auf Höhe der Schlüsselbeine stehen. Rücken bleibt an der Lehne — wenn du beim letzten Satz die Schultern nach vorne rollst, ist das Gewicht zu hoch.',
  },
  {
    id: 'kh-schraegbankdruecken',
    name: 'KH-Schrägbankdrücken',
    kategorie: 'frei',
    muster: 'druecken-schraeg',
    muskel: 'brust',
    hinweis:
      'Gewicht pro Hantel notieren. Banklehne auf 30–45° — steiler wird es zur Schulterübung. Hanteln auf den Oberschenkeln aufsetzen und mit dem Schwung nach hinten in die Startposition kippen.',
  },

  // ── Brust-Isolation ────────────────────────────────────────────────────────
  {
    id: 'butterfly-pin',
    name: 'Butterfly / Pec Deck',
    kategorie: 'pin',
    muster: 'brust-isolation',
    muskel: 'brust',
    hinweis:
      'Sitzhöhe so, dass die Griffe auf Brusthöhe sind. Ellenbogen leicht gebeugt und in diesem Winkel fixiert. In der Endposition kurz halten und aktiv zusammendrücken — hier liegt der eigentliche Reiz, nicht im Gewicht.',
  },
  {
    id: 'kabel-fliegende',
    name: 'Kabel-Fliegende',
    kategorie: 'pin',
    muster: 'brust-isolation',
    muskel: 'brust',
    hinweis:
      'Rollen auf mittlerer oder hoher Position, einen Schritt nach vorne in leichte Schrittstellung. Vorteil gegenüber dem Butterfly: gleichmäßiger Widerstand über den ganzen Weg, auch in der zusammengeführten Position.',
  },
  {
    id: 'kh-fliegende',
    name: 'KH-Fliegende auf Flachbank',
    kategorie: 'frei',
    muster: 'brust-isolation',
    muskel: 'brust',
    hinweis:
      'Gewicht pro Hantel notieren. Deutlich leichter als beim Drücken — der Hebel ist ungünstig, das ist normal. Ellenbogen bleiben leicht gebeugt und fixiert, es ist eine Bogenbewegung, kein Drücken.',
  },

  // ── Horizontales Ziehen — Rücken Mitte ─────────────────────────────────────
  {
    id: 'hs-iso-row',
    name: 'HS Iso-Lateral Row',
    kategorie: 'scheiben',
    muster: 'ziehen-horizontal',
    muskel: 'ruecken',
    hinweis:
      'Brust fest gegen das Polster, damit der Rücken nicht mitschwingt. Zuerst die Schulterblätter zusammenziehen, dann erst die Ellenbogen beugen — in dieser Reihenfolge arbeitet der Rücken statt der Bizeps.',
  },
  {
    id: 'rudermaschine-pin',
    name: 'Rudermaschine',
    kategorie: 'pin',
    muster: 'ziehen-horizontal',
    muskel: 'ruecken',
    hinweis:
      'Brustpolster so einstellen, dass die Arme fast gestreckt greifen können. Ellenbogen nah am Körper führen. Am Ende der Bewegung nicht den Oberkörper nach hinten kippen — das nimmt dem Rücken die Arbeit ab.',
  },
  {
    id: 'kabelrudern-sitzend',
    name: 'Kabelrudern sitzend',
    kategorie: 'pin',
    muster: 'ziehen-horizontal',
    muskel: 'ruecken',
    hinweis:
      'Oberkörper aufrecht und ruhig. Zum Bauchnabel ziehen, nicht zur Brust. In der gestreckten Position die Schulterblätter bewusst nach vorne laufen lassen — die volle Dehnung ist Teil des Reizes.',
  },
  {
    id: 'kh-rudern-einarmig',
    name: 'KH-Rudern einarmig',
    kategorie: 'frei',
    muster: 'ziehen-horizontal',
    muskel: 'ruecken',
    hinweis:
      'Ein Knie und eine Hand auf der Bank, Rücken gerade. Die Hantel zur Hüfte ziehen, nicht zur Schulter. Oberkörper darf sich nicht mitdrehen — wenn er das tut, ist die Hantel zu schwer.',
  },

  // ── Vertikales Ziehen — Latissimus ─────────────────────────────────────────
  {
    id: 'latzug-breit',
    name: 'Latzug breit',
    kategorie: 'pin',
    muster: 'ziehen-vertikal',
    muskel: 'ruecken',
    hinweis:
      'Beinpolster fest einstellen, sonst hebst du beim schweren Satz ab. Zur oberen Brust ziehen, nicht in den Nacken. Leichte Rücklage von etwa 15° ist richtig — daraus darf aber kein Rudern werden.',
  },
  {
    id: 'latzug-eng',
    name: 'Latzug eng (Parallelgriff)',
    kategorie: 'pin',
    muster: 'ziehen-vertikal',
    muskel: 'ruecken',
    hinweis:
      'Der enge Parallelgriff trifft den Latissimus etwas tiefer und ist für die Schulter meist angenehmer als der breite Obergriff. Ellenbogen eng am Körper nach unten führen.',
  },
  {
    id: 'hs-lat-pulldown',
    name: 'HS Front Lat Pulldown',
    kategorie: 'scheiben',
    muster: 'ziehen-vertikal',
    muskel: 'ruecken',
    hinweis:
      'Weil jede Seite unabhängig läuft, fällt hier sofort auf, wenn eine Seite schwächer ist. Griffe bis auf Schulterhöhe ziehen, oben die Dehnung voll zulassen.',
  },
  {
    id: 'klimmzug',
    name: 'Klimmzug (ggf. assistiert)',
    kategorie: 'frei',
    muster: 'ziehen-vertikal',
    muskel: 'ruecken',
    koerpergewicht: true,
    hinweis:
      'Bei der Assist-Maschine gilt: mehr Gegengewicht = leichter. Notiere in dem Fall das eingestellte Gegengewicht und halte im Kopf, dass hier kleinere Zahlen Fortschritt bedeuten. Mit Zusatzgewicht am Gürtel notierst du das Zusatzgewicht.',
  },

  // ── Ziehen hoch — oberer Rücken ────────────────────────────────────────────
  {
    id: 'hs-high-row',
    name: 'HS High Row',
    kategorie: 'scheiben',
    muster: 'ziehen-hoch',
    muskel: 'ruecken',
    hinweis:
      'Zugrichtung von schräg oben trifft den oberen Rücken und die hintere Schulter. Brust ans Polster, Ellenbogen nach hinten unten ziehen. Am Ende kurz halten.',
  },
  {
    id: 'kabelrudern-hoch',
    name: 'Kabelrudern hoch zum Hals',
    kategorie: 'pin',
    muster: 'ziehen-hoch',
    muskel: 'ruecken',
    hinweis:
      'Rolle auf Kopfhöhe, Seil oder breite Stange. Zum Hals bzw. oberen Brustbein ziehen, Ellenbogen hoch und weit außen. Deutlich leichter als beim normalen Rudern — das ist richtig so.',
  },
  {
    id: 'kh-rudern-schraeg',
    name: 'KH-Rudern vorgebeugt',
    kategorie: 'frei',
    muster: 'ziehen-hoch',
    muskel: 'ruecken',
    hinweis:
      'Gewicht pro Hantel notieren. Oberkörper etwa 45° vorgebeugt, Rücken gerade. Ellenbogen weit außen führen, damit die Last im oberen Rücken landet und nicht im Latissimus.',
  },

  // ── Vertikales Drücken — Schulter ──────────────────────────────────────────
  {
    id: 'schulterpresse-pin',
    name: 'Schulterpresse Maschine',
    kategorie: 'pin',
    muster: 'druecken-vertikal',
    muskel: 'schulter',
    hinweis:
      'Sitzhöhe so, dass die Griffe auf Höhe der Ohren bzw. knapp darüber stehen. Rücken bleibt an der Lehne. Oben nicht komplett durchstrecken — die Spannung soll in der Schulter bleiben, nicht im Ellenbogengelenk landen.',
  },
  {
    id: 'hs-shoulder-press',
    name: 'HS Shoulder Press',
    kategorie: 'scheiben',
    muster: 'druecken-vertikal',
    muskel: 'schulter',
    hinweis:
      'Sitzhöhe so einstellen, dass die Griffe auf Schulterhöhe starten. Jede Seite läuft unabhängig — gut, um Seitenunterschiede aufzudecken. Nicht ins Hohlkreuz ausweichen, wenn es schwer wird.',
  },
  {
    id: 'kh-schulterdruecken',
    name: 'KH-Schulterdrücken sitzend',
    kategorie: 'frei',
    muster: 'druecken-vertikal',
    muskel: 'schulter',
    hinweis:
      'Gewicht pro Hantel notieren. Lehne fast senkrecht, aber mit Rückenkontakt. Hanteln starten auf Ohrhöhe, Ellenbogen leicht nach vorne statt exakt zur Seite — das ist schulterfreundlicher.',
  },

  // ── Schulter seitlich ──────────────────────────────────────────────────────
  {
    id: 'kabel-seitheben',
    name: 'Kabel-Seitheben einarmig',
    kategorie: 'pin',
    muster: 'schulter-seitlich',
    muskel: 'schulter',
    hinweis:
      'Rolle ganz unten, Kabel läuft hinter dem Körper vorbei. Vorteil gegenüber der Kurzhantel: Der Widerstand ist schon am Anfang der Bewegung da, wo die Kurzhantel noch fast nichts macht. Nur bis Schulterhöhe heben.',
  },
  {
    id: 'seitheben-maschine',
    name: 'Seitheben-Maschine',
    kategorie: 'pin',
    muster: 'schulter-seitlich',
    muskel: 'schulter',
    hinweis:
      'Drehpunkt der Maschine sollte auf Höhe des Schultergelenks liegen. Druck kommt vom Ellenbogen, nicht von der Hand — stell dir vor, du hebst mit den Ellenbogen.',
  },
  {
    id: 'kh-seitheben',
    name: 'KH-Seitheben',
    kategorie: 'frei',
    muster: 'schulter-seitlich',
    muskel: 'schulter',
    hinweis:
      'Gewicht pro Hantel notieren. Die klassische Fehlerquelle: zu schwer und dann mit Schwung. Lieber leichter und sauber bis Schulterhöhe. Daumen minimal tiefer als der kleine Finger.',
  },

  // ── Schulter hinten ────────────────────────────────────────────────────────
  {
    id: 'reverse-butterfly',
    name: 'Reverse Butterfly',
    kategorie: 'pin',
    muster: 'schulter-hinten',
    muskel: 'schulter',
    hinweis:
      'Brust ans Polster, Arme fast gestreckt. Nach hinten außen öffnen, geführt vom Ellenbogen. Die hintere Schulter ist bei Drückübungen chronisch unterversorgt — deshalb steht sie fest im Plan.',
  },
  {
    id: 'face-pull',
    name: 'Face Pull am Kabel',
    kategorie: 'pin',
    muster: 'schulter-hinten',
    muskel: 'schulter',
    hinweis:
      'Seil auf Gesichtshöhe, zum Gesicht ziehen und dabei die Hände nach außen rotieren. Trifft hintere Schulter und die Außenrotatoren — gute Gegenbewegung zu allem Drücken.',
  },
  {
    id: 'kh-reverse-flys',
    name: 'KH-Reverse-Flys vorgebeugt',
    kategorie: 'frei',
    muster: 'schulter-hinten',
    muskel: 'schulter',
    hinweis:
      'Gewicht pro Hantel notieren. Oberkörper weit vorgebeugt oder Brust auf einer Schrägbank ablegen. Sehr leicht anfangen — wenn der Rücken die Arbeit übernimmt, ist es zu schwer.',
  },

  // ── Trizeps ────────────────────────────────────────────────────────────────
  {
    id: 'trizeps-kabel',
    name: 'Trizepsdrücken Kabel (Seil)',
    kategorie: 'pin',
    muster: 'trizeps',
    muskel: 'trizeps',
    hinweis:
      'Oberarme bleiben fest am Körper, nur der Unterarm bewegt sich. Unten das Seil auseinanderziehen und kurz halten. Oberkörper nicht mitwippen lassen.',
  },
  {
    id: 'trizepsmaschine',
    name: 'Trizepsmaschine',
    kategorie: 'pin',
    muster: 'trizeps',
    muskel: 'trizeps',
    hinweis:
      'Ellenbogen auf dem Polster fixieren und dort lassen. Volle Streckung, aber ohne ins Gelenk zu knallen.',
  },
  {
    id: 'hs-dip',
    name: 'HS Dip Maschine',
    kategorie: 'scheiben',
    muster: 'trizeps',
    muskel: 'trizeps',
    hinweis:
      'Oberkörper aufrecht halten, damit die Last im Trizeps bleibt und nicht in die Brust wandert. Ellenbogen nah am Körper.',
  },
  {
    id: 'kh-trizeps-ueberkopf',
    name: 'KH-Überkopfdrücken (Trizeps)',
    kategorie: 'frei',
    muster: 'trizeps',
    muskel: 'trizeps',
    hinweis:
      'Eine Hantel beidhändig hinter den Kopf senken. Die Überkopfposition dehnt den langen Trizepskopf, der bei Kabelübungen zu kurz kommt. Ellenbogen zeigen nach vorne und bleiben eng.',
  },
  {
    id: 'dips-station',
    name: 'Dips an der Station',
    kategorie: 'frei',
    muster: 'trizeps',
    muskel: 'trizeps',
    koerpergewicht: true,
    hinweis:
      'Oberkörper möglichst aufrecht für den Trizeps-Fokus. Nur so tief, wie die Schulter es schmerzfrei zulässt. Mit Zusatzgewicht am Gürtel notierst du das Zusatzgewicht; bei der Assist-Maschine das Gegengewicht.',
  },

  // ── Bizeps ─────────────────────────────────────────────────────────────────
  {
    id: 'kh-curl',
    name: 'KH-Curl',
    kategorie: 'frei',
    muster: 'bizeps',
    muskel: 'bizeps',
    hinweis:
      'Gewicht pro Hantel notieren. Ellenbogen bleiben an der Seite. Unten voll ausstrecken — die halbe Bewegung ist der häufigste Grund, warum der Bizeps nicht wächst.',
  },
  {
    id: 'sz-curl',
    name: 'SZ-Curl',
    kategorie: 'frei',
    muster: 'bizeps',
    muskel: 'bizeps',
    hinweis:
      'Die gewinkelte Stange ist handgelenkschonender als die gerade. Oberkörper ruhig, kein Schwung aus der Hüfte. Stangengewicht mitzählen (SZ-Stange meist 7–10 kg).',
  },
  {
    id: 'kabel-curl',
    name: 'Kabel-Curl',
    kategorie: 'pin',
    muster: 'bizeps',
    muskel: 'bizeps',
    hinweis:
      'Konstanter Widerstand über den ganzen Weg, auch oben — anders als bei der Kurzhantel, wo oben die Spannung abfällt. Rolle ganz unten, einen kleinen Schritt zurück.',
  },
  {
    id: 'bizepsmaschine',
    name: 'Bizepsmaschine',
    kategorie: 'pin',
    muster: 'bizeps',
    muskel: 'bizeps',
    hinweis:
      'Oberarme liegen komplett auf dem Polster, Achselhöhle am oberen Rand. Weil der Körper fixiert ist, kannst du hier gefahrlos näher ans Versagen gehen.',
  },

  // ── Bauch — gerade ─────────────────────────────────────────────────────────
  {
    id: 'kabel-crunch',
    name: 'Kabel-Crunch am hohen Zug',
    kategorie: 'pin',
    muster: 'bauch-gerade',
    muskel: 'bauch',
    hinweis:
      'Knien, Seil am Kopf fixieren. Die Bewegung ist ein Einrollen der Wirbelsäule, kein Beugen aus der Hüfte. Hüftwinkel bleibt konstant — das ist der Unterschied zwischen Bauch- und Hüftbeugertraining.',
  },
  {
    id: 'ab-crunch-maschine',
    name: 'Ab-Crunch-Maschine',
    kategorie: 'pin',
    muster: 'bauch-gerade',
    muskel: 'bauch',
    hinweis:
      'Drehpunkt auf Höhe des Bauchnabels einstellen. Kontrolliert einrollen und genauso kontrolliert zurück — das Zurücklassen ist die Hälfte des Reizes.',
  },
  {
    id: 'crunch-boden',
    name: 'Crunch am Boden',
    kategorie: 'frei',
    muster: 'bauch-gerade',
    muskel: 'bauch',
    koerpergewicht: true,
    hinweis:
      'Ohne Gerät jederzeit machbar, wenn alles belegt ist. Mit einer Hantelscheibe auf der Brust wird daraus eine echte Belastungssteigerung — dann das Zusatzgewicht notieren.',
  },

  // ── Bauch — unterer Anteil ─────────────────────────────────────────────────
  {
    id: 'beinheben-station',
    name: 'Beinheben an der Station',
    kategorie: 'frei',
    muster: 'bauch-unten',
    muskel: 'bauch',
    koerpergewicht: true,
    hinweis:
      'Am Ende der Bewegung das Becken bewusst nach oben einrollen — ohne das ist es reines Hüftbeugertraining. Nicht schwingen. Mit Zusatzgewicht zwischen den Füßen steigerbar.',
  },
  {
    id: 'reverse-crunch',
    name: 'Reverse Crunch',
    kategorie: 'frei',
    muster: 'bauch-unten',
    muskel: 'bauch',
    koerpergewicht: true,
    hinweis:
      'Auf dem Rücken liegend die Knie zur Brust und das Becken vom Boden abrollen. Kleine, kontrollierte Bewegung — der Weg ist kurz, der Reiz kommt aus der Spannung.',
  },

  // ── Bauch — seitlich / Rotation ────────────────────────────────────────────
  {
    id: 'rotary-torso',
    name: 'Rotary Torso',
    kategorie: 'pin',
    muster: 'bauch-seitlich',
    muskel: 'bauch',
    hinweis:
      'Bewusst moderat belasten — die Lendenwirbelsäule mag hohe Lasten unter Rotation nicht. Langsam drehen, am Endpunkt kurz halten, kontrolliert zurück.',
  },
  {
    id: 'pallof-press',
    name: 'Pallof Press am Kabel',
    kategorie: 'pin',
    muster: 'bauch-seitlich',
    muskel: 'bauch',
    hinweis:
      'Seitlich zum Kabelturm stehen, Griff vor der Brust, dann nach vorne ausstrecken und der Rotation widerstehen. Es sieht nach nichts aus und ist eine der besten Rumpfübungen überhaupt.',
  },
  {
    id: 'side-plank',
    name: 'Side Plank',
    kategorie: 'frei',
    muster: 'bauch-seitlich',
    muskel: 'bauch',
    koerpergewicht: true,
    wdhEinheit: 'sek',
    hinweis:
      'Hier werden Sekunden statt Wiederholungen notiert. Körper bildet eine gerade Linie, Hüfte bewusst nach oben drücken. Braucht kein Gerät — die sichere Rückfallebene, wenn alles belegt ist.',
  },
];

/** Schneller Zugriff per ID über alle Standardübungen. */
const NACH_ID = new Map(UEBUNGEN.map((u) => [u.id, u]));

/**
 * Findet eine Übung per ID. Eigene Übungen des Nutzers werden mit durchsucht,
 * deshalb wird die Liste hier hereingereicht statt global gehalten.
 */
export function uebungFinden(id, eigeneUebungen = []) {
  return NACH_ID.get(id) || eigeneUebungen.find((u) => u.id === id) || null;
}

/** Alle Übungen (Standard + eigene) zu einem Bewegungsmuster, nach Kategorie gruppiert. */
export function alternativenFinden(muster, eigeneUebungen = []) {
  const alle = [...UEBUNGEN, ...eigeneUebungen].filter((u) => u.muster === muster);
  return KATEGORIE_REIHENFOLGE.map((kategorie) => ({
    kategorie,
    label: KATEGORIEN[kategorie].lang,
    uebungen: alle.filter((u) => u.kategorie === kategorie),
  })).filter((gruppe) => gruppe.uebungen.length > 0); // leere Kategorien gar nicht erst zeigen
}
