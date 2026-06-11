// 校選択 — FR-SEL-001。カードは大きく単一タップ。
import type { School } from '../domain/types';
import { SCHOOL_CARDS as CARDS } from '../data/schools';
import { Disclaimer } from './Disclaimer';

interface Props {
  onSelect: (school: School) => void;
  onSpeak: (text: string) => void;
  onBack: () => void;
}

export function SchoolSelect({ onSelect, onSpeak, onBack }: Props) {
  return (
    <div className="screen">
      <h1 className="title">がっこうを えらんでね</h1>
      <div className="card-grid">
        {CARDS.map((c) => (
          <button
            key={c.school}
            className="school-card"
            onClick={() => {
              onSpeak(c.label);
              onSelect(c.school);
            }}
            aria-label={c.label}
          >
            <span className="emoji" aria-hidden>
              {c.emoji}
            </span>
            <span>{c.label}</span>
            <span className="reliability">{c.note}</span>
          </button>
        ))}
      </div>
      <button className="big-btn ghost" onClick={onBack}>
        ← もどる
      </button>
      <Disclaimer />
    </div>
  );
}
