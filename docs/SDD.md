# ソフトウェア設計書 SDD — メンセツくん

IEEE 1016 準拠。SRS v1.0 に対応。類型: クライアントサイド静的SPA（React + Vite + TypeScript）。

---

## 1. 設計概要・原則
- **プライバシー・バイ・デザイン**: 子供の音声は既定でローカルのみ。外部送信はSTT同意時に限定。永続保存しない。
- **アダプタ分離**: 音声I/O（TTS/録音/STT）と採点をインターフェースで抽象化し、実装を差替可能に（テスト時はモック＝決定論）。
- **依存最小**: React/Vite/TSのみ。音声はブラウザ標準API。外部ランタイム依存なし。
- **単一データソース**: 質問は静的JSONを正本（SSOT-D1）。

---

## 2. 論理ビュー（モジュール構成）
```
src/
  data/
    questions.ts          # 質問データ(型付き配列・出典/信頼度/レベル) … M-Data-Questions
    questions.schema.ts    # 実行時バリデーション … FR-DATA-001
  domain/
    types.ts               # Question, Answer, ScoreResult, Session 等の型
    scoring.ts             # ヒューリスティック採点(純関数) … M-Score-Heuristic / FR-SCORE-001
    selector.ts            # 校・モード別の出題選択(純関数) … M-Data-Selector / FR-SEL/FR-DATA-002
    feedback.ts            # スコア→子供向け表現(花丸/ほめ言葉)変換(純関数) … FR-FB-001
  audio/
    types.ts               # TtsPort, RecorderPort, SttPort インターフェース
    webSpeechTts.ts        # SpeechSynthesis 実装 … FR-AUD-001
    mediaRecorder.ts       # MediaRecorder 実装 … FR-REC-001
    webSpeechStt.ts        # SpeechRecognition 実装(任意) … FR-STT-001
    mockAudio.ts           # テスト用モック(決定論)
    audioFactory.ts        # 環境判定で実装/フォールバック選択 … NFR-COMPAT-001
  state/
    settings.ts            # 設定(STT有効/速度/保存可否) localStorage … FR-SYS-002
    sessionStore.ts        # セッション結果(任意保存)
  ui/
    App.tsx, Home.tsx, SchoolSelect.tsx, ModeSelect.tsx,
    Quiz.tsx (出題), ChildFeedback.tsx, ParentGate.tsx,
    ParentReport.tsx, Settings.tsx, Disclaimer.tsx, MicButton.tsx, Character.tsx
  main.tsx, App.css
tests/ unit/ integration/ e2e/
```

## 3. プロセスビュー（出題1サイクルの流れ）
```
校選択(FR-SEL-001) → モード選択(FR-SEL-002)
 → selector.pickQuestions(school, mode) → 出題ループ:
     Quiz表示 → tts.speak(question.text) (FR-AUD-001)
     → 子供マイクタップ → recorder.start()/stop() (FR-REC-001)
     → (設定でSTT有効&同意&対応時) stt.recognize() (FR-STT-001) else 認識なし
     → scoring.score(question, {hasAudio, sttText, durationMs, silenceMs}) (FR-SCORE-001)
     → feedback.toChild(score) を ChildFeedback で表示 (FR-FB-001・点数非表示)
 → セッション終了 → 結果を sessionStore へ(任意)
 → 保護者: ParentGate(FR-GATE-001) → ParentReport(FR-RPT-001) + 採点補正(FR-SCORE-002)
```

## 4. データビュー（型・スキーマ）
```ts
type School = 'keio_yokohama' | 'keio_yochisha' | 'toin' | 'morimura' | 'common' | 'behavior';
type Mode = 'interview' | 'behavior';
type Level = 'easy' | 'mid' | 'hard';
type Reliability = 'A' | 'B' | 'C' | 'D';
type Category = 'self'|'family'|'kinder'|'social'|'thinking'|'habit'|'interest'|'future'|'event'|'artwork'|'behavior';

interface Question {
  id: string;                 // 例 "keio_yochisha-art-001"
  schools: School[];          // 適用校(複数可・commonは全校で利用)
  mode: Mode;
  category: Category;
  level: Level;
  text: string;               // ひらがな主体の質問文
  intent: string;             // 評価観点(保護者向け)
  keywords?: string[];        // 採点の想定キーワード(任意)
  minWords?: number;          // 望ましい最低語数(目安)
  followUps?: string[];       // 追問
  sampleGoodAnswer?: string;  // 良い回答例(保護者向け)
  source: string;             // 出典URL
  reliability: Reliability;   // A/B/C/D
  note?: string;              // 「慶応は面接なし・制作お尋ね」等の注記
}

interface AnswerSignals { hasAudio: boolean; sttText: string|null; durationMs: number; silenceMs: number; }
interface ScoreResult {
  raw: number;                // 0..100 内部値(子供に非表示)
  checks: { heard: boolean; answered: boolean; lengthOk: boolean; keywordHit: 'hit'|'miss'|'unknown'; };
  childFeedback: { stars: number; praise: string; encourage: boolean };
  parentOverride?: { raw?: number; memo?: string };
}
interface Session { id: string; school: School; mode: Mode; items: { q: Question; signals: AnswerSignals; score: ScoreResult }[]; total: number; }
```
**バリデーション(questions.schema.ts)**: 必須フィールド存在・enum一致・reliability∈{A,B,C,D}・source非空。不正はビルド/起動時に除外しログ。

