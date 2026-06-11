// ホーム画面 — 主要アクションは「はじめる」1つに集約
import { Character } from './Character';
import { Disclaimer } from './Disclaimer';

interface Props {
  onStart: () => void;
}

export function Home({ onStart }: Props) {
  return (
    <div className="screen">
      <h1 className="title">メンセツくん</h1>
      <p className="subtitle">しょうがっこうじゅけん めんせつ・こうどうかんさつ れんしゅう</p>
      <Character emoji="🐥" message="いっしょに めんせつの れんしゅうを しよう！" />
      <button className="big-btn" onClick={onStart}>
        ▶ はじめる
      </button>
      <Disclaimer />
    </div>
  );
}
