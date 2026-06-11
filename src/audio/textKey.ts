// 読み上げテキスト → 安定キー（事前生成音声ファイル名に使用）。
// 生成スクリプトと実行時の双方が同じ関数を使い、ファイル名の不一致を防ぐ。
// FNV-1a 32bit（依存なし・決定論）。

export function normalizeText(s: string): string {
  return s.trim().replace(/\s+/g, ' ');
}

export function textKey(s: string): string {
  const n = normalizeText(s);
  let h = 0x811c9dc5;
  for (let i = 0; i < n.length; i++) {
    h ^= n.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
