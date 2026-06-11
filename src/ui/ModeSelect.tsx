// モード選択 — FR-SEL-002。該当質問が0件のモードは選べない。
import type { Mode, School } from '../domain/types';

interface Props {
  school: School;
  availability: Record<Mode, number>; // 各モードの質問数
  onSelect: (mode: Mode) => void;
  onBack: () => void;
}

export function ModeSelect({ school, availability, onSelect, onBack }: Props) {
  const isKeio = school === 'keio_yochisha' || school === 'keio_yokohama';
  return (
    <div className="screen">
      <h1 className="title">れんしゅうを えらんでね</h1>
      {isKeio && <p className="small">※この学校は面接がなく、制作中の「お尋ね」が中心です。</p>}
      <div>
        <button
          className="big-btn"
          disabled={availability.interview === 0}
          onClick={() => onSelect('interview')}
        >
          🗣 めんせつ {availability.interview === 0 ? '（なし）' : ''}
        </button>
        <button
          className="big-btn accent"
          disabled={availability.behavior === 0}
          onClick={() => onSelect('behavior')}
        >
          🤝 こうどうかんさつ {availability.behavior === 0 ? '（なし）' : ''}
        </button>
      </div>
      <button className="big-btn ghost" onClick={onBack}>
        ← もどる
      </button>
    </div>
  );
}
