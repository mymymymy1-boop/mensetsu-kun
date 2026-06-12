// セッション結果（子供向け） — FR-FB-001 / C-EDU-001（数値は出さない）
import { Character } from './Character';
import type { SessionItem } from '../domain/types';

interface Props {
  items: SessionItem[];
  onAgain: () => void;
  onHome: () => void;
}

export function ChildResult({ items, onAgain, onHome }: Props) {
  const totalStars = items.reduce((a, it) => a + it.score.childFeedback.stars, 0);
  return (
    <div className="screen">
      <h1 className="title">よく がんばったね！</h1>
      {/* 星はアイコンで表示し、折り返して画面外に出さない。数値スコアは子供に見せない(C-EDU-001) */}
      <div className="stars-wrap feedback-pop" aria-label={`あつめた ほし ${totalStars}こ`}>
        {Array.from({ length: Math.max(totalStars, 1) }).map((_, i) => (
          <span key={i}>{i < totalStars ? '⭐' : ''}</span>
        ))}
      </div>
      <Character emoji="🏆" message={`きょうは ${items.length}もん れんしゅう できたね！はなまる！`} />
      <button className="big-btn" onClick={onAgain}>
        🔁 もういちど
      </button>
      <button className="big-btn ghost" onClick={onHome}>
        🏠 さいしょへ
      </button>
    </div>
  );
}
