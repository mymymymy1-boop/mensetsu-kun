// 子供向けフィードバック表現 — FR-FB-001 / C-EDU-001,C-EDU-002
// 点数は出さない。星とほめ言葉のみ。低スコアでも否定せず励ます。

import type { ChildFeedback, ScoreResult } from './types';

const PRAISE_3 = ['とっても じょうずに いえたね！', 'すごい！ はなまる！', 'かんぺき！ かっこいい！'];
const PRAISE_2 = ['じょうずに いえたね！', 'いいね！ よく できました！', 'がんばったね！'];
const PRAISE_1 = ['こえが きこえたよ！ いいね！', 'おはなし できたね！', 'よく がんばったね！'];
const PRAISE_0 = ['もういちど やってみよう！', 'だいじょうぶ。ゆっくりで いいよ！', 'つぎは いえるかな？ やってみよう！'];

/** 事前生成音声のための全ほめ言葉一覧（SSOT）。 */
export const ALL_PRAISE: string[] = [...PRAISE_3, ...PRAISE_2, ...PRAISE_1, ...PRAISE_0];

/** 決定論的に選ぶ（インデックスで分散。Math.randomは使わない=テスト安定）。 */
function pick(list: string[], seed: number): string {
  return list[Math.abs(seed) % list.length];
}

/**
 * スコア結果から子供向け表現を確定する。
 * @param seed 質問順などの安定した値（同じ入力で同じ表示）
 */
export function toChildFeedback(result: ScoreResult, seed = 0): ChildFeedback {
  const stars = result.childFeedback.stars;
  let praise: string;
  if (stars >= 3) praise = pick(PRAISE_3, seed);
  else if (stars === 2) praise = pick(PRAISE_2, seed);
  else if (stars === 1) praise = pick(PRAISE_1, seed);
  else praise = pick(PRAISE_0, seed);
  return { stars, praise, encourage: result.childFeedback.encourage };
}

/** 子供向けに数値スコアを含む文字列を作っていないことを保証するためのガード（テスト用）。 */
export function containsNumber(text: string): boolean {
  return /[0-9０-９]/.test(text);
}
