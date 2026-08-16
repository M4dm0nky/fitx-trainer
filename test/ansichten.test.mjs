// Rendert jede Ansicht gegen einen simulierten Speicher und prüft das erzeugte
// HTML. Fängt Laufzeitfehler ab, die eine reine Syntaxprüfung nicht sieht.
import assert from 'node:assert/strict';

// Minimale Browser-Attrappen — die rendern()-Funktionen brauchen nur den Speicher.
const speicher = new Map();
globalThis.localStorage = {
  getItem: (k) => speicher.get(k) ?? null,
  setItem: (k, v) => speicher.set(k, String(v)),
  removeItem: (k) => speicher.delete(k),
};
globalThis.document = { createElement: () => ({ style: {}, classList: { add() {}, remove() {} } }) };

const { s, speichern } = await import('../js/store.js');
const start = await import('../js/views/home.js');
const training = await import('../js/views/workout.js');
const planEditor = await import('../js/views/planEditor.js');
const verlauf = await import('../js/views/exerciseHistory.js');
const einstellungen = await import('../js/views/settings.js');

let ok = 0;
const pruefe = (name, fn) => {
  try {
    fn();
    console.log(`  ok   ${name}`);
    ok++;
  } catch (e) {
    console.log(`  FEHL ${name}\n       ${e.stack.split('\n').slice(0, 3).join('\n       ')}`);
    process.exitCode = 1;
  }
};

const zustand = s();

console.log('\n— Erster Start (leerer Speicher) —');

pruefe('Startbildschirm schlägt Plan A vor', () => {
  const a = start.rendern();
  assert.ok(a.html.includes('Oberkörper A'));
  assert.ok(a.html.includes('Training starten'));
  assert.ok(a.html.includes('Noch kein Training aufgezeichnet'));
});

pruefe('Trainingsansicht zeigt alle sieben Übungen und je "Gerät belegt?"', () => {
  const a = training.rendern('plan-a');
  assert.equal((a.html.match(/data-tausch=/g) || []).length, 7);
  assert.ok(a.html.includes('HS Chest Press'));
  assert.ok(a.html.includes('Erstes Mal an diesem Gerät'));
});

pruefe('Eingabefelder haben passenden inputmode für die iPhone-Tastatur', () => {
  const a = training.rendern('plan-a');
  assert.ok(a.html.includes('inputmode="decimal"'), 'Gewicht braucht Dezimaltastatur');
  assert.ok(a.html.includes('inputmode="numeric"'), 'Wdh./RIR brauchen Zifferntastatur');
});

pruefe('RIR-Platzhalter wird je Satz aufgeteilt (2 / 2 / 0–1)', () => {
  const a = training.rendern('plan-a');
  assert.ok(a.html.includes('placeholder="0–1"'), 'letzter Satz soll 0–1 vorschlagen');
});

pruefe('Plan-Editor rendert', () => {
  const a = planEditor.rendern('plan-b');
  assert.ok(a.html.includes('Latzug breit'));
  assert.ok(a.html.includes('Ausweichoptionen'));
});

pruefe('Einstellungen rendern inkl. ehrlichem Bauch-Hinweis', () => {
  const a = einstellungen.rendern();
  assert.ok(a.html.includes('Backup erstellen'));
  assert.ok(a.html.includes('gezielt Fett am Bauch abzutrainieren funktioniert'));
});

pruefe('Verlauf einer nie gemachten Übung stürzt nicht ab', () => {
  const a = verlauf.rendern('kh-curl');
  assert.ok(a.html.includes('noch nie protokolliert'));
});

pruefe('unbekannte IDs werden abgefangen', () => {
  assert.ok(training.rendern('gibt-es-nicht').html.includes('gibt es nicht'));
  assert.ok(verlauf.rendern('quatsch').html.includes('gibt es nicht'));
});

console.log('\n— Nach zwei Einheiten mit Gerätewechsel —');

