import { chromium } from 'playwright';

const BASE = 'http://192.168.178.93:8000/cbpi_ui/static/index.html';
const WAIT = { waitUntil: 'load', timeout: 15000 };

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Alle console logs sammeln
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));

  console.log('\n=== TEST 1: Standard (cockpit als Startseite) ===');
  await page.goto(BASE, WAIT);
  await page.evaluate(() => localStorage.removeItem('cbpi_start_page'));
  await page.goto(BASE, WAIT);
  await page.waitForTimeout(2000);
  let url1 = page.url();
  let hash1 = await page.evaluate(() => window.location.hash);
  let cockpitMode1 = await page.evaluate(() => {
    // _cockpitMode ist in einer Closure, aber wir können den DOM prüfen
    return !!document.getElementById('cbpi-cockpit');
  });
  let title1 = await page.evaluate(() => {
    var t = document.getElementById('cbpi-page-title');
    return t ? t.textContent : '(kein Titel)';
  });
  console.log(`  URL: ${url1}`);
  console.log(`  Hash: ${hash1}`);
  console.log(`  Cockpit-DOM: ${cockpitMode1}`);
  console.log(`  Titel: ${title1}`);

  console.log('\n=== TEST 2: Anlagenbild als Startseite (fresh load) ===');
  await page.evaluate(() => localStorage.setItem('cbpi_start_page', 'dashboard'));
  await page.goto(BASE, WAIT);
  await page.waitForTimeout(2000);
  let url2 = page.url();
  let hash2 = await page.evaluate(() => window.location.hash);
  let cockpitMode2 = await page.evaluate(() => !!document.getElementById('cbpi-cockpit'));
  let switcherExists = await page.evaluate(() => !!document.getElementById('cbpi-dashboard-switcher'));
  let title2 = await page.evaluate(() => {
    var t = document.getElementById('cbpi-page-title');
    return t ? t.textContent : '(kein Titel)';
  });
  let bodyHTML2 = await page.evaluate(() => {
    var target = document.querySelector('main') || document.querySelector('.MuiContainer-root') || document.querySelector('[class*="Content"]');
    return target ? target.innerHTML.substring(0, 500) : '(kein Content-Container gefunden)';
  });
  console.log(`  URL: ${url2}`);
  console.log(`  Hash: ${hash2}`);
  console.log(`  Cockpit-DOM: ${cockpitMode2}`);
  console.log(`  Switcher-DOM: ${switcherExists}`);
  console.log(`  Titel: ${title2}`);
  console.log(`  Content (Auszug): ${bodyHTML2.substring(0, 200)}`);

  console.log('\n=== TEST 3: Ctrl+F5 Simulation (reload auf #/dashboard mit dashboard-pref) ===');
  // Simuliere: User ist schon auf #/dashboard, drückt Ctrl+F5
  await page.goto(BASE + '#/dashboard', WAIT);
  await page.waitForTimeout(2000);
  let url3 = page.url();
  let hash3 = await page.evaluate(() => window.location.hash);
  let cockpitMode3 = await page.evaluate(() => !!document.getElementById('cbpi-cockpit'));
  let switcherExists3 = await page.evaluate(() => !!document.getElementById('cbpi-dashboard-switcher'));
  let title3 = await page.evaluate(() => {
    var t = document.getElementById('cbpi-page-title');
    return t ? t.textContent : '(kein Titel)';
  });
  console.log(`  URL: ${url3}`);
  console.log(`  Hash: ${hash3}`);
  console.log(`  Cockpit-DOM: ${cockpitMode3}`);
  console.log(`  Switcher-DOM: ${switcherExists3}`);
  console.log(`  Titel: ${title3}`);

  console.log('\n=== TEST 4: Switch zum Cockpit via Button ===');
  if (switcherExists3) {
    // Onboarding-Overlay entfernen falls vorhanden
    await page.evaluate(() => {
      var ob = document.getElementById('cbpi-onboarding');
      if (ob) ob.remove();
    });
    await page.click('#cbpi-switch-to-cockpit');
    await page.waitForTimeout(2000);
    let url4 = page.url();
    let hash4 = await page.evaluate(() => window.location.hash);
    let cockpitMode4 = await page.evaluate(() => !!document.getElementById('cbpi-cockpit'));
    let title4 = await page.evaluate(() => {
      var t = document.getElementById('cbpi-page-title');
      return t ? t.textContent : '(kein Titel)';
    });
    console.log(`  URL: ${url4}`);
    console.log(`  Hash: ${hash4}`);
    console.log(`  Cockpit-DOM: ${cockpitMode4}`);
    console.log(`  Titel: ${title4}`);
  } else {
    console.log('  ÜBERSPRUNGEN - Kein Switcher-Button gefunden');
  }

  console.log('\n=== TEST 5: Switch zum Anlagenbild via Cockpit-Link ===');
  let dashLink = await page.evaluate(() => {
    var link = document.querySelector('[data-switch-dashboard]');
    return link ? link.textContent : null;
  });
  if (dashLink) {
    await page.click('[data-switch-dashboard]');
    await page.waitForTimeout(2000);
    let url5 = page.url();
    let hash5 = await page.evaluate(() => window.location.hash);
    let cockpitMode5 = await page.evaluate(() => !!document.getElementById('cbpi-cockpit'));
    let switcherExists5 = await page.evaluate(() => !!document.getElementById('cbpi-dashboard-switcher'));
    let title5 = await page.evaluate(() => {
      var t = document.getElementById('cbpi-page-title');
      return t ? t.textContent : '(kein Titel)';
    });
    console.log(`  URL: ${url5}`);
    console.log(`  Hash: ${hash5}`);
    console.log(`  Cockpit-DOM: ${cockpitMode5}`);
    console.log(`  Switcher: ${switcherExists5}`);
    console.log(`  Titel: ${title5}`);
  } else {
    console.log('  ÜBERSPRUNGEN - Kein Anlagenbild-Link im Cockpit gefunden');
  }

  console.log('\n=== Console-Logs ===');
  logs.forEach(l => console.log('  ' + l));

  await browser.close();
  console.log('\nDone.');
}

run().catch(e => { console.error(e); process.exit(1); });
