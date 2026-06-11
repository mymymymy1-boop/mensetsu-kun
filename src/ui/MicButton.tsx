// 大きなマイクボタン（単一タップで録音開始/停止） — FR-REC-001 / UI原則
interface Props {
  recording: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export function MicButton({ recording, disabled, onToggle }: Props) {
  return (
    <div>
      <button
        className={`mic-btn ${recording ? 'recording' : ''}`}
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
