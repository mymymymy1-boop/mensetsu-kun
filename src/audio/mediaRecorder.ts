// MediaRecorder 実装（録音） — FR-REC-001 / C-PRIV-001,C-PRIV-002
// 録音はローカルのみ・外部送信しない。Blobは保存せずメモリ上で扱う。
import type { RecorderPort } from './types';

export class MediaRecorderAdapter implements RecorderPort {
  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private startedAt = 0;

  async start(): Promise<void> {
    this.chunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.recorder = new MediaRecorder(this.stream);
    this.recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data && e.data.size > 0) this.chunks.push(e.data);
    };
    this.recorder.start();
    this.startedAt = performance.now();
  }

  stop(): Promise<{ blob: Blob | null; durationMs: number }> {
    return new Promise((resolve) => {
      const rec = this.recorder;
      if (!rec) {
        resolve({ blob: null, durationMs: 0 });
        return;
      }
      rec.onstop = () => {
        const durationMs = Math.round(performance.now() - this.startedAt);
        const blob = this.chunks.length > 0 ? new Blob(this.chunks, { type: rec.mimeType || 'audio/webm' }) : null;
        this.releaseStream();
        resolve({ blob, durationMs });
      };
      rec.stop();
    });
  }

  private releaseStream(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    this.recorder = null;
  }

  supported(): boolean {
    return (
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof window !== 'undefined' &&
      'MediaRecorder' in window
    );
  }
}
