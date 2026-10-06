// Una «carpeta» de prova: l'OPFS del navegador té la mateixa API que una carpeta del disc triada amb
// showDirectoryPicker. Hi copia llibreta/ (segons index.json) i en torna l'arrel, com si haguessis triat
// la carpeta del repo (l'app ha d'entrar sola a llibreta/). Ho fan servir harness.html i frames.html.
async function opfsBook() {
  const root = await navigator.storage.getDirectory();
  await root.removeEntry('llibreta', { recursive: true }).catch(() => {});
  const book = await root.getDirectoryHandle('llibreta', { create: true });
  const index = await (await fetch('/llibreta/index.json')).json();
  const files = [...index.pages.map(p => p.path), '00 Llibreta/img/exemple.svg', 'index.json'];
  for (const path of files) {
    const parts = path.split('/');
    let dir = book;
    for (const part of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(part, { create: true });
    const blob = await (await fetch('/llibreta/' + parts.map(encodeURIComponent).join('/'))).blob();
    const writable = await (await dir.getFileHandle(parts.at(-1), { create: true })).createWritable();
    await writable.write(blob);
    await writable.close();
  }
  return root;
}

async function opfsText(path) {
  let dir = await (await navigator.storage.getDirectory()).getDirectoryHandle('llibreta');
  const parts = path.split('/');
  for (const part of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(part);
  return (await (await dir.getFileHandle(parts.at(-1))).getFile()).text();
}

async function opfsHas(path) {
  try {
    await opfsText(path);
    return true;
  } catch {
    return false;
  }
}
