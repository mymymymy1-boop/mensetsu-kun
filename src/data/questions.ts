// 質問データ（SSOT-D1） — FR-DATA-001 / 原典: research/question_bank.md
// 各質問に出典(source)・信頼度(reliability)を必須付与(C-INFO-001)。
// 慶応2校は面接なし=制作お尋ね中心(note明記, C-INFO-003)。
// 学校公式は逐語非公開のため多くがB(大手教室)/C(体験談)由来。

import type { Question } from '../domain/types';

const KEIO_OFFICIAL = 'https://www.yochisha.keio.ac.jp/admissions/qa/';
const TENJIN = 'https://www.tenjin.cc/education/pre/elementary-school-examination-interview/';
const SANTSUBOSHI = 'https://shogakko-juken.jp/shiritsu-mensetsu/';
const RIEIKAI_MORIMURA = 'https://www.rieikai.com/success_news/2584/';
const UKARUCO_TOIN = 'https://ukaruco.jp/syoujyu/touingakuen-mensetu-shitumon-naiyo/';
const UKARUCO_YOCHISHA = 'https://ukaruco.jp/syoujyu/keiogijukuyochisha-kaiga/';
const SHINGAKAI_YOKOHAMA = 'https://www.shingakai.co.jp/measures/kanagawa/keio-yokohama/';
const FUJI_MORIMURA = 'https://fujichild.jp/school_course/morimura/';
const KODOKANSATSU = 'https://www.tenjin.cc/education/pre/kodokansatsu/';

