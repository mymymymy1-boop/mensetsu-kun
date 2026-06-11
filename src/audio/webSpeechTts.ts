// SpeechSynthesis 実装（TTS） — FR-AUD-001
// ja-JP音声を優先選択。voiceschanged待ち。子供の声を扱わないため低リスク。
import type { TtsPort } from './types';

export class WebSpeechTts implements TtsPort {
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (this.supported()) {
      this.loadVoice();
      window.speechSynthesis.onvoiceschanged = () => this.loadVoice();
    }
  }

  private loadVoice(): void {
    const voices = window.speechSynthesis.getVoices();
    // ja-JP / ja_JP（Android）を吸収
    this.voice = voices.find((v) => /ja[-_]JP/i.test(v.lang)) ?? voices.find((v) => /^ja/i.test(v.lang)) ?? null;
  }

  speak(text: string, opts?: { rate?: number }): Promise<void> {
    return new Promise((resolve) => {
      if (!this.supported()) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ja-JP';
      u.rate = opts?.rate ?? 0.9;
      if (this.voice) u.voice = this.voice;
      u.onend = () => resolve();
      u.onerror = () => resolve(); // 失敗してもフォールバックして継続
      window.speechSynthesis.speak(u);
    });
  }

  cancel(): void {
    if (this.supported()) window.speechSynthesis.cancel();
  }

  supported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }
}
