import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', e => errors.push('PAGEERR: '+e.message));
await page.goto('http://127.0.0.1:5179/', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.getByText(/Καφενείο/).first().click();
await page.waitForTimeout(11000); // let the avatar walk all the way there
const body = await page.locator('body').innerText();
console.log('shop panel opened:', /Άνοιγμα βάρδιας/.test(body));
await page.screenshot({ path: '/tmp/map_arrived.png' });
// Now open the shift from the panel
if (/Άνοιγμα βάρδιας/.test(body)) {
  await page.getByText(/Άνοιγμα βάρδιας/).click();
  await page.waitForTimeout(800);
  const inShift = await page.locator('body').innerText();
  console.log('entered shift:', /ΤΕΛΕΥΤΑΙΕΣ|€0.00/.test(inShift) || /Μπρίκι/.test(inShift));
  await page.screenshot({ path: '/tmp/entered_shift.png' });
}
console.log('errors:', errors.slice(0,8));
await browser.close();
