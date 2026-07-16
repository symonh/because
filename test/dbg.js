const puppeteer = require('puppeteer-core');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = ms => new Promise(r=>setTimeout(r,ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('http://127.0.0.1:8850/index.html', { waitUntil: 'networkidle0' });
  await p.click('#btnNew'); await p.waitForSelector('.node'); await p.evaluate(()=>window.ArgumentBase.cancelEdit());
  const rid = await p.$eval('.node', e => Number(e.getAttribute('data-id')));
  await p.evaluate(id => window.ArgumentBase.select(id), rid);
  await p.click('#btnReason'); await sleep(150); await p.evaluate(()=>window.ArgumentBase.cancelEdit());
  const reasonId = await p.evaluate(() => { const g = Object.values(window.ArgumentBase.doc.ideas['1'].ideas).find(x => x.attr && x.attr.group==='supporting'); return Object.values(g.ideas)[0].id; });
  await p.evaluate(id => window.ArgumentBase.select(id), reasonId);
  await p.click('#btnCo'); await sleep(150); await p.evaluate(()=>window.ArgumentBase.cancelEdit());
  const dump = await p.evaluate(() => {
    const nodesDom = Array.from(document.querySelectorAll('.node')).map(n => ({ id:n.getAttribute('data-id'), text:(n.querySelector('text')&&n.querySelector('text').textContent||'').slice(0,25) }));
    function tree(n, d){ const a=n.attr||{}; let s='  '.repeat(d)+`[${n.id}] grp=${a.group||'-'} "${(n.title||'').slice(0,22)}"\n`; for(const c of Object.values(n.ideas||{})) s+=tree(c,d+1); return s; }
    return { domCount: nodesDom.length, nodesDom, tree: tree(window.ArgumentBase.doc.ideas['1'],0) };
  });
  console.log('DOM node count:', dump.domCount);
  console.log('DOM nodes:', JSON.stringify(dump.nodesDom));
  console.log('DOC tree:\n' + dump.tree);
  await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
