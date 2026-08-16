// Prüft die Kernlogik ohne Browser: Historie je Variante, Plan-Wechsel,
// Alternativen-Ableitung, Formatierung.
import assert from 'node:assert/strict';
import { STANDARD_PLAENE, naechsterPlan, letzteEinheit, tageSeit } from '../js/plans.js';
import {
  UEBUNGEN,
  MUSTER,
  alternativenFinden,
  uebungFinden,
  KATEGORIEN,
} from '../js/exercises.js';
import {
  letzteLeistung,
  andereVarianteBekannt,
  saetzeFormatieren,
  verlaufsReihe,
} from '../js/history.js';

let ok = 0;
const pruefe = (name, fn) => {
  try {
    fn();
    console.log(`  ok   ${name}`);
    ok++;
  } catch (e) {
    console.log(`  FEHL ${name}\n       ${e.message}`);
    process.exitCode = 1;
  }
};

console.log('\n— Übungsbibliothek —');

pruefe('alle Übungs-IDs sind eindeutig', () => {
  const ids = UEBUNGEN.map((u) => u.id);
  assert.equal(new Set(ids).size, ids.length);
});

pruefe('jede Übung hat ein bekanntes Bewegungsmuster und eine gültige Kategorie', () => {
  for (const u of UEBUNGEN) {
    assert.ok(MUSTER[u.muster], `unbekanntes Muster: ${u.muster} (${u.id})`);
    assert.ok(KATEGORIEN[u.kategorie], `unbekannte Kategorie: ${u.kategorie} (${u.id})`);
    assert.ok(u.hinweis?.length > 20, `Hinweis zu dünn: ${u.id}`);
  }
});

pruefe('jede Übung hat einen brauchbaren Erkennungstext', () => {
  for (const u of UEBUNGEN) {
    assert.ok(u.erkennung, `erkennung fehlt: ${u.id}`);
    assert.ok(u.erkennung.length > 80, `erkennung zu dünn: ${u.id} (${u.erkennung.length} Zeichen)`);
    assert.notEqual(u.erkennung, u.hinweis, `erkennung == hinweis bei ${u.id}`);
  }
});

pruefe('Erkennungstexte erfinden keine Standortangaben', () => {
  // Die Geräteaufteilung unterscheidet sich je Filiale. Eine falsche Wegbeschreibung
  // ist schlimmer als gar keine, deshalb darf hier nichts Ortsbezogenes stehen.
  // Bewegungsrichtungen ("nach hinten ziehen") sind erlaubt und deshalb nicht
  // Teil der Muster — gesucht wird nur nach echten Ortsbehauptungen.
  const verboten = [
    /\b(hinten|vorne|vorn)\s+(links|rechts)\b/i,
    /\bin der (hinteren |vorderen )?Ecke\b/i,
    /\bam (hinteren|vorderen) Ende\b/i,
    /\b(erste[nr]?|zweite[nr]?|dritte[nr]?) (Stock|Etage|Reihe)\b/i,
    /\bneben (dem|der) (Eingang|Theke|Empfang|Umkleide)/i,
  ];
  for (const u of UEBUNGEN) {
    for (const muster of verboten) {
      assert.ok(
        !muster.test(u.erkennung),
        `${u.id}: erfundene Ortsangabe (${muster}) — "${u.erkennung.match(muster)?.[0]}"`
      );
    }
  }
});

pruefe('Erkennung nennt bei Plate-Loaded die Scheiben, bei Pin das Gewichtspaket', () => {
  // Wie die Last angehängt wird, ist das schnellste Unterscheidungsmerkmal im Studio.
  for (const u of UEBUNGEN) {
    const t = u.erkennung.toLowerCase();
    if (u.kategorie === 'scheiben') {
      assert.ok(
        t.includes('scheibe') || t.includes('plate-loaded'),
        `${u.id}: Scheiben-Gerät ohne Hinweis auf Scheiben`
      );
    }
    if (u.kategorie === 'pin') {
      assert.ok(
        t.includes('pin') || t.includes('steckgewicht') || t.includes('gewichtspaket') || t.includes('kabelzug'),
        `${u.id}: Pin-Gerät ohne Hinweis auf Steckgewicht oder Kabelzug`
      );
    }
  }
});

pruefe('jedes Bewegungsmuster hat mindestens zwei Ausweichoptionen', () => {
  for (const muster of Object.keys(MUSTER)) {
    const n = alternativenFinden(muster).reduce((s, g) => s + g.uebungen.length, 0);
    assert.ok(n >= 2, `${muster} hat nur ${n} Variante(n)`);
  }
});

