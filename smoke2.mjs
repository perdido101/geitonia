import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
page.on('pageerror', e => errors.push('PAGEERR: '+e.message));
await page.goto('http://127.0.0.1:5178/', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await page.screenshot({ path: '/tmp/map.png' });
// Tap the Kafeneio node to walk + open panel
await page.getByText(/Καφενείο|Kafeneio/).first().click();
await page.waitForTimeout(1800);
await page.screenshot({ path: '/tmp/map_panel.png' });
const body = await page.locator('body').innerText();
console.log('panel has open-shift text:', /Άνοιγμα|Open the shift/.test(body));
console.log('errors:', errors.slice(0,8));
await browser.close();
