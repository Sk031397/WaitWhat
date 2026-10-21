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
 * ║  SideKick is a general "ask about anything you're watching"          ║
 * ║  companion — every item is a show/movie. (Sports mode exists in the  ║
 * ║  codebase but no catalog item triggers it right now.)                ║
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
const BBB_10S = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4';

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
  show01:  { video: SINTEL,     thumbnail: img('northern', 420, 260), hero: img('northern-hero', 1920, 1080) },
  movie03: { video: FILM.tears, thumbnail: img('steel', 420, 260),    hero: img('steel-hero', 1920, 1080) },
  show02:  { video: SINTEL,     thumbnail: img('glass', 420, 260),    hero: img('glass-hero', 1920, 1080) },
  movie01: { video: SINTEL,     thumbnail: img('lanterns', 420, 260), hero: img('lanterns-hero', 1920, 1080) },
  movie02: { video: BBB_10S,    thumbnail: img('dust', 420, 260),     hero: img('dust-hero', 1920, 1080) },
  movie04: { video: FILM.cosmos,thumbnail: img('cosmos', 420, 260),   hero: img('cosmos-hero', 1920, 1080) },
  movie05: { video: FILM.glass, thumbnail: img('halflife', 420, 260), hero: img('halflife-hero', 1920, 1080) },
  // Made-up sports (fictional teams/stats) over REAL, license-clear footage.
  // basketball matches the seeded game data (Q4, points/rebounds).
  game01:  { video: sportVid('basketball'),        thumbnail: sportImg('basketball'),        hero: sportImg('basketball') },
  game02:  { video: sportVid('american_football'), thumbnail: sportImg('american_football'), hero: sportImg('american_football') },
  game03:  { video: sportVid('hockey'),            thumbnail: sportImg('hockey'),            hero: sportImg('hockey') },
  game04:  { video: sportVid('soccer'),            thumbnail: sportImg('soccer'),            hero: sportImg('soccer') },
  game05:  { video: sportVid('tennis'),            thumbnail: sportImg('tennis'),            hero: sportImg('tennis') },
  game06:  { video: sportVid('boxing'),            thumbnail: sportImg('boxing'),            hero: sportImg('boxing') },
  game07:  { video: sportVid('wrestling'),         thumbnail: sportImg('wrestling'),         hero: sportImg('wrestling') },
  game08:  { video: sportVid('baseball'),          thumbnail: sportImg('baseball'),          hero: sportImg('baseball') },
  game09:  { video: sportVid('rowing'),            thumbnail: sportImg('rowing'),            hero: sportImg('rowing') },
};

const m = (id: string): Media =>
  MEDIA[id] ?? { video: SINTEL, thumbnail: img(id, 420, 260), hero: img(id, 1920, 1080) };

/**
 * The catalog — all general shows/movies. SideKick answers questions about any
 * of them (actors, plot, background) in companion mode.
 */
