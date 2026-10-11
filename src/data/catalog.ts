import { CatalogItem } from './types';

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
 * ║  You can host files anywhere reachable (S3, your own server, a CDN). ║
 * ║  To bundle local files, drop them in assets/media/ and point to      ║
 * ║  their packaged URL — see assets/media/README.md.                    ║
 * ║                                                                      ║
 * ║  IMPORTANT: test each video on the Vega simulator. Not every MP4     ║
 * ║  decodes there — the Sintel/Big Buck Bunny samples below are known   ║
 * ║  good. The old Google gtv-videos-bucket URLs now 403 — don't use.    ║
 * ╚════════════════════════════════════════════════════════════════════╝
 */

interface Media {
  video: string;
  thumbnail: string;
  hero: string;
}

// Placeholder image helper (random art). Replace `thumbnail`/`hero` with your
// real poster URLs to instantly lift perceived quality.
const img = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

// Known-good sample clips (verified to play on the Vega simulator).
const SINTEL = 'https://media.w3.org/2010/05/sintel/trailer.mp4';
const BBB_10S = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4';

/** ⟶ EDIT THIS MAP to use your own content. Keys are catalog item ids. */
export const MEDIA: Record<string, Media> = {
  show01:  { video: SINTEL,  thumbnail: img('northern', 420, 260),  hero: img('northern-hero', 1920, 1080) },
  game01:  { video: SINTEL,  thumbnail: img('kings', 420, 260),     hero: img('kings-hero', 1920, 1080) },
  show02:  { video: SINTEL,  thumbnail: img('glass', 420, 260),     hero: img('glass-hero', 1920, 1080) },
  movie01: { video: SINTEL,  thumbnail: img('lanterns', 420, 260),  hero: img('lanterns-hero', 1920, 1080) },
  movie02: { video: BBB_10S, thumbnail: img('dust', 420, 260),      hero: img('dust-hero', 1920, 1080) },
  game01b: { video: SINTEL,  thumbnail: img('fullcourt', 420, 260), hero: img('fullcourt-hero', 1920, 1080) },
  game01c: { video: BBB_10S, thumbnail: img('okafor', 420, 260),    hero: img('okafor-hero', 1920, 1080) },
};

const m = (id: string): Media =>
  MEDIA[id] ?? { video: SINTEL, thumbnail: img(id, 420, 260), hero: img(id, 1920, 1080) };

/**
 * The catalog itself — titles, synopsis, and the AI grounding context. The
 * media (video/images) is pulled from the MEDIA map above by id, so you only
 * edit content in one place.
 */
