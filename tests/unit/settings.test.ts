import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../../src/state/settings';

describe('settings (FR-SYS-002 / C-PRIV)', () => {
  beforeEach(() => localStorage.clear());

  it('既定はrecord-only・同意false・保存false', () => {
    expect(DEFAULT_SETTINGS.sttMode).toBe('record-only');
    expect(DEFAULT_SETTINGS.sttConsent).toBe(false);
    expect(DEFAULT_SETTINGS.saveResults).toBe(false);
  });

  it('保存・読込が往復する', () => {
    saveSettings({ ...DEFAULT_SETTINGS, ttsRate: 1.1, saveResults: true });
    const s = loadSettings();
    expect(s.ttsRate).toBe(1.1);
    expect(s.saveResults).toBe(true);
  });

  it('webspeech-sttは同意なしならrecord-onlyへ強制', () => {
    localStorage.setItem(
      'mensetsu.settings.v1',
      JSON.stringify({ sttMode: 'webspeech-stt', sttConsent: false }),
    );
    expect(loadSettings().sttMode).toBe('record-only');
  });

  it('webspeech-sttは同意ありなら維持', () => {
    saveSettings({ ...DEFAULT_SETTINGS, sttMode: 'webspeech-stt', sttConsent: true });
    expect(loadSettings().sttMode).toBe('webspeech-stt');
  });

  it('壊れたデータは既定にフォールバック', () => {
    localStorage.setItem('mensetsu.settings.v1', '{not json');
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });
});
