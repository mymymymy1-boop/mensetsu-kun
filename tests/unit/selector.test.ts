import { describe, expect, it } from 'vitest';
import { candidatesFor, selectQuestions } from '../../src/domain/selector';
import { validateQuestions } from '../../src/data/questions.schema';
import { questions } from '../../src/data/questions';

const VALID = validateQuestions(questions).valid;

describe('candidatesFor (FR-DATA-002)', () => {
  it('桐蔭(interview)は自己紹介easyが先頭、思考hardを含む', () => {
    const c = candidatesFor('toin', 'interview', VALID);
    expect(c.length).toBeGreaterThan(0);
    expect(c[0].schools).toContain('toin');
    expect(c.some((q) => q.level === 'hard')).toBe(true);
    // 共通質問で補完されている
    expect(c.some((q) => q.schools.includes('common'))).toBe(true);
  });

  it('慶応幼稚舎(interview)は制作お尋ね(artwork)が先頭', () => {
    const c = candidatesFor('keio_yochisha', 'interview', VALID);
    expect(c[0].category).toBe('artwork');
  });

  it('behavior校はbehaviorモードの質問のみ', () => {
    const c = candidatesFor('behavior', 'behavior', VALID);
    expect(c.length).toBeGreaterThan(0);
    expect(c.every((q) => q.mode === 'behavior')).toBe(true);
  });

  it('該当0件は空配列（慶応のbehaviorモード）', () => {
    const c = candidatesFor('keio_yochisha', 'behavior', VALID);
    expect(c).toEqual([]);
  });
});

describe('selectQuestions', () => {
  it('count件返す', () => {
    const q = selectQuestions('common', 'interview', VALID, 3, 0);
    expect(q).toHaveLength(3);
  });
  it('countが候補超過なら全件', () => {
    const all = candidatesFor('behavior', 'behavior', VALID);
    const q = selectQuestions('behavior', 'behavior', VALID, 999, 0);
    expect(q).toHaveLength(all.length);
  });
  it('候補0件は空', () => {
    expect(selectQuestions('keio_yochisha', 'behavior', VALID, 5, 0)).toEqual([]);
  });
  it('count<=0は空', () => {
    expect(selectQuestions('common', 'interview', VALID, 0, 0)).toEqual([]);
  });
  it('seedで開始位置が回転（決定論）', () => {
    const a = selectQuestions('common', 'interview', VALID, 2, 0);
    const b = selectQuestions('common', 'interview', VALID, 2, 0);
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
  });
});
