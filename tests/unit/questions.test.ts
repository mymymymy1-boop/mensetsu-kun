import { describe, expect, it } from 'vitest';
import { validateQuestion, validateQuestions } from '../../src/data/questions.schema';
import { questions } from '../../src/data/questions';
import type { Question } from '../../src/domain/types';

describe('質問データ (FR-DATA-001 / C-INFO-001)', () => {
  it('全質問が妥当（出典・信頼度あり）', () => {
    const { valid, errors } = validateQuestions(questions);
    expect(errors).toEqual([]);
    expect(valid).toHaveLength(questions.length);
  });

  it('全質問にsourceとreliabilityが100%付与', () => {
    for (const q of questions) {
      expect(q.source).toBeTruthy();
      expect(['A', 'B', 'C', 'D']).toContain(q.reliability);
    }
  });

  it('4校＋共通＋行動観察すべてに質問が存在', () => {
    const schools = new Set(questions.flatMap((q) => q.schools));
    for (const s of ['keio_yochisha', 'keio_yokohama', 'toin', 'morimura', 'common', 'behavior']) {
      expect(schools.has(s as never)).toBe(true);
    }
  });

  it('慶応2校はnoteで面接なしを明記(C-INFO-003)', () => {
    const keio = questions.filter((q) => q.schools.includes('keio_yochisha') || q.schools.includes('keio_yokohama'));
    expect(keio.every((q) => !!q.note)).toBe(true);
  });
});

describe('validateQuestion (異常系)', () => {
  const ok: Question = {
    id: 'x', schools: ['common'], mode: 'interview', category: 'self', level: 'easy',
    text: 'a', intent: 'b', source: 'http://x', reliability: 'B',
  };
  it('正常はnull', () => expect(validateQuestion(ok)).toBeNull());
  it('source欠落を検出', () => expect(validateQuestion({ ...ok, source: '' })).toMatch(/出典/));
  it('reliability不正を検出', () => expect(validateQuestion({ ...ok, reliability: 'Z' as never })).toMatch(/reliability/));
  it('schools空を検出', () => expect(validateQuestion({ ...ok, schools: [] })).toMatch(/schools/));
  it('重複idを除外', () => {
    const { errors } = validateQuestions([ok, { ...ok }]);
    expect(errors.some((e) => /重複/.test(e.reason))).toBe(true);
  });
});
