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
  const maxStars = items.length * 3;
  return (
    <div className="screen">
      <h1 className="title">よく がんばったね！</h1>
      <div className="stars" aria-label={`あつめた ほし ${totalStars}`}>
        ⭐ {'★'.repeat(Math.min(totalStars, 20))}
      </div>
      <Character emoji="🏆" message={`きょうは ${items.length}もん れんしゅう できたね！はなまる！`} />
      <p className="small">あつめた ほし: {totalStars} / {maxStars}（おうちのひと むけ）</p>
      <button className="big-btn" onClick={onAgain}>
        🔁 もういちど
      </button>
      <button className="big-btn ghost" onClick={onHome}>
        🏠 さいしょへ
      </button>
    </div>
  );
}
