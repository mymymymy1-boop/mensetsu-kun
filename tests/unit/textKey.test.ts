import { describe, expect, it } from 'vitest';
import { normalizeText, textKey } from '../../src/audio/textKey';
import { allSpokenTexts } from '../../src/data/spokenTexts';

describe('textKey（事前生成音声のファイル名キー）', () => {
  it('同じ入力で同じキー（決定論）', () => {
    expect(textKey('おなまえは？')).toBe(textKey('おなまえは？'));
  });
  it('前後空白・連続空白を正規化して同一視', () => {
    expect(textKey('  なに を   つくる  ')).toBe(textKey('なに を つくる'));
  });
  it('異なる文は異なるキー', () => {
    expect(textKey('いぬ')).not.toBe(textKey('ねこ'));
  });
  it('8桁hex', () => {
    expect(textKey('テスト')).toMatch(/^[0-9a-f]{8}$/);
  });
  it('normalizeText', () => {
    expect(normalizeText(' a  b ')).toBe('a b');
  });
});

describe('allSpokenTexts（事前生成対象）', () => {
  it('質問・ほめ言葉・学校ラベルを含み重複なし', () => {
    const texts = allSpokenTexts();
    expect(texts.length).toBeGreaterThan(30);
    expect(new Set(texts).size).toBe(texts.length); // 重複なし
    expect(texts).toContain('とっても じょうずに いえたね！'); // praise
    expect(texts).toContain('きょうつう（ぜんぶ）'); // school label
  });
  it('各テキストのキーは一意（衝突なし）', () => {
    const keys = allSpokenTexts().map((t) => textKey(t));
    expect(new Set(keys).size).toBe(keys.length);
  });
});
