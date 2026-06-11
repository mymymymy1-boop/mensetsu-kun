import { describe, expect, it } from 'vitest';
import { isSttActive, makeRecorder, makeStt, makeTts } from '../../src/audio/audioFactory';
import { DEFAULT_SETTINGS } from '../../src/state/settings';
import type { Settings } from '../../src/domain/types';

// jsdomには SpeechSynthesis/SpeechRecognition/MediaRecorder が無い → 全てフォールバックする想定。

describe('audioFactory フォールバック (NFR-COMPAT-001)', () => {
  it('TTSは未対応環境でもインスタンスを返す', () => {
    const tts = makeTts();
    expect(typeof tts.speak).toBe('function');
    expect(typeof tts.supported).toBe('function');
  });

  it('録音は未対応環境でstop()がnull blobを返す', async () => {
    const rec = makeRecorder();
    const r = await rec.stop();
    expect(r.blob).toBeNull();
  });
});

describe('STT外部送信ガード (NFR-SEC-001 / C-PRIV-001)', () => {
  it('record-only既定では recognize() が常にnull（外部送信しない）', async () => {
    const stt = makeStt(DEFAULT_SETTINGS);
    expect(await stt.recognize()).toBeNull();
    expect(stt.supported()).toBe(false);
  });

  it('webspeech-sttでも同意がなければ実STTにならない', async () => {
    const s: Settings = { ...DEFAULT_SETTINGS, sttMode: 'webspeech-stt', sttConsent: false };
    const stt = makeStt(s);
    expect(await stt.recognize()).toBeNull();
  });

  it('同意ありでもブラウザ非対応ならフォールバック(null)', async () => {
    const s: Settings = { ...DEFAULT_SETTINGS, sttMode: 'webspeech-stt', sttConsent: true };
    const stt = makeStt(s);
    // jsdomは非対応なので null
    expect(await stt.recognize()).toBeNull();
  });

  it('isSttActiveは非対応環境でfalse', () => {
    const s: Settings = { ...DEFAULT_SETTINGS, sttMode: 'webspeech-stt', sttConsent: true };
    expect(isSttActive(s)).toBe(false);
  });
});
