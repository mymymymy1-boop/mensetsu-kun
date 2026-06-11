// 事前生成音声の再生アダプタ — FR-AUD-001 / ElevenLabs事前生成方式
// public/audio/{key}.mp3 を再生。無い/失敗ならフォールバック(Web Speech等)へ。
// 再生は子供の声を扱わず外部送信もしない（同梱ファイルの再生のみ）。
import type { TtsPort } from './types';
import { textKey } from './textKey';
import { AUDIO_KEYS } from '../data/audioManifest';

export class PrerecordedTts implements TtsPort {
  private current: HTMLAudioElement | null = null;

  constructor(
    private fallback: TtsPort,
    private baseUrl: string = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/',
    private keys: ReadonlySet<string> = AUDIO_KEYS,
  ) {}

  speak(text: string, opts?: { rate?: number }): Promise<void> {
    const key = textKey(text);
    if (!this.keys.has(key) || typeof Audio === 'undefined') {
      return this.fallback.speak(text, opts);
    }
    return new Promise<void>((resolve) => {
      const url = `${this.baseUrl}audio/${key}.mp3`.replace(/\/\/audio/, '/audio');
      const audio = new Audio(url);
      this.current = audio;
      const done = () => resolve();
      audio.onended = done;
      audio.onerror = () => {
        // ファイル破損/未配置時はフォールバックして継続（無音にしない）
        void this.fallback.speak(text, opts).finally(done);
      };
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          void this.fallback.speak(text, opts).finally(done);
        });
      }
    });
  }

  cancel(): void {
    if (this.current) {
      this.current.pause();
      this.current = null;
    }
    this.fallback.cancel();
  }

  supported(): boolean {
    return this.keys.size > 0 || this.fallback.supported();
  }
}
