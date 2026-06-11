// セッション結果の保存（任意） — FR-SYS-002 / C-PRIV-002
// 保存対象はスコア・観点・保護者メモのみ。音声Blob・STT原文は絶対に保存しない。
import type { Session } from '../domain/types';

const KEY = 'mensetsu.sessions.v1';

/** 保存用に音声等を含まない形へ整形（型上もSessionに音声は無いが、明示的に最小化）。 */
interface StoredItem {
  qId: string;
  raw: number;
  parentRaw?: number;
  memo?: string;
  reliability: string;
  source: string;
}
interface StoredSession {
  id: string;
  school: string;
  mode: string;
  total: number;
  items: StoredItem[];
  savedAt: number;
}

function toStored(s: Session, now: number): StoredSession {
  return {
    id: s.id,
    school: s.school,
    mode: s.mode,
    total: s.total,
    savedAt: now,
    items: s.items.map((it) => ({
      qId: it.q.id,
      raw: it.score.raw,
      parentRaw: it.score.parentOverride?.raw,
      memo: it.score.parentOverride?.memo,
      reliability: it.q.reliability,
      source: it.q.source,
    })),
  };
}

export function saveSession(s: Session, enabled: boolean, now: number): void {
  if (!enabled) return; // 既定off(FR-SYS-002)
  try {
    if (typeof localStorage === 'undefined') return;
    const prev = loadSessions();
    const next = [toStored(s, now), ...prev].slice(0, 50);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return;
  }
}

export function loadSessions(): StoredSession[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredSession[]) : [];
  } catch {
    return [];
  }
}

export function clearSessions(): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(KEY);
  } catch {
    return;
  }
}
