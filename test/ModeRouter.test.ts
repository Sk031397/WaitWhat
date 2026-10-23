import {buildAskRequest, videoIdFor} from '../src/sidekick/ModeRouter';
import {CATALOG} from '../src/data/catalog';
import {formatTime} from '../src/util/formatTime';

describe('videoIdFor', () => {
  it('uses the file name without extension or query', () => {
    expect(videoIdFor('https://cdn.example.com/a/tears-of-steel.mp4?x=1')).toBe(
      'tears-of-steel',
    );
  });
});

describe('buildAskRequest', () => {
  it('grounds the request on the item and rounded position', () => {
    const item = CATALOG.find((c) => c.title === 'Tears of Steel')!;
    const req = buildAskRequest(item, 30.6, 'general', 'What is happening?');
    expect(req.content).toMatchObject({
      title: 'Tears of Steel',
      positionSeconds: 31,
      videoId: 'tears-of-steel',
    });
    expect(req.navigated).toBe(false);
    expect(req.history).toEqual([]);
  });
});

describe('catalog', () => {
  it('gives every title its own video, so frames match the synopsis', () => {
    const urls = CATALOG.map((c) => c.videoUrl);
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe('formatTime', () => {
  it.each([
    [65, '1:05'],
    [3725, '1:02:05'],
    [-3, '0:00'],
  ])('%d -> %s', (s, out) => {
    expect(formatTime(s)).toBe(out);
  });
});
