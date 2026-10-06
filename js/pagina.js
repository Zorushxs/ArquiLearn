// Pantalla d'una pàgina: molles de pa (temes), botó d'editar i el contingut pintat.
// La pantalla d'inici és aquesta mateixa amb inici.md.
const Pagina = (() => {
  const { html, ICON } = U;

  function crumbs(path) {
    if (path === Temari.HOME) return '';
    return html`<nav class="crumbs" aria-label="Temes">
      <a href="#/">Inici</a>${Temari.crumbs(path).map(topic => html`<span>›</span><span>${topic.name}</span>`)}
    </nav>`;
  }

  // Si no hi ha inici.md, una benvinguda curta.
  const WELCOME = html`<h1>ArquiLearn</h1>
    <p>La llibreta encara és buida. Obre la carpeta <code>llibreta</code> per començar a escriure-hi.</p>`;

  async function render(root, path) {
    const edit = Carpeta.canWrite
      ? html`<a class="btn" href="#/e/${U.raw(Temari.encodePath(path))}">${ICON.edit}Editar</a>`
      : '';
    root.innerHTML = html`<div class="page-head">${crumbs(path)}${edit}</div><article class="doc"></article>`;
    const article = root.querySelector('.doc');
    let text;
    try {
      text = await Carpeta.read(path);
    } catch {
      if (path === Temari.HOME) article.innerHTML = WELCOME;
      else article.innerHTML = html`<h1>No s'ha trobat la pàgina</h1><p class="hint">${path}</p>`;
      return;
    }
    document.title = (path === Temari.HOME ? '' : Temari.titleOf(text, path) + ' · ') + 'ArquiLearn';
    await Render.into(article, text, path);
  }

  return { nav: 'page', render };
})();
