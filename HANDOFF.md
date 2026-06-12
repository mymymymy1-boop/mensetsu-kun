# HANDOFF — メンセツくん 引き継ぎ & 作業再開ガイド

> このファイルが**再開時の単一入口**です。まずこれを読めば現状把握・作業再開ができます。
> 最終更新: 2026-06-12

---

## 0. 30秒サマリ
- **何**: 私立小学校受験（年長5〜6歳）向け「音声面接対策アプリ」＝音声で質問→子供が声で回答→録音/採点→保護者が振り返り。
- **対応4校**: 慶応横浜初等部 / 慶応幼稚舎 / 桐蔭学園小 / 森村学園初等部 ＋ 共通 ＋ 行動観察。
- **状態**: Phase 0〜8 完了。**本番公開済み（ライブ）**。
- **公開URL**: https://mymymymy1-boop.github.io/mensetsu-kun/
- **リポジトリ**: https://github.com/mymymymy1-boop/mensetsu-kun （public）
- **技術**: React 18 + Vite 5 + TypeScript（完全クライアントサイド静的SPA・バックエンド/課金/アカウントなし）。
- **音声**: ElevenLabs（やさしい女性声）を**事前生成**して同梱（ランタイムはキー不要・課金なし・オフライン）。
- **品質**: 65 unit/integration + 4 E2E PASS / coverage 98.6% / slop CLEAN。

---

## 1. すぐ動かす（ローカル）
```bash
cd C:\dev\mensetsu
npm install          # 初回のみ
npm run dev          # 開発サーバー http://localhost:5173 （Chrome/Edge推奨）
npm run build        # 本番ビルド → dist/
npm run preview      # ビルド結果を http://localhost:4173 で確認
npm test             # 65テスト
npm run coverage     # カバレッジ
npm run e2e          # E2E（要: npx playwright install chromium）
node scripts/shots.mjs   # UI確認スクショ（要 preview 起動・screenshots/ へ出力）
```

## 2. 変更して再公開する（重要）
**main に push すれば GitHub Actions が自動でビルド＆再公開**します。手動デプロイ不要。
```bash
git add -A && git commit -m "変更内容"
git push origin main      # → .github/workflows/deploy.yml が走り数分で反映
gh run watch              # デプロイ進行を見たい場合
```
- 公開設定: GitHub Pages（source = GitHub Actions）。設定済み。
- vite の `base: './'` は GitHub Pages のサブパス公開に対応済み（変更不要）。

## 3. 構成マップ（どこに何があるか）
```
src/
  data/        questions.ts(質問SSOT・58問) / questions.schema.ts(検証) /
               schools.ts(学校カード) / spokenTexts.ts(音声生成対象) / audioManifest.ts(自動生成)
  domain/      types.ts / scoring.ts(採点・純関数) / selector.ts(校別出題) / feedback.ts(子供向け表現)
  audio/       types.ts(ポートIF) / webSpeechTts / mediaRecorder / webSpeechStt /
               prerecordedTts(ElevenLabs再生) / mockAudio / audioFactory / textKey
  state/       settings.ts / sessionStore.ts
  ui/          App.tsx(画面遷移の中枢) / Home / SchoolSelect / ModeSelect / Quiz(中核) /
               ChildResult / ParentGate / ParentReport / Settings / MicButton / Character / Disclaimer
public/audio/  *.mp3（事前生成音声・75本）
scripts/       generateTts.ts(音声生成) / shots.mjs(スクショ)
tests/         unit/ integration/ e2e/
docs/          SRS.md / SDD.md / TEST_PLAN.md / E2E_SCENARIOS.md
research/      research_v1.md / research_v2.md / question_bank.md（調査原典）
harness/       HARNESS.md / review-log.md / finding_ledger.md / state/(状態機械・後述)
CLAUDE.md      開発ガイド ／ CONSTRAINTS.md 不変条件 ／ PROGRESS.md 進捗・決定ログ
```

## 4. 絶対に壊してはいけない不変条件（CONSTRAINTS.md 正本）
1. **子供の音声を外部送信しない**（既定 record-only）。例外は STT を保護者が同意した時のみ。外部送信が起きるのは `src/audio/webSpeechStt.ts` の1箇所だけ・`audioFactory.makeStt` がガード。
2. 音声・STT原文を**永続保存しない**（メモリのみ）。localStorageはスコア/メモ/設定だけ。
3. 子供に**数値スコアを見せない**（花丸・星・ほめ言葉のみ）。低スコア・無回答でも否定しない。
4. 受験情報は**出典・信頼度A〜Dを表示**し「最新は公式要項で確認」を常時表示。慶応2校は面接なし＝制作お尋ね中心と注記。
5. 大人向け機能は**保護者ゲート**の奥。

