// 音声ポート定義 — FR-AUD-001/FR-REC-001/FR-STT-001 / docs/SDD.md §6
// 実装は環境判定でfactoryが選ぶ。未対応はフォールバック(NFR-COMPAT-001)。

export interface TtsPort {
  speak(text: string, opts?: { rate?: number }): Promise<void>;
  cancel(): void;
  supported(): boolean;
}

export interface RecorderPort {
  start(): Promise<void>;
  /** 録音を停止しBlobを返す。失敗/未対応はnull。durationMsも返す。 */
  stop(): Promise<{ blob: Blob | null; durationMs: number }>;
  supported(): boolean;
}

export interface SttPort {
  /** 音声認識結果。未対応/エラー/未認識はnull。 */
  recognize(opts?: { lang?: string; timeoutMs?: number }): Promise<{ text: string } | null>;
  supported(): boolean;
}
