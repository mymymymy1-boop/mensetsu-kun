import { afterEach, describe, expect, it, vi } from 'vitest';
import { PrerecordedTts } from '../../src/audio/prerecordedTts';
import { MockTts } from '../../src/audio/mockAudio';
import { textKey } from '../../src/audio/textKey';

// 制御可能な Audio スタブ
class FakeAudio {
  static instances: FakeAudio[] = [];
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  paused = false;
  constructor(public src: string) {
    FakeAudio.instances.push(this);
  }
  play() {
    // 次tickで再生完了とする
    queueMicrotask(() => this.onended && this.onended());
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
}

afterEach(() => {
  FakeAudio.instances = [];
  vi.unstubAllGlobals();
});

describe('PrerecordedTts（事前生成音声の再生＋フォールバック）', () => {
  it('キーが無い文はフォールバックで読み上げる', async () => {
    const fb = new MockTts();
    const tts = new PrerecordedTts(fb, '/', new Set());
    await tts.speak('みっとうろくのことば');
    expect(fb.calls.map((c) => c.text)).toContain('みっとうろくのことば');
  });

  it('キーがある文は音声ファイルを再生し、フォールバックを呼ばない', async () => {
    vi.stubGlobal('Audio', FakeAudio as unknown as typeof Audio);
    const fb = new MockTts();
    const text = 'おなまえは？';
    const keys = new Set([textKey(text)]);
    const tts = new PrerecordedTts(fb, '/', keys);
    await tts.speak(text);
    expect(FakeAudio.instances.length).toBe(1);
    expect(FakeAudio.instances[0].src).toContain(`/audio/${textKey(text)}.mp3`);
    expect(fb.calls.length).toBe(0);
  });

  it('再生エラー時はフォールバックする', async () => {
    class ErrAudio extends FakeAudio {
      play() {
        queueMicrotask(() => this.onerror && this.onerror());
        return Promise.resolve();
      }
    }
    vi.stubGlobal('Audio', ErrAudio as unknown as typeof Audio);
    const fb = new MockTts();
    const text = 'おなまえは？';
    const tts = new PrerecordedTts(fb, '/', new Set([textKey(text)]));
    await tts.speak(text);
    expect(fb.calls.map((c) => c.text)).toContain(text);
  });

  it('supported(): キーがあればtrue', () => {
    const fb = new MockTts();
    expect(new PrerecordedTts(fb, '/', new Set(['abc'])).supported()).toBe(true);
  });
});