## 5. よくある作業の手順
### 質問を追加する
1. `src/data/questions.ts` に追記（id一意・schools/mode/category/level/text/intent/source/reliability 必須。慶応はnote）。原典は `research/question_bank.md`。
2. `npm test`（questions.test.ts がスキーマ/重複/必須を検証）。
3. **音声生成**: `.elevenlabs-key.txt`（または .env.local の ELEVENLABS_API_KEY）を置いて `npm run gen:tts`（冪等＝新規分のみ生成）。声/速度は env `ELEVENLABS_VOICE_ID` / `ELEVENLABS_SPEED` で変更可。声を変える時は `public/audio/` を空にして再生成。
4. `npm run build` → commit → `git push origin main`。

### 声を変える
`.env.local` に `ELEVENLABS_VOICE_ID=<voice>` → `public/audio/*.mp3` 削除 → `npm run gen:tts` → build → push。
（既定 voice=Sarah `EXAVITQu4vr4xnSDxMaL`・speed 0.85）

### UIを直す
`src/ui/*` と `src/App.css`。確認は `npm run dev` か `node scripts/shots.mjs`。

## 6. 採点ロジックの要点（src/domain/scoring.ts）
5〜6歳はSTT精度が低い(WER≈27%)前提。「答えた形跡」を最重視・キーワードは加点・STT無効時はkeywordHit=unknown。低スコアでも子供は星1＋励まし。最終判断は保護者補正(ParentReport)。閾値はこのファイルが正本（TEST_PLAN §4と整合）。

## 7. spec-driven-autobuild パイプラインの再開
- 状態機械の現在地: **DEPLOY**（正常完了の一歩手前。COMPLETEは終端なので未遷移＝今後も反復可能）。
- 状態の正本: `harness/state/session_manifest.json`（現在phase）
- 全遷移・ゲート判定ログ（**再開用ログ**）: `harness/state/task_history.jsonl`（追記専用・9イベント記録済み）
- 進捗・意思決定ログ: `PROGRESS.md`（人間可読の決定ログ）
- 状態確認/遷移コマンド:
  ```bash
  python3 "C:/Users/mitsu/.claude/skills/spec-driven-autobuild/scripts/state_machine.py" status --dir .
  # 例: さらに実装する → IMPL へ戻す
  python3 ".../state_machine.py" transition --dir . --to IMPL --reason "理由"
  ```
- 機械ゲート: G1-AST `scripts/slop_detector.py --dir . --target src` / G1-EV `scripts/evidence_gate.py`（**Windowsでは `PYTHONUTF8=1` を付けて実行**＝日本語出力のcp932デコード回避）。

## 8. セキュリティ／秘密情報
- `.env`（**実APIキー多数: ANTHROPIC/OPENROUTER/OPENAI 等**）と `.elevenlabs-key.txt` は **.gitignore 済み・コミット禁止**。リポジトリには含まれていない（確認済み）。
- 公開リポジトリだがコードに秘密値は無い。新たにキーを足す時は必ず .gitignore を確認。

## 9. 残課題 / 次の候補（DEFER・未着手）
- ローカルSTT(Vosk-browser・Apache-2.0・約50MB)で「外部送信なしの自動聞き取り」を実装（アダプタ `SttPort` 差し替えで対応可）。
- LLMによる回答の意味採点（キー導入時に採点アダプタ差し替え）。
- 進捗の長期記録・成長グラフ（現状セッション結果は任意でlocalStorage）。
- 保護者向け「見られているポイント」解説の拡充（question_bank §6/§7 が素材）。
- 質問のさらなる拡充（question_bank.md に未収録の候補多数）。
- 注意: 面接形式は年度変動。各校公式で要再確認（アプリ内に注意表示済み）。

## 10. コミット履歴（要点）
```
e4d640b docs: Phase 8 本番公開を記録（GitHub Pages 公開済み）
6fe3c6b ci: GitHub Pages 自動デプロイのワークフロー追加
132c8b4 feat: 質問を58問に拡充 + 子供向けUI/UX改善
8e1f43c feat: メンセツくん 初版（Phase 0〜7）
```
復元/差分: `git log` / `git show <sha>` / `git checkout <sha>`。
