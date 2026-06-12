// 大きなマイクボタン（単一タップで録音開始/停止） — FR-REC-001 / UI原則
interface Props {
  recording: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export function MicButton({ recording, disabled, onToggle }: Props) {
  // 待機中(録音していない)はやさしく光って弾み、タップを誘導する
  const cls = recording ? 'mic-btn recording' : 'mic-btn idle';
  return (
    <div>
      <button
        className={cls}
        onClick={onToggle}
        disabled={disabled}
        aria-label={recording ? 'おはなしを とめる' : 'おはなしする'}
      >
        🎤
      </button>
      <div className="mic-label">{recording ? 'きいているよ…（おわったら もういちど おして）' : 'マイクを おして おはなししてね'}</div>
    </div>
  );
}
