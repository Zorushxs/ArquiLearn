// Torna a fer llibreta/index.json (la llista de pàgines que llegeix la web). L'app ja el fa sola quan
// desa; això és per quan edites els .md fora de l'app (per exemple, amb VS Code).
// Com s'executa: node tools/index.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const BOOK = path.join(ROOT, 'llibreta');

// Les mateixes regles que l'app (js/temari.js).
const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', 'temari.js'), 'utf8') + '\n;globalThis.Temari = Temari;', ctx);
const { Temari } = ctx;

function walk(dir, prefix, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const rel = prefix + entry.name;
    if (entry.isDirectory()) walk(path.join(dir, entry.name), rel + '/', out);
    else if (/\.md$/i.test(entry.name)) out.push(rel);
  }
  return out;
}

const pages = walk(BOOK, '', []).sort().map(rel => ({
  path: rel,
  title: Temari.titleOf(fs.readFileSync(path.join(BOOK, rel), 'utf8'), rel),
}));
fs.writeFileSync(path.join(BOOK, 'index.json'), JSON.stringify({ version: 1, pages }, null, 2) + '\n');
console.log(`llibreta/index.json: ${pages.length} pàgines.`);
