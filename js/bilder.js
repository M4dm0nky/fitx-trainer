// Beispielbilder: frei lizenzierte Fotos (Wikimedia Commons, Flickr u. a.) plus die Suchbegriffe
// für den Knopf "Bilder im Netz".
//
// Bewusst getrennt von exercises.js: Dort stehen die Übungsdaten, hier alles, was mit
// fremden Bildern und ihrer Urhebernennung zu tun hat. Die Ansichten lesen nur über
// beispielbild(), suchUrl() und bildnachweise().
//
// Regel 3 (docs/03-unantastbare-regeln.md): Ein Bild darf nur hier eingetragen werden,
// wenn die Lizenz frei ist (ERLAUBTE_LIZENZ) und Urheber, Lizenz und Quelle stimmen.
// Der Logik-Test prüft das für jeden Eintrag.

// Manche Bilder zeigen bewusst das GERÄT statt der Übung (Kabelzugturm für alle Kabelübungen,
// Flachbank mit Kurzhantel), weil es ums Wiederfinden des Geräts im Studio geht.
/** { [uebungId]: { datei, urheber, lizenz, lizenzUrl, quelle, quelleName? } } — quelle: https-Seite des Bilds (Commons, Flickr …) */
export const BEISPIELBILDER = {
  'ab-crunch-maschine': {
    datei: 'bilder/ab-crunch-maschine.jpg',
    urheber: 'Sgt. Carmen Steinbach',
    lizenz: 'Public domain',
    lizenzUrl: 'https://commons.wikimedia.org/wiki/Public_domain',
    quelle: 'https://commons.wikimedia.org/wiki/File:JTF_Pumping_Iron_DVIDS204608.jpg',
  },
  'brustpresse-pin': {
    datei: 'bilder/brustpresse-pin.jpg',
    urheber: 'Tyler Read',
    lizenz: 'CC BY 2.0',
    lizenzUrl: 'https://creativecommons.org/licenses/by/2.0',
    quelle: 'https://commons.wikimedia.org/wiki/File:Girl_doing_chest_press_machine_exercise.jpg',
  },
  'butterfly-pin': {
    datei: 'bilder/butterfly-pin.jpg',
    urheber: 'Aliva Sahoo',
    lizenz: 'CC BY-SA 4.0',
    lizenzUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    quelle: 'https://commons.wikimedia.org/wiki/File:Pec_deck_Fly.jpg',
  },
  'dips-station': {
    datei: 'bilder/dips-station.jpg',
    urheber: 'John Fornander',
    lizenz: 'Unsplash-Lizenz',
    lizenzUrl: 'https://unsplash.com/license',
    quelle: 'https://unsplash.com/photos/man-exercising-in-dip-station-dMWL8V7L8G4',
  },
  'face-pull': {
    datei: 'bilder/kabelzugturm.jpg',
    urheber: 'Stefan Vibes',
    lizenz: 'Unsplash-Lizenz',
    lizenzUrl: 'https://unsplash.com/license',
    quelle: 'https://unsplash.com/photos/cable-machine-in-gym-workspace-WFE0QrmLsMM',
  },
  'hs-iso-row': {
    datei: 'bilder/hs-iso-row.jpg',
    urheber: 'Stefan Vibes',
    lizenz: 'Unsplash-Lizenz',
    lizenzUrl: 'https://unsplash.com/license',
    quelle: 'https://unsplash.com/photos/seated-row-machine-in-gym-ktT4AX6j9uY',
  },
  'hs-shoulder-press': {
    datei: 'bilder/hs-shoulder-press.jpg',
    urheber: 'Aliva Sahoo',
    lizenz: 'CC BY-SA 4.0',
    lizenzUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    quelle: 'https://commons.wikimedia.org/wiki/File:Shoulder_Press.jpg',
  },
  'kabel-crunch': {
    datei: 'bilder/kabelzugturm.jpg',
    urheber: 'Stefan Vibes',
    lizenz: 'Unsplash-Lizenz',
    lizenzUrl: 'https://unsplash.com/license',
    quelle: 'https://unsplash.com/photos/cable-machine-in-gym-workspace-WFE0QrmLsMM',
  },
  'kabel-curl': {
    datei: 'bilder/kabelzugturm.jpg',
    urheber: 'Stefan Vibes',
    lizenz: 'Unsplash-Lizenz',
    lizenzUrl: 'https://unsplash.com/license',
    quelle: 'https://unsplash.com/photos/cable-machine-in-gym-workspace-WFE0QrmLsMM',
  },
  'kabel-fliegende': {
    datei: 'bilder/kabel-fliegende.jpg',
    urheber: 'Nenad Stojkovic',
    lizenz: 'CC BY 2.0',
    lizenzUrl: 'https://creativecommons.org/licenses/by/2.0',
    quelle: 'https://commons.wikimedia.org/wiki/File:Chest_flies_with_cable_machine_-_cable_crossover_flies.jpg',
  },
  'kabel-seitheben': {
    datei: 'bilder/kabelzugturm.jpg',
    urheber: 'Stefan Vibes',
    lizenz: 'Unsplash-Lizenz',
    lizenzUrl: 'https://unsplash.com/license',
    quelle: 'https://unsplash.com/photos/cable-machine-in-gym-workspace-WFE0QrmLsMM',
  },
  'kabelrudern-hoch': {
    datei: 'bilder/kabelzugturm.jpg',
    urheber: 'Stefan Vibes',
    lizenz: 'Unsplash-Lizenz',
    lizenzUrl: 'https://unsplash.com/license',
    quelle: 'https://unsplash.com/photos/cable-machine-in-gym-workspace-WFE0QrmLsMM',
  },
  'kabelrudern-sitzend': {
    datei: 'bilder/kabelrudern-sitzend.jpg',
    urheber: 'Everkinetic',
    lizenz: 'CC BY-SA 3.0',
    lizenzUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    quelle: 'https://commons.wikimedia.org/wiki/File:Cable-seated-rows-1.png',
  },
  'kh-bankdruecken': {
    datei: 'bilder/flachbank-kurzhantel.jpg',
    urheber: 'Federico Faccipieri',
    lizenz: 'Unsplash-Lizenz',
    lizenzUrl: 'https://unsplash.com/license',
    quelle: 'https://unsplash.com/photos/a-man-doing-a-bench-press-with-a-dumbbell-fGAgXh6QQEU',
  },
  'kh-curl': {
    datei: 'bilder/kh-curl.jpg',
    urheber: 'PTPioneer',
    lizenz: 'CC BY 2.0',
    lizenzUrl: 'https://creativecommons.org/licenses/by/2.0',
    quelle: 'https://commons.wikimedia.org/wiki/File:Dumbbell_bicep_curls.jpg',
  },
  'kh-fliegende': {
    datei: 'bilder/flachbank-kurzhantel.jpg',
    urheber: 'Federico Faccipieri',
    lizenz: 'Unsplash-Lizenz',
    lizenzUrl: 'https://unsplash.com/license',
    quelle: 'https://unsplash.com/photos/a-man-doing-a-bench-press-with-a-dumbbell-fGAgXh6QQEU',
  },
  'kh-rudern-einarmig': {
    datei: 'bilder/flachbank-kurzhantel.jpg',
    urheber: 'Federico Faccipieri',
    lizenz: 'Unsplash-Lizenz',
    lizenzUrl: 'https://unsplash.com/license',
    quelle: 'https://unsplash.com/photos/a-man-doing-a-bench-press-with-a-dumbbell-fGAgXh6QQEU',
  },
  'kh-schraegbankdruecken': {
    datei: 'bilder/kh-schraegbankdruecken.jpg',
    urheber: 'Everkinetic',
    lizenz: 'CC BY-SA 3.0',
    lizenzUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    quelle: 'https://commons.wikimedia.org/wiki/File:Dumbbell-incline-bench-press-1.png',
  },
  'kh-schulterdruecken': {
    datei: 'bilder/kh-schulterdruecken.jpg',
    urheber: 'Tyler Read',
    lizenz: 'CC BY 2.0',
    lizenzUrl: 'https://creativecommons.org/licenses/by/2.0',
    quelle: 'https://commons.wikimedia.org/wiki/File:Girl_doing_dumbbell_shoulder_press_02.jpg',
  },
  'kh-seitheben': {
    datei: 'bilder/kh-seitheben.jpg',
    urheber: 'GeorgeStepanek',
    lizenz: 'CC BY-SA 3.0',
    lizenzUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    quelle: 'https://commons.wikimedia.org/wiki/File:DumbbellLateralRaise.JPG',
  },
  'kh-trizeps-ueberkopf': {
    datei: 'bilder/kh-trizeps-ueberkopf.jpg',
    urheber: 'Tyler Read',
    lizenz: 'CC BY 2.0',
    lizenzUrl: 'https://creativecommons.org/licenses/by/2.0',
    quelle: 'https://commons.wikimedia.org/wiki/File:Girl_double_dumbbell_tricep_extension.jpg',
  },
  klimmzug: {
    datei: 'bilder/klimmzug.jpg',
    urheber: 'Sgt. Dylan Bowyer',
    lizenz: 'Public domain',
    lizenzUrl: 'https://commons.wikimedia.org/wiki/Public_domain',
    quelle: 'https://commons.wikimedia.org/wiki/File:Zero_to_Twenty-plus,_Marine_develops_program_to_improve_pull-ups_160219-M-GG952-003.jpg',
  },
  'latzug-breit': {
    datei: 'bilder/latzug-breit.jpg',
    urheber: 'Abooyeah',
    lizenz: 'CC BY-SA 4.0',
    lizenzUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    quelle: 'https://commons.wikimedia.org/wiki/File:Amer-Lat-Pulldown.jpg',
  },
  'latzug-eng': {
    datei: 'bilder/latzug-eng.jpg',
    urheber: 'Şule Makaroğlu',
    lizenz: 'Unsplash-Lizenz',
    lizenzUrl: 'https://unsplash.com/license',
    quelle: 'https://unsplash.com/photos/woman-in-black-sports-bra-exercising-using-lat-pull-down-machine-YFmvjO3TP_s',
  },
  'pallof-press': {
    datei: 'bilder/kabelzugturm.jpg',
    urheber: 'Stefan Vibes',
    lizenz: 'Unsplash-Lizenz',
    lizenzUrl: 'https://unsplash.com/license',
    quelle: 'https://unsplash.com/photos/cable-machine-in-gym-workspace-WFE0QrmLsMM',
  },
  'side-plank': {
    datei: 'bilder/side-plank.jpg',
    urheber: 'Jaykayfit',
    lizenz: 'CC BY-SA 3.0',
    lizenzUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    quelle: 'https://commons.wikimedia.org/wiki/File:Side_Plank.jpg',
  },
  'sz-curl': {
    datei: 'bilder/sz-curl.jpg',
    urheber: 'Phil Robson',
    lizenz: 'Unsplash-Lizenz',
    lizenzUrl: 'https://unsplash.com/license',
    quelle: 'https://unsplash.com/photos/man-performs-bicep-curls-with-weights-in-the-gym-2OUQO77kGa0',
  },
  'trizeps-kabel': {
    datei: 'bilder/kabelzugturm.jpg',
    urheber: 'Stefan Vibes',
    lizenz: 'Unsplash-Lizenz',
    lizenzUrl: 'https://unsplash.com/license',
    quelle: 'https://unsplash.com/photos/cable-machine-in-gym-workspace-WFE0QrmLsMM',
  },
};