export const questions: Question[] = [
  // ── 慶応幼稚舎（制作お尋ね・面接なし） ──
  {
    id: 'keio_yochisha-art-001', schools: ['keio_yochisha'], mode: 'interview', category: 'artwork', level: 'easy',
    text: 'これは なにを かいたの？', intent: '自作の説明・表現力', keywords: [], minWords: 1,
    sampleGoodAnswer: 'これは ○○だよ。〜してるところ。', source: UKARUCO_YOCHISHA, reliability: 'B',
    note: '慶応幼稚舎は面接なし。絵画・制作中の「お尋ね」で問われる。',
  },
  {
    id: 'keio_yochisha-art-002', schools: ['keio_yochisha'], mode: 'interview', category: 'artwork', level: 'mid',
    text: 'どうして この いろを えらんだの？', intent: '理由づけ・こだわり', minWords: 2,
    source: UKARUCO_YOCHISHA, reliability: 'B', note: '制作中のお尋ね。',
  },
  {
    id: 'keio_yochisha-art-003', schools: ['keio_yochisha'], mode: 'interview', category: 'artwork', level: 'mid',
    text: 'この おはなしの すきな ところを おしえて。', intent: '物語理解・好みの説明', minWords: 2,
    source: KEIO_OFFICIAL, reliability: 'B', note: '制作テーマと一体の問い。',
  },

  // ── 慶応横浜初等部（制作の問いかけ・面接なし） ──
  {
    id: 'keio_yokohama-art-001', schools: ['keio_yokohama'], mode: 'interview', category: 'artwork', level: 'easy',
    text: 'なにを つくっているの？', intent: '説明力・意欲', minWords: 1,
    source: SHINGAKAI_YOKOHAMA, reliability: 'B', note: '横浜初等部は保護者面接なし。二次の制作中に問われる。',
  },
  {
    id: 'keio_yokohama-art-002', schools: ['keio_yokohama'], mode: 'interview', category: 'artwork', level: 'mid',
    text: 'どうして これを つくろうと おもったの？', intent: '動機・発想', minWords: 2,
    source: 'https://www.crownkids.jp/archives/clmn/keiougijyukuyokohama', reliability: 'B', note: '制作中のお尋ね。',
  },

  // ── 桐蔭学園小（親子面接＋個別口頭試問・とっさ判断） ──
  {
    id: 'toin-self-001', schools: ['toin'], mode: 'interview', category: 'self', level: 'easy',
    text: 'おなまえを おしえてください。', intent: '自己認識・発声', keywords: [], minWords: 1,
    source: 'https://ameblo.jp/pingpong-qta/entry-12678138495.html', reliability: 'C',
  },
  {
    id: 'toin-self-002', schools: ['toin'], mode: 'interview', category: 'self', level: 'mid',
    text: 'いま がんばっている ことは なんですか？', intent: '努力の言語化', minWords: 2,
    source: 'https://ameblo.jp/pingpong-qta/entry-12678138495.html', reliability: 'C',
  },
  {
    id: 'toin-think-001', schools: ['toin'], mode: 'interview', category: 'thinking', level: 'hard',
    text: '（くもの かたちを みて）これは なにに みえますか？', intent: '想像力・とっさの発想',
    source: UKARUCO_TOIN, reliability: 'B',
  },
  {
    id: 'toin-think-002', schools: ['toin'], mode: 'interview', category: 'thinking', level: 'hard',
    text: 'おともだちが コップの みずを こぼして こまっています。どんな こえを かけますか？',
    intent: '思いやり・とっさの対応', minWords: 3, keywords: ['だいじょうぶ', 'てつだう', 'いっしょ'],
    source: 'https://ameblo.jp/pingpong-qta/entry-12678138495.html', reliability: 'C',
  },

  // ── 森村学園初等部（グループ面接＋制作中の質問） ──
  {
    id: 'morimura-self-001', schools: ['morimura'], mode: 'interview', category: 'interest', level: 'easy',
    text: 'すきな あそびは なんですか？', intent: '興味', minWords: 1,
    source: FUJI_MORIMURA, reliability: 'B',
  },
  {
    id: 'morimura-habit-001', schools: ['morimura'], mode: 'interview', category: 'habit', level: 'easy',
    text: 'おてつだいは なにを しますか？', intent: '自立・生活', minWords: 1,
    source: FUJI_MORIMURA, reliability: 'B',
  },
  {
    id: 'morimura-art-001', schools: ['morimura'], mode: 'interview', category: 'artwork', level: 'mid',
    text: '（おべんとうの え）だれと どこで たべたいですか？', intent: '表現・想像', minWords: 2,
    source: RIEIKAI_MORIMURA, reliability: 'B', note: '個人制作中の質問(2026年度)。',
  },
  {
    id: 'morimura-art-002', schools: ['morimura'], mode: 'interview', category: 'artwork', level: 'mid',
    text: '（うみの え）うみに いったら なにを したいですか？', intent: '想像・経験', minWords: 2,
    source: RIEIKAI_MORIMURA, reliability: 'B', note: '個人制作中の質問(2026年度)。',
  },

  // ── 共通（全私立で頻出） ──
  {
    id: 'common-self-001', schools: ['common'], mode: 'interview', category: 'self', level: 'easy',
    text: 'おなまえを おしえてください。', intent: '自己認識・発声明瞭さ', minWords: 1,
    source: SANTSUBOSHI, reliability: 'B',
  },
  {
    id: 'common-self-002', schools: ['common'], mode: 'interview', category: 'self', level: 'easy',
    text: 'なんさいですか？', intent: '基本回答', keywords: ['さい', '６', '6'], minWords: 1,
    sampleGoodAnswer: '６さいです。', source: SANTSUBOSHI, reliability: 'B',
  },
  {
    id: 'common-kinder-001', schools: ['common'], mode: 'interview', category: 'kinder', level: 'easy',
    text: 'ようちえん（ほいくえん）の なまえを おしえてください。', intent: '記憶・園生活', minWords: 1,
    source: TENJIN, reliability: 'B',
  },
  {
    id: 'common-kinder-002', schools: ['common'], mode: 'interview', category: 'kinder', level: 'mid',
    text: 'ようちえんで たのしい ことは なんですか？', intent: '体験の言語化', minWords: 2,
    source: TENJIN, reliability: 'B',
  },
  {
    id: 'common-family-001', schools: ['common'], mode: 'interview', category: 'family', level: 'easy',
    text: 'おうちで どんな おてつだいを しますか？', intent: '自立・生活習慣', minWords: 1,
    source: 'https://www.tokyogakuen.co.jp/mensetsu/me05.html', reliability: 'B',
  },
  {
    id: 'common-family-002', schools: ['common'], mode: 'interview', category: 'family', level: 'mid',
    text: 'かぞくで たのしかった ことは なんですか？', intent: '情緒・エピソード力', minWords: 3,
    source: TENJIN, reliability: 'B',
  },
  {
    id: 'common-social-001', schools: ['common'], mode: 'interview', category: 'social', level: 'mid',
    text: 'おともだちが ないていたら どうしますか？', intent: '共感・思いやり', minWords: 2,
    keywords: ['だいじょうぶ', 'どうしたの', 'なぐさめ', 'せんせい'],
    source: SANTSUBOSHI, reliability: 'B',
  },
  {
    id: 'common-social-002', schools: ['common'], mode: 'interview', category: 'social', level: 'mid',
    text: 'おともだちと けんかを したら どうしますか？', intent: '問題解決・思いやり', minWords: 2,
    keywords: ['ごめんなさい', 'あやま', 'なかなおり', 'せんせい'],
    source: SANTSUBOSHI, reliability: 'B',
  },
  {
    id: 'common-think-001', schools: ['common'], mode: 'interview', category: 'thinking', level: 'hard',
    text: 'まいごに なったら どうしますか？', intent: '安全判断・対処', minWords: 2,
    keywords: ['せんせい', 'おみせ', 'ひと', 'まつ'],
    source: TENJIN, reliability: 'B',
  },
  {
    id: 'common-habit-001', schools: ['common'], mode: 'interview', category: 'habit', level: 'easy',
    text: 'けさは なにを たべましたか？', intent: '生活・具体的説明', minWords: 1,
    source: TENJIN, reliability: 'B',
  },
  {
    id: 'common-interest-001', schools: ['common'], mode: 'interview', category: 'interest', level: 'mid',
    text: 'すきな ほんは なんですか？ どんな おはなしですか？', intent: '読書習慣・表現', minWords: 2,
    source: SANTSUBOSHI, reliability: 'B',
  },
  {
    id: 'common-future-001', schools: ['common'], mode: 'interview', category: 'future', level: 'mid',
    text: 'おおきく なったら なにに なりたいですか？ どうして？', intent: '将来像・理由づけ', minWords: 2,
    source: SANTSUBOSHI, reliability: 'B',
  },

  // ── 行動観察 声かけ（信頼度C/D・観点が主) ──
  {
    id: 'behavior-play-001', schools: ['behavior'], mode: 'behavior', category: 'behavior', level: 'easy',
    text: 'いま なにを して あそんでいるの？', intent: '表現・コミュニケーション（協調性を観察）', minWords: 1,
    source: KODOKANSATSU, reliability: 'C', note: '声かけ逐語の出典は乏しい。観点(協調性)が主。',
  },
  {
    id: 'behavior-make-001', schools: ['behavior'], mode: 'behavior', category: 'behavior', level: 'easy',
    text: 'いま なにを つくっているの？', intent: '説明力・意欲', minWords: 1,
    source: KODOKANSATSU, reliability: 'C', note: '制作中の声かけ。',
  },
  {
    id: 'behavior-help-001', schools: ['behavior'], mode: 'behavior', category: 'behavior', level: 'mid',
    text: 'おともだちが こまっていたら どうする？', intent: '思いやり・援助', minWords: 2,
    keywords: ['てつだう', 'だいじょうぶ', 'いっしょ'],
    source: 'https://www.shingakai.co.jp/column/post/columnpost-1875/', reliability: 'B',
  },
  {
    id: 'behavior-rule-001', schools: ['behavior'], mode: 'behavior', category: 'behavior', level: 'mid',
    text: 'みんなで あそぶ ときの おやくそくは なにかな？', intent: 'ルール・マナー理解', minWords: 1,
    source: KODOKANSATSU, reliability: 'C',
  },
];