export const CATALOG: CatalogItem[] = [
  // ----- Row: Featured (mixed) -----
  {
    id: 'show01',
    title: 'The Northern Expanse',
    row: 'Featured',
    contentType: 'show',
    videoUrl: m('show01').video,
    thumbnail: m('show01').thumbnail,
    headerImage: m('show01').hero,
    synopsis:
      'A survival drama following two estranged siblings guiding a research crew across a collapsing arctic shelf. Season 2, Episode 4: the crew discovers the supply cache has been raided.',
    genres: ['Drama', 'Survival'],
    releaseYear: 2025,
    rating: '8.7',
    context: {
      cast: ['Mara Lindqvist as Dr. Elin Vos', 'Theo Grant as Captain Reyes'],
      previousEpisode:
        'Elin confronted Reyes about the missing fuel logs; the storm front arrived early.',
      genre: 'Survival drama',
    },
  },
  {
    id: 'game01',
    title: 'Coastal Kings vs. Summit City — Q4',
    row: 'Featured',
    contentType: 'sports',
    gameId: 'game01',
    videoUrl: m('game01').video,
    thumbnail: m('game01').thumbnail,
    headerImage: m('game01').hero,
    synopsis:
      'Fourth quarter of a tight regular-season basketball game. Coastal Kings trail by 4 with 6:12 to play; Summit City is in the bonus.',
    genres: ['Sports', 'Live'],
    releaseYear: 2026,
    rating: 'LIVE',
    context: {
      homeTeam: 'Summit City',
      awayTeam: 'Coastal Kings',
      venue: 'Summit City Arena',
      star: 'A. Okafor',
    },
  },

  // ----- Row: Shows & Movies (general mode) -----
  {
    id: 'show02',
    title: 'Glass Harbor',
    row: 'Shows & Movies',
    contentType: 'show',
    videoUrl: m('show02').video,
    thumbnail: m('show02').thumbnail,
    headerImage: m('show02').hero,
    synopsis:
      'A detective anthology set in a rain-soaked coastal city where every case ties back to a single disappearance.',
    genres: ['Mystery', 'Crime'],
    releaseYear: 2024,
    rating: '8.1',
    context: {
      cast: ['Nadia Price as Det. Correa', 'Sam Oyelaran as ADA Finch'],
      previousEpisode: 'Correa found the ferry ticket stub in the victim’s coat.',
    },
  },
  {
    id: 'movie01',
    title: 'Paper Lanterns',
    row: 'Shows & Movies',
    contentType: 'movie',
    videoUrl: m('movie01').video,
    thumbnail: m('movie01').thumbnail,
    headerImage: m('movie01').hero,
    synopsis:
      'A quiet drama about a festival lantern-maker reuniting with the daughter he lost touch with over twenty years.',
    genres: ['Drama'],
    releaseYear: 2023,
    rating: '7.9',
    context: { cast: ['Ken Watari as Hiro', 'Lia Monroe as June'] },
  },
  {
    id: 'movie02',
    title: 'Dust & Signal',
    row: 'Shows & Movies',
    contentType: 'movie',
    videoUrl: m('movie02').video,
    thumbnail: m('movie02').thumbnail,
    headerImage: m('movie02').hero,
    synopsis:
      'Two radio operators in a near-future dust belt pick up a signal that should not exist.',
    genres: ['Sci-Fi', 'Thriller'],
    releaseYear: 2025,
    rating: '8.3',
    context: { cast: ['Priya Nalin as Asha', 'Diego Marín as Cole'] },
  },

  // ----- Row: Live Sports (sports mode) -----
  {
    id: 'game01b',
    title: 'Kings vs. City — Full Court',
    row: 'Live Sports',
    contentType: 'sports',
    gameId: 'game01',
    videoUrl: m('game01b').video,
    thumbnail: m('game01b').thumbnail,
    headerImage: m('game01b').hero,
    synopsis:
      'Wide-angle broadcast feed of the Coastal Kings at Summit City. Fourth quarter, one-possession game.',
    genres: ['Sports', 'Live'],
    releaseYear: 2026,
    rating: 'LIVE',
    context: { homeTeam: 'Summit City', awayTeam: 'Coastal Kings', star: 'A. Okafor' },
  },
  {
    id: 'game01c',
    title: 'Okafor — Player Cam',
    row: 'Live Sports',
    contentType: 'sports',
    gameId: 'game01',
    videoUrl: m('game01c').video,
    thumbnail: m('game01c').thumbnail,
    headerImage: m('game01c').hero,
    synopsis:
      'Isolated camera on Summit City star A. Okafor, having a 31-point, 12-rebound night.',
    genres: ['Sports', 'Live'],
    releaseYear: 2026,
    rating: 'LIVE',
    context: { homeTeam: 'Summit City', awayTeam: 'Coastal Kings', star: 'A. Okafor' },
  },
];

/** Distinct row titles, in display order. */
export const CATALOG_ROWS = (): string[] => {
  const seen: string[] = [];
  for (const item of CATALOG) {
    if (item.row && !seen.includes(item.row)) seen.push(item.row);
  }
  return seen;
};

/** Items belonging to a given row. */
export const itemsForRow = (row: string): CatalogItem[] =>
  CATALOG.filter((c) => c.row === row);

export const getCatalogItem = (id: string): CatalogItem | undefined =>
  CATALOG.find((c) => c.id === id);
