// El lateral: capçalera (Temari, mode i +), cercador i l'arbre del temari. Dos modes:
// - 'open' (per defecte): tots els temes oberts, sense desplegables. La pàgina oberta porta una ratlla de color.
// - 'accordion': cada tema principal és un desplegable amb el nombre de pàgines; només s'obre el de la
//   pàgina on ets (o tots els que tenen resultats, si cerques). Els subtemes són etiquetes petites.
// El lateral es crea un cop (render). En canviar de pàgina (show) només es mou la marca de la pàgina oberta,
// perquè no parpellegi ni perdi l'scroll, la cerca o els temes oberts. L'arbre es torna a pintar quan canvia
// la llista de pàgines, el mode o la cerca.
const Arbre = (() => {
  const { $, html, ICON } = U;
  const MODES = [
    { id: 'open', title: 'Tot obert', icon: ICON.list },
    { id: 'accordion', title: 'Acordió: només el tema on ets', icon: ICON.fold },
  ];
  const state = { query: '', current: '', root: null, pages: null };
  const mode = () => (Prefs.get('sideMode') === 'accordion' ? 'accordion' : 'open');

  // ---------- Peces ----------
  function pageLink(page) {
    const on = page.path === state.current;
    return html`<li><a class="tree-page${on ? ' on' : ''}" href="#/p/${U.raw(Temari.encodePath(page.path))}"
      ${on ? U.raw('aria-current="page"') : ''}>${page.title}</a></li>`;
  }
  const pageList = pages => pages.map(pageLink);

  // Mode obert: el nom del tema i, a sota, les seves pàgines i subtemes, tot obert.
  function openTopic(topic) {
    return html`<li class="tree-topic">
      <div class="tree-name">${Temari.displayName(topic.name)}</div>
      <ul class="tree">${pageList(topic.pages)}${topic.topics.map(openTopic)}</ul>
    </li>`;
  }

  // Mode acordió: dins d'un tema obert, els subtemes són etiquetes amb les seves pàgines a sota.
  function foldContent(topic) {
    return html`${pageList(topic.pages)}${topic.topics.map(sub => html`<li class="tree-topic">
      <div class="tree-name tree-label">${Temari.displayName(sub.name)}</div>
      <ul class="tree">${foldContent(sub)}</ul>
    </li>`)}`;
  }
  function foldTopic(topic) {
    const open = !!state.query || Temari.inside(topic, state.current);
    return html`<li class="tree-topic"><details class="tree-fold"${open ? U.raw(' open') : ''}>
      <summary><span class="tree-chev" aria-hidden="true">›</span><span class="tree-name">${Temari.displayName(topic.name)}</span>
        <span class="tree-count">${Temari.count(topic)}</span></summary>
      <ul class="tree">${foldContent(topic)}</ul>
    </details></li>`;
  }

  function treeHtml() {
    const tree = Temari.tree(Temari.filter(Carpeta.pages, state.query));
    const empty = !tree.pages.length && !tree.topics.length;
    if (empty && state.query) return html`<p class="hint">Cap pàgina conté «${state.query}».</p>`;
    if (empty) return html`<p class="hint">Encara no hi ha cap pàgina.</p>`;
    const topic = mode() === 'accordion' ? foldTopic : openTopic;
    return html`<ul class="tree tree-${mode()}">${pageList(tree.pages)}${tree.topics.map(topic)}</ul>`;
  }

  function renderTree() {
    state.pages = Carpeta.pages;
    $('.side-tree', state.root).innerHTML = treeHtml();
  }

  // Canvi de pàgina: encén la nova i, en mode acordió, obre el seu tema (els que havies obert es queden oberts).
  function show(current) {
    state.current = current;
    if (!state.root) return;
    if (state.pages !== Carpeta.pages) {
      renderTree(); // pàgines noves, esborrades o amb un altre títol
      return;
    }
    const href = '#/p/' + Temari.encodePath(current);
    state.root.querySelectorAll('.tree-home, .tree-page').forEach(link => {
      const on = current === Temari.HOME ? link.classList.contains('tree-home') : link.getAttribute('href') === href;
      link.classList.toggle('on', on);
      if (on && link.classList.contains('tree-page')) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
      if (on) {
        const fold = link.closest('.tree-fold');
        if (fold) fold.open = true;
      }
    });
  }

  // ---------- Lateral sencer ----------
  function render(root) {
    state.root = root;
    const current = state.current;
    const add = Carpeta.canWrite
      ? html`<a class="side-add" href="#/nova" title="Pàgina nova" aria-label="Pàgina nova">${ICON.plus}</a>`
      : '';
    root.innerHTML = html`
      <div class="side-head">
        <span class="side-title">Temari</span>
        <div class="side-modes" role="group" aria-label="Com es veu el temari">
          ${MODES.map(m => html`<button type="button" data-act="mode" data-mode="${m.id}" title="${m.title}"
            aria-label="${m.title}" aria-pressed="${mode() === m.id}">${m.icon}</button>`)}
        </div>
        ${add}
      </div>
      <input type="search" class="side-search" id="sideSearch" placeholder="Cerca una pàgina…" aria-label="Cerca una pàgina"
        value="${state.query}" autocomplete="off">
      <a class="tree-home${current === Temari.HOME ? ' on' : ''}" href="#/">Inici</a>
      <div class="side-tree"></div>`;
    renderTree();
    const search = $('.side-search', root);
    search.oninput = () => {
      state.query = search.value.trim();
      renderTree();
    };
    search.onkeydown = event => {
      if (event.key !== 'Escape') return;
      search.value = '';
      search.oninput();
    };
  }

  // Els clics del lateral (el lateral no es torna a crear, només se'n canvia el contingut).
  U.onActions($('#side'), {
    mode(el) {
      Prefs.set('sideMode', el.dataset.mode);
      state.root.querySelectorAll('[data-act="mode"]').forEach(b => b.setAttribute('aria-pressed', b === el));
      renderTree();
    },
  });

  return { render, show };
})();
