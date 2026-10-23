import {CatalogItem} from './types';

/**
 * ╔════════════════════════════════════════════════════════════════════╗
 * ║  SIDEKICK CONTENT — EDIT HERE                                        ║
 * ║                                                                      ║
 * ║  Everything you swap for your own demo lives in the MEDIA map below. ║
 * ║  For each item id, set:                                              ║
 * ║    video     — MP4/HLS URL (must be reachable; verify it plays)      ║
 * ║    thumbnail — card art (landscape ~420x260 looks best)              ║
 * ║    hero      — wide background art (1920x1080)                       ║
 * ║                                                                      ║
 * ║  Wait, What? answers about anything you're watching; sports items    ║
 * ║  (contentType 'sports') switch it into sports mode automatically.    ║
 * ╚════════════════════════════════════════════════════════════════════╝
 */

interface Media {
  video: string;
  thumbnail: string;
  hero: string;
}

// Placeholder image helper (random art). Replace with your real poster URLs.
const img = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

// Known-good sample clips (verified to play on the Vega simulator).
const SINTEL = 'https://media.w3.org/2010/05/sintel/trailer.mp4';
const BBB_10S =
  'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4';

// CC-licensed films from Amazon's vega-sports-app CDN (MIT-0, verified
// reachable + decode on the Vega sim). Reused here as general film content.
const CDN = 'https://d1v0fxmwkpxbrg.cloudfront.net/videos/mp4';
const FILM = {
  tears: `${CDN}/tears-of-steel/720p/tears-of-steel.mp4`,
  cosmos: `${CDN}/cosmos-laundromat/720p/cosmos-laundromat.mp4`,
  glass: `${CDN}/glass-half/720p/glass-half.mp4`,
};

// Real sports clips + posters hosted on the project's S3 bucket (public-read,
// verified HTTP 206). License-clear footage the team captured/owns.
const S3 = 'https://sidekickvegaos.s3.us-east-1.amazonaws.com';
const sportVid = (name: string) => `${S3}/${name}.mp4`;
const sportImg = (name: string) => `${S3}/${name}.jpg`;

/** ⟶ EDIT THIS MAP to use your own content. Keys are catalog item ids. */
export const MEDIA: Record<string, Media> = {
  show01: {
    video: SINTEL,
    thumbnail: img('sintel', 420, 260),
    hero: img('sintel-hero', 1920, 1080),
  },
  movie03: {
    video: FILM.tears,
    thumbnail: img('steel', 420, 260),
    hero: img('steel-hero', 1920, 1080),
  },
  movie02: {
    video: BBB_10S,
    thumbnail: img('bunny', 420, 260),
    hero: img('bunny-hero', 1920, 1080),
  },
  movie04: {
    video: FILM.cosmos,
    thumbnail: img('cosmos', 420, 260),
    hero: img('cosmos-hero', 1920, 1080),
  },
  movie05: {
    video: FILM.glass,
    thumbnail: img('halflife', 420, 260),
    hero: img('halflife-hero', 1920, 1080),
  },
  // Real, license-clear amateur sports footage (see catalog entries below).
  game01: {
    video: sportVid('basketball'),
    thumbnail: sportImg('basketball'),
    hero: sportImg('basketball'),
  },
  game02: {
    video: sportVid('american_football'),
    thumbnail: sportImg('american_football'),
    hero: sportImg('american_football'),
  },
  game03: {
    video: sportVid('hockey'),
    thumbnail: sportImg('hockey'),
    hero: sportImg('hockey'),
  },
  game04: {
    video: sportVid('soccer'),
    thumbnail: sportImg('soccer'),
    hero: sportImg('soccer'),
  },
  game05: {
    video: sportVid('tennis'),
    thumbnail: sportImg('tennis'),
    hero: sportImg('tennis'),
  },
  game06: {
    video: sportVid('boxing'),
    thumbnail: sportImg('boxing'),
    hero: sportImg('boxing'),
  },
  game07: {
    video: sportVid('wrestling'),
    thumbnail: sportImg('wrestling'),
    hero: sportImg('wrestling'),
  },
  game08: {
    video: sportVid('baseball'),
    thumbnail: sportImg('baseball'),
    hero: sportImg('baseball'),
  },
  game09: {
    video: sportVid('rowing'),
    thumbnail: sportImg('rowing'),
    hero: sportImg('rowing'),
  },
};

