// テスト/フォールバック用モック（決定論） — NFR-COMPAT-001 / NFR-REL-001
import type { RecorderPort, SttPort, TtsPort } from './types';

export class MockTts implements TtsPort {
  public calls: { text: string; rate?: number }[] = [];
  async speak(text: string, opts?: { rate?: number }): Promise<void> {
    this.calls.push({ text, rate: opts?.rate });
  }
  cancel(): void {}
  supported(): boolean {
    return true;
  }
}

/** 録音はせず、設定したdurationMsを返す（外部送信・実マイクなし）。 */
export class MockRecorder implements RecorderPort {
  constructor(private durationMs = 2000, private isSupported = true) {}
  async start(): Promise<void> {}
  async stop(): Promise<{ blob: Blob | null; durationMs: number }> {
    if (!this.isSupported) return { blob: null, durationMs: 0 };
    return { blob: new Blob(['mock'], { type: 'audio/webm' }), durationMs: this.durationMs };
  }
  supported(): boolean {
    return this.isSupported;
  }
}

export class MockStt implements SttPort {
  constructor(private text: string | null = null, private isSupported = true) {}
  async recognize(): Promise<{ text: string } | null> {
    if (!this.isSupported || this.text === null) return null;
    return { text: this.text };
  }
  supported(): boolean {
    return this.isSupported;
  }
}
