// 保護者ゲート — FR-GATE-001 / C-PRIV-003。子供が偶然突破できない計算問題。
import { useMemo, useState } from 'react';

interface Props {
  onPass: () => void;
  onCancel: () => void;
}

export function ParentGate({ onPass, onCancel }: Props) {
  // 固定パターンではなく、桁の大きい掛け算（子供には難しい）。決定論のためdate依存にしない。
  const problem = useMemo(() => {
    const a = 7 + ((Date.now() >> 4) % 6); // 7..12
    const b = 6 + ((Date.now() >> 7) % 6); // 6..11
    return { a, b, answer: a * b };
  }, []);
  const [val, setVal] = useState('');
  const [err, setErr] = useState(false);

  const submit = () => {
    if (parseInt(val, 10) === problem.answer) onPass();
    else {
      setErr(true);
      setVal('');
    }
  };

  return (
    <div className="parent">
      <h2>おうちのかた かくにん</h2>
      <p className="small">お子さまが あやまって 設定や 結果を 触らないための かくにんです。</p>
      <p>
        つぎの けいさんを してください: <strong>{problem.a} × {problem.b} = ?</strong>
      </p>
      <input
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        aria-label="けいさんの こたえ"
        inputMode="numeric"
      />
      {err && <p className="warn">こたえが ちがいます。もういちど。</p>}
      <div className="row">
        <button className="big-btn" onClick={submit}>
          すすむ
        </button>
        <button className="big-btn ghost" onClick={onCancel}>
          もどる
        </button>
      </div>
    </div>
  );
}