zustand.einheiten.push(
  {
    id: 'e1',
    planId: 'plan-a',
    datum: new Date(Date.now() - 4 * 86400000).toISOString(),
    notiz: '',
    entlastung: false,
    eintraege: [
      {
        slotId: 'a3',
        uebungId: 'schulterpresse-pin',
        saetze: [
          { gewicht: 45, wdh: 10, rir: 2 },
          { gewicht: 45, wdh: 9, rir: 1 },
        ],
      },
    ],
  },
  {
    id: 'e2',
    planId: 'plan-b',
    datum: new Date(Date.now() - 2 * 86400000).toISOString(),
    notiz: 'Studio voll',
    entlastung: false,
    eintraege: [
      { slotId: 'b1', uebungId: 'latzug-breit', saetze: [{ gewicht: 60, wdh: 10, rir: 2 }] },
    ],
  }
);
speichern();

pruefe('Startbildschirm schlägt jetzt Plan A vor (nach B) und zeigt den Abstand', () => {
  const a = start.rendern();
  assert.ok(a.html.includes('Letztes Training'));
  assert.ok(a.html.includes('vor 2 Tagen'));
  assert.ok(a.html.includes('Oberkörper B'), 'letzter Plan muss B sein');
});

pruefe('Trainingsansicht zeigt "Letztes Mal" mit den echten Werten', () => {
  const a = training.rendern('plan-a');
  assert.ok(a.html.includes('45 kg × 10 · 45 kg × 9'), 'Werte der Pin-Maschine fehlen');
  assert.ok(a.html.includes('Letztes Mal'));
});

pruefe('Vorbefüllung setzt die letzten Werte als Platzhalter', () => {
  const a = training.rendern('plan-a');
  assert.ok(a.html.includes('placeholder="45"'), 'Gewicht muss vorbelegt sein');
});

pruefe('Verlauf zeigt Einheiten und Diagrammhinweis', () => {
  const a = verlauf.rendern('schulterpresse-pin');
  assert.ok(a.html.includes('45 kg × 10'));
  assert.ok(a.html.includes('1 Einheiten aufgezeichnet') || a.html.includes('Einheiten aufgezeichnet'));
});

console.log('\n— Ausweichen auf eine andere Kategorie —');

pruefe('eine laufende Einheit behält ihr Gerät, wenn der Plan-Standard sich ändert', () => {
  training.rendern('plan-a'); // legt die laufende Einheit an
  const planA = zustand.plaene.find((p) => p.id === 'plan-a');
  planA.slots.find((sl) => sl.id === 'a3').uebungId = 'kh-schulterdruecken';
  const a = training.rendern('plan-a');
  assert.ok(
    a.html.includes('Schulterpresse Maschine'),
    'mitten im Training darf sich das Gerät nicht unter den Händen ändern'
  );
});

// Das ist, was der Ausweich-Dialog tut: die uebungId der LAUFENDEN Einheit ändern.
zustand.laufend.eintraege.find((e) => e.slotId === 'a3').uebungId = 'kh-schulterdruecken';

pruefe('nach dem Ausweichen erscheint die Warnung statt der 45 kg', () => {
  const a = training.rendern('plan-a');
  const flach = a.html.replace(/\s+/g, ' '); // Zeilenumbrüche im Markup wegnormalisieren
  assert.ok(a.html.includes('KH-Schulterdrücken sitzend'));
  assert.ok(
    flach.includes('Übernimm das Gewicht <strong>nicht</strong>'),
    'Hinweis zur Nicht-Übertragbarkeit fehlt'
  );
  const stelle = a.html.indexOf('KH-Schulterdrücken');
  const ausschnitt = a.html.slice(stelle, stelle + 2000);
  assert.ok(!ausschnitt.includes('45 kg'), 'Maschinengewicht darf hier NICHT stehen');
});

console.log('\n— HTML-Maskierung —');

pruefe('Übungsnamen mit Sonderzeichen zerlegen die Seite nicht', () => {
  zustand.eigeneUebungen.push({
    id: 'boese',
    name: '<script>alert(1)</script>',
    kategorie: 'frei',
    muster: 'bizeps',
    muskel: 'bizeps',
    hinweis: 'Test',
  });
  const a = einstellungen.rendern();
  assert.ok(!a.html.includes('<script>alert(1)</script>'));
  assert.ok(a.html.includes('&lt;script&gt;'));
});

console.log(`\n${ok} Prüfungen bestanden.${process.exitCode ? ' ES GAB FEHLER.' : ''}\n`);
