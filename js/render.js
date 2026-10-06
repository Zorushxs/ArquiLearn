// Markdown → HTML: marked el converteix, highlight.js pinta el codi i DOMPurify en treu qualsevol cosa
// perillosa. Després es resolen les rutes relatives: les imatges es llegeixen de la llibreta (web o disc)
// i els enllaços a un altre .md obren aquella pàgina dins de l'app.
const Render = (() => {
  const markdown = new marked.Marked({ gfm: true });
  markdown.use({ renderer: { code } });

  // Bloc de codi: ```java → pintat i amb el nom del llenguatge a dalt.
  function code({ text, lang }) {
    const language = (lang || '').trim().split(/\s+/)[0].toLowerCase();
    const known = language && hljs.getLanguage(language);
    const body = known ? hljs.highlight(text, { language, ignoreIllegals: true }).value : U.esc(text);
    const caption = language ? `<figcaption>${U.esc(language)}</figcaption>` : '';
    return `<figure class="code">${caption}<pre><code class="hljs">${body}</code></pre></figure>\n`;
  }

  // marked codifica les rutes (un espai → %20); aquí es tornen al nom real del fitxer.
  function pathFrom(dir, url) {
    let clean = url.split('#')[0].split('?')[0];
    try { clean = decodeURIComponent(clean); } catch {}
    return Temari.resolve(dir, clean);
  }

  // Una imatge que no hi és es canvia per un avís amb la ruta que s'esperava.
  function missing(img, path) {
    const note = document.createElement('span');
    note.className = 'img-missing';
    note.textContent = `No es troba la imatge ${path}`;
    img.replaceWith(note);
  }

  async function fixImage(img, dir) {
    const src = img.getAttribute('src');
    if (!Temari.isRelative(src)) return;
    const path = pathFrom(dir, src);
    img.removeAttribute('src');
    img.loading = 'lazy';
    if (/\.svg$/i.test(path || '')) img.classList.add('svg'); // en tema fosc, els SVG porten fons clar
    try {
      img.onerror = () => missing(img, path); // a la web, si no hi és, ho diu en carregar-la
      img.src = await Carpeta.fileUrl(path);
    } catch {
      missing(img, path || src); // al disc, ja se sap en llegir-la
    }
  }

  async function fixLink(link, dir) {
    const href = link.getAttribute('href');
    if (!Temari.isRelative(href)) {
      if (/^https?:/i.test(href)) {
        link.target = '_blank';
        link.rel = 'noopener';
      }
      return;
    }
    const path = pathFrom(dir, href);
    if (!path) return;
    if (/\.md$/i.test(path)) link.href = '#/p/' + Temari.encodePath(path);
    else link.href = await Carpeta.fileUrl(path).catch(() => href);
  }

  // Pinta el markdown d'una pàgina dins d'el. Es prepara en un <template> (allà les imatges encara no es
  // descarreguen) i es posa a la pàgina al final. Si mentrestant s'ha tornat a cridar (l'editor ho fa
  // a cada tecla), el resultat vell es descarta.
  const latest = new WeakMap();
  async function into(el, text, pagePath) {
    const turn = (latest.get(el) || 0) + 1;
    latest.set(el, turn);
    const template = document.createElement('template');
    template.innerHTML = DOMPurify.sanitize(markdown.parse(text));
    const dir = Temari.dirname(pagePath);
    const content = template.content;
    await Promise.all([
      ...[...content.querySelectorAll('img[src]')].map(img => fixImage(img, dir)),
      ...[...content.querySelectorAll('a[href]')].map(link => fixLink(link, dir)),
    ]);
    if (latest.get(el) === turn) el.replaceChildren(content);
  }

  return { into };
})();
