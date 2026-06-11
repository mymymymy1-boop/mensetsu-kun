// 学校カード定義（SSOT） — SchoolSelect と 音声事前生成の双方が参照。
import type { School } from '../domain/types';

export interface SchoolCard {
  school: School;
  label: string;
  emoji: string;
  note: string;
}

export const SCHOOL_CARDS: SchoolCard[] = [
  { school: 'keio_yochisha', label: 'けいおう ようちしゃ', emoji: '🏫', note: '面接なし・制作お尋ね' },
  { school: 'keio_yokohama', label: 'けいおう よこはま しょとうぶ', emoji: '🏫', note: '面接なし・制作お尋ね' },
  { school: 'toin', label: 'とういん がくえん しょうがっこう', emoji: '🏫', note: '親子面接・口頭試問' },
  { school: 'morimura', label: 'もりむら がくえん しょとうぶ', emoji: '🏫', note: 'グループ面接・制作中の質問' },
  { school: 'common', label: 'きょうつう（ぜんぶ）', emoji: '⭐', note: '定番の質問' },
  { school: 'behavior', label: 'こうどうかんさつ（こえかけ）', emoji: '🤝', note: '声かけ・協調性' },
];
