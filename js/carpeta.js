// Capa de dades: d'on surten les pàgines i on es desen. Les pantalles només fan servir aquest objecte,
// i no saben si les dades venen de la web o del disc. Modes:
// - 'web': llegeix llibreta/ del mateix lloc web (GitHub Pages o un servidor local). Només lectura.
// - 'carpeta': la carpeta llibreta/ del disc, amb File System Access (Chrome i Edge d'escriptori). Llegeix i desa.
// - 'permis': hi ha una carpeta recordada, però el navegador torna a demanar permís. Mentrestant, llegeix la web.
// A la carpeta hi ha index.json amb la llista de pàgines ({ path, title }), perquè una web estàtica no pot
// llistar carpetes. Es torna a escriure cada vegada que canvia alguna pàgina.
const Carpeta = (() => {
  const BASE = 'llibreta/';
  const INDEX = 'index.json';
  const canPick = 'showDirectoryPicker' in window;
  const MIME = { svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
    webp: 'image/webp', pdf: 'application/pdf' };
  let dir = null, mode = 'web', pages = [];
  const urls = new Map(); // ruta → { url, modified }: els arxius del disc es mostren amb una URL blob:

  // ---------- IndexedDB: hi guardem la carpeta triada (no es pot desar a localStorage) ----------
  const db = () => new Promise((ok, ko) => {
    const request = indexedDB.open('arquilearn', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('kv');
    request.onsuccess = () => ok(request.result);
    request.onerror = () => ko(request.error);
  });
  async function kvGet(key) {
    try {
      const d = await db();
      return await new Promise(ok => {
        const q = d.transaction('kv').objectStore('kv').get(key);
        q.onsuccess = () => ok(q.result);
        q.onerror = () => ok(null);
      });
    } catch {
      return null;
    }
  }
  async function kvSet(key, value) {
    try {
      const d = await db();
      await new Promise(ok => {
        const tx = d.transaction('kv', 'readwrite');
        tx.objectStore('kv').put(value, key);
        tx.oncomplete = ok;
        tx.onerror = ok;
      });
    } catch {}
  }

  // ---------- Web ----------
  const webUrl = path => BASE + Temari.encodePath(path);
  async function webText(path) {
    const response = await fetch(webUrl(path), { cache: 'no-cache' });
    if (!response.ok) throw new Error(`No s'ha trobat ${path} (${response.status})`);
    return response.text();
  }
  async function webList() {
    try {
      const data = JSON.parse(await webText(INDEX));
      return Array.isArray(data.pages) ? data.pages : [];
    } catch (e) {
      console.warn('No es pot llegir llibreta/index.json:', e.message);
      return [];
    }
  }

  // ---------- Disc ----------
  async function dirOf(path, create) {
    let handle = dir;
    for (const part of Temari.parts(Temari.dirname(path))) handle = await handle.getDirectoryHandle(part, { create });
    return handle;
  }
  async function fileHandle(path, create = false) {
    const parent = await dirOf(path, create);
    return parent.getFileHandle(Temari.basename(path), { create });
  }
  const diskFile = async path => (await fileHandle(path)).getFile();
  async function diskWrite(path, content) {
    const writable = await (await fileHandle(path, true)).createWritable();
    await writable.write(content);
    await writable.close();
  }
  // Tots els .md de la carpeta i les subcarpetes (sense les que comencen per punt).
  async function walk(handle, prefix, out) {
    for await (const entry of handle.values()) {
      if (entry.name.startsWith('.')) continue;
      const path = prefix + entry.name;
      if (entry.kind === 'directory') await walk(entry, path + '/', out);
      else if (/\.md$/i.test(entry.name)) out.push(path);
    }
    return out;
  }
  async function diskList() {
    const paths = (await walk(dir, '', [])).sort();
    return Promise.all(paths.map(async path => ({ path, title: Temari.titleOf(await (await diskFile(path)).text(), path) })));
  }
  // Torna a escriure index.json, però només si ha canviat (així git no hi veu canvis de més).
  async function syncIndex() {
    const json = JSON.stringify({ version: 1, pages }, null, 2) + '\n';
    let old = '';
    try { old = await (await diskFile(INDEX)).text(); } catch {}
    if (old !== json) await diskWrite(INDEX, json);
  }
  function forgetUrls() {
    urls.forEach(entry => URL.revokeObjectURL(entry.url));
    urls.clear();
  }

  // ---------- Mode ----------
  // Torna a llegir la llista de pàgines. Si la carpeta ja no hi és, l'oblida i passa a la web.
  async function refresh() {
    if (mode !== 'carpeta') {
      pages = await webList();
      return;
    }
    try {
      pages = await diskList();
      await syncIndex();
    } catch (e) {
      if (e.name !== 'NotFoundError') throw e;
      await close();
    }
  }
  async function init() {
    const saved = canPick ? await kvGet('dir') : null;
    if (saved) {
      dir = saved;
      mode = await saved.queryPermission({ mode: 'readwrite' }) === 'granted' ? 'carpeta' : 'permis';
    }
    await refresh();
  }
  // Tria la carpeta. Si tries l'arrel del repo, entra sola a llibreta/.
  async function pick() {
    let handle = await showDirectoryPicker({ id: 'arquilearn', mode: 'readwrite' });
    try { handle = await handle.getDirectoryHandle('llibreta'); } catch {}
    dir = handle;
    mode = 'carpeta';
    forgetUrls();
    await kvSet('dir', handle);
    await refresh();
  }
  async function reconnect() {
    if (await dir.requestPermission({ mode: 'readwrite' }) !== 'granted') return;
    mode = 'carpeta';
    await refresh();
  }
  async function close() {
    dir = null;
    mode = 'web';
    forgetUrls();
    await kvSet('dir', null);
    await refresh();
  }

  // ---------- Llegir i desar ----------
  async function read(path) {
    if (mode === 'carpeta') return (await diskFile(path)).text();
    return webText(path);
  }
  async function exists(path) {
    if (mode !== 'carpeta') return pages.some(page => page.path === path);
    try {
      await fileHandle(path);
      return true;
    } catch {
      return false;
    }
  }
  function mustWrite() {
    if (mode !== 'carpeta') throw new Error('Per desar, obre la carpeta llibreta.');
  }
  // Desa una pàgina (.md) i actualitza la llista i l'index.json.
  async function write(path, text) {
    mustWrite();
    await diskWrite(path, text);
    await refresh();
  }
  // Desa un arxiu que no és una pàgina (una imatge).
  async function writeFile(path, blob) {
    mustWrite();
    await diskWrite(path, blob);
  }
  async function remove(path) {
    mustWrite();
    const parent = await dirOf(path, false);
    await parent.removeEntry(Temari.basename(path));
    await refresh();
  }
  // URL per mostrar un arxiu de la llibreta (una imatge). Del disc, es torna a llegir si ha canviat
  // (per exemple, si has tornat a exportar un dibuix d'Excalidraw amb el mateix nom).
  async function fileUrl(path) {
    if (mode !== 'carpeta') return webUrl(path);
    const file = await diskFile(path);
    const cached = urls.get(path);
    if (cached && cached.modified === file.lastModified) return cached.url;
    if (cached) URL.revokeObjectURL(cached.url);
    const type = MIME[path.split('.').pop().toLowerCase()] || file.type;
    const url = URL.createObjectURL(new Blob([file], { type }));
    urls.set(path, { url, modified: file.lastModified });
    return url;
  }

  return {
    init, pick, reconnect, close, refresh,
    read, exists, write, writeFile, remove, fileUrl, canPick,
    get mode() { return mode; },
    get canWrite() { return mode === 'carpeta'; },
    get name() { return dir && dir.name; },
    get pages() { return pages; },
  };
})();