pruefe('Schulterdrücken bietet alle drei Gerätekategorien', () => {
  const gruppen = alternativenFinden('druecken-vertikal');
  assert.deepEqual(
    gruppen.map((g) => g.kategorie).sort(),
    ['frei', 'pin', 'scheiben']
  );
});

pruefe('Bauch-unten hat keine leere Kategorie-Gruppe', () => {
  const gruppen = alternativenFinden('bauch-unten');
  assert.ok(gruppen.every((g) => g.uebungen.length > 0));
  assert.ok(gruppen.length < 3, 'es soll keine erfundene Scheiben-Variante geben');
});

console.log('\n— Pläne —');

const plaene = STANDARD_PLAENE();

pruefe('beide Pläne haben je 20 Arbeitssätze', () => {
  for (const p of plaene) {
    const summe = p.slots.reduce((n, s) => n + s.saetze, 0);
    assert.equal(summe, 20, `${p.name} hat ${summe} Sätze`);
  }
});

pruefe('jeder Slot verweist auf eine Übung mit passendem Muster', () => {
  for (const p of plaene) {
    for (const slot of p.slots) {
      const u = uebungFinden(slot.uebungId);
      assert.ok(u, `Übung fehlt: ${slot.uebungId}`);
      assert.equal(u.muster, slot.muster, `${slot.id}: Muster passt nicht`);
    }
  }
});

pruefe('kein Beintraining in den Plänen', () => {
  const muskeln = plaene.flatMap((p) =>
    p.slots.map((s) => uebungFinden(s.uebungId).muskel)
  );
  assert.ok(!muskeln.includes('bein'), 'Beinübung gefunden');
});

pruefe('Wochenvolumen je Muskelgruppe liegt zwischen 10 und 20 Sätzen', () => {
  // Beide Pläne laufen bei "alle zwei Tage" je ca. 1,75-mal pro Woche.
  const proWoche = {};
  for (const p of plaene) {
    for (const slot of p.slots) {
      const m = uebungFinden(slot.uebungId).muskel;
      proWoche[m] = (proWoche[m] || 0) + slot.saetze * 1.75;
    }
  }
  const gross = ['brust', 'ruecken', 'schulter', 'bauch'];
  for (const m of gross) {
    assert.ok(
      proWoche[m] >= 10 && proWoche[m] <= 20,
      `${m}: ${proWoche[m].toFixed(1)} Sätze/Woche liegt außerhalb 10–20`
    );
  }
  console.log(
    '       Volumen/Woche:',
    Object.entries(proWoche)
      .map(([m, n]) => `${m} ${n.toFixed(1)}`)
      .join(' · ')
  );
});

pruefe('nach Plan A wird Plan B vorgeschlagen und umgekehrt', () => {
  const leer = { plaene, einheiten: [] };
  assert.equal(naechsterPlan(leer).id, 'plan-a', 'ohne Historie zuerst A');

  const nachA = { plaene, einheiten: [{ planId: 'plan-a', datum: '2026-08-14T10:00:00Z' }] };
  assert.equal(naechsterPlan(nachA).id, 'plan-b');

  const nachB = {
    plaene,
    einheiten: [
      { planId: 'plan-a', datum: '2026-08-14T10:00:00Z' },
      { planId: 'plan-b', datum: '2026-08-16T10:00:00Z' },
    ],
  };
  assert.equal(naechsterPlan(nachB).id, 'plan-a');
});

pruefe('letzteEinheit geht nach Datum, nicht nach Array-Reihenfolge', () => {
  const z = {
    plaene,
    einheiten: [
      { planId: 'plan-b', datum: '2026-08-16T10:00:00Z' },
      { planId: 'plan-a', datum: '2026-08-14T10:00:00Z' },
    ],
  };
  assert.equal(letzteEinheit(z).planId, 'plan-b');
});

console.log('\n— Historie je Variante (Kernregel) —');

