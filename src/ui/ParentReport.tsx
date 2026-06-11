// 保護者向け結果 — FR-RPT-001 / FR-SCORE-002（手動補正）
import { useState } from 'react';
import { sessionTotal } from '../domain/scoring';
import type { SessionItem } from '../domain/types';

interface Props {
  items: SessionItem[];
  onOverride: (index: number, raw: number | undefined, memo: string | undefined) => void;
  onBack: () => void;
  onOpenSettings: () => void;
}

export function ParentReport({ items, onOverride, onBack, onOpenSettings }: Props) {
  const [draft, setDraft] = useState<Record<number, { raw: string; memo: string }>>({});

  const getDraft = (i: number) => draft[i] ?? { raw: '', memo: '' };
  const total = sessionTotal(items.map((it) => it.score));

  if (items.length === 0) {
    return (
      <div className="parent">
        <h2>けっか</h2>
        <p>まだ れんしゅうが ありません。</p>
        <button className="big-btn ghost" onClick={onBack}>もどる</button>
      </div>
    );
  }

  return (
    <div className="parent">
      <h2>保護者むけ けっか</h2>
      <p className="warn">
        ※ 自動採点は補助です。お子さまの声・回答を聞いて、保護者が最終判断・補正してください。
        点数はお子さまには表示していません。
      </p>
      <p>セッション平均: <strong>{total}</strong> / 100</p>
      <table>
        <thead>
          <tr>
            <th>質問</th>
            <th>観点</th>
            <th>自動</th>
            <th>補正</th>
            <th>メモ</th>
            <th>出典</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => {
            const d = getDraft(i);
            return (
              <tr key={it.q.id}>
                <td>
                  {it.q.text}
                  <br />
                  <span className={`reliability-badge rb-${it.q.reliability}`}>信頼度{it.q.reliability}</span>
                  {it.q.note && <span className="small"> {it.q.note}</span>}
                </td>
                <td className="small">{it.q.intent}</td>
                <td>
                  {it.score.raw}
                  <br />
                  <span className="small">
                    {it.score.checks.answered ? '答えた' : '無回答'} /
                    {it.score.checks.keywordHit === 'unknown' ? 'KW未判定' : it.score.checks.keywordHit === 'hit' ? 'KW一致' : 'KW不一致'}
                  </span>
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={d.raw}
                    aria-label={`補正スコア ${i}`}
                    onChange={(e) => setDraft({ ...draft, [i]: { ...d, raw: e.target.value } })}
                  />
                </td>
                <td>
                  <textarea
                    value={d.memo}
                    aria-label={`メモ ${i}`}
                    placeholder="姿勢・声の大きさ・視線 など"
                    onChange={(e) => setDraft({ ...draft, [i]: { ...d, memo: e.target.value } })}
                  />
                </td>
                <td>
                  <a href={it.q.source} target="_blank" rel="noreferrer">
                    出典
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="row">
        <button
          className="big-btn"
          onClick={() => {
            items.forEach((_, i) => {
              const d = getDraft(i);
              const raw = d.raw === '' ? undefined : Math.max(0, Math.min(100, parseInt(d.raw, 10) || 0));
              const memo = d.memo.trim() === '' ? undefined : d.memo.trim();
              if (raw !== undefined || memo !== undefined) onOverride(i, raw, memo);
            });
          }}
        >
          補正を ほぞん
        </button>
        <button className="big-btn ghost" onClick={onOpenSettings}>
          せってい
        </button>
        <button className="big-btn ghost" onClick={onBack}>
          もどる
        </button>
      </div>
    </div>
  );
}
