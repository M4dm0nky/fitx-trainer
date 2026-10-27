// Prüft den Router (js/app.js): Nach mehreren Render-Durchläufen darf an #app
// genau EIN click-Listener hängen. Häufen sich Listener (weil #app dasselbe
// Element bleibt), feuern Handler doppelt — z. B. wird ein Satz-Haken sofort
// wieder abgewählt.
import assert from 'node:assert/strict';

// Minimale Browser-Attrappen.
const speicher = new Map();
globalThis.localStorage = {
  getItem: (k) => speicher.get(k) ?? null,
  setItem: (k, v) => speicher.set(k, String(v)),
  removeItem: (k) => speicher.delete(k),
};

class FakeElement {
  constructor(id) {
    this.id = id;
    this.innerHTML = '';
    this.style = {};
    this.classList = { add() {}, remove() {}, toggle() {} };
    this.listener = {}; // Typ -> Anzahl addEventListener-Aufrufe
  }
  addEventListener(typ) {
    this.listener[typ] = (this.listener[typ] ?? 0) + 1;
  }
  removeEventListener() {}
  cloneNode() {
    return new FakeElement(this.id); // frisch, ohne Listener
  }
  replaceWith(neu) {
    if (elemente.get(this.id) === this) elemente.set(this.id, neu);
  }
  querySelector() { return null; }
  querySelectorAll() { return []; }
}

const elemente = new Map();
for (const id of ['app', 'titel', 'kopf-aktion']) elemente.set(id, new FakeElement(id));

globalThis.document = {
  getElementById: (id) => elemente.get(id) ?? null,
  createElement: () => new FakeElement('x'),
  querySelector: () => null,
  querySelectorAll: () => [],
  body: new FakeElement('body'),
};

const fensterListener = {};
globalThis.window = {
  addEventListener: (typ, fn) => { fensterListener[typ] = fn; },
  scrollY: 0,
  scrollTo() {},
};
globalThis.location = { hash: '#/' };
globalThis.history = { replaceState() {}, pushState() {} };

// Unbehandelte Ablehnungen (z. B. fehlendes IndexedDB) sollen den Test nicht kippen.
process.on('unhandledRejection', () => {});

await import('../js/app.js');

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

const klicks = () => document.getElementById('app').listener.click ?? 0;

console.log('\n— Router: Listener an #app —');

pruefe('nach dem ersten Render hängt genau 1 click-Listener an #app', () => {
  assert.equal(klicks(), 1);
});

pruefe('nach zwei weiteren Renders (hashchange) weiterhin genau 1', () => {
  assert.equal(typeof fensterListener.hashchange, 'function');
  fensterListener.hashchange();
  fensterListener.hashchange();
  assert.equal(klicks(), 1);
});

console.log(`\n${ok} Prüfungen bestanden.${process.exitCode ? ' ES GAB FEHLER.' : ''}\n`);
