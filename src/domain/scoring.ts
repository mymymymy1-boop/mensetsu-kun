// 採点ロジック（純関数） — FR-SCORE-001 / docs/SDD.md §4
// 設計: 5〜6歳のSTT精度は低い(WER≈27%, research A6[A])。
// よって「答えた形跡」を最重視し、キーワードは加点要素に留める。
// 低スコアでも子供には励まし(FR-FB-001 / C-EDU-002)。最終判断は保護者補正(FR-SCORE-002)。

import type { AnswerSignals, KeywordHit, Question, ScoreResult } from './types';

const ANSWER_MIN_MS = 800; // これ以上の発話で「答えた」とみなす
const LENGTH_MIN_MS = 1500; // これ以上で「しっかり話せた」とみなす（録音のみ時）

/** 回答テキストの「ことばの量」を、空白区切りと文字数の両面から見積もる（日本語対応）。 */
export function answerLength(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  const bySpace = t.split(/\s+/).filter(Boolean).length;
  const byChar = Math.ceil(t.replace(/\s/g, '').length / 2);
  return Math.max(bySpace, byChar);
}

function judgeKeyword(question: Question, sttText: string | null): KeywordHit {
  const kw = question.keywords;
  if (!kw || kw.length === 0) return 'unknown';
  if (!sttText || sttText.trim().length === 0) return 'unknown';
  const hay = sttText.replace(/\s/g, '');
  return kw.some((k) => hay.includes(k.replace(/\s/g, ''))) ? 'hit' : 'miss';
}

/**
 * 回答シグナルを採点する。副作用なし・決定論的。
 */
export function score(question: Question, signals: AnswerSignals): ScoreResult {
  const { hasAudio, sttText, durationMs } = signals;
  const hasText = !!sttText && sttText.trim().length > 0;

  const heard = hasAudio || sttText !== null;
  const answered = hasText || (hasAudio && durationMs >= ANSWER_MIN_MS);
  const lengthOk =
    answered &&
    (hasText ? answerLength(sttText as string) >= (question.minWords ?? 1) : durationMs >= LENGTH_MIN_MS);
  const keywordHit = judgeKeyword(question, sttText);

  let raw = 0;
  if (answered) raw += 40;
  if (lengthOk) raw += 25;
  if (answered) raw += keywordHit === 'hit' ? 25 : keywordHit === 'unknown' ? 15 : 5;
  if (heard) raw += 10;
  raw = Math.min(100, raw);

  const stars = raw >= 80 ? 3 : raw >= 50 ? 2 : raw >= 1 ? 1 : 0;

  return {
    raw,
    checks: { heard, answered, lengthOk, keywordHit },
    childFeedback: { stars, praise: '', encourage: raw < 50 },
    // praise は feedback.ts で星数に応じて確定する（採点と表現の関心を分離）。
  };
}

/** セッション平均（0..100）。保護者補正があればそれを優先。 */
export function sessionTotal(results: ScoreResult[]): number {
  if (results.length === 0) return 0;
  const sum = results.reduce((acc, r) => acc + (r.parentOverride?.raw ?? r.raw), 0);
  return Math.round(sum / results.length);
}
