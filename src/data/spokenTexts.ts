// 事前生成すべき読み上げテキストの一覧（SSOT） — 生成スクリプトと整合用。
// 実行時に speak() される可能性のある固定テキストを列挙する。
import { questions } from './questions';
import { SCHOOL_CARDS } from './schools';
import { ALL_PRAISE } from '../domain/feedback';

/** 重複を除いた、事前生成対象テキストの配列。 */
export function allSpokenTexts(): string[] {
  const set = new Set<string>();
  questions.forEach((q) => set.add(q.text));
  SCHOOL_CARDS.forEach((c) => set.add(c.label));
  ALL_PRAISE.forEach((p) => set.add(p));
  return [...set];
}