/**
 * Ausnahmen, wenn der Übungsname als Suchbegriff nicht taugt: { [uebungId]: 'Begriff' }.
 * Hammer Strength mit vollem Modellnamen, sonst landet die Suche beim Pin-Gerät.
 * "Rudermaschine" allein liefert Ruderergometer — daher der englische Gerätename.
 */
export const SUCHBEGRIFFE = {
  'hs-chest-press': 'Hammer Strength Iso-Lateral Chest Press',
  'hs-incline-press': 'Hammer Strength Iso-Lateral Incline Press',
  'hs-iso-row': 'Hammer Strength Iso-Lateral Row',
  'hs-lat-pulldown': 'Hammer Strength Iso-Lateral Front Lat Pulldown',
  'hs-high-row': 'Hammer Strength Iso-Lateral High Row',
  'hs-shoulder-press': 'Hammer Strength Iso-Lateral Shoulder Press',
  'hs-dip': 'Hammer Strength Seated Dip',
  'rudermaschine-pin': 'Seated Row Machine Brustpolster',
  'latzug-breit': 'Latzug Maschine breiter Griff',
  'latzug-eng': 'Latzug enger Parallelgriff',
  'kabel-fliegende': 'Kabelzug Fliegende Cable Crossover',
  'seitheben-maschine': 'Lateral Raise Machine',
  'reverse-butterfly': 'Reverse Butterfly Maschine',
  trizepsmaschine: 'Trizepsmaschine Fitnessstudio',
  bizepsmaschine: 'Bizepsmaschine Fitnessstudio',
  'ab-crunch-maschine': 'Ab Crunch Maschine',
  'rotary-torso': 'Rotary Torso Maschine',
  'kabel-crunch': 'Kabel Crunch kniend',
};

