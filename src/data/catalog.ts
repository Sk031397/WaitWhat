import { CatalogItem } from './types';

/**
 * Demo catalog for the SideKick landing page.
 *
 * The home screen renders a hero header (driven by the focused card) plus
 * horizontal rows of thumbnails — the same shape as the AmazonAppDev
 * multi-tv-app-sample, minus the drawer.
 *
 * Each item carries a `thumbnail` (card art) and `headerImage` (wide hero art).
 * Video URLs use small, public, CORS/range-friendly sample MP4s that are
 * verified reachable (HTTP 206). Swap for your own clips before recording.
 */

// Verified-reachable public sample MP4s (range requests return 206).
// NOTE: the old Google `gtv-videos-bucket` samples now return HTTP 403 and
// will NOT play — do not use them.
const W3 = 'https://media.w3.org/2010/05';
const TV = 'https://test-videos.co.uk/vids';
const img = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

// Short, reliable clips.
const CLIPS = {
  sintel: `${W3}/sintel/trailer.mp4`,
  bunny: `${W3}/bunny/movie.mp4`,
  bbb10: `${TV}/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4`,
  bbb30: `${W3}/sintel/trailer.mp4`,
};

export const CATALOG: CatalogItem[] = [
  // ----- Row: Featured (mixed) -----
  {
    id: 'show01',
    title: 'The Northern Expanse',
    row: 'Featured',
    contentType: 'show',
    videoUrl: CLIPS.sintel,
    thumbnail: img('northern', 420, 260),
    headerImage: img('northern-hero', 1920, 1080),
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
    videoUrl: CLIPS.bbb30,
    thumbnail: img('kings', 420, 260),
    headerImage: img('kings-hero', 1920, 1080),
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
    videoUrl: CLIPS.bunny,
    thumbnail: img('glass', 420, 260),
    headerImage: img('glass-hero', 1920, 1080),
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
    videoUrl: CLIPS.sintel,
    thumbnail: img('lanterns', 420, 260),
    headerImage: img('lanterns-hero', 1920, 1080),
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
    videoUrl: CLIPS.bbb10,
    thumbnail: img('dust', 420, 260),
    headerImage: img('dust-hero', 1920, 1080),
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
    videoUrl: CLIPS.bbb30,
    thumbnail: img('fullcourt', 420, 260),
    headerImage: img('fullcourt-hero', 1920, 1080),
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
    videoUrl: CLIPS.bbb10,
    thumbnail: img('okafor', 420, 260),
    headerImage: img('okafor-hero', 1920, 1080),
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
