import { chromium } from 'playwright';

const BASE = 'http://192.168.178.93:8000/cbpi_ui/static/index.html#/recipes';
const WAIT = { waitUntil: 'load', timeout: 15000 };

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const jsErrors = [];
  page.on('pageerror', e => jsErrors.push(e.message));

  // Zur Rezeptseite navigieren
  console.log('=== Navigiere zu #/recipes ===');
  await page.goto(BASE, WAIT);
  await page.waitForTimeout(8000);

  const hash = await page.evaluate(() => window.location.hash);
  console.log('Hash:', hash);

  // Test 1: Rezept-ListItems finden
  console.log('\n=== TEST 1: MuiListItem-container Elemente ===');
  const listItems = await page.evaluate(() => {
    var items = document.querySelectorAll('li.MuiListItem-container');
    return Array.from(items).map(function(li) {
      var nameSpan = li.querySelector('.MuiListItemText-primary');
      var name = nameSpan ? nameSpan.textContent.trim() : '(kein Name)';
      var hasActions = !!li.querySelector('.recipe-row-actions');
      var actionBtns = li.querySelectorAll('.recipe-row-btn');
      return { name: name, hasActions: hasActions, btnCount: actionBtns.length };
    });
  });
  console.log(`  Gefundene ListItems: ${listItems.length}`);
  listItems.forEach(function(item, i) {
    console.log(`  ${i}: "${item.name}" actions=${item.hasActions} buttons=${item.btnCount}`);
  });

  // Test 2: HTML eines einzelnen Eintrags mit Buttons
  console.log('\n=== TEST 2: HTML mit Buttons ===');
  const rowHTML2 = await page.evaluate(() => {
    var li = document.querySelector('li.MuiListItem-container');
    if (!li) return 'Kein ListItem';
    return li.outerHTML.substring(0, 1500);
  });
  console.log(rowHTML);

  // 1) Prüfe ob refreshIngredientSummaries aufgerufen wird
  console.log('\n=== TEST 1: Rezept-Links auf der Seite ===');
  const linkInfo = await page.evaluate(() => {
    var links = document.querySelectorAll('a[href*="/recipe/"]');
    var results = [];
    links.forEach(function(link) {
      var text = (link.textContent || '').trim();
      var href = link.getAttribute('href');
      var parentTag = link.parentNode ? link.parentNode.tagName : 'none';
      var parentClass = link.parentNode ? link.parentNode.className : 'none';
      var gpTag = link.parentNode && link.parentNode.parentNode ? link.parentNode.parentNode.tagName : 'none';
      var gpClass = link.parentNode && link.parentNode.parentNode ? link.parentNode.parentNode.className : 'none';
      results.push({ text, href, parentTag, parentClass, gpTag, gpClass });
    });
    return { count: links.length, links: results };
  });
  console.log(`  Gefundene Links: ${linkInfo.count}`);
  linkInfo.links.forEach(function(l, i) {
    console.log(`  Link ${i}: "${l.text}" href=${l.href}`);
    console.log(`    Parent: <${l.parentTag}> class="${l.parentClass}"`);
    console.log(`    Grandparent: <${l.gpTag}> class="${l.gpClass}"`);
  });

  // 2) DOM-Struktur um die Rezept-Einträge herum
  console.log('\n=== TEST 2: DOM-Struktur der Rezeptliste ===');
  const domStructure = await page.evaluate(() => {
    var links = document.querySelectorAll('a[href*="/recipe/"]');
    if (links.length === 0) return 'Keine Rezept-Links gefunden!';
    
    // Vom ersten Link aufwärts navigieren
    var el = links[0];
    var path = [];
    var current = el;
    for (var i = 0; i < 10 && current; i++) {
      path.push({
        tag: current.tagName,
        id: current.id || '',
        className: (current.className || '').toString().substring(0, 120),
        childCount: current.children ? current.children.length : 0
      });
      current = current.parentNode;
    }
    return path;
  });
  console.log('  Pfad vom Link aufwärts:');
  if (Array.isArray(domStructure)) {
    domStructure.forEach(function(n, i) {
      console.log(`    ${'  '.repeat(i)}<${n.tag}> id="${n.id}" class="${n.className}" children=${n.childCount}`);
    });
  } else {
    console.log('  ' + domStructure);
  }

  // 3) Vollständiges HTML eines einzelnen Rezept-Eintrags
  console.log('\n=== TEST 3: HTML eines Rezept-Eintrags ===');
  const rowHTML = await page.evaluate(() => {
    var link = document.querySelector('a[href*="/recipe/"]');
    if (!link) return 'Kein Link gefunden';
    
    // Finde die Zeile (ein paar Ebenen nach oben)
    var row = link;
    for (var i = 0; i < 5; i++) {
      if (!row.parentNode) break;
      // Stoppe wenn wir auf ein Element treffen das mehrere Rezept-Links enthält
      var linksInParent = row.parentNode.querySelectorAll('a[href*="/recipe/"]');
      if (linksInParent.length > 1) break;
      row = row.parentNode;
    }
    return {
      tag: row.tagName,
      className: (row.className || '').toString(),
      outerHTML: row.outerHTML.substring(0, 2000)
    };
  });
  console.log(`  Row-Element: <${rowHTML.tag}> class="${rowHTML.className}"`);
  console.log(`  HTML:\n${rowHTML.outerHTML}`);

  // 4) Prüfe ob .recipe-row-actions bereits vorhanden sind
  console.log('\n=== TEST 4: Vorhandene recipe-row-actions ===');
  const actionsCount = await page.evaluate(() => {
    return document.querySelectorAll('.recipe-row-actions').length;
  });
  console.log(`  .recipe-row-actions Elemente: ${actionsCount}`);

  // 5) Prüfe ob refreshIngredientSummaries als Funktion existiert
  console.log('\n=== TEST 5: Funktion vorhanden? ===');
  const fnCheck = await page.evaluate(() => {
    return {
      refreshIngredientSummaries: typeof window.refreshIngredientSummaries,
      exportSingleRecipe: typeof window.exportSingleRecipe,
      buildIngredientEditor: typeof window.buildIngredientEditor,
      getIngredients: typeof window.getIngredients,
    };
  });
  console.log(`  refreshIngredientSummaries: ${fnCheck.refreshIngredientSummaries}`);
  console.log(`  exportSingleRecipe: ${fnCheck.exportSingleRecipe}`);
  console.log(`  buildIngredientEditor: ${fnCheck.buildIngredientEditor}`);
  console.log(`  getIngredients: ${fnCheck.getIngredients}`);

  // 6) Manuell refreshIngredientSummaries aufrufen und prüfen
  console.log('\n=== TEST 6: Manueller Aufruf ===');
  const manualResult = await page.evaluate(() => {
    try {
      if (typeof refreshIngredientSummaries === 'function') {
        refreshIngredientSummaries();
        var actions = document.querySelectorAll('.recipe-row-actions');
        return { success: true, actionsAfter: actions.length };
      }
      // Evtl. nicht global - im Scope suchen
      return { success: false, reason: 'Funktion nicht global verfügbar' };
    } catch(e) {
      return { success: false, reason: e.message };
    }
  });
  console.log(`  Ergebnis: ${JSON.stringify(manualResult)}`);

  // 7) Prüfe das "x" Löschen-Button Element
  console.log('\n=== TEST 7: Lösch-Buttons (x) ===');
  const deleteInfo = await page.evaluate(() => {
    var link = document.querySelector('a[href*="/recipe/"]');
    if (!link) return 'kein Link';
    // Gehe zur Zeile und suche nach dem x
    var row = link;
    for (var i = 0; i < 5; i++) {
      if (!row.parentNode) break;
      var linksInParent = row.parentNode.querySelectorAll('a[href*="/recipe/"]');
      if (linksInParent.length > 1) break;
      row = row.parentNode;
    }
    var btns = row.querySelectorAll('button');
    var spans = row.querySelectorAll('span');
    var xEls = [];
    row.querySelectorAll('*').forEach(function(el) {
      if ((el.textContent || '').trim() === 'x' || (el.textContent || '').trim() === '×') {
        xEls.push({ tag: el.tagName, class: el.className, text: el.textContent.trim() });
      }
    });
    return { buttons: btns.length, spans: spans.length, xElements: xEls };
  });
  console.log(`  ${JSON.stringify(deleteInfo)}`);

  // 8) JS-Fehler
  console.log('\n=== JS-FEHLER ===');
  if (jsErrors.length === 0) {
    console.log('  Keine JS-Fehler');
  } else {
    jsErrors.forEach(e => console.log(`  ERROR: ${e}`));
  }

  await browser.close();
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
