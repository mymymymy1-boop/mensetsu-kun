import { expect, test } from '@playwright/test';

// 実ブラウザ(Chromium・fake media)で実音声アダプタ(MediaRecorder/SpeechSynthesis)を通す。
// STTは既定record-onlyのため外部送信は発生しない。

test('E2E-N1: ホーム→共通→面接→1セッション完走（子供フロー）', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'メンセツくん' })).toBeVisible();

  await page.getByRole('button', { name: /はじめる/ }).click();
  await page.getByRole('button', { name: 'きょうつう（ぜんぶ）' }).click();
  await page.getByRole('button', { name: /めんせつ/ }).click();

  // 出題画面
  await expect(page.getByText(/1 \/ 5もん/)).toBeVisible();

  for (let i = 0; i < 5; i++) {
    await expect(page.getByText(new RegExp(`${i + 1} / 5もん`))).toBeVisible();
    // 録音開始（待機中マイクは誘導アニメのため force）
    await page.getByLabel('おはなしする').click({ force: true });
    // 800ms以上話したことにする
    await page.waitForTimeout(1000);
    // 録音中ボタンは脈打つアニメーションのため force クリック
    await page.getByLabel('おはなしを とめる').click({ force: true });
    // フィードバック（星＋つぎへ/おわり）
    await expect(page.getByLabel(/ほし/)).toBeVisible();
    await page.getByRole('button', { name: /つぎへ|おわり/ }).click();
  }

  await expect(page.getByText(/よく がんばったね/)).toBeVisible();
});

test('E2E-N2: 慶応幼稚舎は制作お尋ね中心＋行動観察モード無効', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /はじめる/ }).click();
  await page.getByRole('button', { name: 'けいおう ようちしゃ' }).click();
  await expect(page.getByText(/この学校は面接がなく/)).toBeVisible();
  await expect(page.getByRole('button', { name: /こうどうかんさつ/ })).toBeDisabled();
});

test('E2E-N3: 保護者ゲート→計算正解→結果（セッションなしは空表示）', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /おうちのかた/ }).click();
  const problem = await page.getByText(/×/).textContent();
  const m = problem!.match(/(\d+)\s*×\s*(\d+)/)!;
  const answer = parseInt(m[1], 10) * parseInt(m[2], 10);
  await page.getByLabel('けいさんの こたえ').fill(String(answer));
  await page.getByRole('button', { name: /すすむ/ }).click();
  await expect(page.getByText(/まだ れんしゅうが ありません/)).toBeVisible();
});

test('E2E-disclaimer: 最新確認の注意が表示される (FR-SYS-001)', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/最新は各校公式の募集要項でご確認ください/)).toBeVisible();
});
