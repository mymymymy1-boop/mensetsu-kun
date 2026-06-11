# HARNESS — 安全・品質ハーネス（メンセツくん）

## 1. Planner / Generator / Evaluator
- Planner: TASKS.md にper-taskで分割（1タスク=RED→GREEN→独立レビュー→done）。
- Generator: SDDのモジュール単位で最小実装（feature flag裏）。
- Evaluator: 決定論センサー（下記）＋独立レビュー役(別文脈Task)。

## 2. 決定論センサー（人手判断を排した合否）
| センサー | 内容 | 合格 |
|---|---|---|
| type-check | `tsc --noEmit` | エラー0 |
| lint | eslint | エラー0 |
| unit/integration | vitest | 全PASS |
| coverage(domain) | vitest --coverage | 80%以上 |
| build | vite build | 成功 |
| e2e | playwright | 全PASS |
| G1-AST | slop_detector.py(src) | CRITICAL=0 |
| G1-EV | evidence_gate.py | 各タスクdone時PASS |

## 3. 安全ハーネス（不変条件の機械監視）
- 外部送信ガード: STT実装以外で `SpeechRecognition` / fetch/XHR を使わない（grep検査）。STT呼出は設定＋同意フラグ必須。
- 保存ガード: localStorageに音声Blob/STT原文を書かない（コードレビュー＋テスト）。
- 子供FBガード: ChildFeedbackに数値スコアをrenderしない（テスト）。
- これらはCONSTRAINTSのC-PRIV/C-EDUに対応。

## 4. 失敗学習ループ
- 失敗は harness/failure_patterns.md に FP-XXX で記録→CONSTRAINTS禁止事項へ昇格。
- REJECT2回で根本原因をクリーン文脈で再調査、通算3回でblocked化し隔離して自走継続。

## 5. レビュー（Phase5/6b）
- 非対称レビュー: Codex役(実装/テスト/破壊防止) と Opus役(教育的妥当性/情報正確性/プライバシー/MVP境界)。
- 指摘は再リサーチID/finding_ledgerへ。RYGで判定。
