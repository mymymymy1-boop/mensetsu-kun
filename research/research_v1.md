# リサーチ V1 — 小学校受験 子供向け 音声面接対策アプリ

## 調査日: 2026-06-11
## 対象プロジェクト: 慶応横浜初等部・慶応幼稚舎・桐蔭学園小・森村学園初等部 4校対応 音声面接対策アプリ
## 方法: Claude Code 内蔵 WebSearch/WebFetch + 並列5サブエージェント（外部API課金¥0）。信頼度 A=学校公式/一次, B=大手幼児教室公式・MDN等技術一次, C=個人ブログ・体験談, D=出所不明

---

## A. ツール/技術（音声I/O・実装基盤）

| # | 調査項目 | 結果 | ソースURL | 信頼度 |
|---|---|---|---|---|
| A1 | 質問の音声読み上げ(TTS) | Web Speech API `SpeechSynthesis`。Chrome/Edge/Safari/Firefox対応。ja-JP音声はOS依存だが多くの環境で存在。rate/pitch/voice制御可。`voiceschanged`待ち必須 | https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis | A |
| A2 | 子供の回答の音声認識(STT) | Web Speech API `SpeechRecognition`。**実質Chrome/Safariのみ**（Edgeは非対応扱い・Firefox無効）。**既定で音声をGoogleサーバーに送信＝オフライン不可・子供の声が外部送信される** | https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API ／ https://caniuse.com/speech-recognition | A |
| A3 | STTのローカル化 | Chrome 139(2025/8)で`processLocally=true`のon-deviceモード追加。音声を外部送信しない。ただし対応はChrome139+のみ・**ja-JP可否は未確認** | https://chromestatus.com/feature/6090916291674112 ／ https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/processLocally | A |
| A4 | 録音（保護者採点用） | MediaRecorder API。getUserMediaのマイク音声をローカルBlobで録音・再生。Chrome/Safari/Firefox対応。**外部送信ゼロを確実に保証できる** | https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder | A |
| A5 | ブラウザ内オフラインSTT | Vosk-browser（WASM+Kaldi・Apache-2.0・日本語smallモデル約50MB・完全ローカル）。whisper-web(transformers.js・Apache-2.0・数百MB・重い) | https://www.npmjs.com/package/vosk-browser ／ https://alphacephei.com/vosk/models ／ https://github.com/xenova/whisper-web | A |
| A6 | 子供(5〜6歳)のSTT精度 | 学年別WER: 5歳=26.9%, 6歳=14.6%, 7歳=10.5%。**5〜6歳はASRが最も苦手とする層。自動採点の主軸に据えるのは危険** | https://arxiv.org/html/2502.08587 ／ https://pubs.aip.org/asa/jel/article/5/3/035201/ | A/B |

## B. 受験情報（4校の面接・行動観察・質問）

| # | 調査項目 | 結果 | ソースURL | 信頼度 |
|---|---|---|---|---|
| B1 | 慶応幼稚舎 面接有無 | **面接なし（公式明言）**。運動/行動観察(集団遊び)/絵画制作の3本柱・ペーパーなし。子供への質問は絵画制作中の「お尋ね」（何を描いたの/どうしてこの色？等） | https://www.yochisha.keio.ac.jp/admissions/qa/ | A(有無) / B(質問例) |
| B2 | 慶応横浜初等部 面接有無 | **保護者面接なし（公式明言）**。一次ペーパー→二次で運動・集団テスト(行動観察)・絵画制作。制作中に「何を作っているの/どうしてこれを作ろうと思った？」の問いかけ | https://www.yokohama-e.keio.ac.jp/admission/qa.html | A(有無) / B(質問例) |
| B3 | 桐蔭学園小 面接有無 | **面接あり**。2025年度から保護者面接→**親子面接**に変更（別日・約15分）。考査中の「総合観察/個別口頭試問」で子供に質問（写真・雲・タブレット動画でのとっさの判断含む） | https://toin.ac.jp/ele/guideline/ ／ https://www.rieikai.com/success_news/304/ | A(有無) / B/C(質問) |
| B4 | 森村学園初等部 面接有無 | **面接あり**。保護者面接(別日)＋子供の**グループ面接(3〜4人)**＋個人制作中の試験官質問（どんなおかず描いた/誰とどこで食べたい等） | https://www.morimura.ed.jp/examination/pdf/guideline.pdf ／ https://www.rieikai.com/success_news/2584/ | A(有無) / B(質問) |
| B5 | 一般の子供面接頻出質問 | 9カテゴリ約130問を網羅（自己紹介/家庭/園生活/友達・社会性/思考とっさ/生活習慣/興味/将来志望/行事経験）。出典は大手教室B・体験談C中心 | https://shogakko-juken.jp/shiritsu-mensetsu/ ／ https://www.tenjin.cc/education/pre/elementary-school-examination-interview/ | B/C |
| B6 | 行動観察の声かけ質問 | 約35問を場面別に整理。ただし**試験官の逐語的声かけ例の信頼できる出典は乏しい(C/D)**。一方「見られているポイント」(協調性/指示理解/マナー/思いやり/自立/やりきる力)はB出典で確実 | https://www.shingakai.co.jp/column/post/columnpost-1875/ ／ https://www.tenjin.cc/education/pre/kodokansatsu/ | B(観点)/C(逐語) |

