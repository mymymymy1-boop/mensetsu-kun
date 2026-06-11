# CLAUDE.md — メンセツくん（小学校受験 子供向け音声面接対策アプリ）

## 1. プロジェクト概要
年長児(5〜6歳)が家庭で面接・行動観察の受け答えを音声で練習するWebアプリ。音声で出題→子供が声で回答→録音/任意聞き取り→採点→保護者が振り返り。4校(慶応横浜初等部/慶応幼稚舎/桐蔭学園小/森村学園初等部)＋共通＋行動観察に対応。

## 2. 技術スタック
React 18 / Vite 5 / TypeScript 5 / Vitest + Testing Library / Playwright(E2E)。外部API・サーバー・課金・アカウント無し。音声=ブラウザ標準(SpeechSynthesis/MediaRecorder/SpeechRecognition)。

## 3. ディレクトリ
`src/data`(質問JSON・SSOT) `src/domain`(scoring/selector/feedback 純関数) `src/audio`(ポート＋実装＋mock＋factory) `src/state` `src/ui` / `tests/{unit,integration,e2e}` / `docs/` `research/`。

## 4. ビルド/実行
`npm install` → 開発 `npm run dev` / ビルド `npm run build` / プレビュー `npm run preview` / テスト `npm test` / カバレッジ `npm run coverage` / E2E `npm run e2e`。

## 5. 中核ドメイン
- 採点(`domain/scoring.ts`)は純関数。「答えた形跡」最重視・キーワードは加点・STT無効時は keywordHit=unknown。低スコアでも子供は星1＋励まし。
- 出題選択(`domain/selector.ts`)は校別重み(慶応=制作お尋ね+共通 / 桐蔭=思考hard厚め / 森村=自己紹介easy+お尋ね)。
- 子供向け表現(`domain/feedback.ts`)は点数を出さず花丸/star/ほめ言葉。

## 6. 音声アダプタ
`TtsPort/RecorderPort/SttPort` をfactoryで環境判定。supported()=falseはmock/フォールバック。**STTは設定有効＋保護者同意フラグのガードがある時だけ呼ぶ**。
- **TTS=ElevenLabs事前生成方式**: 固定テキスト(質問/ほめ言葉/学校ラベル)を `npm run gen:tts` でMP3生成→`public/audio/{key}.mp3`＋`src/data/audioManifest.ts`。実行時は `PrerecordedTts` が再生し、無い文だけWeb Speechにフォールバック（ランタイムでキー不要・課金なし・オフライン）。キーは `.elevenlabs-key.txt`/`.env.local`(gitignore)から生成時のみ読む。voice/speed は env(`ELEVENLABS_VOICE_ID`/`ELEVENLABS_SPEED`)で差替。テキスト→ファイル名は `src/audio/textKey.ts`(FNV-1a)。

## 7. 不変条件（CONSTRAINTS.md 正本）
①子供の音声を外部送信しない(STT同意時を除く) ②音声・STT原文を永続保存しない ③子供に数値スコアを見せない ④受験情報は出典・信頼度を表示し公式確認を促す ⑤大人向け機能は保護者ゲートの奥。

## 8. UI原則
2cm四方ボタン・単一タップのみ(ドラッグ/スワイプ/長押し不可)・ひらがな＋音声併記・キャラ主導・無反応時は質問自動再読・1画面1アクション・短セッション。

## 9. テスト方針
音声I/Oはmockで決定論テスト。domain純関数はunitでカバレッジ80%以上。画面遷移はintegration。1サイクルはe2e。テスト改ざん禁止(SD-03)。

## 10. 安全則
破壊的/外部送信/課金/本番デプロイは個別承認。feature flag既定off。STTは同意ゲートの奥。`npm audit`で依存衛生。

## 11. コーディング規約
TS strict。空実装/TODO放置/握りつぶしexcept禁止(G1-AST)。純関数を優先しUIから副作用を分離。日本語UI文言・コメントは簡潔に。

## 12. データ出典の扱い
質問は学校公式(A)>大手教室(B)>体験談(C)>出所不明(D)。慶応2校は面接なし=制作お尋ね中心と注記。逐語非公開を明示。

## 13. 参照
要件=docs/SRS.md / 設計=docs/SDD.md / 調査=research/*.md / 質問原典=research/question_bank.md / 進捗=PROGRESS.md / 状態=harness/state/。
