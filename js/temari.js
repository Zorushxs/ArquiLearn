// Regles del temari, sense DOM: rutes dels fitxers, noms que es mostren, títols i l'arbre de temes.
// Una pàgina és un fitxer .md dins de llibreta/; cada carpeta és un tema (i pot tenir subtemes).
const Temari = (() => {
  const HOME = 'inici.md'; // la pàgina d'inici no surt a l'arbre

  // ---------- Rutes ----------
  const parts = path => path.split('/').filter(Boolean);
  const dirname = path => parts(path).slice(0, -1).join('/');
  const basename = path => parts(path).pop() || '';

  // Resol una ruta relativa (img/a.svg, ../altre.md) des de la carpeta d'una pàgina.
  // Torna null si surt fora de la llibreta.
  function resolve(fromDir, relative) {
    const out = parts(fromDir);
    for (const part of parts(relative)) {
      if (part === '.') continue;
      if (part === '..') {
        if (!out.length) return null;
        out.pop();
      } else {
        out.push(part);
      }
    }
    return out.join('/');
  }

  // Ruta relativa: res d'http:, mailto:, data:, #ancora ni /arrel.
  const isRelative = url => !!url && !/^([a-z][a-z0-9+.-]*:|#|\/)/i.test(url);

  // La part del hash: cada tros codificat, les barres es mantenen (#/p/Patrons/Strategy.md).
  const encodePath = path => parts(path).map(encodeURIComponent).join('/');

  // ---------- Noms ----------
  // «01 Patrons de disseny» → «Patrons de disseny». El número només serveix per ordenar.
  const displayName = name => name.replace(/\.md$/i, '').replace(/^\d+[\s._-]+/, '') || name;

  // Treu els caràcters que no poden anar en un nom de fitxer o que trenquen les URL.
  const cleanName = name => String(name).replace(/[\\/:*?"<>|#%]/g, '').replace(/\s+/g, ' ').trim().replace(/^\.+|\.+$/g, '');

  // «Patrons / Comportament» → «Patrons/Comportament» (cada tros net, sense buits).
  const cleanTopic = topic => String(topic).split('/').map(cleanName).filter(Boolean).join('/');

  const fileName = title => cleanName(title) + '.md';

  // El títol és el primer «# Títol» del text (sense *, _ ni `); si no n'hi ha, el nom del fitxer.
  function titleOf(markdown, path) {
    const match = String(markdown).match(/^#[ \t]+(.+?)[ \t#]*$/m);
    const title = match ? match[1].replace(/[*_`]/g, '').trim() : '';
    return title || displayName(basename(path));
  }

  // ---------- Arbre ----------
  const byName = (a, b) => a.name.localeCompare(b.name, 'ca', { numeric: true, sensitivity: 'base' });

  // De [{ path, title }] a { topics: [...], pages: [...] }, amb els temes i les pàgines ordenats pel nom
  // del fitxer o la carpeta (així «01 …» va abans que «02 …»). La pàgina d'inici no hi surt.
  function tree(pages) {
    const root = { name: '', path: '', topics: [], pages: [] };
    for (const page of pages) {
      if (page.path === HOME) continue;
      let node = root;
      for (const part of parts(dirname(page.path))) {
        let child = node.topics.find(topic => topic.name === part);
        if (!child) {
          child = { name: part, path: node.path ? node.path + '/' + part : part, topics: [], pages: [] };
          node.topics.push(child);
        }
        node = child;
      }
      node.pages.push({ ...page, name: basename(page.path) });
    }
    const sort = node => {
      node.topics.sort(byName).forEach(sort);
      node.pages.sort(byName);
    };
    sort(root);
    return root;
  }

  // Totes les carpetes de tema («Patrons», «Patrons/Comportament»), per triar-ne una en crear una pàgina.
  function topics(pages) {
    const all = new Set();
    for (const page of pages) {
      const dir = parts(dirname(page.path));
      dir.forEach((_, i) => all.add(dir.slice(0, i + 1).join('/')));
    }
    return [...all].sort((a, b) => a.localeCompare(b, 'ca', { numeric: true }));
  }

  // Els temes de la ruta d'una pàgina, per a les molles de pa: [{ name, path }].
  function crumbs(path) {
    const dir = parts(dirname(path));
    return dir.map((name, i) => ({ name: displayName(name), path: dir.slice(0, i + 1).join('/') }));
  }

  return {
    HOME, parts, dirname, basename, resolve, isRelative, encodePath,
    displayName, cleanName, cleanTopic, fileName, titleOf, tree, topics, crumbs,
  };
})();