## C. UI/UX・既存アプリ（子供向け設計）

| # | 調査項目 | 結果 | ソースURL | 信頼度 |
|---|---|---|---|---|
| C1 | 子供向けタッチ設計 | タッチターゲット最低2cm×2cm（成人の4倍）。**5歳以下はドラッグ不可・単一タップ中心**。ボタンは触れた瞬間に視覚+効果音で反応 | https://www.nngroup.com/articles/children-ux-physical-development/ | A |
| C2 | 音声主導ナビ | 3〜6歳ではVUI（音声）がナビ本体。ロボット声でなくキャラ主導ナレーション。無反応なら指示を自動で繰り返す | https://www.aufaitux.com/blog/ui-ux-designing-for-children/ | B |
| C3 | フォント | UDデジタル教科書体（読み書き困難児にも配慮・試験字形に近い）。ひらがな＋音声を常にセット | https://www.w3.org/WAI/cognitive/ ／ https://studiosora.jp/column/898/ | A/B/C |
| C4 | 保護者ゲート | Apple Kids要件: 購入・外部リンク・権限要求は保護者ゲートの奥。計算問題/PIN/長押しで突破。子供に点数を直接見せない | https://developer.apple.com/app-store/review/guidelines/ | A |
| C5 | ゲーミフィケーション | 懲罰でなくポジティブ強化＋即時FB。花丸/star/進捗バー。短セッション(3〜5分)＋1日◯分制限(シンクシンク実例) | https://www.nngroup.com/articles/kids-cognition/ ／ https://think.wonderfy.inc/ | A/B |
| C6 | 最も近い既存例 | 「小学校受験三つ星 面接対策(設問音声付き・子供が音声を聞いて答える)」「できましたっち！(ジャック監修・音声出題で自走)」「お受験くるくる(音声読み上げ＋自動採点)」「BrainySprouts(音声出題・進捗は保護者画面)」 | https://shogakkojuken-3star.stores.jp/items/6110f0a9202397315f8371d5 ／ https://shogakko-juken.jp/shogakko-juken_app/ | B |

---

## 未解決・要V2確認

| # | 項目 | 理由 | V2で何を調べるか/どう確定するか |
|---|---|---|---|
| 1 | STTの方式選択（プライバシー vs 採点自動化） | 既定Web Speech STTは子供の声を外部送信。on-deviceはja可否不明・対応狭い | アーキ判断: 録音(MediaRecorder)を基盤に、STTはアダプタ化。MVP既定方針をV2で確定 |
| 2 | 採点ロジックの設計 | 5〜6歳のSTT精度が低く自動採点が不正確になりうる | 「自動(ヒューリスティック)＋保護者手動補正」のハイブリッド設計をV2で確定。点数で子供を否定しない |
| 3 | 各校の最新の面接形式・実施有無 | 年度で変動（桐蔭の親子/保護者面接、森村の運動有無等） | 学校公式が逐語非公開。アプリ内に「最新は公式要項で確認」注記を必須化。質問は信頼度を明示して収録 |
| 4 | 行動観察「声かけ」質問の逐語出典 | 逐語例の信頼できる出典が乏しい | 「想定声かけ」として信頼度C/D明示で収録。見られているポイント(B)を保護者向け解説に活用 |
| 5 | ja-JP TTS音声の実機品質 | 環境依存 | 実装時に`getVoices()`でja-JP選択・rateやや遅め。音声なし環境のフォールバック(文字のみ)を用意 |
