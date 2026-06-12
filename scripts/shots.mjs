// 現状UIのスクリーンショット取得（UI/UX改善の根拠用・一時スクリプト）
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = 'screenshots';
mkdirSync(OUT, { recursive: true });
const URL = process.env.URL ?? 'http://localhost:4173';

const browser = await chromium.launch({
  args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required'],
});
const ctx = await browser.newContext({ permissions: ['microphone'], viewport: { width: 430, height: 850 } });
const page = await ctx.newPage();
const shot = async (name) => { await page.screenshot({ path: `${OUT}/${name}.png` }); console.log(`shot: ${name}`); };

await page.goto(URL);
await page.waitForTimeout(400);
await shot('01-home');

await page.getByRole('button', { name: /はじめる/ }).click();
await page.waitForTimeout(300);
await shot('02-school');

await page.getByRole('button', { name: 'とういん がくえん しょうがっこう' }).click();
await page.waitForTimeout(300);
await shot('03-mode');

await page.getByRole('button', { name: /めんせつ/ }).click();
await page.waitForTimeout(500);
await shot('04-quiz');

await page.getByLabel('おはなしする').click({ force: true });
await page.waitForTimeout(900);
await page.getByLabel('おはなしを とめる').click({ force: true });
await page.waitForTimeout(500);
await shot('05-feedback');

// 残りを答えてセッション結果へ
for (let i = 0; i < 5; i++) {
  const next = page.getByRole('button', { name: /つぎへ|おわり/ });
  if (await next.count()) await next.click();
  await page.waitForTimeout(300);
  const start = page.getByLabel('おはなしする');
  if (await start.count()) {
    await start.click({ force: true });
    await page.waitForTimeout(900);
    await page.getByLabel('おはなしを とめる').click({ force: true });
    await page.waitForTimeout(400);
  }
  if (await page.getByText(/よく がんばったね/).count()) break;
}
await page.waitForTimeout(300);
await shot('06-childResult');

// 保護者ゲート→結果
await page.getByRole('button', { name: /おうちのかた/ }).click();
await page.waitForTimeout(300);
const problem = await page.getByText(/×/).textContent();
const m = problem.match(/(\d+)\s*×\s*(\d+)/);
await page.getByLabel('けいさんの こたえ').fill(String(parseInt(m[1]) * parseInt(m[2])));
await page.getByRole('button', { name: /すすむ/ }).click();
await page.waitForTimeout(400);
await shot('07-parentReport');

await page.getByRole('button', { name: /せってい/ }).click();
await page.waitForTimeout(300);
await shot('08-settings');

await browser.close();
console.log('done');
