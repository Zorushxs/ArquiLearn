// Botons de format de l'editor, sense DOM. Cada funció rep el text i la selecció (start, end) i torna
// el canvi que s'ha de fer: { from, to, insert } (substituir de from a to per insert) i la selecció
// nova { selStart, selEnd }. L'editor aplica el canvi de manera que Ctrl+Z el desfà.
const Format = (() => {
  const change = (from, to, insert, selStart, selEnd = selStart) => ({ from, to, insert, selStart, selEnd });

  // **negreta**, *cursiva*, `codi`. Sense selecció, posa un text d'exemple i el deixa seleccionat.
  function wrap(text, start, end, marker, placeholder) {
    const inner = text.slice(start, end) || placeholder;
    const from = start + marker.length;
    return change(start, end, marker + inner + marker, from, from + inner.length);
  }

  // Les línies senceres que toca la selecció.
  function lineRange(text, start, end) {
    const from = text.lastIndexOf('\n', start - 1) + 1;
    const stop = text.indexOf('\n', end > start && text[end - 1] === '\n' ? end - 1 : end);
    return { from, to: stop === -1 ? text.length : stop };
  }

  // «## », «- », «> » davant de cada línia. Si totes ja el tenen, el treu.
  function prefixLines(text, start, end, prefix) {
    const { from, to } = lineRange(text, start, end);
    const lines = text.slice(from, to).split('\n');
    const all = lines.every(line => line.startsWith(prefix));
    const insert = lines.map(line => (all ? line.slice(prefix.length) : prefix + line)).join('\n');
    return change(from, to, insert, from, from + insert.length);
  }

  // Un bloc que ha d'anar en línies pròpies: hi afegeix els salts de línia que falten abans i després.
  function block(text, start, end, body, selectFrom, selectTo) {
    const before = start > 0 && text[start - 1] !== '\n' ? '\n' : '';
    const after = end < text.length && text[end] !== '\n' ? '\n' : '';
    const offset = start + before.length;
    return change(start, end, before + body + after, offset + selectFrom, offset + selectTo);
  }

  // ```java ... ```: amb selecció, l'envolta; sense, deixa seleccionat el text d'exemple.
  function codeBlock(text, start, end, lang = 'java') {
    const code = text.slice(start, end) || 'codi';
    const open = '```' + lang + '\n';
    return block(text, start, end, open + code + '\n```', open.length, open.length + code.length);
  }

  // [text](url): deixa seleccionada la url per escriure-la.
  function link(text, start, end) {
    const label = text.slice(start, end) || 'text';
    const urlAt = start + label.length + 3;
    return change(start, end, `[${label}](url)`, urlAt, urlAt + 3);
  }

  // ![descripció](img/nom.svg), en una línia pròpia.
  function image(text, start, end, alt, src) {
    const body = `![${alt}](${src})`;
    return block(text, start, end, body, body.length, body.length);
  }

  function table(text, start, end) {
    const body = '| Columna | Columna |\n| --- | --- |\n| text | text |';
    return block(text, start, end, body, 2, 9);
  }

  // Tabulador dins de l'editor: quatre espais (per al codi).
  const indent = (text, start, end) => change(start, end, '    ', start + 4);

  return { wrap, prefixLines, codeBlock, link, image, table, indent };
})();
