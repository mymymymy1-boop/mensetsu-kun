// キャラクター（音声主導の案内役） — UI原則(キャラ主導)
interface Props {
  emoji?: string;
  message: string;
  speaking?: boolean;
}

export function Character({ emoji = '🐥', message, speaking }: Props) {
  return (
    <div className="screen">
      <div className="character" aria-hidden>
        {emoji}
      </div>
      <div className="speech" role="status" aria-live="polite">
        {speaking ? '🔊 ' : ''}
        {message}
      </div>
    </div>
  );
}
