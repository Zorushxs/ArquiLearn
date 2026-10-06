// Arrencada, rutes (#/...), lateral, tema i el botó de la carpeta.
// Cada pantalla és un objecte { nav, render(root, arg), leave() }: render la pinta dins de root, i leave
// (opcional) diu si es pot sortir (l'editor pregunta si hi ha canvis sense desar).
// Rutes: #/ (inici), #/p/<ruta.md> (pàgina), #/e/<ruta.md> (editar), #/nova[/<tema>] (pàgina nova).
const App = (() => {
  const { $, html, ICON } = U;
  const Inici = { nav: 'home', render: root => Pagina.render(root, Temari.HOME) };
  const ROUTES = { '': Inici, p: Pagina, e: Editor, nova: Nova };
  let current = null, lastHash = null, currentPath = Temari.HOME;

  // ---------- Rutes ----------
  function parse() {
    const [name, ...rest] = location.hash.replace(/^#\/?/, '').split('/');
    let arg = rest.join('/');
    try { arg = decodeURIComponent(arg); } catch {}
    return { name: ROUTES[name] ? name : '', arg };
  }

  function route() {
    // Si la pantalla no deixa sortir, es torna a posar l'adreça d'abans (replaceState no torna a cridar route).
    if (current && current.leave && lastHash !== null && location.hash !== lastHash && !current.leave()) {
      history.replaceState(history.state, '', lastHash);
      return;
    }
    const { name, arg } = parse();
    current = ROUTES[name];
    lastHash = location.hash;
    currentPath = name === 'p' || name === 'e' ? arg : name === '' ? Temari.HOME : '';
    document.body.dataset.screen = current.nav;
    document.title = 'ArquiLearn';
    const root = document.createElement('div');
    root.className = 'screen';
    $('#view').replaceChildren(root);
    renderSide();
    scrollTo(0, 0);
    current.render(root, current === Inici ? Temari.HOME : arg);
  }
  window.addEventListener('hashchange', route);
  window.addEventListener('beforeunload', event => {
    if (current && current.dirty && current.dirty()) event.preventDefault();
  });

  function renderSide() {
    Arbre.render($('#side'), currentPath);
  }

  // ---------- Tema ----------
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    Prefs.set('theme', theme);
  }
  if (!document.documentElement.dataset.theme) {
    setTheme(matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  $('#themeBtn').onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');

  // ---------- Carpeta ----------
  // A la capçalera: només lectura (web), la carpeta oberta, o el botó per tornar a donar permís.
  function renderMode() {
    const mode = Carpeta.mode;
    const el = $('#mode');
    if (mode === 'carpeta') {
      el.innerHTML = html`<span class="mode-text" title="Els canvis es desen a la carpeta del disc">
          ${ICON.folder}${Carpeta.name}</span>
        <button type="button" class="btn small" data-act="close">Tancar carpeta</button>`;
    } else if (mode === 'permis') {
      el.innerHTML = html`<button type="button" class="btn small primary" data-act="reconnect">
        Tornar a obrir «${Carpeta.name}»</button>`;
    } else if (Carpeta.canPick) {
      el.innerHTML = html`<span class="mode-text">Només lectura</span>
        <button type="button" class="btn small" data-act="pick" title="Obre la carpeta llibreta per editar">
          ${ICON.edit}Editar</button>`;
    } else {
      el.innerHTML = '';
    }
  }
  // Canvia la carpeta (obrir, tornar a donar permís o tancar) i ho torna a pintar tot.
  async function folder(action) {
    if (current && current.leave && !current.leave()) return;
    try {
      await action();
    } catch (e) {
      if (e.name !== 'AbortError') alert(`No s'ha pogut obrir la carpeta: ${e.message}`); // AbortError: has tancat el selector
    }
    renderMode();
    lastHash = null; // torna a pintar la pantalla encara que l'adreça sigui la mateixa
    route();
  }
  U.onActions($('#mode'), {
    pick: () => folder(Carpeta.pick),
    reconnect: () => folder(Carpeta.reconnect),
    close: () => folder(Carpeta.close),
  });

  // ---------- Arrencada ----------
  (async () => {
    try {
      await Carpeta.init();
    } catch (e) {
      console.error(e);
    }
    renderMode();
    route();
  })();

  return { renderSide };
})();
