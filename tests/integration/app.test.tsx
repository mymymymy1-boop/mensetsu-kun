import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { MockRecorder, MockStt, MockTts } from '../../src/audio/mockAudio';
import { containsNumber } from '../../src/domain/feedback';

function renderApp(opts?: { recorder?: MockRecorder; sttText?: string | null; sttSupported?: boolean }) {
  const tts = new MockTts();
  const recorder = opts?.recorder ?? new MockRecorder(2000, true);
  const stt = new MockStt(opts?.sttText ?? null, opts?.sttSupported ?? false);
  render(<App tts={tts} recorder={recorder} makeSttFor={() => stt} sttBrowserSupported={false} />);
  return { tts, recorder, stt };
}

async function answerOne(user: ReturnType<typeof userEvent.setup>) {
  const startBtn = await screen.findByLabelText('おはなしする');
  await user.click(startBtn);
  const stopBtn = await screen.findByLabelText('おはなしを とめる');
  await user.click(stopBtn);
  // フィードバック画面（つぎへ or おわり）が出るまで待つ
  await screen.findByRole('button', { name: /つぎへ|おわり/ });
}

describe('子供フロー (E2E-N1相当)', () => {
  beforeEach(() => localStorage.clear());

  it('ホーム→共通→面接→5問回答→セッション結果、数値は子供に出ない', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: /はじめる/ }));
    await user.click(await screen.findByLabelText('きょうつう（ぜんぶ）'));
    await user.click(await screen.findByRole('button', { name: /めんせつ/ }));

    // 5問ループ
    for (let i = 0; i < 5; i++) {
      expect(await screen.findByText(new RegExp(`${i + 1} / 5もん`))).toBeInTheDocument();
      await answerOne(user);
      const star = screen.getByLabelText(/ほし/);
      expect(star).toBeInTheDocument();
      const next = screen.getByRole('button', { name: /つぎへ|おわり/ });
      await user.click(next);
    }

    // セッション結果（子供向け）
    expect(await screen.findByText(/よく がんばったね/)).toBeInTheDocument();
  });

  it('子供向けフィードバックの文言に数字が含まれない (C-EDU-001)', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: /はじめる/ }));
    await user.click(await screen.findByLabelText('きょうつう（ぜんぶ）'));
    await user.click(await screen.findByRole('button', { name: /めんせつ/ }));
    await answerOne(user);
    const speech = screen.getByRole('status');
    expect(containsNumber(speech.textContent ?? '')).toBe(false);
  });
});

describe('モード可用性 (FR-SEL-002)', () => {
  beforeEach(() => localStorage.clear());
  it('慶応幼稚舎は行動観察モードが無効', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: /はじめる/ }));
    await user.click(await screen.findByLabelText('けいおう ようちしゃ'));
    const behaviorBtn = await screen.findByRole('button', { name: /こうどうかんさつ/ });
    expect(behaviorBtn).toBeDisabled();
  });
});

describe('保護者ゲート＋結果 (FR-GATE-001 / FR-RPT-001)', () => {
  beforeEach(() => localStorage.clear());

  it('セッション後、ゲートを解いて結果に出典・信頼度・補正欄が出る', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: /はじめる/ }));
    await user.click(await screen.findByLabelText('きょうつう（ぜんぶ）'));
    await user.click(await screen.findByRole('button', { name: /めんせつ/ }));
    // 1問だけ答えて、おわりではなく…5問必要。簡略のため5問回す
    for (let i = 0; i < 5; i++) {
      await answerOne(user);
      await user.click(screen.getByRole('button', { name: /つぎへ|おわり/ }));
    }
    await screen.findByText(/よく がんばったね/);

    // 保護者ゲート
    await user.click(screen.getByRole('button', { name: /おうちのかた/ }));
    const problem = await screen.findByText(/×/);
    const m = problem.textContent!.match(/(\d+)\s*×\s*(\d+)/)!;
    const answer = parseInt(m[1], 10) * parseInt(m[2], 10);
    await user.type(screen.getByLabelText('けいさんの こたえ'), String(answer));
    await user.click(screen.getByRole('button', { name: /すすむ/ }));

    // 結果画面
    expect(await screen.findByText(/保護者むけ けっか/)).toBeInTheDocument();
    expect(screen.getAllByText(/信頼度[ABCD]/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('出典').length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/補正スコア/).length).toBeGreaterThan(0);
  });

  it('ゲートの答えが違うと結果に入れない', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: /おうちのかた/ }));
    await user.type(screen.getByLabelText('けいさんの こたえ'), '1');
    await user.click(screen.getByRole('button', { name: /すすむ/ }));
    expect(screen.getByText(/こたえが ちがいます/)).toBeInTheDocument();
    expect(screen.queryByText(/保護者むけ けっか/)).not.toBeInTheDocument();
  });
});

describe('マイク不許可フォールバック (FR-REC-001例外)', () => {
  beforeEach(() => localStorage.clear());
  it('録音未対応でも出題と回答が継続する', async () => {
    const user = userEvent.setup();
    renderApp({ recorder: new MockRecorder(0, false) });
    await user.click(screen.getByRole('button', { name: /はじめる/ }));
    await user.click(await screen.findByLabelText('きょうつう（ぜんぶ）'));
    await user.click(await screen.findByRole('button', { name: /めんせつ/ }));
    // 録音未対応の案内
    expect(await screen.findByText(/マイクが つかえない/)).toBeInTheDocument();
    // それでも回答(タップ)で進める
    await answerOne(user);
    expect(screen.getByRole('button', { name: /つぎへ|おわり/ })).toBeInTheDocument();
  });
});
