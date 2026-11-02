import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

test('failed image is retryable, cancelling a slow load cannot resurrect a card', async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    await page.route('**/dali-rainbow.webp', route => route.abort());
    await page.goto('http://127.0.0.1:4173/#desk', { waitUntil: 'domcontentloaded' });
    await page.locator('#eject-button').click();
    await page.waitForFunction(() => document.querySelector('.camera-desk').dataset.state === 'error');
    assert.match(await page.locator('#film-count').innerText(), /00\s*\/\s*14/);
    await page.unroute('**/dali-rainbow.webp');
    await page.route('**/dali-rainbow.webp', async route => { await new Promise(r => setTimeout(r, 900)); await route.continue().catch(() => {}); });
    await page.locator('#eject-button').click();
    await page.locator('#camera-clear').click();
    await page.waitForTimeout(1200);
    assert.equal(await page.locator('.instant-photo').count(), 0);
    assert.equal(await page.locator('.camera-desk').getAttribute('data-state'), 'idle');
    await page.locator('#eject-button').click();
    await page.waitForFunction(() => document.querySelector('.camera-desk').dataset.state === 'ready');
    assert.equal(await page.locator('.instant-photo').getAttribute('data-photo-id'), 'dali-rainbow');
    for (let i = 1; i < 14; i++) {
      await page.locator('#eject-button').click();
      await page.waitForFunction(() => document.querySelector('.camera-desk').dataset.state === 'ready');
    }
    assert.match(await page.locator('#film-count').innerText(), /14\s*\/\s*14/);
    assert.match(await page.locator('#eject-button').innerText(), /重新翻阅/);
    await page.locator('#eject-button').focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelector('.camera-desk').dataset.state === 'ready');
    assert.match(await page.locator('#film-count').innerText(), /01\s*\/\s*14/);
    await page.locator('.instant-photo').focus();
    await page.keyboard.press('Space');
    assert.equal(await page.locator('.instant-photo').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('.photo-front').getAttribute('aria-hidden'), 'true');
  } finally { await browser.close(); }
});

test('gallery filters and camera detail use independent photo lists', async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    await page.goto('http://127.0.0.1:4173/#gallery', { waitUntil: 'domcontentloaded' });
    await page.locator('[data-filter="dali"]').click();
    assert.equal(await page.locator('.gallery-photo').count(), 7);
    await page.locator('.gallery-photo').first().click();
    assert.match(await page.locator('#dialog-counter').innerText(), /1 \/ 7/);
    await page.keyboard.press('ArrowLeft');
    assert.match(await page.locator('#dialog-counter').innerText(), /7 \/ 7/);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.gallery-photo').first().evaluate(e => e === document.activeElement), true);
    await page.locator('[data-filter="puer"]').click();
    await page.locator('#eject-button').click();
    await page.waitForFunction(() => document.querySelector('.camera-desk').dataset.state === 'ready');
    await page.locator('#camera-inspect').click();
    assert.match(await page.locator('#dialog-counter').innerText(), /1 \/ 14/);
    assert.match(await page.locator('#dialog-content h3').innerText(), /彩虹/);
    const download = page.waitForEvent('download');
    await page.locator('.photo-download').click();
    assert.equal((await download).suggestedFilename(), 'dali-rainbow.png');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#camera-inspect').evaluate(e => e === document.activeElement), true);
  } finally { await browser.close(); }
});

test('a failed next shot preserves the previous photo and can retry the same frame', async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    await page.route('**/dali-cableway.webp', route => route.abort());
    await page.goto('http://127.0.0.1:4173/#desk', { waitUntil: 'domcontentloaded' });
    await page.locator('#camera-eject').click();
    await page.waitForFunction(() => document.querySelector('.camera-desk').dataset.state === 'ready');
    await page.locator('#eject-button').click();
    await page.waitForFunction(() => document.querySelector('.camera-desk').dataset.state === 'error');
    await page.locator('.instant-photo').click();
    assert.equal(await page.locator('.instant-photo').getAttribute('aria-pressed'), 'true');
    assert.match(await page.locator('#film-count').innerText(), /01\s*\/\s*14/);
    await page.unroute('**/dali-cableway.webp');
    await page.locator('#eject-button').click();
    await page.waitForFunction(() => document.querySelector('.camera-desk').dataset.state === 'ready');
    assert.equal(await page.locator('.instant-photo').getAttribute('data-photo-id'), 'dali-cableway');
    assert.match(await page.locator('#film-count').innerText(), /02\s*\/\s*14/);
  } finally { await browser.close(); }
});

test('camera ignores rapid repeat presses and clear cancels a pending exposure', async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    await page.goto('http://127.0.0.1:4173/#desk', { waitUntil: 'domcontentloaded' });
    await page.locator('#eject-button').click();
    assert.equal(await page.locator('#eject-button').getAttribute('aria-disabled'), 'true');
    await page.waitForFunction(() => document.querySelector('.camera-desk').dataset.state === 'ejecting');
    await page.locator('#camera-eject').dispatchEvent('click');
    await page.locator('#camera-clear').click();
    await page.waitForTimeout(1500);
    assert.equal(await page.locator('.instant-photo').count(), 0, 'cancelled exposure must not reappear');
    await page.locator('#eject-button').click();
    await page.waitForFunction(() => document.querySelector('.camera-desk').dataset.state === 'ready');
    assert.equal(await page.locator('.instant-photo img').count(), 1);
    assert.match(await page.locator('#film-count').innerText(), /01\s*\/\s*14/);
    await page.locator('.instant-photo').click();
    assert.equal(await page.locator('.instant-photo').getAttribute('aria-pressed'), 'true');
  } finally { await browser.close(); }
});
