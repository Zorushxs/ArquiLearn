// Proves de lògica pura (temari i botons de format), sense navegador. Com s'executa: node tests/logic.test.js
const vm = require('vm'), fs = require('fs'), path = require('path');
const APP = path.join(__dirname, '..', 'js') + '/';
const ctx = {};
vm.createContext(ctx);
const src = ['temari', 'format'].map(f => fs.readFileSync(APP + f + '.js', 'utf8')).join('\n;\n')
  + '\n;globalThis.__ = { Temari, Format };';
vm.runInContext(src, ctx);
const { Temari, Format } = ctx.__;
let fails = 0;
const ok = (c, msg) => { if (!c) { fails++; console.log('FAIL', msg); } else console.log('ok  ', msg); };
const eq = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg} → ${JSON.stringify(a)}`);

// ---------- Rutes ----------
eq(Temari.resolve('Patrons', 'img/a.svg'), 'Patrons/img/a.svg', 'imatge relativa a la carpeta de la pàgina');
eq(Temari.resolve('Patrons/Comportament', '../Strategy.md'), 'Patrons/Strategy.md', '.. puja una carpeta');
eq(Temari.resolve('', './inici.md'), 'inici.md', '. no canvia res');
eq(Temari.resolve('Patrons', '../../fora.md'), null, 'sortir de la llibreta → null');
ok(Temari.isRelative('img/a.png') && Temari.isRelative('../a.md'), 'rutes relatives');
ok(!Temari.isRelative('https://x.com') && !Temari.isRelative('#ancora') && !Temari.isRelative('/a')
  && !Temari.isRelative('data:image/png;base64,') && !Temari.isRelative(''), 'absolutes, àncores i buides no');
eq(Temari.encodePath('00 Llibreta/Format i codi.md'), '00%20Llibreta/Format%20i%20codi.md', 'hash: cada tros codificat');
eq(Temari.encodePath('Patrons/C#?.md'), 'Patrons/C%23%3F.md', 'hash: # i ? codificats');

// ---------- Noms i títols ----------
eq(Temari.displayName('01 Introducció'), 'Introducció', 'el número d\'ordre no es veu');
eq(Temari.displayName('02-Patrons.md'), 'Patrons', 'número amb guió i .md');
eq(Temari.displayName('2026'), '2026', 'un número sol es queda');
eq(Temari.cleanName('  Què és: un <patró>?  '), 'Què és un patró', 'nom de fitxer net');
eq(Temari.cleanTopic(' Patrons / / Comportament* '), 'Patrons/Comportament', 'tema amb subtema');
eq(Temari.fileName('Strategy'), 'Strategy.md', 'nom de fitxer d\'una pàgina');
eq(Temari.titleOf('Text\n\n# El *patró* `Strategy` #\n\n# Segon', 'a/b.md'), 'El patró Strategy', 'títol: primer #');
eq(Temari.titleOf('## Només secció', 'Patrons/01 Strategy.md'), 'Strategy', 'sense # → nom del fitxer');
eq(Temari.titleOf('#sense espai', 'x.md'), 'x', '#text no és un títol');

// ---------- Arbre ----------
const pages = [
  { path: 'inici.md', title: 'Inici' },
  { path: 'Patrons/Strategy.md', title: 'Strategy' },
  { path: '10 Arquitectura/Hexagonal.md', title: 'Hexagonal' },
  { path: 'Patrons/Comportament/Observer.md', title: 'Observer' },
  { path: 'Patrons/Builder.md', title: 'Builder' },
  { path: '2 Principis/SOLID.md', title: 'SOLID' },
  { path: 'Solta.md', title: 'Solta' },
];
const tree = Temari.tree(pages);
eq(tree.pages.map(p => p.path), ['Solta.md'], 'inici.md no surt a l\'arbre');
eq(tree.topics.map(t => t.name), ['2 Principis', '10 Arquitectura', 'Patrons'], 'temes per ordre numèric');
const patrons = tree.topics[2];
eq(patrons.pages.map(p => p.title), ['Builder', 'Strategy'], 'pàgines ordenades');
eq(patrons.topics.map(t => t.path), ['Patrons/Comportament'], 'subtema amb la ruta sencera');
eq(Temari.topics(pages), ['2 Principis', '10 Arquitectura', 'Patrons', 'Patrons/Comportament'], 'llista de temes');
eq(Temari.crumbs('Patrons/Comportament/Observer.md'), [
  { name: 'Patrons', path: 'Patrons' }, { name: 'Comportament', path: 'Patrons/Comportament' }], 'molles de pa');

// ---------- Format ----------
// Aplica un canvi i torna el text, amb [ ] on queda la selecció.
function applied(text, start, end, fn, ...args) {
  const r = fn(text, start, end, ...args);
  const out = text.slice(0, r.from) + r.insert + text.slice(r.to);
  return out.slice(0, r.selStart) + '[' + out.slice(r.selStart, r.selEnd) + ']' + out.slice(r.selEnd);
}
eq(applied('hola món', 5, 8, Format.wrap, '**', 'negreta'), 'hola **[món]**', 'negreta amb selecció');
eq(applied('hola ', 5, 5, Format.wrap, '*', 'cursiva'), 'hola *[cursiva]*', 'cursiva sense selecció');
eq(applied('a\nb\nc', 2, 5, Format.prefixLines, '- '), 'a\n[- b\n- c]', 'llista a les línies seleccionades');
eq(applied('a\n- b\n- c', 3, 9, Format.prefixLines, '- '), 'a\n[b\nc]', 'si ja hi és, el treu');
eq(applied('títol', 2, 2, Format.prefixLines, '## '), '[## títol]', 'títol a la línia del cursor');
eq(applied('abc\n', 0, 4, Format.prefixLines, '> '), '[> abc]\n', 'selecció que acaba en salt de línia');
eq(applied('text', 4, 4, Format.codeBlock), 'text\n```java\n[codi]\n```', 'bloc de codi en línia pròpia');
eq(applied('x = 1', 0, 5, Format.codeBlock, 'python'), '```python\n[x = 1]\n```', 'bloc de codi amb la selecció');
eq(applied('mira aquí', 5, 9, Format.link), 'mira [aquí]([url])', 'enllaç: url seleccionada');
eq(applied('a\nb', 1, 1, Format.image, 'dibuix', 'img/dibuix.svg'), 'a\n![dibuix](img/dibuix.svg)[]\nb', 'imatge en línia pròpia');
eq(applied('', 0, 0, Format.table), '| [Columna] | Columna |\n| --- | --- |\n| text | text |', 'taula');
eq(applied('ab', 1, 1, Format.indent), 'a    []b', 'tabulador → 4 espais');

console.log(fails ? `\n${fails} FALLADES` : '\nTOT OK');
process.exit(fails ? 1 : 0);
