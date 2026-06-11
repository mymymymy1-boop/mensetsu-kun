import { describe, expect, it } from 'vitest';
import { containsNumber, toChildFeedback } from '../../src/domain/feedback';
import type { ScoreResult } from '../../src/domain/types';

const mk = (stars: number, encourage: boolean): ScoreResult => ({
  raw: stars * 30,
  checks: { heard: true, answered: stars > 0, lengthOk: stars > 1, keywordHit: 'unknown' },
  childFeedback: { stars, praise: '', encourage },
});

describe('toChildFeedback (FR-FB-001 / C-EDU-001)', () => {
  it('星3はほめ言葉が入り数字を含まない', () => {
    const fb = toChildFeedback(mk(3, false), 0);
    expect(fb.praise.length).toBeGreaterThan(0);
    expect(containsNumber(fb.praise)).toBe(false);
  });

  it('星0でも否定でなく励まし、数字なし', () => {
    const fb = toChildFeedback(mk(0, true), 1);
    expect(fb.stars).toBe(0);
    expect(fb.encourage).toBe(true);
    expect(containsNumber(fb.praise)).toBe(false);
    // 否定語が含まれない
    expect(fb.praise).not.toMatch(/だめ|ばつ|まちがい/);
  });

  it('seedで決定論（同seedで同じ）', () => {
    expect(toChildFeedback(mk(2, false), 5).praise).toBe(toChildFeedback(mk(2, false), 5).praise);
  });

  it('全レベルのほめ言葉に数字を含まない', () => {
    for (let s = 0; s <= 3; s++) {
      for (let seed = 0; seed < 4; seed++) {
        expect(containsNumber(toChildFeedback(mk(s, s < 2), seed).praise)).toBe(false);
      }
    }
  });
});

describe('containsNumber', () => {
  it('半角・全角数字を検出', () => {
    expect(containsNumber('6さい')).toBe(true);
    expect(containsNumber('６さい')).toBe(true);
    expect(containsNumber('はなまる')).toBe(false);
  });
});
