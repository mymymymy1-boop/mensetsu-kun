// 環境判定で実装を選択 — NFR-COMPAT-001 / NFR-REL-001
// 未対応はフォールバックして常に動作（クラッシュ禁止 C-TECH-002）。
import type { Settings } from '../domain/types';
import { MediaRecorderAdapter } from './mediaRecorder';
import { MockRecorder, MockStt, MockTts } from './mockAudio';
import { PrerecordedTts } from './prerecordedTts';
import type { RecorderPort, SttPort, TtsPort } from './types';
import { WebSpeechStt } from './webSpeechStt';
import { WebSpeechTts } from './webSpeechTts';
import { AUDIO_KEYS } from '../data/audioManifest';

export function makeTts(): TtsPort {
  // フォールバック: Web Speech（未対応ならMock）。
  const fallback: TtsPort = new WebSpeechTts().supported() ? new WebSpeechTts() : new MockTts();
  // 事前生成音声(ElevenLabs)があればそれを優先し、無い文だけフォールバック。
  if (AUDIO_KEYS.size > 0) return new PrerecordedTts(fallback);
  return fallback;
}

export function makeRecorder(): RecorderPort {
  const rec = new MediaRecorderAdapter();
  // 未対応環境では「録音なし」モック（録音スキップ＝口頭練習モード相当）
  return rec.supported() ? rec : new MockRecorder(0, false);
}

/**
 * STTを選ぶ。★外部送信ガード: 設定が webspeech-stt かつ同意ありの時だけ実STTを返す。
 * それ以外は常に「認識しない」STT（record-only）を返す（C-PRIV-001）。
 */
export function makeStt(settings: Settings): SttPort {
  const allowed = settings.sttMode === 'webspeech-stt' && settings.sttConsent === true;
  if (!allowed) return new MockStt(null, false); // recognize()は常にnull＝外部送信しない
  const stt = new WebSpeechStt();
  return stt.supported() ? stt : new MockStt(null, false);
}

/** 実STTが実際に有効化されているか（UI表示用）。 */
export function isSttActive(settings: Settings): boolean {
  return settings.sttMode === 'webspeech-stt' && settings.sttConsent === true && new WebSpeechStt().supported();
}
