// Pantalla «Pàgina nova»: tria el tema (un que ja existeix o un de nou) i el títol, i obre l'editor.
const Nova = (() => {
  const { $, html } = U;

  function render(root, topic) {
    if (!Carpeta.canWrite) {
      root.innerHTML = html`<p class="hint">Per crear pàgines, obre la carpeta llibreta.</p>`;
      return;
    }
    root.innerHTML = html`<form class="new-form panel">
      <h1 class="h">Pàgina nova</h1>
      <label>Tema
        <input name="topic" list="topicList" value="${topic}" placeholder="Patrons de disseny" autocomplete="off">
      </label>
      <datalist id="topicList">${Temari.topics(Carpeta.pages).map(name => html`<option value="${name}">`)}</datalist>
      <p class="hint">Un de nou o un que ja tens. Per a un subtema, separa'ls amb una barra: <code>Patrons/Comportament</code>.
        Per ordenar-los, posa un número davant: <code>01 Introducció</code> (el número no es veu).</p>
      <label>Títol <input name="title" required placeholder="Strategy" autocomplete="off"></label>
      <p class="new-error warn" hidden></p>
      <div class="row"><button class="btn primary">Crear i editar</button><a class="btn" href="#/">Cancel·lar</a></div>
    </form>`;
    const form = $('form', root);
    form.onsubmit = event => {
      event.preventDefault();
      create(form).catch(e => showError(form, e.message));
    };
  }

  // Quan la pantalla ja es veu: el focus al primer camp que cal omplir.
  function shown(root) {
    const form = $('form', root);
    if (form) form.elements[form.elements.topic.value ? 'title' : 'topic'].focus();
  }

  function showError(form, message) {
    const el = $('.new-error', form);
    el.textContent = message;
    el.hidden = false;
  }

  async function create(form) {
    const topic = Temari.cleanTopic(form.elements.topic.value);
    const title = form.elements.title.value.trim();
    if (!Temari.cleanName(title)) return showError(form, 'Escriu un títol.');
    const path = (topic ? topic + '/' : '') + Temari.fileName(title);
    if (await Carpeta.exists(path)) return showError(form, `Ja hi ha una pàgina ${path}.`);
    await Carpeta.write(path, `# ${title}\n\n`);
    location.hash = '#/e/' + Temari.encodePath(path);
  }

  return { nav: 'new', render, shown };
})();