/**
 * CC0, Public Domain, CC BY und CC BY-SA in jeder Version. Kein NC, kein ND.
 * Dazu 'Unsplash-Lizenz' (Unsplash License): keine CC-Lizenz, erlaubt aber freie Nutzung auch in
 * Apps. Unsplash+ (Bezahlangebot) ist ausgeschlossen.
 */
export const ERLAUBTE_LIZENZ = /^(CC0|Public domain|Unsplash-Lizenz$|CC BY(-SA)? [\d.]+)/i;

/**
 * Anzeigename der Bildquelle für den Linktext: explizites Feld quelleName, sonst aus
 * dem Host abgeleitet (Commons, Flickr), sonst der Hostname selbst.
 */
export function quelleName(bild) {
  if (bild.quelleName) return bild.quelleName;
  let host = '';
  try {
    host = new URL(bild.quelle).hostname;
  } catch {
    return 'Quelle';
  }
  if (host === 'commons.wikimedia.org') return 'Wikimedia Commons';
  if (host === 'unsplash.com' || host === 'www.unsplash.com') return 'Unsplash';
  if (host === 'flickr.com' || host === 'www.flickr.com') return 'Flickr';
  return host;
}

export function beispielbild(uebungId) {
  return BEISPIELBILDER[uebungId] || null;
}

/** Suchbegriff für die Bildersuche: Ausnahme aus SUCHBEGRIFFE, sonst Name mit ausgeschriebenen Kürzeln. */
export function suchbegriff(uebung) {
  if (SUCHBEGRIFFE[uebung.id]) return SUCHBEGRIFFE[uebung.id];
  return uebung.name.replace(/^HS /, 'Hammer Strength ').replace(/^KH-/, 'Kurzhantel ');
}

export function suchUrl(uebung) {
  return 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(suchbegriff(uebung));
}

/** Alle Einträge mit Bild samt Übungsname, nach Name sortiert (für die Bildnachweise). */
export function bildnachweise(uebungen) {
  return uebungen
    .filter((u) => BEISPIELBILDER[u.id])
    .map((u) => ({ uebungId: u.id, name: u.name, ...BEISPIELBILDER[u.id] }))
    .sort((a, b) => a.name.localeCompare(b.name, 'de'));
}
