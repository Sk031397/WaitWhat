import {
  parseFractionalPhrase,
  parseSeekIntent,
  parseTimePhrase,
} from '../src/util/parseTimePhrase';

describe('parseTimePhrase', () => {
  it.each([
    ['take me to 0:10', 10],
    ['go to 1:02:03', 3723],
    ['at minute 2', 120],
    ['3 minutes in', 180],
    ['45 secs in', 45],
    ['go to the start', 0],
  ])('%s -> %d', (phrase, seconds) => {
    expect(parseTimePhrase(phrase)).toBe(seconds);
  });

  it('returns null when there is no time phrase', () => {
    expect(parseTimePhrase('who is that?')).toBeNull();
  });
});

describe('parseFractionalPhrase', () => {
  it.each([
    ['go to the middle', 50],
    ['go to the end', 98],
    ['a quarter of the way', 25],
    ['three quarters in', 75],
    ['60 percent', 60],
  ])('%s -> %d (of 100s)', (phrase, seconds) => {
    expect(parseFractionalPhrase(phrase, 100)).toBe(seconds);
  });

  it('needs a known duration', () => {
    expect(parseFractionalPhrase('go to the middle', 0)).toBeNull();
    expect(parseFractionalPhrase('go to the middle', NaN)).toBeNull();
  });
});

describe('parseSeekIntent', () => {
  it('treats "go back N seconds" as a relative rewind, not an absolute time', () => {
    expect(parseSeekIntent('go back 10 seconds')).toEqual({
      absoluteSeconds: null,
      relativeSeconds: -10,
      verb: 'Rewound',
      pureControl: true,
    });
  });

  it('skips ahead by the given amount', () => {
    expect(parseSeekIntent('skip ahead 30 seconds')).toMatchObject({
      relativeSeconds: 30,
      verb: 'Skipped ahead',
    });
  });

  it('defaults a bare "rewind" to 10 seconds', () => {
    expect(parseSeekIntent('rewind')).toMatchObject({
      relativeSeconds: -10,
      verb: 'Rewound',
    });
  });

  it('keeps a question attached to a jump (not pure control)', () => {
    expect(
      parseSeekIntent("take me to 0:10 and tell me what's happening"),
    ).toMatchObject({
      absoluteSeconds: 10,
      verb: 'Jumped',
      pureControl: false,
    });
  });

  it('returns null for a normal question', () => {
    expect(parseSeekIntent('who is that?')).toBeNull();
  });
});
