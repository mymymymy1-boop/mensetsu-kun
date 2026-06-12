// 事前生成音声の再生アダプタ — FR-AUD-001 / ElevenLabス事前生成方式
// public/audio/{key}.mp3 を再生。無い/失敗ならフォールバック(Web Speech等)へ。
// 再生は子供の声を扱わず外部送信もしない（同梱ファイルの再生のみ）。
//
// iOS対策: HTMLAudioElement を「1つ使い回す」(src差し替え)。新規Audioを都度作ると
// iOSは最初のユーザー操作で解錠した要素以外の再生をブロックしがちなため。
// 最初のタップ時の speak（学校名読み上げ）でこの単一要素が解錠され、以降の出題が鳴る。
import type { TtsPort } from './types';
import { textKey } from './textKey';
import { AUDIO_KEYS } from '../data/audioManifest';

export class PrerecordedTts implements TtsPort {
  private audio: HTMLAudioElement | null = null;

  constructor(
    private fallback: TtsPort,
    private baseUrl: string = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/',
    private keys: ReadonlySet<string> = AUDIO_KEYS,
  ) {}

  private el(): HTMLAudioElement | null {
    if (typeof Audio === 'undefined') return null;
    if (!this.audio) this.audio = new Audio();
    return this.audio;
  }

  speak(text: string, opts?: { rate?: number }): Promise<void> {
    const key = textKey(text);
    if (!this.keys.has(key)) return this.fallback.speak(text, opts);
    const audio = this.el();
    if (!audio) return this.fallback.speak(text, opts);
    return new Promise<void>((resolve) => {
      const url = `${this.baseUrl}audio/${key}.mp3`.replace(/\/\/audio/, '/audio');
      const done = () => {
        audio.onended = null;
        audio.onerror = null;
        resolve();
      };
      audio.onended = done;
      audio.onerror = () => {
        // ファイル破損/未配置/再生不可時はフォールバックして継続（無音にしない）
        void this.fallback.speak(text, opts).finally(done);
      };
      audio.src = url;
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          // iOSの自動再生ブロック等。フォールバック(Web Speech)で読み上げを試みる。
          void this.fallback.speak(text, opts).finally(done);
        });
      }
    });
  }

  cancel(): void {
    if (this.audio) {
      this.audio.pause();
    }
    this.fallback.cancel();
  }

  supported(): boolean {
    return this.keys.size > 0 || this.fallback.supported();
  }
}
