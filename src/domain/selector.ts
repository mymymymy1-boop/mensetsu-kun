// 出題選択（純関数・決定論） — FR-SEL-002 / FR-DATA-002 / docs/SDD.md
// 校別傾向: 慶応=制作お尋ね(artwork)+共通 / 桐蔭=思考hard厚め / 森村=自己紹介easy+お尋ね / 共通=easy〜mid。
// Math.randomは使わない（seedで安定）。

import type { Mode, Question, School } from './types';

/** 校ごとのカテゴリ/レベルの並び優先度（小さいほど先に出る）。 */
function rank(school: School, q: Question): number {
  switch (school) {
    case 'keio_yochisha':
    case 'keio_yokohama':
      // 制作お尋ね優先、次に共通の自己紹介
      if (q.category === 'artwork') return 0;
      if (q.level === 'easy') return 1;
      return 2;
    case 'toin':
      // 思考・とっさ(hard)を厚く。まず自己紹介easyで温め、その後hard。
      if (q.category === 'self' && q.level === 'easy') return 0;
      if (q.level === 'hard' || q.category === 'thinking') return 1;
      return 2;
    case 'morimura':
      // 自己紹介easy→制作お尋ね
      if (q.level === 'easy') return 0;
      if (q.category === 'artwork') return 1;
      return 2;
    default:
      // common / behavior: easy→mid→hard
      return q.level === 'easy' ? 0 : q.level === 'mid' ? 1 : 2;
  }
}

function isRealSchool(school: School): boolean {
  return school !== 'common' && school !== 'behavior';
}

/**
 * 校・モードに応じた候補質問を、傾向順に並べて返す（不足時はcommonで補完）。
 */
export function candidatesFor(school: School, mode: Mode, all: Question[]): Question[] {
  const primary = all.filter((q) => q.schools.includes(school) && q.mode === mode);
  const tagged = primary.map((q) => ({ q, primary: true }));
  // 実在校の面接モードは共通質問で補完（重複idは除外）
  if (isRealSchool(school) && mode === 'interview') {
    const ids = new Set(primary.map((q) => q.id));
    all
      .filter((q) => q.schools.includes('common') && q.mode === mode && !ids.has(q.id))
      .forEach((q) => tagged.push({ q, primary: false }));
  }
  // 安定ソート: 傾向rank → 校固有を優先 → id（決定論）
  return tagged
    .sort(
      (a, b) =>
        rank(school, a.q) - rank(school, b.q) ||
        Number(b.primary) - Number(a.primary) ||
        a.q.id.localeCompare(b.q.id),
    )
    .map((x) => x.q);
}

/**
 * 出題を count 件選ぶ。seed で開始位置を回転（同seedで同結果）。
 * 候補が count 未満ならある分だけ返す。
 */
export function selectQuestions(
  school: School,
  mode: Mode,
  all: Question[],
  count: number,
  seed = 0,
): Question[] {
  const ordered = candidatesFor(school, mode, all);
  if (ordered.length === 0 || count <= 0) return [];
  if (count >= ordered.length) return ordered;
  // 先頭(傾向の強い順)を優先しつつ、seedで軽く回転して毎回同じ並びにならないように
  const start = Math.abs(seed) % ordered.length;
  const rotated = ordered.slice(start).concat(ordered.slice(0, start));
  return rotated.slice(0, count);
}
