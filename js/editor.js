// Pantalla per editar una pàgina: barra de format, el text a l'esquerra i la vista prèvia a la dreta
// (al mòbil, una o l'altra). Desa amb el botó o Ctrl+S, i avisa si surts amb canvis sense desar.
// Les imatges (botó, enganxar o arrossegar) es desen a la carpeta img/ del tema.
const Editor = (() => {
  const { $, html, ICON } = U;
  // Estat de la pàgina que s'edita: ruta, text desat i elements.
  const state = { path: '', saved: '', text: null, preview: null, timer: null };

  // ---------- Barra de format ----------
  const TOOLS = [
    { act: 'bold', label: 'B', title: 'Negreta', run: (t, s, e) => Format.wrap(t, s, e, '**', 'negreta') },
    { act: 'italic', label: 'I', title: 'Cursiva', run: (t, s, e) => Format.wrap(t, s, e, '*', 'cursiva') },
    { act: 'h2', label: 'H2', title: 'Títol de secció', run: (t, s, e) => Format.prefixLines(t, s, e, '## ') },
    { act: 'h3', label: 'H3', title: 'Subtítol', run: (t, s, e) => Format.prefixLines(t, s, e, '### ') },
    { act: 'list', label: ICON.list, title: 'Llista', run: (t, s, e) => Format.prefixLines(t, s, e, '- ') },
    { act: 'quote', label: ICON.quote, title: 'Cita o nota', run: (t, s, e) => Format.prefixLines(t, s, e, '> ') },
    { act: 'code', label: '`c`', title: 'Codi dins del text', run: (t, s, e) => Format.wrap(t, s, e, '`', 'codi') },
    { act: 'block', label: '{ }', title: 'Bloc de codi', run: (t, s, e) => Format.codeBlock(t, s, e) },
    { act: 'link', label: ICON.link, title: 'Enllaç', run: (t, s, e) => Format.link(t, s, e) },
    { act: 'table', label: ICON.table, title: 'Taula', run: (t, s, e) => Format.table(t, s, e) },
  ];

  // Aplica un canvi de Format. Amb execCommand, Ctrl+Z el desfà; si el navegador no el té, setRangeText.
  function apply(result) {
    const area = state.text;
    area.focus();
    area.setSelectionRange(result.from, result.to);
    if (!document.execCommand('insertText', false, result.insert)) {
      area.setRangeText(result.insert, result.from, result.to, 'end');
      changed();
    }
    area.setSelectionRange(result.selStart, result.selEnd);
  }
  const run = tool => apply(tool.run(state.text.value, state.text.selectionStart, state.text.selectionEnd));

  // ---------- Vista prèvia i canvis ----------
  const dirty = () => !!state.text && state.text.value !== state.saved;
  function renderDirty() {
    const button = $('.ed-save');
    if (button) button.disabled = !dirty();
  }
  function changed() {
    renderDirty();
    clearTimeout(state.timer);
    state.timer = setTimeout(() => Render.into(state.preview, state.text.value, state.path), 150);
  }

  // ---------- Desar i esborrar ----------
  async function save() {
    if (!dirty()) return;
    const text = state.text.value;
    try {
      await Carpeta.write(state.path, text);
      state.saved = text;
      renderDirty();
      App.renderSide();
      U.toast('Desat');
    } catch (e) {
      alert(`No s'ha pogut desar: ${e.message}`);
    }
  }
  async function remove() {
    if (!confirm(`Vols esborrar la pàgina ${state.path}? No es pot desfer (si no és a git).`)) return;
    try {
      await Carpeta.remove(state.path);
      state.saved = state.text.value; // perquè no demani confirmació en sortir
      location.hash = '#/';
    } catch (e) {
      alert(`No s'ha pogut esborrar: ${e.message}`);
    }
  }

  // ---------- Imatges ----------
  // Nom de fitxer sense espais ni caràcters estranys. Les captures enganxades es diuen captura-<data>.png.
  function imageName(file) {
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const base = file.name.replace(/\.[^.]+$/, '');
    if (!base || base === 'image') {
      const now = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
      return `captura-${now}.${ext}`;
    }
    return Temari.cleanName(base).replace(/\s+/g, '-') + '.' + ext;
  }
  // Si ja n'hi ha una amb el mateix nom, n'hi afegeix un número (foto-2.png).
  async function freePath(dir, name) {
    const [base, ext] = [name.replace(/\.[^.]+$/, ''), name.split('.').pop()];
    let candidate = name;
    for (let n = 2; await Carpeta.exists(Temari.resolve(dir, 'img/' + candidate)); n++) candidate = `${base}-${n}.${ext}`;
    return candidate;
  }
  async function addImages(files) {
    const images = [...files].filter(file => file.type.startsWith('image/'));
    for (const file of images) {
      try {
        const dir = Temari.dirname(state.path);
        const name = await freePath(dir, imageName(file));
        await Carpeta.writeFile(Temari.resolve(dir, 'img/' + name), file);
        const area = state.text;
        apply(Format.image(area.value, area.selectionStart, area.selectionEnd, name.replace(/\.[^.]+$/, ''), 'img/' + name));
      } catch (e) {
        alert(`No s'ha pogut desar la imatge: ${e.message}`);
      }
    }
  }

  // ---------- Pantalla ----------
  function setTab(root, tab) {
    $('.ed-split', root).dataset.tab = tab;
    root.querySelectorAll('[data-tab-btn]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tabBtn === tab));
    Prefs.set('editorTab', tab);
  }

  function view(path) {
    const tab = Prefs.get('editorTab') === 'preview' ? 'preview' : 'write';
    return html`<div class="ed-head">
        <p class="ed-path">${path}</p>
        <div class="seg ed-tabs" role="group" aria-label="Què es veu">
          <button type="button" data-act="tab" data-tab-btn="write" aria-pressed="${tab === 'write'}">Escriure</button>
          <button type="button" data-act="tab" data-tab-btn="preview" aria-pressed="${tab === 'preview'}">Vista prèvia</button>
        </div>
        <div class="ed-actions">
          <button type="button" class="btn primary ed-save" data-act="save" title="Ctrl+S" disabled>Desar</button>
          <a class="btn" href="#/p/${U.raw(Temari.encodePath(path))}">Tancar</a>
          <button type="button" class="icon-btn danger" data-act="remove" title="Esborrar la pàgina"
            aria-label="Esborrar la pàgina">${ICON.trash}</button>
        </div>
      </div>
      <div class="ed-tools" role="toolbar" aria-label="Format">
        ${TOOLS.map(tool => html`<button type="button" data-act="tool" data-tool="${tool.act}" title="${tool.title}"
          aria-label="${tool.title}">${tool.label}</button>`)}
        <button type="button" data-act="image" title="Imatge (també pots enganxar-la o arrossegar-la)"
          aria-label="Imatge">${ICON.image}</button>
      </div>
      <div class="ed-split" data-tab="${tab}">
        <textarea class="ed-text" spellcheck="true" aria-label="Text de la pàgina"></textarea>
        <article class="doc ed-preview"></article>
      </div>
      <input type="file" class="ed-file" accept="image/*" multiple hidden>`;
  }

  function bind(root) {
    const area = state.text;
    U.onActions(root, {
      tab: el => setTab(root, el.dataset.tabBtn),
      save,
      remove,
      tool: el => run(TOOLS.find(tool => tool.act === el.dataset.tool)),
      image: () => $('.ed-file', root).click(),
    });
    area.oninput = changed;
    area.onkeydown = event => {
      if (event.key === 'Tab' && !event.shiftKey && !event.ctrlKey) {
        event.preventDefault();
        apply(Format.indent(area.value, area.selectionStart, area.selectionEnd));
      }
    };
    root.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        save();
      }
    });
    area.onpaste = event => {
      const files = event.clipboardData && event.clipboardData.files;
      if (files && files.length) {
        event.preventDefault();
        addImages(files);
      }
    };
    area.ondragover = event => event.preventDefault();
    area.ondrop = event => {
      if (!event.dataTransfer.files.length) return;
      event.preventDefault();
      addImages(event.dataTransfer.files);
    };
    $('.ed-file', root).onchange = event => {
      addImages(event.target.files).finally(() => { event.target.value = ''; });
    };
  }

  async function render(root, path) {
    state.text = null;
    if (!Carpeta.canWrite) {
      location.replace('#/p/' + Temari.encodePath(path));
      return;
    }
    state.path = path;
    state.saved = '';
    root.innerHTML = view(path);
    state.text = $('.ed-text', root);
    state.preview = $('.ed-preview', root);
    try {
      state.saved = await Carpeta.read(path);
    } catch (e) {
      root.innerHTML = html`<h1>No s'ha trobat la pàgina</h1><p class="hint">${path}</p>`;
      state.text = null;
      return;
    }
    state.text.value = state.saved;
    bind(root);
    // Pàgina nova (només el títol): el cursor al final, per començar a escriure. Si no, a dalt.
    const cursor = /^# [^\n]*\s*$/.test(state.saved) ? state.saved.length : 0;
    state.text.focus({ preventScroll: true }); // que la barra de format no surti de la pantalla
    state.text.setSelectionRange(cursor, cursor);
    state.text.scrollTop = 0;
    Render.into(state.preview, state.saved, path);
  }

  // L'app ho pregunta abans de canviar de pantalla.
  function leave() {
    return !dirty() || confirm('Tens canvis sense desar. Vols sortir igualment?');
  }

  return { nav: 'edit', render, leave, dirty };
})();