### 採点アルゴリズム（scoring.score 純関数・教育的配慮内蔵）
```
base = 0
heard    = hasAudio || sttText!=null              // 聞こえた/話した形跡
answered = (sttText && sttText.trim().length>0) || (hasAudio && durationMs>=800)
lengthOk = answered && (sttText ? wordCount(sttText)>= (minWords??1) : durationMs>=1500)
keywordHit = keywords?
    (sttText ? (someKeyword in sttText ? 'hit':'miss') : 'unknown')   // STT無効時はunknown
    : 'unknown'
raw = (answered?40:0) + (lengthOk?25:0) + (keywordHit==='hit'?25: keywordHit==='unknown'?15:5)
    + (heard?10:0)   // 上限100
childFeedback.stars = raw>=80?3 : raw>=50?2 : raw>=1?1 : 0
childFeedback.praise = 肯定文(stars別)。encourage = raw<50（否定でなく励まし）
```
- 設計判断: STT無効/誤認識を前提に、**「答えた形跡」を最重視**しキーワードは加点要素に留める。低スコアでも子供には星1＋励まし（FR-FB-001）。最終判断は保護者補正（FR-SCORE-002）。

## 5. 物理ビュー（配置）
- 単一の静的バンドル（`vite build` → `dist/`）。サーバー不要。ローカル(`vite preview`)/任意の静的ホスティングで配信。
- 実行時通信: TTS/録音=ローカル。STT(同意時のみ)=ブラウザの音声認識サービスへ。それ以外の外部通信なし。

## 6. インターフェース設計（音声ポート）
```ts
interface TtsPort { speak(text:string, opts?:{rate?:number}):Promise<void>; supported():boolean; }
interface RecorderPort { start():Promise<void>; stop():Promise<Blob|null>; supported():boolean; }
interface SttPort { recognize(opts?:{lang?:string}):Promise<{text:string}|null>; supported():boolean; }
// audioFactory: supported()=falseなら mock/フォールバックを返す → アプリは常に動作(NFR-COMPAT/REL)
```

## 7. ADR（主要アーキ決定記録）
- **ADR-001**: STT既定オフ・record-only。理由=未就学児の声の外部送信回避(MDN[A])＋WER高(自動採点不適)。代替=常時STT→却下(プライバシー/精度)。
- **ADR-002**: 採点はヒューリスティック＋保護者補正。理由=5歳WER≈27%。代替=LLM意味採点→DEFER(キー不要方針)。
- **ADR-003**: React+Vite+TS。理由=子供向けUIの状態管理・型安全・静的出力・キー不要。代替=素のJS→却下(保守性)。
- **ADR-004**: 質問データは静的JSON(TS)。理由=SSOT・出典/信頼度の型付与・オフライン。代替=外部CMS→却下(依存/コスト)。
- **ADR-005**: 音声I/Oはポート＋ファクトリ。理由=テスト決定論化・将来Vosk差替(NFR-EXT)。

## 8. トレーサビリティ（モジュール↔要件↔テスト）
SRS §13 と一対一。各モジュール先頭コメントに対応FRを記す。CONSTRAINTS の不変条件（外部送信なし・保存なし・点数非表示）を実装で常時満たす。

## 9. セキュリティ設計
- 入力描画はReactの自動エスケープのみ（dangerouslySetInnerHTML不使用）。
- 外部送信箇所はSTT実装1ファイルに限定し、呼出は設定＋同意フラグのガード必須。
- localStorageは設定/スコア/メモのみ（音声・STT原文を書かない）。
