# TASKS.md — Phase 6b 実装台帳（per-task）

各タスク: RED(落ちるテスト)→GREEN(最小実装・flag裏)→独立レビュー→done。done化はG1-EV(diff/build/test/file)で機械判定。

| T | タスク | type | 主な成果物 | 対応FR | 状態 |
|---|---|---|---|---|---|
| T-001 | プロジェクト雛形(Vite+React+TS+Vitest+ESLint) | config | package.json/tsconfig/vite.config/index.html | 基盤 | done |
| T-002 | ドメイン型定義 | code | src/domain/types.ts | 全 | done |
| T-003 | 質問データ＋スキーマ検証 | code | src/data/questions.ts, questions.schema.ts | FR-DATA-001 | done |
| T-004 | 採点ロジック(純関数) | code | src/domain/scoring.ts +test | FR-SCORE-001 | done |
| T-005 | 出題選択(校別重み) | code | src/domain/selector.ts +test | FR-SEL/DATA-002 | done |
| T-006 | 子供向けFB変換 | code | src/domain/feedback.ts +test | FR-FB-001 | done |
| T-007 | 音声ポート＋mock＋factory | code | src/audio/*.ts +test | FR-AUD/REC/STT,COMPAT | done |
| T-008 | 設定/セッション状態 | code | src/state/*.ts +test | FR-SYS-002 | done |
| T-009 | UI(ホーム/校/モード/出題/FB/結果/ゲート/設定) | code | src/ui/*.tsx | FR-SEL/AUD/REC/FB/RPT/GATE/SYS | done |
| T-010 | 結合テスト | code | tests/integration/* | 複数FR | done |
| T-011 | E2E | code | tests/e2e/* | E2Eシナリオ | done |
| T-012 | 検証(lint/type/test/coverage/build) | config | - | NFR | Phase7 |

注: feature flag = STT(既定off)・結果保存(既定off)。Phase7/8まで有効化しない。