export const CATALOG: CatalogItem[] = [
  // ----- Row: Live Sports (made-up — fictional teams/players, no real league) -----
  {
    id: 'game01',
    title: 'Coastal Kings vs. Summit City — Q4',
    row: 'Live Sports',
    contentType: 'sports',
    videoUrl: m('game01').video,
    thumbnail: m('game01').thumbnail,
    headerImage: m('game01').hero,
    synopsis:
      'Fourth quarter of a tight basketball game. Coastal Kings trail Summit City by 4 with 6:12 to play; Summit City is in the bonus.',
    genres: ['Basketball', 'Live'],
    releaseYear: 2026,
    rating: 'LIVE',
    context: {
      homeTeam: 'Summit City',
      awayTeam: 'Coastal Kings',
      venue: 'Summit City Arena',
      star: 'A. Okafor',
    },
  },
  {
    id: 'game02',
    title: 'Rivercity Hawks vs. Granite Bay — 2nd Half',
    row: 'Live Sports',
    contentType: 'sports',
    videoUrl: m('game02').video,
    thumbnail: m('game02').thumbnail,
    headerImage: m('game02').hero,
    synopsis:
      'Second half of a hard-fought football matchup. Rivercity Hawks lead Granite Bay 21-17 with the ball near midfield.',
    genres: ['Football', 'Live'],
    releaseYear: 2026,
    rating: 'LIVE',
    context: { homeTeam: 'Granite Bay', awayTeam: 'Rivercity Hawks' },
  },
  {
    id: 'game03',
    title: 'Frost vs. Harbor Wolves — 3rd Period',
    row: 'Live Sports',
    contentType: 'sports',
    videoUrl: m('game03').video,
    thumbnail: m('game03').thumbnail,
    headerImage: m('game03').hero,
    synopsis:
      'Third period of a tied hockey game. The Frost and the Harbor Wolves are deadlocked 2-2 with under eight minutes left.',
    genres: ['Hockey', 'Live'],
    releaseYear: 2026,
    rating: 'LIVE',
    context: { homeTeam: 'Harbor Wolves', awayTeam: 'Frost' },
  },
  {
    id: 'game04',
    title: 'Azure United vs. Verde FC — 2nd Half',
    row: 'Live Sports',
    contentType: 'sports',
    videoUrl: m('game04').video,
    thumbnail: m('game04').thumbnail,
    headerImage: m('game04').hero,
    synopsis:
      'Second half of a tense soccer derby. Azure United and Verde FC are level 1-1 with twenty minutes to play.',
    genres: ['Soccer', 'Live'],
    releaseYear: 2026,
    rating: 'LIVE',
    context: { homeTeam: 'Verde FC', awayTeam: 'Azure United' },
  },
  {
    id: 'game05',
    title: 'Vale vs. Chen — Championship Final',
    row: 'Live Sports',
    contentType: 'sports',
    videoUrl: m('game05').video,
    thumbnail: m('game05').thumbnail,
    headerImage: m('game05').hero,
    synopsis:
      'The deciding set of a championship tennis final. Vale leads Chen a set apiece, 4-3 in the third.',
    genres: ['Tennis', 'Live'],
    releaseYear: 2026,
    rating: 'LIVE',
    context: { playerOne: 'R. Vale', playerTwo: 'L. Chen' },
  },
  {
    id: 'game06',
    title: 'Mercer vs. Diallo — Title Bout',
    row: 'Live Sports',
    contentType: 'sports',
    videoUrl: m('game06').video,
    thumbnail: m('game06').thumbnail,
    headerImage: m('game06').hero,
    synopsis:
      'A heavyweight title bout, round 8 of 12. Mercer and Diallo are trading heavy shots; the cards are close.',
    genres: ['Boxing', 'Live'],
    releaseYear: 2026,
    rating: 'LIVE',
    context: { fighterOne: 'K. Mercer', fighterTwo: 'O. Diallo' },
  },
  {
    id: 'game07',
    title: 'Kessler vs. Boone — Title Match',
    row: 'Live Sports',
    contentType: 'sports',
    videoUrl: m('game07').video,
    thumbnail: m('game07').thumbnail,
    headerImage: m('game07').hero,
    synopsis:
      'The main-event wrestling title match. Kessler and Boone are trading momentum in the third period with the crowd on its feet.',
    genres: ['Wrestling', 'Live'],
    releaseYear: 2026,
    rating: 'LIVE',
    context: { wrestlerOne: 'T. Kessler', wrestlerTwo: 'D. Boone' },
  },
  {
    id: 'game08',
    title: 'Ironside vs. Crestfall — 7th Inning',
    row: 'Live Sports',
    contentType: 'sports',
    videoUrl: m('game08').video,
    thumbnail: m('game08').thumbnail,
    headerImage: m('game08').hero,
    synopsis:
      'Seventh inning of a tense baseball matchup. Ironside lead Crestfall 4-3 with runners on first and second and two outs.',
    genres: ['Baseball', 'Live'],
    releaseYear: 2026,
    rating: 'LIVE',
    context: { homeTeam: 'Crestfall', awayTeam: 'Ironside' },
  },
  {
    id: 'game09',
    title: 'Meridian vs. Stonebridge — Finals Heat',
    row: 'Live Sports',
    contentType: 'sports',
    videoUrl: m('game09').video,
    thumbnail: m('game09').thumbnail,
    headerImage: m('game09').hero,
    synopsis:
      'The A-final of a championship rowing regatta. Meridian and Stonebridge are stroke-for-stroke with 500 metres to go.',
    genres: ['Rowing', 'Live'],
    releaseYear: 2026,
    rating: 'LIVE',
    context: { teamOne: 'Meridian', teamTwo: 'Stonebridge' },
  },

  // ----- Row: Featured -----
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
    sceneMoments: [
      { atSeconds: 8, text: 'New scene: the crew reaches the supply cache and finds it raided — the moment the season’s central mystery begins.' },
      { atSeconds: 20, text: 'Watch Elin here — this exchange pays off the fuel-log confrontation from last episode.' },
    ],
    context: {
      cast: ['Mara Lindqvist as Dr. Elin Vos', 'Theo Grant as Captain Reyes'],
      previousEpisode:
        'Elin confronted Reyes about the missing fuel logs; the storm front arrived early.',
      genre: 'Survival drama',
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
    releaseYear: 2024,
    rating: '8.0',
    context: {
      cast: ['Derek de Lint as Thom', 'Sergio Hasselbaink as Barley'],
      genre: 'Science fiction',
    },
  },

  // ----- Row: Shows & Movies -----
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

  // ----- Row: More to Explore -----
  {
    id: 'movie04',
    title: 'Cosmos Laundromat',
    row: 'More to Explore',
    contentType: 'movie',
    videoUrl: m('movie04').video,
    thumbnail: m('movie04').thumbnail,
    headerImage: m('movie04').hero,
    synopsis:
      'A suicidal sheep named Franck meets a quirky salesman offering him the deal of a lifetime across infinite possible worlds.',
    genres: ['Animation', 'Comedy', 'Drama'],
    releaseYear: 2023,
    rating: '7.6',
    context: { cast: ['Pierre as Franck', 'The Salesman'] },
  },
  {
    id: 'movie05',
    title: 'Glass Half',
    row: 'More to Explore',
    contentType: 'movie',
    videoUrl: m('movie05').video,
    thumbnail: m('movie05').thumbnail,
    headerImage: m('movie05').hero,
    synopsis:
      'A witty animated short about art, perception, and whether the glass is half full — told through a gallery of clashing opinions.',
    genres: ['Animation', 'Comedy'],
    releaseYear: 2022,
    rating: '7.4',
    context: { cast: ['The Critic', 'The Optimist'] },
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

/** Find a scene moment whose timestamp was just crossed between prev and now. */
export const sceneMomentCrossed = (item: CatalogItem, prev: number, now: number) =>
  item.sceneMoments?.find((sm) => prev < sm.atSeconds && now >= sm.atSeconds);
