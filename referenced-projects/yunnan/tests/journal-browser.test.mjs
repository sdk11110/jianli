import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

test('personal journal: city navigation, photo comparison, and closing stamp', async () => {
  const browser = await chromium.launch({ channel:'msedge', headless:true });
  try {
    const page = await browser.newPage({ reducedMotion:'reduce' });
    await page.goto('http://127.0.0.1:4173/', { waitUntil:'domcontentloaded' });
    assert.equal(await page.locator('#memory-range').count(), 1, 'the real/painted comparison must exist');
    await page.locator('[data-city-tab="puer"]').click();
    assert.equal(await page.locator('#city-title').innerText(), '普洱');
    assert.match(await page.locator('#city-photo').getAttribute('src'), /puer-cows/);
    await page.locator('#memory-range').focus();
    await page.keyboard.press('Home');
    assert.equal(await page.locator('#memory-range').inputValue(), '0');
    await page.keyboard.press('End');
    assert.equal(await page.locator('#memory-range').inputValue(), '100');
    await page.locator('[data-compare="puer-feast"]').click();
    await page.waitForFunction(()=>document.querySelector('#memory-board').dataset.photo==='puer-feast');
    assert.match(await page.locator('#memory-real').getAttribute('src'), /source\/puer-feast/);
    await page.locator('#stamp-letter').click();
    assert.equal(await page.locator('#letter-stamp').getAttribute('aria-hidden'), 'false');
    await page.locator('button[data-record="1"]').click();
    assert.equal(await page.locator('button[data-record="1"]').getAttribute('aria-pressed'), 'true');
    await page.locator('#record-remove').click();
    assert.equal(await page.locator('.mounted-record').isVisible(), false);
  } finally { await browser.close(); }
});
