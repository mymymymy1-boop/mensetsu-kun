// 設定の保存/読込 — FR-SYS-002 / C-PRIV-002
// localStorageに音声やSTT原文は書かない。設定のみ。
import type { Settings } from '../domain/types';

const KEY = 'mensetsu.settings.v1';

export const DEFAULT_SETTINGS: Settings = {
  sttMode: 'record-only', // 既定: 外部送信なし(C-PRIV-001)
  sttConsent: false,
  ttsRate: 0.9,
  saveResults: false, // 既定: 保存しない
};

export function loadSettings(): Settings {
  try {
    if (typeof localStorage === 'undefined') return { ...DEFAULT_SETTINGS };
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...DEFAULT_SETTINGS, ...sanitize(parsed) };
  } catch {
    // 壊れた設定は既定に戻す（握りつぶしでなく明示的フォールバック）
    return { ...DEFAULT_SETTINGS };
  }
}

function sanitize(p: Partial<Settings>): Partial<Settings> {
  const out: Partial<Settings> = {};
  if (p.sttMode === 'record-only' || p.sttMode === 'webspeech-stt') out.sttMode = p.sttMode;
  if (typeof p.sttConsent === 'boolean') out.sttConsent = p.sttConsent;
  if (typeof p.ttsRate === 'number' && p.ttsRate >= 0.5 && p.ttsRate <= 1.5) out.ttsRate = p.ttsRate;
  if (typeof p.saveResults === 'boolean') out.saveResults = p.saveResults;
  // webspeech-stt は同意とセットでなければ強制的に record-only に落とす
  if (out.sttMode === 'webspeech-stt' && out.sttConsent !== true) out.sttMode = 'record-only';
  return out;
}

export function saveSettings(s: Settings): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // 保存不可（プライベートモード等）は無視して継続
    return;
  }
}