const m = (id: string): Media =>
  MEDIA[id] ?? {
    video: SINTEL,
    thumbnail: img(id, 420, 260),
    hero: img(id, 1920, 1080),
  };

/**
 * The catalog — all general shows/movies. SideKick answers questions about any
 * of them (actors, plot, background) in companion mode.
 */
export const CATALOG: CatalogItem[] = [
  // ----- Row: Sports — titles and context describe what each clip actually
  // shows (amateur/pickup footage, no real teams, no scoreboard, so no scores). -----
  {
    id: 'game01',
    title: 'Blacktop 1-on-1 — Drive to the Hoop',
    row: 'Sports',
    contentType: 'sports',
    videoUrl: m('game01').video,
    thumbnail: m('game01').thumbnail,
    headerImage: m('game01').hero,
    synopsis:
      "Drone's-eye view of a sunny outdoor concrete court: two young players go one-on-one at the top of the key, then the ball handler drives to the rim.",
    genres: ['Basketball', 'Pickup'],
    releaseYear: 2026,
    rating: 'SPORTS',
    context: {
      format: '1-on-1 pickup game',
      setting: 'Outdoor concrete court on a sunny afternoon',
      camera: 'Overhead drone, moving with the play',
      onTheBall: 'Player in the white tank top and red shoes',
      defender: 'Player in the white shirt with black sleeves',
    },
  },
  {
    id: 'game02',
    title: 'Gold & White vs. Green — Pileup at the 30',
    row: 'Sports',
    contentType: 'sports',
    videoUrl: m('game02').video,
    thumbnail: m('game02').thumbnail,
    headerImage: m('game02').hero,
    synopsis:
      'An amateur football game on a sunny grass field: a play develops between the 40- and 30-yard lines and ends in a pileup around the 30 as the referee signals.',
    genres: ['Football', 'Amateur'],
    releaseYear: 2026,
    rating: 'SPORTS',
    context: {
      teams:
        'White jerseys with gold trim vs. green-and-gold jerseys (fictional, unnamed)',
      setting: 'Grass field with a small covered grandstand, sunny with clouds',
      camera: 'Sideline, at field level',
    },
  },
  {
    id: 'game03',
    title: 'Rink Scrimmage — White vs. Black',
    row: 'Sports',
    contentType: 'sports',
    videoUrl: m('game03').video,
    thumbnail: m('game03').thumbnail,
    headerImage: m('game03').hero,
    synopsis:
      'Pickup hockey at an indoor rink: skaters in white and black jerseys battle for the puck along the boards, then a black-jersey skater carries it in toward the net.',
    genres: ['Hockey', 'Scrimmage'],
    releaseYear: 2026,
    rating: 'SPORTS',
    context: {
      teams: 'White jerseys with light-blue pants vs. black jerseys',
      setting: 'Indoor rink, practice-style scrimmage, no crowd',
      camera: 'Ice level, along the boards',
    },
  },
  {
    id: 'game04',
    title: 'Five-a-Side — Maroon Breaks for Goal',
    row: 'Sports',
    contentType: 'sports',
    videoUrl: m('game04').video,
    thumbnail: m('game04').thumbnail,
    headerImage: m('game04').hero,
    synopsis:
      'A small-sided game on an outdoor turf pitch: a player in maroon carries the ball past a defender in a blue bib and drives a shot toward goal.',
    genres: ['Soccer', 'Small-sided'],
    releaseYear: 2026,
    rating: 'SPORTS',
    context: {
      teams: 'Maroon shirts vs. light-blue training bibs',
      setting: 'Fenced artificial-turf pitch, overcast day',
      camera: 'Pitch level, following the ball',
    },
  },
  {
    id: 'game05',
    title: 'Baseline Rally — Overhead Court Cam',
    row: 'Sports',
    contentType: 'sports',
    videoUrl: m('game05').video,
    thumbnail: m('game05').thumbnail,
    headerImage: m('game05').hero,
    synopsis:
      'Straight-down drone view of a blue hard court: two singles players trade groundstrokes from the baselines as the net casts a long afternoon shadow.',
    genres: ['Tennis', 'Singles'],
    releaseYear: 2026,
    rating: 'SPORTS',
    context: {
      players:
        'One player in white (left baseline), one in red (right baseline)',
      setting: 'Outdoor blue hard court, late-afternoon sun',
      camera: 'Overhead drone, fixed',
    },
  },
  {
    id: 'game06',
    title: 'Ring Bout — Blue Gloves vs. Red Gloves',
    row: 'Sports',
    contentType: 'sports',
    videoUrl: m('game06').video,
    thumbnail: m('game06').thumbnail,
    headerImage: m('game06').hero,
    synopsis:
      'Close-up inside the ropes: a fighter in blue gloves works his jab against a guarded opponent in red gloves, then they close in and trade at short range.',
    genres: ['Boxing', 'Bout'],
    releaseYear: 2026,
    rating: 'SPORTS',
    context: {
      fighters:
        'Blue gloves and blue trunks vs. red-and-gold gloves with a script tattoo down his spine',
      setting: 'Boxing ring under teal lights',
      camera: 'Handheld, inside the ring',
    },
  },
  {
    id: 'game07',
    title: 'Lucha Libre — Masked Tag-Team Clash',
    row: 'Sports',
    contentType: 'sports',
    videoUrl: m('game07').video,
    thumbnail: m('game07').thumbnail,
    headerImage: m('game07').hero,
    synopsis:
      'A packed lucha libre arena: a masked wrestler in red pants takes his opponent to the mat as the referee waves, while a gold-masked partner waits on the apron.',
    genres: ['Wrestling', 'Lucha Libre'],
    releaseYear: 2026,
    rating: 'SPORTS',
    context: {
      format: 'Tag-team lucha libre match',
      setting: 'Arena with a big crowd and video screens',
      camera: 'Ringside',
    },
  },
  {
    id: 'game08',
    title: 'Sandlot Baseball — At-Bat Under the Palms',
    row: 'Sports',
    contentType: 'sports',
    videoUrl: m('game08').video,
    thumbnail: m('game08').thumbnail,
    headerImage: m('game08').hero,
    synopsis:
      'Behind-the-plate view at a dusty, palm-lined diamond: a batter in blue swings, then the catcher in black stands and watches the play unfold in the field.',
    genres: ['Baseball', 'Amateur'],
    releaseYear: 2026,
    rating: 'SPORTS',
    context: {
      teams: 'Blue jerseys (batting) vs. black-and-grey uniforms (fielding)',
      setting: 'Dirt infield, palm trees, sunny tropical day',
      camera: 'Behind home plate, through the backstop',
    },
  },
  {
    id: 'game09',
    title: 'Rowing — Three Crews on the Lake',
    row: 'Sports',
    contentType: 'sports',
    videoUrl: m('game09').video,
    thumbnail: m('game09').thumbnail,
    headerImage: m('game09').hero,
    synopsis:
      "Drone shot over calm, sunny water: three rowing crews pull in parallel past a waterfront town while a coach's launch motors alongside.",
    genres: ['Rowing', 'Training'],
    releaseYear: 2026,
    rating: 'SPORTS',
    context: {
      crews: 'Three boats in parallel lanes; the nearest is a four',
      setting: 'Wide lake or river beside a waterfront town, summer day',
      camera: 'High overhead drone, tracking the boats',
    },
  },

  // ----- Row: Featured -----
  {
    id: 'show01',
    title: 'Sintel',
    row: 'Featured',
    contentType: 'movie',
    videoUrl: m('show01').video,
    thumbnail: m('show01').thumbnail,
    headerImage: m('show01').hero,
    synopsis:
      'Trailer for the Blender Foundation fantasy short: Sintel, a lone young woman, crosses snowy mountains and hostile lands searching for Scales, the baby dragon she rescued and lost.',
    genres: ['Fantasy', 'Animation', 'Adventure'],
    releaseYear: 2010,
    rating: '8.2',
    context: {
      characters: [
        'Sintel, a wandering young warrior',
        'Scales, her baby dragon',
      ],
      genre: 'Animated fantasy (trailer)',
    },
  },
  {
    id: 'movie03',
    title: 'Tears of Steel',
    row: 'Featured',
    contentType: 'movie',
    videoUrl: m('movie03').video,
    thumbnail: m('movie03').thumbnail,
    headerImage: m('movie03').hero,
    synopsis:
      'A sci-fi short: a group of warriors and scientists in a future Amsterdam attempt to save the world from destructive robots using memories of the past.',
    genres: ['Sci-Fi', 'Action'],
    releaseYear: 2012,
    rating: '8.0',
    context: {
      cast: ['Derek de Lint as Thom', 'Sergio Hasselbaink as Barley'],
      genre: 'Science fiction',
    },
  },

  // ----- Row: Shows & Movies -----
  {
    id: 'movie02',
    title: 'Big Buck Bunny',
    row: 'Shows & Movies',
    contentType: 'movie',
    videoUrl: m('movie02').video,
    thumbnail: m('movie02').thumbnail,
    headerImage: m('movie02').hero,
    synopsis:
      'A 10-second clip from the Blender Institute comedy short: a big, gentle rabbit in a sunny meadow, before three rodent bullies push him too far.',
    genres: ['Animation', 'Comedy'],
    releaseYear: 2008,
    rating: '7.8',
    context: {
      characters: [
        'Big Buck Bunny',
        'Frank, Rinky and Gimera, the rodent bullies',
      ],
      genre: 'Animated comedy (clip)',
    },
  },

  {
    id: 'movie04',
    title: 'Cosmos Laundromat',
    row: 'Shows & Movies',
    contentType: 'movie',
    videoUrl: m('movie04').video,
    thumbnail: m('movie04').thumbnail,
    headerImage: m('movie04').hero,
    synopsis:
      'A suicidal sheep named Franck meets a quirky salesman offering him the deal of a lifetime across infinite possible worlds.',
    genres: ['Animation', 'Comedy', 'Drama'],
    releaseYear: 2015,
    rating: '7.6',
    context: {cast: ['Pierre as Franck', 'The Salesman']},
  },
  {
    id: 'movie05',
    title: 'Glass Half',
    row: 'Shows & Movies',
    contentType: 'movie',
    videoUrl: m('movie05').video,
    thumbnail: m('movie05').thumbnail,
    headerImage: m('movie05').hero,
    synopsis:
      'A witty animated short about art, perception, and whether the glass is half full — told through a gallery of clashing opinions.',
    genres: ['Animation', 'Comedy'],
    releaseYear: 2015,
    rating: '7.4',
    context: {cast: ['The Critic', 'The Optimist']},
  },
];

/** Distinct row titles, in display order. */
export const CATALOG_ROWS = (): string[] => {
  const seen: string[] = [];
  for (const item of CATALOG) {
    if (item.row && !seen.includes(item.row)) {
      seen.push(item.row);
    }
  }
  return seen;
};

/** Items belonging to a given row. */
export const itemsForRow = (row: string): CatalogItem[] =>
  CATALOG.filter((c) => c.row === row);

export const getCatalogItem = (id: string): CatalogItem | undefined =>
  CATALOG.find((c) => c.id === id);
