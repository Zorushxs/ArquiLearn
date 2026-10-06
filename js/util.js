// Utilitats generals: DOM, HTML segur, clics, icones i avisos (copiat i retallat de KanjiApp).
const U = (() => {
  const $ = (selector, root = document) => root.querySelector(selector);

  // ---------- HTML segur ----------
  const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = text => String(text ?? '').replace(/[&<>"']/g, c => ENTITIES[c]);

  // Un tros d'HTML ja construït, que no s'ha de tornar a escapar.
  class Html {
    constructor(text) { this.text = text; }
    toString() { return this.text; }
  }
  // Marca un text com a HTML segur (per exemple, una icona SVG fixa).
  const raw = text => new Html(String(text ?? ''));

  // Converteix un valor en HTML: el text s'escapa; l'HTML (html`…` o raw) es deixa tal qual;
  // una llista s'uneix sense separador; null i undefined no pinten res. true i false s'escriuen
  // (aria-pressed="${on}"); per a les condicions, fes servir cond ? html`…` : ''.
  function toHtml(value) {
    if (value instanceof Html) return value.text;
    if (Array.isArray(value)) return value.map(toHtml).join('');
    if (value === null || value === undefined) return '';
    return esc(value);
  }

  // Plantilla que escapa sola tot el que hi poses: html`<p class="hint">${text}</p>`.
  function html(strings, ...values) {
    let out = strings[0];
    values.forEach((value, i) => { out += toHtml(value) + strings[i + 1]; });
    return new Html(out);
  }

  // ---------- Clics ----------
  // Cada element amb data-act="nom" crida actions.nom(element, event). Si l'element és dins d'un altre
  // amb data-act, guanya el de més endins.
  function onActions(root, actions) {
    root.onclick = event => {
      const el = event.target.closest('[data-act]');
      if (!el || !root.contains(el)) return;
      const action = actions[el.dataset.act];
      if (action) action(el, event);
    };
  }

  // ---------- Icones ----------
  const svg = body => raw(`<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`);
  const ICON = {
    edit: svg('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>'),
    folder: svg('<path d="M3.5 7a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>'),
    left: svg('<path d="M14.5 6l-6 6 6 6"/>'),
    close: svg('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>'),
    image: svg('<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M5 17l4.5-4.5 3 3 2.5-2.5 4 4"/>'),
    trash: svg('<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/>'),
    list: svg('<path d="M9.5 7h10M9.5 12h10M9.5 17h10"/><circle cx="5" cy="7" r=".6"/><circle cx="5" cy="12" r=".6"/><circle cx="5" cy="17" r=".6"/>'),
    quote: svg('<path d="M5 6v12"/><path d="M9.5 8h9.5M9.5 12h9.5M9.5 16h6"/>'),
    link: svg('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
    fold: svg('<rect x="3.5" y="4" width="17" height="5" rx="1.5"/><path d="M6.5 14.5h11M6.5 17.5h8"/><rect x="3.5" y="11" width="17" height="9" rx="1.5"/>'),
    table: svg('<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M3.5 10h17M3.5 14.5h17M10 10v9"/>'),
  };

  // ---------- Avisos ----------
  // Missatge breu a baix de la pantalla. Els llargs es queden més estona.
  let toastTimer = null;
  function toast(message, kind) {
    const el = $('#toast');
    el.textContent = message;
    el.dataset.kind = kind || '';
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, Math.max(3000, message.length * 60));
  }

  return { $, esc, html, raw, onActions, ICON, toast };
})();
