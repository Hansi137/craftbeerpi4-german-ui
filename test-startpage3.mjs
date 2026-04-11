import { chromium } from 'playwright';

const BASE = 'http://192.168.178.93:8000/cbpi_ui/static/index.html';
const WAIT = { waitUntil: 'load', timeout: 15000 };

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const jsErrors = [];
  page.on('pageerror', e => jsErrors.push(e.message));

  async function state(label) {
    await page.waitForTimeout(3000);
    const s = await page.evaluate(() => ({
      hash: window.location.hash,
      cockpit: !!document.getElementById('cbpi-cockpit'),
      switcher: !!document.getElementById('cbpi-dashboard-switcher'),
      title: (document.getElementById('cbpi-page-title') || {}).textContent || '(none)',
      reactContent: !!document.querySelector('.MuiContainer-root'),
    }));
    const ok = s.hash === '#/' ? 'OK' : 'WRONG HASH';
    console.log(`${label}: hash=${s.hash}(${ok}) cockpit=${s.cockpit} switcher=${s.switcher} title="${s.title}" react=${s.reactContent}`);
    return s;
  }

  async function killOnboarding() {
    await page.evaluate(() => { var o = document.getElementById('cbpi-onboarding'); if (o) o.remove(); });
  }

  // Test 1: Cockpit als Start (default)
  await page.goto(BASE, WAIT);
  await page.evaluate(() => localStorage.removeItem('cbpi_start_page'));
  await page.goto(BASE, WAIT);
  await state('T1 Cockpit-Start');

  // Test 2: Anlagenbild als Start
  await page.evaluate(() => localStorage.setItem('cbpi_start_page', 'dashboard'));
  await page.goto(BASE, WAIT);
  const s2 = await state('T2 Anlagenbild-Start');

  // Test 3: Button → Cockpit
  await killOnboarding();
  if (s2.switcher) {
    await page.click('#cbpi-switch-to-cockpit');
    await state('T3 Button→Cockpit');
  }

  // Test 4: Anlagenbild-Link im Cockpit
  await killOnboarding();
  const hasLink = await page.evaluate(() => !!document.querySelector('[data-switch-dashboard]'));
  if (hasLink) {
    await page.click('[data-switch-dashboard]');
    await state('T4 Link→Anlagenbild');
  }

  // Test 5: Sidebar → Cockpit
  await killOnboarding();
  await page.click('button[aria-label="open drawer"]');
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    var items = document.querySelectorAll('.MuiListItem-root');
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === 'cbpi-nav-cockpit') { items[i].click(); return; }
    }
  });
  await state('T5 Sidebar→Cockpit');

  // Test 6: Sidebar → Anlagenbild  
  await page.click('button[aria-label="open drawer"]');
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    var items = document.querySelectorAll('.MuiListItem-root');
    for (var i = 0; i < items.length; i++) {
      var t = (items[i].querySelector('.MuiListItemText-primary') || {}).textContent || '';
      if (t.trim() === 'Anlagenbild' || t.trim() === 'Dashboard') { items[i].click(); return; }
    }
  });
  await state('T6 Sidebar→Anlagenbild');

  // Test 7: Ctrl+F5 mit Anlagenbild-pref
  await page.evaluate(() => localStorage.setItem('cbpi_start_page', 'dashboard'));
  await page.reload({ waitUntil: 'load' });
  await state('T7 Ctrl+F5 Anlagenbild');

  // Test 8: Ctrl+F5 mit Cockpit-pref
  await page.evaluate(() => localStorage.setItem('cbpi_start_page', 'cockpit'));
  await page.reload({ waitUntil: 'load' });
  await state('T8 Ctrl+F5 Cockpit');

  if (jsErrors.length) {
    console.log('\nJS ERRORS:');
    jsErrors.forEach(e => console.log('  ' + e));
  } else {
    console.log('\nKeine JS-Fehler.');
  }

  await browser.close();
  console.log('Done.');
}

run().catch(e => { console.error(e); process.exit(1); });
