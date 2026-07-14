import { chromium } from 'playwright-core';
const exe = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
page.on('pageerror', e => errors.push('PAGEERR: '+e.message));
await page.goto('http://127.0.0.1:5177/', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
// Launcher: click the first shop "open" button
await page.getByText(/Άνοιξε|Open/).first().click();
await page.waitForTimeout(1500); // let some customers spawn
await page.screenshot({ path: '/tmp/shift.png' });
// Try tapping a station (briki) to cook
const stationBtns = await page.locator('button:has-text("Μπρίκι"), button:has-text("Briki")').count();
console.log('station tiles found:', stationBtns);
// Tap first station
await page.locator('div.grid button').first().click().catch(()=>{});
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/shift2.png' });
const bodyText = await page.locator('body').innerText();
console.log('has money/time hud:', /€/.test(bodyText));
console.log('errors:', errors.slice(0,10));
await browser.close();
