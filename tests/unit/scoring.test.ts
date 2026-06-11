import { describe, expect, it } from 'vitest';
import { answerLength, score, sessionTotal } from '../../src/domain/scoring';
import type { AnswerSignals, Question } from '../../src/domain/types';

const baseQ: Question = {
  id: 'q-test', schools: ['common'], mode: 'interview', category: 'self', level: 'easy',
  text: 'なまえは？', intent: 'test', source: 'http://example.com', reliability: 'B',
};
const qWithKw: Question = { ...baseQ, keywords: ['いぬ'], minWords: 1 };

const sig = (p: Partial<AnswerSignals>): AnswerSignals => ({
  hasAudio: false, sttText: null, durationMs: 0, silenceMs: 0, ...p,
});

describe('answerLength', () => {
  it('空文字は0', () => expect(answerLength('')).toBe(0));
  it('日本語は文字数ベース', () => expect(answerLength('いぬ')).toBe(1));
  it('長い日本語', () => expect(answerLength('いぬが だいすきです')).toBeGreaterThanOrEqual(3));
  it('空白区切り', () => expect(answerLength('a b c d')).toBe(4));
});

describe('score (FR-SCORE-001)', () => {
  it('無回答は raw=0 / stars=0 / 励まし', () => {
    const r = score(qWithKw, sig({}));
    expect(r.raw).toBe(0);
    expect(r.childFeedback.stars).toBe(0);
    expect(r.checks.answered).toBe(false);
    expect(r.childFeedback.encourage).toBe(true);
  });

  it('音声が短い(800ms未満)は未回答扱いだが聞こえた加点', () => {
    const r = score(qWithKw, sig({ hasAudio: true, durationMs: 500 }));
    expect(r.checks.answered).toBe(false);
    expect(r.checks.heard).toBe(true);
    expect(r.raw).toBe(10);
    expect(r.childFeedback.stars).toBe(1);
  });

  it('録音のみ十分(2000ms)はKW未判定で raw=90', () => {
    const r = score(qWithKw, sig({ hasAudio: true, durationMs: 2000 }));
    expect(r.checks).toMatchObject({ heard: true, answered: true, lengthOk: true, keywordHit: 'unknown' });
    expect(r.raw).toBe(90);
    expect(r.childFeedback.stars).toBe(3);
  });

  it('STTがキーワード一致で raw=100', () => {
    const r = score(qWithKw, sig({ hasAudio: true, sttText: 'いぬが すき', durationMs: 1500 }));
    expect(r.checks.keywordHit).toBe('hit');
    expect(r.raw).toBe(100);
  });

  it('STTがキーワード不一致で raw=80', () => {
    const r = score(qWithKw, sig({ hasAudio: true, sttText: 'あか', durationMs: 1500 }));
    expect(r.checks.keywordHit).toBe('miss');
    expect(r.raw).toBe(80);
  });

  it('キーワード無し質問はSTTありでも unknown 加点', () => {
    const r = score(baseQ, sig({ hasAudio: true, sttText: 'はい', durationMs: 1500 }));
    expect(r.checks.keywordHit).toBe('unknown');
    expect(r.raw).toBe(90);
  });

  it('STTのみ(録音なし)でも答えとして扱う', () => {
    const r = score(baseQ, sig({ hasAudio: false, sttText: 'ねこ', durationMs: 0 }));
    expect(r.checks.answered).toBe(true);
    expect(r.checks.heard).toBe(true);
  });
});

describe('sessionTotal', () => {
  it('空は0', () => expect(sessionTotal([])).toBe(0));
  it('平均を返す', () => {
    const r1 = score(baseQ, sig({ hasAudio: true, durationMs: 2000 }));
    const r2 = score(baseQ, sig({}));
    expect(sessionTotal([r1, r2])).toBe(Math.round((r1.raw + r2.raw) / 2));
  });
  it('保護者補正を優先', () => {
    const r = score(baseQ, sig({}));
    r.parentOverride = { raw: 100 };
    expect(sessionTotal([r])).toBe(100);
  });
});