// Szenario: Schulterpresse an der Pin-Maschine gemacht, danach auf Kurzhantel
// ausgewichen, weil das Gerät belegt war.
const zustand = {
  eigeneUebungen: [],
  einheiten: [
    {
      planId: 'plan-a',
      datum: '2026-08-10T18:00:00Z',
      eintraege: [
        {
          slotId: 'a3',
          uebungId: 'schulterpresse-pin',
          saetze: [
            { gewicht: 45, wdh: 10, rir: 2 },
            { gewicht: 45, wdh: 9, rir: 1 },
            { gewicht: 40, wdh: 10, rir: 1 },
          ],
        },
      ],
    },
    {
      planId: 'plan-a',
      datum: '2026-08-14T18:00:00Z',
      eintraege: [
        {
          slotId: 'a3',
          uebungId: 'kh-schulterdruecken', // ausgewichen
          saetze: [
            { gewicht: 16, wdh: 10, rir: 2 },
            { gewicht: 16, wdh: 8, rir: 1 },
          ],
        },
      ],
    },
  ],
};

pruefe('Pin-Maschine liefert ihre eigenen 45 kg', () => {
  const l = letzteLeistung(zustand, 'schulterpresse-pin');
  assert.equal(l.saetze[0].gewicht, 45);
  assert.equal(l.datum, '2026-08-10T18:00:00Z');
});

pruefe('Kurzhantel liefert 16 kg — NICHT die 45 kg der Maschine', () => {
  const l = letzteLeistung(zustand, 'kh-schulterdruecken');
  assert.equal(l.saetze[0].gewicht, 16);
  assert.equal(l.saetze.length, 2);
});

pruefe('eine nie gemachte Variante liefert null statt eines Fremdwerts', () => {
  assert.equal(letzteLeistung(zustand, 'hs-shoulder-press'), null);
});

pruefe('Warnhinweis greift bei neuer Variante desselben Musters', () => {
  assert.equal(
    andereVarianteBekannt(zustand, 'druecken-vertikal', 'hs-shoulder-press'),
    true,
    'HS ist neu, aber Pin/KH sind bekannt → Hinweis muss kommen'
  );
  assert.equal(
    andereVarianteBekannt(zustand, 'bizeps', 'kh-curl'),
    false,
    'noch nie Bizeps gemacht → kein Hinweis'
  );
});

pruefe('leere Sätze verfälschen die Historie nicht', () => {
  const z = {
    eigeneUebungen: [],
    einheiten: [
      {
        datum: '2026-08-15T18:00:00Z',
        eintraege: [
          { uebungId: 'kh-curl', saetze: [{ gewicht: '', wdh: '', rir: '' }] },
        ],
      },
    ],
  };
  assert.equal(letzteLeistung(z, 'kh-curl'), null);
});

console.log('\n— Formatierung —');

pruefe('Sätze werden lesbar formatiert', () => {
  const u = uebungFinden('schulterpresse-pin');
  const text = saetzeFormatieren(letzteLeistung(zustand, 'schulterpresse-pin').saetze, u);
  assert.equal(text, '45 kg × 10 · 45 kg × 9 · 40 kg × 10');
});

pruefe('Körpergewichtsübung ohne Zusatzlast zeigt KG statt 0 kg', () => {
  const u = uebungFinden('klimmzug');
  assert.equal(saetzeFormatieren([{ gewicht: 0, wdh: 8 }], u), 'KG × 8');
  assert.equal(saetzeFormatieren([{ gewicht: 10, wdh: 8 }], u), '10 kg × 8');
});

pruefe('Side Plank zählt Sekunden statt Wiederholungen', () => {
  const u = uebungFinden('side-plank');
  assert.equal(saetzeFormatieren([{ gewicht: 0, wdh: 45 }], u), 'KG 45 s');
});

pruefe('Kommazahlen bleiben erhalten (47,5 kg Scheiben)', () => {
  const u = uebungFinden('schulterpresse-pin');
  assert.equal(saetzeFormatieren([{ gewicht: 47.5, wdh: 8 }], u), '47,5 kg × 8');
});

pruefe('Verlaufsreihe nimmt das beste Satzgewicht je Einheit', () => {
  const r = verlaufsReihe(zustand, 'schulterpresse-pin');
  assert.equal(r.nurWdh, false);
  assert.deepEqual(r.punkte.map((p) => p.wert), [45]);
});

pruefe('tageSeit rechnet auf Tagesgrenzen', () => {
  const gestern = new Date(Date.now() - 86400000).toISOString();
  assert.equal(tageSeit(gestern), 1);
  assert.equal(tageSeit(new Date().toISOString()), 0);
});

console.log(`\n${ok} Prüfungen bestanden.${process.exitCode ? ' ES GAB FEHLER.' : ''}\n`);
