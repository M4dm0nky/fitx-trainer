// Router und Einstiegspunkt.
//
// Hash-Routing statt History-API: GitHub Pages liefert bei einem direkten
// Aufruf von /training/plan-a nur ein 404 aus, weil dort keine Datei liegt.
// Mit "#/training/plan-a" bleibt alles in der einen index.html — und der
// Zurück-Knopf des iPhones funktioniert trotzdem.

import { laden } from './store.js';
import * as start from './views/home.js';
import * as training from './views/workout.js';
import * as planEditor from './views/planEditor.js';
import * as verlaufAnsicht from './views/exerciseHistory.js';
import * as einstellungen from './views/settings.js';

const app = document.getElementById('app');
const titel = document.getElementById('titel');
const kopfAktion = document.getElementById('kopf-aktion');

/** Zerlegt "#/training/plan-a" in ["training", "plan-a"]. */
function route() {
  return location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
}

function ansichtWaehlen() {
  const [bereich, arg] = route();
  switch (bereich) {
    case 'training':
      return training.rendern(arg);
    case 'plan':
      return planEditor.rendern(arg);
    case 'verlauf':
      return verlaufAnsicht.rendern(arg);
    case 'einstellungen':
      return einstellungen.rendern();
    default:
      return start.rendern();
  }
}

/**
 * @param {boolean} positionHalten  true beim Neuzeichnen nach einer Aktion —
 *   sonst springt die Seite bei jedem Gerätetausch nach oben, was mitten im
 *   Training äußerst lästig ist.
 */
function zeichnen(positionHalten = false) {
  const y = window.scrollY;
  let ansicht;
  try {
    ansicht = ansichtWaehlen();
  } catch (e) {
    console.error(e);
    ansicht = {
      titel: 'Fehler',
      html: `<p class="leer">Da ist etwas schiefgelaufen.<br />
             <a class="textlink" href="#/">Zurück zum Start</a></p>`,
    };
  }

  titel.innerHTML = ansicht.titel ?? 'FitX Trainer';
  kopfAktion.innerHTML = ansicht.kopfAktion ?? '';
  app.innerHTML = ansicht.html ?? '';
  ansicht.nachRender?.(app, () => zeichnen(true));

  window.scrollTo(0, positionHalten ? y : 0);
}

window.addEventListener('hashchange', () => zeichnen(false));

laden();
zeichnen(false);
