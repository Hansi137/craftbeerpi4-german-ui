import { chromium } from 'playwright';

const BASE = 'http://192.168.178.93:8000/cbpi_ui/static/index.html';
const WAIT = { waitUntil: 'load', timeout: 15000 };

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', e => errors.push('PAGE ERROR: ' + e.message));

  // Hilfsfunktion: DOM-Stand prüfen
  async function checkState(label) {
    await page.waitForTimeout(3000);
    const state = await page.evaluate(() => {
      return {
        url: window.location.href,
        hash: window.location.hash,
        cockpitDOM: !!document.getElementById('cbpi-cockpit'),
        switcherDOM: !!document.getElementById('cbpi-dashboard-switcher'),
        title: (document.getElementById('cbpi-page-title') || {}).textContent || '(kein Titel)',
        pref: localStorage.getItem('cbpi_start_page') || '(nicht gesetzt)',
        onboarding: !!document.getElementById('cbpi-onboarding'),
        // Prüfe ob Original-Dashboard-Content sichtbar oder versteckt ist
        hiddenChildren: (() => {
          var t = document.querySelector('.MuiContainer-root');
          if (!t) return 'kein Container';
          var hidden = 0, visible = 0;
          for (var i = 0; i < t.children.length; i++) {
            if (t.children[i].style.display === 'none') hidden++;
            else visible++;
          }
          return 'visible=' + visible + ' hidden=' + hidden;
        })()
      };
    });
    console.log(`\n=== ${label} ===`);
    console.log(`  Hash: ${state.hash}`);
    console.log(`  Pref: ${state.pref}`);
    console.log(`  Cockpit: ${state.cockpitDOM} | Switcher: ${state.switcherDOM}`);
    console.log(`  Titel: ${state.title}`);
    console.log(`  Children: ${state.hiddenChildren}`);
    console.log(`  Onboarding: ${state.onboarding}`);
    return state;
  }

  // Onboarding entfernen
  async function killOnboarding() {
    await page.evaluate(() => {
      var ob = document.getElementById('cbpi-onboarding');
      if (ob) ob.remove();
    });
  }

  // ============================================================
  // SZENARIO A: User hat Anlagenbild als Startseite, drückt Ctrl+F5
  // ============================================================
  console.log('\n========= SZENARIO A: Anlagenbild-Startseite + Ctrl+F5 =========');
  
  await page.goto(BASE, WAIT);
  await page.evaluate(() => localStorage.setItem('cbpi_start_page', 'dashboard'));
  
  // Simulate Ctrl+F5 (full reload)
  await page.goto(BASE, WAIT);
  await checkState('A1: Fresh Load mit dashboard-pref');

  // Nochmal Ctrl+F5 (auf #/dashboard)
  await page.reload({ waitUntil: 'load' });
  await checkState('A2: Reload auf #/dashboard');

  // ============================================================
  // SZENARIO B: Klick auf "Zum Brau-Cockpit wechseln"
  // ============================================================
  console.log('\n========= SZENARIO B: Button-Klick =========');
  
  await killOnboarding();
  
  let hasSwitcher = await page.evaluate(() => !!document.getElementById('cbpi-switch-to-cockpit'));
  if (hasSwitcher) {
    // Hash-Änderungen loggen
    await page.evaluate(() => {
      window._hashLog = [];
      window.addEventListener('hashchange', function() {
        window._hashLog.push(window.location.hash);
      });
    });

    await page.click('#cbpi-switch-to-cockpit');
    await checkState('B1: Nach Klick auf "Zum Brau-Cockpit"');
    
    let hashLog = await page.evaluate(() => window._hashLog);
    console.log('  Hash-Änderungen:', JSON.stringify(hashLog));
  } else {
    console.log('  KEIN SWITCHER GEFUNDEN - überspringen');
  }

  // ============================================================
  // SZENARIO C: Von Cockpit zu Anlagenbild via Sidebar-Link
  // ============================================================
  console.log('\n========= SZENARIO C: Sidebar "Anlagenbild" =========');
  
  // Sidebar öffnen
  await page.click('button[aria-label="open drawer"], .MuiIconButton-root');
  await page.waitForTimeout(500);
  
  // Finde den "Anlagenbild" Link in der Sidebar
  let sidebarLinks = await page.evaluate(() => {
    var items = document.querySelectorAll('.MuiListItem-root, [role="button"]');
    var links = [];
    items.forEach(function(item) {
      var text = item.textContent.trim();
      if (text.indexOf('Anlagenbild') !== -1 || text.indexOf('Dashboard') !== -1) {
        links.push({ text: text.substring(0, 50), tag: item.tagName, id: item.id });
      }
    });
    return links;
  });
  console.log('  Gefundene Sidebar-Links:', JSON.stringify(sidebarLinks));

  // Klick auf Anlagenbild in der Sidebar
  let clicked = await page.evaluate(() => {
    var items = document.querySelectorAll('.MuiListItem-root, [role="button"]');
    for (var i = 0; i < items.length; i++) {
      var t = (items[i].querySelector('.MuiListItemText-primary') || {}).textContent || '';
      if (t.trim() === 'Anlagenbild' || t.trim() === 'Dashboard') {
        items[i].click();
        return t.trim();
      }
    }
    return null;
  });
  console.log('  Geklickt auf:', clicked);
  await checkState('C1: Nach Sidebar "Anlagenbild" Klick');

  // ============================================================
  // SZENARIO D: Startseite cockpit, fresh load
  // ============================================================
  console.log('\n========= SZENARIO D: Cockpit als Startseite =========');
  await page.evaluate(() => localStorage.setItem('cbpi_start_page', 'cockpit'));
  await page.goto(BASE, WAIT);
  await checkState('D1: Fresh Load mit cockpit-pref');

  // ============================================================
  // SZENARIO E: Direct URL #/ (leere URL)
  // ============================================================
  console.log('\n========= SZENARIO E: Direct #/ =========');
  await page.goto(BASE + '#/', WAIT);
  await checkState('E1: Navigiert zu #/');

  // ============================================================
  console.log('\n=== JS-Fehler ===');
  errors.forEach(e => console.log('  ' + e));

  await browser.close();
  console.log('\nDone.');
}

run().catch(e => { console.error(e); process.exit(1); });
