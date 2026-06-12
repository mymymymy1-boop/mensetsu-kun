# PROGRESS — 小学校受験 子供向け音声面接対策アプリ

- session_id: 2026-06-11T05:55:00（full_auto）
- BUILD_TARGET: 私立小学校受験の子供向け音声面接対策アプリ（慶応横浜初等部・慶応幼稚舎・桐蔭学園小・森村学園小の4校対応、音声で出題→子供が音声回答→聞き取り→採点）

## フェーズ進捗

| Phase | 状態(G4) | 状況 | 主な成果物 |
|---|---|---|---|
| 0 ヒアリング | HEARING | ✅完了 | intake_sheet.md / scope_table.md / open_items.md |
| 1 リサーチ V1→V2 | RESEARCH | ✅完了 | research/research_v1.md / research_v2.md / question_bank.md |
| 2 SRS | SPEC | ✅完了 | docs/SRS.md |
| 3 SDD | SPEC | ✅完了 | docs/SDD.md / CLAUDE.md |
| 4 テスト/ハーネス/E2E | SPEC | ✅完了 | TEST_PLAN.md / E2E_SCENARIOS.md / HARNESS.md / CONSTRAINTS.md |
| 5 レビュー・GO判定 | REVIEW | ✅GO | harness/review-log.md / finding_ledger.md |
| 6/6b 実装 | IMPL | ✅完了 | src/ tests/ TASKS.md（T-001〜T-011 done） |
| 7 検証 | VERIFY | ✅完了 | 全ゲート緑（下記DoD） |
| 8 本番移行 | - | ⏸ 保留（個別承認必須・人ゼロ自動化しない） | dist/（ビルド済み） |

## Definition of Done（Phase 7 検証結果・2026-06-11）
| ゲート | 結果 |
|---|---|
| typecheck (tsc --noEmit) | ✅ エラー0 |
| lint (eslint) | ✅ エラー0 |
| unit + integration (vitest) | ✅ 54/54 PASS |
| coverage (domain/data/factory) | ✅ 98.2% statements（閾値80%） |
| build (vite build) | ✅ 成功（dist/・gzip 56KB JS） |
| G1-AST slop検知 | ✅ CLEAN（deficit 0・CRITICAL 0） |
| G1-EV 完了ゲート | ✅ PASS（build+test機械検証） |
| E2E (Playwright・実ブラウザ実音声) | ✅ 4/4 PASS |
| Spec Drift SD-01/02/03 | ✅ 文書整合・テスト改ざんなし |

## 重要決定ログ
- 2026-06-11: 外部APIキー未設定 → 有料リサーチ外部パイプライン不可。Claude Code内蔵WebSearch/WebFetch+並列サブエージェントで代替（外部課金¥0）。
- 2026-06-11: 形式=Webアプリ（Web Speech API使用・キー不要）。子供の音声は既定で外部保存しない方針。
- 2026-06-11(追加): TTSの機械音改善要望 → ElevenLabs女性声(Sarah/speed0.85)を**事前生成方式**で採用。46音声をビルド時生成しpublic/audioに同梱。ランタイムはキー不要・課金なし・オフライン維持。Web Speechはフォールバックに降格。全ゲート再緑(65テスト/E2E4/build/slop)。
- 2026-06-12: 続き作業①質問拡充(29→58問・出典/信頼度/レベル全付与・音声75本に)②UI/UX改善(進捗ドット/マイク誘導アニメ/グラデ背景/学校カード色分け/結果画面の星折り返し修正・子供画面から数値除去/お祝い演出)。全ゲート再緑(65テスト/E2E4/coverage98.6%/slop CLEAN)。次=③本番公開(要承認)。

## 残課題 / リスク
- 子供(5〜6歳)発話のSTT精度 → 採点は自動＋保護者補正のハイブリッドで吸収
- 受験情報の正確性 → 学校公式を最優先（信頼度A）、教室・体験談はB/C扱い
