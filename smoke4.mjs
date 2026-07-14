import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', e => errors.push('PAGEERR: '+e.message));
page.on('console', m => { if (m.type()==='error') errors.push('CONSOLE: '+m.text()); });
await page.addInitScript(() => localStorage.clear());
await page.goto('http://127.0.0.1:5180/', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/title.png' });
console.log('title has Play:', /Παίξε|Play/.test(await page.locator('body').innerText()));
// Play (fresh)
await page.getByText(/^Παίξε$|^Play$/).first().click();
await page.waitForTimeout(500);
// walk to kafeneio
await page.getByText(/Καφενείο/).first().click();
await page.waitForTimeout(11000);
await page.getByText(/Άνοιγμα βάρδιας/).click();
await page.waitForTimeout(600);
// wait for a pappous to spawn and tap briki to cook
await page.waitForTimeout(4000);
await page.screenshot({ path: '/tmp/onboarding.png' });
const body = await page.locator('body').innerText();
console.log('onboarding tip present:', /μπρίκι|briki|Περίμενε|συλλογή/.test(body));
console.log('errors:', errors.slice(0,8));
await browser.close();
