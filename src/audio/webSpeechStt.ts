// SpeechRecognition 実装（STT・任意） — FR-STT-001 / C-PRIV-001,C-PRIV-003
// ★重要: これは「子供の声が外部(ブラウザの認識サービス=Google等)に送信され得る」唯一の箇所。
//   呼び出し側は settings.sttMode==='webspeech-stt' かつ sttConsent===true のガードを必須とする。
//   このファイル以外で SpeechRecognition / 音声の外部送信を行ってはならない(HARNESS §3)。
import type { SttPort } from './types';

interface ISpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function getCtor(): (new () => ISpeechRecognition) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => ISpeechRecognition;
    webkitSpeechRecognition?: new () => ISpeechRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export class WebSpeechStt implements SttPort {
  recognize(opts?: { lang?: string; timeoutMs?: number }): Promise<{ text: string } | null> {
    const Ctor = getCtor();
    if (!Ctor) return Promise.resolve(null);
    return new Promise((resolve) => {
      const rec = new Ctor();
      rec.lang = opts?.lang ?? 'ja-JP';
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      let done = false;
      const finish = (text: string | null) => {
        if (done) return;
        done = true;
        try {
          rec.stop();
        } catch {
          // stop後の二重呼びは無視（既に終了）
          resolve(text ? { text } : null);
          return;
        }
        resolve(text ? { text } : null);
      };
      const timer = setTimeout(() => finish(null), opts?.timeoutMs ?? 8000);
      rec.onresult = (ev) => {
        clearTimeout(timer);
        const text = ev.results?.[0]?.[0]?.transcript ?? '';
        finish(text);
      };
      rec.onerror = () => {
        clearTimeout(timer);
        finish(null);
      };
      rec.onend = () => {
        clearTimeout(timer);
        finish(null);
      };
      try {
        rec.start();
      } catch {
        clearTimeout(timer);
        finish(null);
      }
    });
  }

  supported(): boolean {
    return getCtor() !== null;
  }
}
