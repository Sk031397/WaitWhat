import {dueInsight} from '../src/sidekick/insights';

const insights = [
  {t: 10, text: 'First scene'},
  {t: 30, text: 'Second scene'},
];

describe('dueInsight', () => {
  it('fires when normal playback crosses an insight', () => {
    expect(dueInsight(insights, 9.5, 10.2)?.text).toBe('First scene');
  });

  it('does not fire again once past it', () => {
    expect(dueInsight(insights, 10.2, 10.9)).toBeNull();
  });

  it('ignores seeks that jump over insights', () => {
    expect(dueInsight(insights, 5, 31)).toBeNull();
  });

  it('ignores rewinds', () => {
    expect(dueInsight(insights, 31, 29)).toBeNull();
  });

  it('returns null with no insights', () => {
    expect(dueInsight([], 9, 10)).toBeNull();
  });
});
