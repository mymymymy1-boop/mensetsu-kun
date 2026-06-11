// 質問データの実行時バリデーション — FR-DATA-001 / C-INFO-001
// 不正データは採用しない（除外しログ）。出典・信頼度の欠落を機械検出。

import type { Category, Level, Mode, Question, Reliability, School } from '../domain/types';

const SCHOOLS: School[] = ['keio_yokohama', 'keio_yochisha', 'toin', 'morimura', 'common', 'behavior'];
const MODES: Mode[] = ['interview', 'behavior'];
const LEVELS: Level[] = ['easy', 'mid', 'hard'];
const RELIABILITIES: Reliability[] = ['A', 'B', 'C', 'D'];
const CATEGORIES: Category[] = [
  'self', 'family', 'kinder', 'social', 'thinking', 'habit', 'interest', 'future', 'event', 'artwork', 'behavior',
];

export interface ValidationResult {
  valid: Question[];
  errors: { id: string; reason: string }[];
}

/** 1件の質問が妥当か検査する。 */
export function validateQuestion(q: Question): string | null {
  if (!q.id || typeof q.id !== 'string') return 'id が不正';
  if (!Array.isArray(q.schools) || q.schools.length === 0) return 'schools が空';
  if (q.schools.some((s) => !SCHOOLS.includes(s))) return '未知の school';
  if (!MODES.includes(q.mode)) return '未知の mode';
  if (!CATEGORIES.includes(q.category)) return '未知の category';
  if (!LEVELS.includes(q.level)) return '未知の level';
  if (!q.text || q.text.trim().length === 0) return 'text が空';
  if (!q.intent || q.intent.trim().length === 0) return 'intent が空';
  if (!q.source || q.source.trim().length === 0) return 'source が空（出典必須）';
  if (!RELIABILITIES.includes(q.reliability)) return 'reliability が不正（A-D必須）';
  return null;
}

/** 配列を検査し、妥当なものだけを返す。不正はerrorsに記録。 */
export function validateQuestions(list: Question[]): ValidationResult {
  const valid: Question[] = [];
  const errors: { id: string; reason: string }[] = [];
  const seen = new Set<string>();
  for (const q of list) {
    const reason = validateQuestion(q);
    if (reason) {
      errors.push({ id: q.id ?? '(no id)', reason });
      continue;
    }
    if (seen.has(q.id)) {
      errors.push({ id: q.id, reason: 'id 重複' });
      continue;
    }
    seen.add(q.id);
    valid.push(q);
  }
  return { valid, errors };
}
