// L'arbre del temari (el lateral): temes desplegables amb les seves pàgines. La pàgina oberta s'encén.
const Arbre = (() => {
  const { html, ICON } = U;

  function pageLink(page, current) {
    const on = page.path === current;
    return html`<li><a class="tree-page${on ? ' on' : ''}" href="#/p/${U.raw(Temari.encodePath(page.path))}"
      ${on ? U.raw('aria-current="page"') : ''}>${page.title}</a></li>`;
  }

  function topicNode(topic, current) {
    return html`<li><details class="tree-topic" open>
      <summary>${Temari.displayName(topic.name)}</summary>
      ${list(topic, current)}
    </details></li>`;
  }

  function list(node, current) {
    return html`<ul class="tree">
      ${node.pages.map(page => pageLink(page, current))}
      ${node.topics.map(topic => topicNode(topic, current))}
    </ul>`;
  }

  function render(root, current) {
    const tree = Temari.tree(Carpeta.pages);
    const empty = !tree.pages.length && !tree.topics.length;
    root.innerHTML = html`
      ${Carpeta.canWrite ? html`<a class="btn primary side-new" href="#/nova">${ICON.plus}Pàgina nova</a>` : ''}
      <a class="tree-home${current === Temari.HOME ? ' on' : ''}" href="#/">Inici</a>
      ${empty ? html`<p class="hint">Encara no hi ha cap pàgina.</p>` : list(tree, current)}`;
  }

  return { render };
})();
