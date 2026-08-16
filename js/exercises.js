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
//
// Zwei Textfelder mit klarer Aufgabenteilung:
//   erkennung — brauchst du, BEVOR du am Gerät bist: Bauform, wie die Last angehängt
//               wird, und vor allem die Abgrenzung zum Verwechslungskandidaten.
//   hinweis   — brauchst du, WENN du am Gerät sitzt: Einstellung, Bewegungsradius,
//               typische Fehler.
//
// Bewusst NICHT in `erkennung`: Standortangaben wie "hinten links". Die Aufteilung
// unterscheidet sich je Filiale, und eine falsche Wegbeschreibung ist schlimmer als
// gar keine. Beschrieben wird nur der funktionale Bereich (Maschinenpark,
// Kabelzugturm, Freihantelbereich).

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
    erkennung:
      'Plate-Loaded: Du steckst Hantelscheiben auf zwei Dorne links und rechts, es gibt kein Gewichtspaket. Du sitzt aufrecht und drückst zwei getrennte Griffe nach vorn, jede Seite bewegt sich unabhängig. Steht im Maschinenpark bei den anderen Hammer-Strength-Geräten, meist schwarz-rot lackiert und deutlich massiver gebaut als die Technogym-Maschinen. Nicht verwechseln mit der Brustpresse Maschine — dort steckst du einen Pin ins Gewichtspaket.',
    hinweis:
      'Sitzhöhe so wählen, dass die Griffe auf Höhe der unteren Brust stehen — stehen sie zu hoch, wandert die Last in die Schulter. Schulterblätter nach hinten unten ziehen und dort halten. Nicht ganz durchstrecken, Spannung auf der Brust lassen.',
  },
  {
    id: 'brustpresse-pin',
    name: 'Brustpresse Maschine',
    kategorie: 'pin',
    muster: 'druecken-horizontal',
    muskel: 'brust',
    erkennung:
      'Steckgewicht: seitlich sitzt ein Gewichtspaket, in dem du einen Pin auf die gewünschte Zahl steckst. Du sitzt mit dem Rücken an einer Lehne und drückst zwei Griffe waagerecht nach vorn. Verglichen mit der Hammer Strength wirkt sie schlanker und ist meist hell lackiert. Nicht verwechseln mit dem Butterfly — dort führst du die gestreckten Arme vor der Brust zusammen, statt zu drücken.',
    hinweis:
      'Rückenlehne so einstellen, dass die Griffe auf Brusthöhe liegen. Ellenbogen etwa 45–60° zum Körper, nicht auf 90° abspreizen — das ist der häufigste Grund für Schulterbeschwerden an diesem Gerät.',
  },
  {
    id: 'kh-bankdruecken',
    name: 'KH-Bankdrücken flach',
    kategorie: 'frei',
    muster: 'druecken-horizontal',
    muskel: 'brust',
    erkennung:
      'Kein Gerät, sondern eine waagerechte Flachbank im Freihantelbereich plus zwei Kurzhanteln aus dem Ständer. Die Bank ist flach und nicht verstellbar oder auf 0° gestellt. Nicht verwechseln mit der Multipresse — dort läuft eine Stange in Schienen.',
    hinweis:
      'Hinweis: Gewicht ist pro Hantel notiert, nicht die Summe. Schulterblätter zusammen und in die Bank drücken, leichtes Hohlkreuz ist erwünscht. Hanteln nicht oben zusammenschlagen — sie bleiben etwa schulterbreit.',
  },
  {
    id: 'multipresse-bankdruecken',
    name: 'Multipresse Bankdrücken',
    kategorie: 'frei',
    muster: 'druecken-horizontal',
    muskel: 'brust',
    erkennung:
      'Das Gestell, in dem eine Langhantel fest in zwei senkrechten Schienen läuft und sich nur hoch und runter bewegen lässt. An den Seiten hängst du Scheiben auf, mit einem Drehen der Stange rasten Sicherungshaken ein. Die Bank schiebst du selbst darunter. Nicht verwechseln mit dem freien Power Rack, in dem die Hantel lose liegt.',
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
    erkennung:
      'Steckgewicht mit Pin. Sieht aus wie die Brustpresse, aber die Griffe zeigen schräg nach oben und die Lehne steht steiler — du drückst diagonal aufwärts statt waagerecht. Nicht verwechseln mit der Schulterpresse, bei der die Griffe senkrecht über den Ohren stehen und du gerade nach oben drückst.',
    hinweis:
      'Zielt auf den oberen Brustanteil, der beim Flachdrücken zu kurz kommt. Ellenbogen leicht angelegt lassen, Bewegung endet, wenn die Oberarme etwa parallel zum Boden sind.',
  },
  {
    id: 'hs-incline-press',
    name: 'HS Incline Press',
    kategorie: 'scheiben',
    muster: 'druecken-schraeg',
    muskel: 'brust',
    erkennung:
      'Plate-Loaded mit Scheibendornen, schwarz-rot. Wie die HS Chest Press, aber Sitz und Griffe sind nach oben geneigt — die Bewegung geht diagonal aufwärts. Nicht verwechseln mit der HS Shoulder Press: Dort startest du mit den Griffen auf Schulterhöhe direkt neben den Ohren.',
    hinweis:
      'Griffe sollten auf Höhe der Schlüsselbeine stehen. Rücken bleibt an der Lehne — wenn du beim letzten Satz die Schultern nach vorne rollst, ist das Gewicht zu hoch.',
  },
  {
    id: 'kh-schraegbankdruecken',
    name: 'KH-Schrägbankdrücken',
    kategorie: 'frei',
    muster: 'druecken-schraeg',
    muskel: 'brust',
    erkennung:
      'Verstellbare Bank im Freihantelbereich, Lehne auf 30–45° gestellt, dazu zwei Kurzhanteln. Die Bank erkennst du an der gezackten Verstellschiene unter der Rückenlehne. Bei 90° wäre es Schulterdrücken — achte auf den Winkel.',
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
    erkennung:
      'Steckgewicht. Zwei lange Schwenkarme, die seitlich vom Rahmen abstehen; du sitzt dazwischen mit dem Rücken an der Lehne und führst sie vor der Brust zusammen. Oft dasselbe Gerät wie der Reverse Butterfly, nur in die andere Richtung genutzt — achte darauf, in welche Richtung du schaust. Beim Butterfly blickst du vom Gerät weg.',
    hinweis:
      'Sitzhöhe so, dass die Griffe auf Brusthöhe sind. Ellenbogen leicht gebeugt und in diesem Winkel fixiert. In der Endposition kurz halten und aktiv zusammendrücken — hier liegt der eigentliche Reiz, nicht im Gewicht.',
  },
  {
    id: 'kabel-fliegende',
    name: 'Kabel-Fliegende',
    kategorie: 'pin',
    muster: 'brust-isolation',
    muskel: 'brust',
    erkennung:
      'Kein eigenes Gerät: zwei gegenüberstehende Kabelzugtürme, du stellst dich mittig dazwischen und ziehst zwei Einzelgriffe vor dem Körper zusammen. Die Rollen hängst du auf mittlere oder obere Position. Wird oft als Doppelturm mit verstellbaren Rollen angeboten.',
    hinweis:
      'Rollen auf mittlerer oder hoher Position, einen Schritt nach vorne in leichte Schrittstellung. Vorteil gegenüber dem Butterfly: gleichmäßiger Widerstand über den ganzen Weg, auch in der zusammengeführten Position.',
  },
  {
    id: 'kh-fliegende',
    name: 'KH-Fliegende auf Flachbank',
    kategorie: 'frei',
    muster: 'brust-isolation',
    muskel: 'brust',
    erkennung:
      'Flachbank plus zwei leichte Kurzhanteln. Optisch identisch zum Bankdrücken — der Unterschied liegt allein in der Bewegung: weiter Bogen zur Seite statt Drücken nach oben. Deshalb brauchst du hier deutlich weniger Gewicht.',
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
    erkennung:
      'Plate-Loaded, schwarz-rot: Scheiben kommen auf zwei Dorne, kein Gewichtspaket. Du sitzt aufrecht mit der Brust gegen ein Polster und ziehst zwei getrennte Griffe nach hinten; jede Seite arbeitet für sich. Nicht verwechseln mit der Rudermaschine am Gewichtspaket — dort steckst du einen Pin und ziehst meist an einem durchgehenden Griff.',
    hinweis:
      'Brust fest gegen das Polster, damit der Rücken nicht mitschwingt. Zuerst die Schulterblätter zusammenziehen, dann erst die Ellenbogen beugen — in dieser Reihenfolge arbeitet der Rücken statt der Bizeps.',
  },
  {
    id: 'rudermaschine-pin',
    name: 'Rudermaschine',
    kategorie: 'pin',
    muster: 'ziehen-horizontal',
    muskel: 'ruecken',
    erkennung:
      'Steckgewicht mit Pin. Du sitzt aufrecht, die Brust liegt an einem Polster, und ziehst Griffe waagerecht zu dir. Das Brustpolster ist das entscheidende Merkmal — es unterscheidet sie vom Kabelrudern sitzend, wo du frei ohne Abstützung sitzt.',
    hinweis:
      'Brustpolster so einstellen, dass die Arme fast gestreckt greifen können. Ellenbogen nah am Körper führen. Am Ende der Bewegung nicht den Oberkörper nach hinten kippen — das nimmt dem Rücken die Arbeit ab.',
  },
  {
    id: 'kabelrudern-sitzend',
    name: 'Kabelrudern sitzend',
    kategorie: 'pin',
    muster: 'ziehen-horizontal',
    muskel: 'ruecken',
    erkennung:
      'Lange, flache Bank am Boden mit einer Fußplatte am Ende und einem tief liegenden Kabelzug davor. Du sitzt frei ohne Brustpolster und ziehst einen Griff zum Bauch. Die Fußplatte ist das eindeutige Merkmal.',
    hinweis:
      'Oberkörper aufrecht und ruhig. Zum Bauchnabel ziehen, nicht zur Brust. In der gestreckten Position die Schulterblätter bewusst nach vorne laufen lassen — die volle Dehnung ist Teil des Reizes.',
  },
  {
    id: 'kh-rudern-einarmig',
    name: 'KH-Rudern einarmig',
    kategorie: 'frei',
    muster: 'ziehen-horizontal',
    muskel: 'ruecken',
    erkennung:
      'Kein Gerät: eine Flachbank und eine Kurzhantel. Du stützt ein Knie und die gleichseitige Hand auf der Bank ab und ziehst die Hantel mit dem freien Arm hoch.',
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
    erkennung:
      'Steckgewicht. Hoher Rahmen mit einer breiten, leicht gebogenen Stange über dem Sitz und einem Polster, das du dir über die Oberschenkel klemmst. Du ziehst von oben nach unten. Das Oberschenkelpolster ist das sichere Erkennungsmerkmal — kein anderes Zuggerät hat das.',
    hinweis:
      'Beinpolster fest einstellen, sonst hebst du beim schweren Satz ab. Zur oberen Brust ziehen, nicht in den Nacken. Leichte Rücklage von etwa 15° ist richtig — daraus darf aber kein Rudern werden.',
  },
  {
    id: 'latzug-eng',
    name: 'Latzug eng (Parallelgriff)',
    kategorie: 'pin',
    muster: 'ziehen-vertikal',
    muskel: 'ruecken',
    erkennung:
      'Dieselbe Latzugstation am Gewichtspaket mit Pin — du hängst nur einen anderen Aufsatz ein: den kurzen V-förmigen Griff mit zwei parallelen Handgriffen statt der breiten Stange. Die Aufsätze liegen meist in einem Ständer neben der Station. Auch hier klemmst du die Oberschenkel unter das Polster.',
    hinweis:
      'Der enge Parallelgriff trifft den Latissimus etwas tiefer und ist für die Schulter meist angenehmer als der breite Obergriff. Ellenbogen eng am Körper nach unten führen.',
  },
  {
    id: 'hs-lat-pulldown',
    name: 'HS Front Lat Pulldown',
    kategorie: 'scheiben',
    muster: 'ziehen-vertikal',
    muskel: 'ruecken',
    erkennung:
      'Plate-Loaded, schwarz-rot: Scheiben auf Dorne, kein Kabel und kein Gewichtspaket. Zwei getrennte Griffe über dem Kopf, die du unabhängig nach unten ziehst. Auch hier klemmt ein Polster die Oberschenkel fest. Der fehlende Kabelzug unterscheidet sie sofort vom normalen Latzug.',
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
    erkennung:
      'Entweder eine freie Klimmzugstange am Rahmen oder die Assist-Maschine: ein Turm mit einem klappbaren Knie- oder Fußpolster, auf das du dich stellst, plus Gewichtspaket. Wichtig zu wissen: Bei der Assist-Maschine wirkt das eingestellte Gewicht als Gegengewicht — mehr bedeutet leichter, nicht schwerer.',
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
    erkennung:
      'Plate-Loaded, schwarz-rot. Ähnlich der Iso-Lateral Row mit Brustpolster, aber die Griffe hängen deutlich höher — du ziehst von schräg oben herunter statt waagerecht. Sitz und Griffe stehen so, dass deine Arme beim Greifen über Schulterhöhe liegen.',
    hinweis:
      'Zugrichtung von schräg oben trifft den oberen Rücken und die hintere Schulter. Brust ans Polster, Ellenbogen nach hinten unten ziehen. Am Ende kurz halten.',
  },
  {
    id: 'kabelrudern-hoch',
    name: 'Kabelrudern hoch zum Hals',
    kategorie: 'pin',
    muster: 'ziehen-hoch',
    muskel: 'ruecken',
    erkennung:
      'Kabelzugturm mit der Rolle etwa auf Kopfhöhe, Seil oder breite Stange eingehängt. Du stehst oder sitzt und ziehst waagerecht zum Hals. Unterschied zum Face Pull ist allein die Zielhöhe: hier zum oberen Brustbein, dort zur Stirn.',
    hinweis:
      'Rolle auf Kopfhöhe, Seil oder breite Stange. Zum Hals bzw. oberen Brustbein ziehen, Ellenbogen hoch und weit außen. Deutlich leichter als beim normalen Rudern — das ist richtig so.',
  },
  {
    id: 'kh-rudern-schraeg',
    name: 'KH-Rudern vorgebeugt',
    kategorie: 'frei',
    muster: 'ziehen-hoch',
    muskel: 'ruecken',
    erkennung:
      'Kein Gerät: zwei Kurzhanteln, du stehst frei und beugst den Oberkörper etwa 45° vor. Unterscheidet sich vom einarmigen Rudern dadurch, dass du beidarmig und ohne Bank arbeitest.',
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
    erkennung:
      'Steckgewicht mit Pin. Du sitzt aufrecht, die Griffe stehen senkrecht neben deinen Ohren, und du drückst gerade nach oben über den Kopf. Das ist der Unterschied zur Incline Press, wo du diagonal nach vorne oben drückst.',
    hinweis:
      'Sitzhöhe so, dass die Griffe auf Höhe der Ohren bzw. knapp darüber stehen. Rücken bleibt an der Lehne. Oben nicht komplett durchstrecken — die Spannung soll in der Schulter bleiben, nicht im Ellenbogengelenk landen.',
  },
  {
    id: 'hs-shoulder-press',
    name: 'HS Shoulder Press',
    kategorie: 'scheiben',
    muster: 'druecken-vertikal',
    muskel: 'schulter',
    erkennung:
      'Plate-Loaded, schwarz-rot: Scheiben auf Dorne, kein Gewichtspaket. Zwei getrennte Griffe auf Schulterhöhe, die du unabhängig nach oben drückst. Nicht verwechseln mit der HS Incline Press — dort ist der Sitz zurückgeneigt und die Bewegung geht schräg nach vorne.',
    hinweis:
      'Sitzhöhe so einstellen, dass die Griffe auf Schulterhöhe starten. Jede Seite läuft unabhängig — gut, um Seitenunterschiede aufzudecken. Nicht ins Hohlkreuz ausweichen, wenn es schwer wird.',
  },
  {
    id: 'kh-schulterdruecken',
    name: 'KH-Schulterdrücken sitzend',
    kategorie: 'frei',
    muster: 'druecken-vertikal',
    muskel: 'schulter',
    erkennung:
      'Verstellbare Bank mit fast senkrecht gestellter Lehne, dazu zwei Kurzhanteln. Der steile Lehnenwinkel unterscheidet es vom Schrägbankdrücken, wo die Lehne bei 30–45° steht.',
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
    erkennung:
      'Kabelzugturm mit der Rolle ganz unten am Boden und einem einzelnen Handgriff. Du stehst seitlich zum Turm, das Kabel läuft vor deinem Körper vorbei, und hebst den Arm zur Seite. Kein eigenes Gerät — jeder freie Kabelturm funktioniert.',
    hinweis:
      'Rolle ganz unten, Kabel läuft hinter dem Körper vorbei. Vorteil gegenüber der Kurzhantel: Der Widerstand ist schon am Anfang der Bewegung da, wo die Kurzhantel noch fast nichts macht. Nur bis Schulterhöhe heben.',
  },
  {
    id: 'seitheben-maschine',
    name: 'Seitheben-Maschine',
    kategorie: 'pin',
    muster: 'schulter-seitlich',
    muskel: 'schulter',
    erkennung:
      'Steckgewicht. Du sitzt aufrecht, und zwei gepolsterte Arme liegen außen an deinen Oberarmen an — du drückst sie mit den Ellenbogen nach außen oben. Charakteristisch ist, dass die Polster an den Oberarmen anliegen, nicht an den Händen.',
    hinweis:
      'Drehpunkt der Maschine sollte auf Höhe des Schultergelenks liegen. Druck kommt vom Ellenbogen, nicht von der Hand — stell dir vor, du hebst mit den Ellenbogen.',
  },
  {
    id: 'kh-seitheben',
    name: 'KH-Seitheben',
    kategorie: 'frei',
    muster: 'schulter-seitlich',
    muskel: 'schulter',
    erkennung:
      'Zwei leichte Kurzhanteln aus dem Ständer, du stehst frei und hebst die Arme seitlich bis Schulterhöhe. Braucht kein Gerät und keine Bank — funktioniert also immer, auch wenn alles belegt ist.',
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
    erkennung:
      'Steckgewicht mit Pin — meist dasselbe Gerät wie der Butterfly, nur andersherum benutzt: Du sitzt mit der Brust gegen das Polster und öffnest die Arme nach außen hinten. Manche Studios haben ein eigenes Gerät dafür. Entscheidend ist die Blickrichtung — beim Reverse Butterfly schaust du zum Gerät hin, beim Butterfly davon weg.',
    hinweis:
      'Brust ans Polster, Arme fast gestreckt. Nach hinten außen öffnen, geführt vom Ellenbogen. Die hintere Schulter ist bei Drückübungen chronisch unterversorgt — deshalb steht sie fest im Plan.',
  },
  {
    id: 'face-pull',
    name: 'Face Pull am Kabel',
    kategorie: 'pin',
    muster: 'schulter-hinten',
    muskel: 'schulter',
    erkennung:
      'Kabelzugturm mit Seilaufsatz, Rolle auf Gesichtshöhe. Du stehst und ziehst das Seil zur Stirn, wobei die Hände nach außen wandern. Unterschied zum hohen Kabelrudern ist die Zielhöhe: hier zum Gesicht, dort zum Brustbein.',
    hinweis:
      'Seil auf Gesichtshöhe, zum Gesicht ziehen und dabei die Hände nach außen rotieren. Trifft hintere Schulter und die Außenrotatoren — gute Gegenbewegung zu allem Drücken.',
  },
  {
    id: 'kh-reverse-flys',
    name: 'KH-Reverse-Flys vorgebeugt',
    kategorie: 'frei',
    muster: 'schulter-hinten',
    muskel: 'schulter',
    erkennung:
      'Zwei sehr leichte Kurzhanteln. Du beugst dich weit vor oder legst die Brust auf eine schräg gestellte Bank und öffnest die Arme seitlich nach oben. Optisch wie Seitheben, nur im vorgebeugten Zustand.',
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
    erkennung:
      'Kabelzugturm, Rolle ganz oben, Seil mit zwei verdickten Enden eingehängt. Du stehst davor und drückst die Unterarme nach unten, während die Oberarme am Körper bleiben. Das Seil liegt meist im Aufsatzständer neben der Station.',
    hinweis:
      'Oberarme bleiben fest am Körper, nur der Unterarm bewegt sich. Unten das Seil auseinanderziehen und kurz halten. Oberkörper nicht mitwippen lassen.',
  },
  {
    id: 'trizepsmaschine',
    name: 'Trizepsmaschine',
    kategorie: 'pin',
    muster: 'trizeps',
    muskel: 'trizeps',
    erkennung:
      'Steckgewicht. Du sitzt, die Oberarme liegen auf einem schrägen Polster vor dir, und du streckst die Unterarme nach unten. Sieht der Bizepsmaschine sehr ähnlich — der Unterschied ist die Bewegungsrichtung: hier streckst du, dort beugst du.',
    hinweis:
      'Ellenbogen auf dem Polster fixieren und dort lassen. Volle Streckung, aber ohne ins Gelenk zu knallen.',
  },
  {
    id: 'hs-dip',
    name: 'HS Dip Maschine',
    kategorie: 'scheiben',
    muster: 'trizeps',
    muskel: 'trizeps',
    erkennung:
      'Plate-Loaded mit Scheibendornen. Du sitzt und drückst zwei Griffe neben der Hüfte nach unten. Nicht verwechseln mit der Dip-Station, an der du dein eigenes Körpergewicht zwischen zwei feststehenden Holmen stemmst.',
    hinweis:
      'Oberkörper aufrecht halten, damit die Last im Trizeps bleibt und nicht in die Brust wandert. Ellenbogen nah am Körper.',
  },
  {
    id: 'kh-trizeps-ueberkopf',
    name: 'KH-Überkopfdrücken (Trizeps)',
    kategorie: 'frei',
    muster: 'trizeps',
    muskel: 'trizeps',
    erkennung:
      'Eine einzelne Kurzhantel, beidhändig am oberen Ende gefasst. Du sitzt oder stehst und senkst sie hinter den Kopf. Braucht nur eine Hantel, keine Station.',
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
    erkennung:
      'Zwei feststehende parallele Holme etwa in Hüfthöhe, an denen du dich mit gestreckten Armen aufstützt und dein Körpergewicht senkst. Oft am selben Turm wie die Klimmzugstange oder als Assist-Maschine mit Kniepolster.',
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
    erkennung:
      'Zwei Kurzhanteln aus dem Ständer, du stehst oder sitzt frei und beugst die Arme. Braucht keine Station — die zuverlässigste Rückfallebene, wenn im Bizepsbereich alles belegt ist.',
    hinweis:
      'Gewicht pro Hantel notieren. Ellenbogen bleiben an der Seite. Unten voll ausstrecken — die halbe Bewegung ist der häufigste Grund, warum der Bizeps nicht wächst.',
  },
  {
    id: 'sz-curl',
    name: 'SZ-Curl',
    kategorie: 'frei',
    muster: 'bizeps',
    muskel: 'bizeps',
    erkennung:
      'Die kurze Langhantel mit den zwei Wellen in der Mitte — daran erkennst du sie sofort, eine gerade Stange ist es nicht. Liegt meist im Hantelständer im Freihantelbereich. Die Stange selbst wiegt schon 7–10 kg, das musst du mitzählen.',
    hinweis:
      'Die gewinkelte Stange ist handgelenkschonender als die gerade. Oberkörper ruhig, kein Schwung aus der Hüfte. Stangengewicht mitzählen (SZ-Stange meist 7–10 kg).',
  },
  {
    id: 'kabel-curl',
    name: 'Kabel-Curl',
    kategorie: 'pin',
    muster: 'bizeps',
    muskel: 'bizeps',
    erkennung:
      'Kabelzugturm mit der Rolle ganz unten, gerade Stange oder Seil eingehängt. Du stehst davor und beugst die Arme nach oben. Gleiche Ausgangsposition wie das Kabel-Seitheben, nur mit beidhändigem Aufsatz statt einzelnem Griff.',
    hinweis:
      'Konstanter Widerstand über den ganzen Weg, auch oben — anders als bei der Kurzhantel, wo oben die Spannung abfällt. Rolle ganz unten, einen kleinen Schritt zurück.',
  },
  {
    id: 'bizepsmaschine',
    name: 'Bizepsmaschine',
    kategorie: 'pin',
    muster: 'bizeps',
    muskel: 'bizeps',
    erkennung:
      'Steckgewicht. Du sitzt, die Oberarme liegen komplett auf einem großen schrägen Polster vor dir, und du beugst die Unterarme zu dir hoch. Sieht der Trizepsmaschine sehr ähnlich — hier ziehst du zu dir, dort drückst du weg.',
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
    erkennung:
      'Kabelzugturm, Rolle ganz oben, Seilaufsatz. Du kniest mit dem Rücken zum Turm auf dem Boden, hältst das Seil am Kopf und rollst den Oberkörper ein. Erkennbar daran, dass man dafür kniet — alle anderen Kabelübungen macht man im Stehen oder Sitzen.',
    hinweis:
      'Knien, Seil am Kopf fixieren. Die Bewegung ist ein Einrollen der Wirbelsäule, kein Beugen aus der Hüfte. Hüftwinkel bleibt konstant — das ist der Unterschied zwischen Bauch- und Hüftbeugertraining.',
  },
  {
    id: 'ab-crunch-maschine',
    name: 'Ab-Crunch-Maschine',
    kategorie: 'pin',
    muster: 'bauch-gerade',
    muskel: 'bauch',
    erkennung:
      'Steckgewicht. Du sitzt, greifst zwei Griffe über den Schultern oder legst die Brust an ein Polster, und rollst den Oberkörper nach vorne unten ein. Nicht verwechseln mit dem Rotary Torso, wo du dich seitlich wegdrehst statt einzurollen.',
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
    erkennung:
      'Braucht gar nichts außer einer Matte in der Gymnastikecke. Die sichere Rückfallebene, wenn alle Bauchgeräte belegt sind. Mit einer Hantelscheibe auf der Brust wird daraus eine belastbare Übung.',
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
    erkennung:
      'Der senkrechte Turm mit zwei gepolsterten Armauflagen und einer Rückenlehne, in den du dich einhängst, sodass die Beine frei hängen. Wird oft „Captains Chair" genannt und steht meist am selben Rahmen wie Klimmzugstange und Dip-Holme.',
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
    erkennung:
      'Nur eine Matte oder eine Flachbank nötig. Du liegst auf dem Rücken und ziehst die Knie zur Brust. Die Rückfallebene, wenn die Beinheber-Station besetzt ist.',
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
    erkennung:
      'Steckgewicht. Du sitzt fixiert — Beine meist zwischen Polstern eingeklemmt — und drehst den Oberkörper seitlich weg. Die Drehbewegung um die Körperachse ist einmalig im Studio, kein anderes Gerät macht das.',
    hinweis:
      'Bewusst moderat belasten — die Lendenwirbelsäule mag hohe Lasten unter Rotation nicht. Langsam drehen, am Endpunkt kurz halten, kontrolliert zurück.',
  },
  {
    id: 'pallof-press',
    name: 'Pallof Press am Kabel',
    kategorie: 'pin',
    muster: 'bauch-seitlich',
    muskel: 'bauch',
    erkennung:
      'Kabelzugturm mit Einzelgriff auf Brusthöhe. Du stehst seitlich zum Turm, hältst den Griff mit beiden Händen vor der Brust und streckst die Arme nach vorne. Von außen sieht es aus, als würdest du nichts tun — die Arbeit besteht darin, der Drehung standzuhalten.',
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
    erkennung:
      'Braucht nur eine Matte. Seitlage, auf den Unterarm gestützt, Hüfte oben. Die letzte Rückfallebene, wenn wirklich jedes Gerät belegt ist. Hier werden Sekunden statt Wiederholungen notiert.',
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
