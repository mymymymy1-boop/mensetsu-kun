/**
 * ElevenLabs 音声 事前生成スクリプト（ビルド時に一度だけ実行）。
 *   実行: npm run gen:tts
 * APIキー: 環境変数 ELEVENLABS_API_KEY / .env.local / .elevenlabs-key.txt のいずれか。
 * 声 ID:  環境変数 ELEVENLABS_VOICE_ID（未指定なら やさしい女性声の既定）。
 * 出力:   public/audio/{key}.mp3 と src/data/audioManifest.ts。
 * 冪等:   既存ファイルはスキップ（再実行で課金を増やさない）。
 */
import { promises as fs } from 'node:fs';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { allSpokenTexts } from '../src/data/spokenTexts';
import { textKey } from '../src/audio/textKey';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO_DIR = path.join(ROOT, 'public', 'audio');
const MANIFEST = path.join(ROOT, 'src', 'data', 'audioManifest.ts');

// 既定: ネイティブ日本語の女性声 "Kana"（若い・おだやか・標準アクセント・子供向け）。
//   英語圏ボイス(旧Sarah)は日本語が訛るため、ネイティブ日本語ボイスへ変更(2026-06-12)。
//   ELEVENLABS_VOICE_ID で差し替え可。日本語候補は ElevenLabs Voice Library(language=ja)。
const DEFAULT_VOICE = 'dhGvgIx0X6G3xzSWqOye';
const MODEL = process.env.ELEVENLABS_MODEL ?? 'eleven_multilingual_v2';
const SPEED = Number(process.env.ELEVENLABS_SPEED ?? '0.92'); // 少しゆっくりめ（若い声なので0.9前後が自然）

function readKey(): string {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  const envLocal = path.join(ROOT, '.env.local');
  if (existsSync(envLocal)) {
    const m = readFileSync(envLocal, 'utf8').match(/ELEVENLABS_API_KEY\s*=\s*(.+)/);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  const keyFile = path.join(ROOT, '.elevenlabs-key.txt');
  if (existsSync(keyFile)) return readFileSync(keyFile, 'utf8').trim();
  throw new Error(
    'ElevenLabs APIキーが見つかりません。ELEVENLABS_API_KEY を設定するか、プロジェクト直下に .elevenlabs-key.txt を置いてください。',
  );
}

async function synth(text: string, voiceId: string, apiKey: string): Promise<Buffer> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'content-type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true, speed: SPEED },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`ElevenLabs API ${res.status}: ${body.slice(0, 300)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const apiKey = readKey();
  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_VOICE;
  const texts = allSpokenTexts();
  await fs.mkdir(AUDIO_DIR, { recursive: true });

  const totalChars = texts.reduce((a, t) => a + t.length, 0);
  console.log(`対象テキスト: ${texts.length}件 / 合計 ${totalChars}文字 / voice=${voiceId} / model=${MODEL} / speed=${SPEED}`);

  const keys: string[] = [];
  let generated = 0;
  let skipped = 0;
  for (const text of texts) {
    const key = textKey(text);
    keys.push(key);
    const out = path.join(AUDIO_DIR, `${key}.mp3`);
    if (existsSync(out)) {
      skipped++;
      continue;
    }
    process.stdout.write(`生成: "${text.slice(0, 24)}..." -> ${key}.mp3 `);
    const buf = await synth(text, voiceId, apiKey);
    await fs.writeFile(out, buf);
    generated++;
    console.log(`(${buf.length}B)`);
    await new Promise((r) => setTimeout(r, 350)); // レート制限に配慮
  }

  const manifest =
    `// 自動生成ファイル — \`npm run gen:tts\` で更新される。手動編集しない。\n` +
    `export const AUDIO_VOICE = ${JSON.stringify(voiceId)};\n` +
    `export const AUDIO_KEYS: ReadonlySet<string> = new Set<string>([\n` +
    keys
      .sort()
      .map((k) => `  ${JSON.stringify(k)},`)
      .join('\n') +
    `\n]);\n`;
  await fs.writeFile(MANIFEST, manifest, 'utf8');

  console.log(`完了: 生成 ${generated} / スキップ(既存) ${skipped} / 合計 ${keys.length}`);
  console.log(`manifest更新: src/data/audioManifest.ts`);
}

main().catch((e) => {
  console.error('エラー:', e.message);
  process.exit(1);
});
