// 出題画面（中核） — FR-AUD-001/FR-REC-001/FR-STT-001/FR-SCORE-001/FR-FB-001
// 音声ポートはpropsで注入（テストはmockで決定論）。
import { useCallback, useEffect, useRef, useState } from 'react';
import { score } from '../domain/scoring';
import { toChildFeedback } from '../domain/feedback';
import type { AnswerSignals, Question, SessionItem } from '../domain/types';
import type { RecorderPort, SttPort, TtsPort } from '../audio/types';
import { Character } from './Character';
import { MicButton } from './MicButton';

interface Props {
  questions: Question[];
  tts: TtsPort;
  recorder: RecorderPort;
  stt: SttPort;
  ttsRate: number;
  recordingSupported: boolean;
  onComplete: (items: SessionItem[]) => void;
}

type Phase = 'asking' | 'recording' | 'feedback';

export function Quiz({ questions, tts, recorder, stt, ttsRate, recordingSupported, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('asking');
  const [items, setItems] = useState<SessionItem[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [lastItem, setLastItem] = useState<SessionItem | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = questions[index];

  const speakQuestion = useCallback(() => {
    if (!current) return;
    setSpeaking(true);
    void tts.speak(current.text, { rate: ttsRate }).finally(() => setSpeaking(false));
  }, [current, tts, ttsRate]);

  // 質問が変わったら読み上げ＋無反応時の自動再読(UI原則)
  useEffect(() => {
    if (phase !== 'asking' || !current) return;
    speakQuestion();
    idleTimer.current = setTimeout(() => speakQuestion(), 12000);
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [index, phase, current, speakQuestion]);

  const finishAnswer = useCallback(
    async (signals: AnswerSignals) => {
      const result = score(current, signals);
      result.childFeedback = toChildFeedback(result, index);
      const item: SessionItem = { q: current, signals, score: result };
      setItems((prev) => [...prev, item]);
      setLastItem(item);
      setPhase('feedback');
      // 子供向けに音声でほめる
      void tts.speak(result.childFeedback.praise, { rate: ttsRate });
    },
    [current, index, tts, ttsRate],
  );

  const toggleMic = useCallback(async () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    tts.cancel();
    if (phase === 'asking') {
      // 録音開始
      try {
        await recorder.start();
        setPhase('recording');
      } catch {
        // マイク不許可 → 録音スキップ・口頭練習として無回答シグナルで継続
        await finishAnswer({ hasAudio: false, sttText: null, durationMs: 0, silenceMs: 0 });
      }
      return;
    }
    if (phase === 'recording') {
      const rec = await recorder.stop();
      let sttText: string | null = null;
      if (stt.supported()) {
        const r = await stt.recognize({ lang: 'ja-JP' });
        sttText = r ? r.text : null;
      }
      await finishAnswer({
        hasAudio: !!rec.blob,
        sttText,
        durationMs: rec.durationMs,
        silenceMs: 0,
      });
    }
  }, [phase, recorder, stt, tts, finishAnswer]);

  const next = useCallback(() => {
    if (index + 1 >= questions.length) {
      onComplete(items);
    } else {
      setIndex((i) => i + 1);
      setPhase('asking');
      setLastItem(null);
    }
  }, [index, questions.length, items, onComplete]);

  if (!current) {
    return (
      <div className="screen">
        <Character emoji="🐥" message="しつもんが ありません。べつの れんしゅうを えらんでね。" />
      </div>
    );
  }

  if (phase === 'feedback' && lastItem) {
    const fb = lastItem.score.childFeedback;
    const collected = items.reduce((a, it) => a + it.score.childFeedback.stars, 0);
    return (
      <div className="screen">
        <div className="stars big feedback-pop" aria-label={`ほし ${fb.stars}つ`}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={i < fb.stars ? 'on' : 'off'}>
              ★
            </span>
          ))}
        </div>
        <Character emoji={fb.stars >= 2 ? '🎉' : '🐥'} message={fb.praise} />
        <p className="tally" aria-hidden>
          これまで {'⭐'.repeat(Math.min(collected, 15))}
        </p>
        <button className="big-btn" onClick={next}>
          {index + 1 >= questions.length ? '🏁 おわり' : '➡ つぎへ'}
        </button>
        <button className="big-btn ghost" onClick={() => void tts.speak(current.text, { rate: ttsRate })}>
          🔁 もういちど きく
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="progress-dots" aria-hidden>
        {questions.map((q, i) => (
          <span
            key={q.id}
            className={`dot ${i < index ? 'done' : i === index ? 'current' : ''}`}
          />
        ))}
      </div>
      <p className="progress-text">
        {index + 1} / {questions.length}もん
      </p>
      <Character emoji="🐥" message={current.text} speaking={speaking} />
      <MicButton recording={phase === 'recording'} onToggle={() => void toggleMic()} />
      <div>
        <button className="big-btn ghost" onClick={speakQuestion}>
          🔁 もういちど きく
        </button>
      </div>
      {!recordingSupported && (
        <p className="small">マイクが つかえないため、こえで れんしゅうして、おうちのひとが ○を つけてね。</p>
      )}
    </div>
  );
}
