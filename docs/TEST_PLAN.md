# テスト計画 TEST_PLAN — メンセツくん（IEEE 829準拠）

## 1. 方針
- 純粋ドメイン(scoring/selector/feedback/schema)はunitで重点検証。カバレッジ80%以上(NFR-MAINT-001)。
- 音声I/Oはモックポートで決定論テスト（実マイク不要・CI緑）。
- 画面遷移・状態はintegration、1サイクルはE2E(Playwright)。
- 全Must要件にTC-*を接続（黄金ルール#2）。

## 2. テスト環境
Node 18+/24、Vitest(jsdom)、@testing-library/react、Playwright(Chromium)。外部依存なし。

## 3. トレーサビリティ（Must要件→TC）
| 要件 | TC-ID | 種別 | 主な検証 |
|---|---|---|---|
| FR-SEL-001 | TC-FR-SEL-001 | integration | 校選択で該当質問セットが読まれ遷移する/読込失敗時の表示 |
| FR-SEL-002 | TC-FR-SEL-002 | unit/integration | モードで質問が絞られる/0件は選択不可 |
| FR-AUD-001 | TC-FR-AUD-001 | unit(mock) | tts.speakが質問文/rate0.9で呼ばれる/非対応時フォールバック |
| FR-REC-001 | TC-FR-REC-001 | unit(mock) | start→stopでBlob取得/非対応時スキップ継続 |
| FR-STT-001 | TC-FR-STT-001 | unit(mock) | 同意フラグfalseならsttを呼ばない/エラー時record-onlyフォールバック |
| FR-SCORE-001 | TC-FR-SCORE-001 | unit | 採点表(下記§4)の全境界 |
| FR-SCORE-002 | TC-FR-SCORE-002 | unit/integration | 保護者補正がraw/memoを上書き |
| FR-FB-001 | TC-FR-FB-001 | unit | 子供向けに数値が出ない/低スコアでも励まし文 |
| FR-RPT-001 | TC-FR-RPT-001 | integration | 結果一覧・出典/信頼度・録音再生・合計表示/0件表示 |
| FR-GATE-001 | TC-FR-GATE-001 | integration | 正解で保護者領域/不正解で入れない |
| FR-DATA-001 | TC-FR-DATA-001 | unit | スキーマ検証で不正除外/全件にsource・reliability |
| FR-DATA-002 | TC-FR-DATA-002 | unit | 校別重みで傾向通り選択/不足時common補完 |
| FR-SYS-001 | TC-FR-SYS-001 | integration | 注意文が校選択・結果に常時表示 |
| FR-SYS-002 | TC-FR-SYS-002 | unit/integration | セッション終了で音声破棄/localStorageに音声を書かない |
| NFR-SEC-001 | TC-NFR-SEC-001 | unit | STT無効時に外部送信経路が呼ばれない(モックspy) |
| NFR-COMPAT-001 | TC-NFR-COMPAT-001 | unit | factoryがsupported=falseでフォールバックを返す |
| NFR-MAINT-001 | TC-NFR-MAINT-001 | meta | domainカバレッジ80%以上 |

## 4. 採点ロジック境界（TC-FR-SCORE-001 ケース表）
| ケース | hasAudio | sttText | durationMs | keywords | 期待raw | stars |
|---|---|---|---|---|---|---|
| 無回答 | false | null | 0 | あり | 0 | 0 |
| 音声短い | true | null | 500 | あり | 50(heard10+answered? no) ※answeredはduration>=800で判定 → answered=false → 10 | 1? |
| 録音のみ十分 | true | null | 2000 | あり | answered40+lengthOk25+kw unknown15+heard10=90 | 3 |
| STT一致 | true | "いぬがすき" | 1500 | ["いぬ"] | 40+25+25+10=100 | 3 |
| STT不一致 | true | "あか" | 1500 | ["いぬ"] | 40+25+5+10=80 | 3 |
| STT空文字 | true | "" | 1500 | あり | answered=false(空)→ heard10 + lengthOk?no → 10 | 1 |
※実装の閾値は scoring.ts を正本とし、本表はテストの期待値整合を取る（実装確定時に数値を固定）。

## 5. 合否基準（Exit）
lint/type-check/build緑 ・ unit/integration/e2e全PASS ・ domainカバレッジ80%以上 ・ G1-AST CRITICAL=0。

## 6. リスクベース重点
RISK-001(外部送信)→TC-NFR-SEC-001/TC-FR-STT-001を必須。RISK-002(誤採点)→TC-FR-SCORE-001/FB-001。RISK-003→TC-FR-DATA-001/SYS-001。
