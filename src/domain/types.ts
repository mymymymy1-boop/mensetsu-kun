// ドメイン型定義 — SRS/SDD 正本。全FRが参照。
// 関連: docs/SDD.md §4, CONSTRAINTS.md

export type School =
  | 'keio_yokohama'
  | 'keio_yochisha'
  | 'toin'
  | 'morimura'
  | 'common'
  | 'behavior';

export type Mode = 'interview' | 'behavior';

export type Level = 'easy' | 'mid' | 'hard';

export type Reliability = 'A' | 'B' | 'C' | 'D';

export type Category =
  | 'self'
  | 'family'
  | 'kinder'
  | 'social'
  | 'thinking'
  | 'habit'
  | 'interest'
  | 'future'
  | 'event'
  | 'artwork'
  | 'behavior';

/** 1つの面接質問。出典(source)と信頼度(reliability)は必須(C-INFO-001)。 */
export interface Question {
  id: string;
  schools: School[];
  mode: Mode;
  category: Category;
  level: Level;
  /** ひらがな主体の質問文（子供向け） */
  text: string;
  /** 評価観点（保護者向け） */
  intent: string;
  /** 採点の想定キーワード（任意・加点要素） */
  keywords?: string[];
  /** 望ましい最低語数の目安（任意） */
  minWords?: number;
  /** 追問 */
  followUps?: string[];
  /** 良い回答例（保護者向け） */
  sampleGoodAnswer?: string;
  /** 出典URL（必須） */
  source: string;
  /** 信頼度（必須） */
  reliability: Reliability;
  /** 注記（例: 慶応は面接なし・制作お尋ね中心） */
  note?: string;
}

/** 回答から得られるシグナル（採点入力）。実マイクに依存せずテスト可能。 */
export interface AnswerSignals {
  hasAudio: boolean;
  sttText: string | null;
  durationMs: number;
  silenceMs: number;
}

export type KeywordHit = 'hit' | 'miss' | 'unknown';

export interface ScoreChecks {
  heard: boolean;
  answered: boolean;
  lengthOk: boolean;
  keywordHit: KeywordHit;
}

export interface ChildFeedback {
  /** 0..3 の星。子供には数値スコアを見せない(C-EDU-001)。 */
  stars: number;
  praise: string;
  /** 励まし表示が必要か（低スコアでも否定しない） */
  encourage: boolean;
}

export interface ParentOverride {
  raw?: number;
  memo?: string;
}

export interface ScoreResult {
  /** 0..100 内部値。子供には非表示。 */
  raw: number;
  checks: ScoreChecks;
  childFeedback: ChildFeedback;
  parentOverride?: ParentOverride;
}

export interface SessionItem {
  q: Question;
  signals: AnswerSignals;
  score: ScoreResult;
}

export interface Session {
  id: string;
  school: School;
  mode: Mode;
  items: SessionItem[];
  /** 0..100 のセッション平均（保護者向け） */
  total: number;
}

export type SttMode = 'record-only' | 'webspeech-stt';

export interface Settings {
  /** STTモード。既定は record-only（外部送信なし）。C-PRIV-001 */
  sttMode: SttMode;
  /** STT外部送信への保護者同意。webspeech-stt使用の必須条件。 */
  sttConsent: boolean;
  /** TTS読み上げ速度（既定0.9） */
  ttsRate: number;
  /** 結果の保存（既定off）。音声は保存しない(C-PRIV-002)。 */
  saveResults: boolean;
}
