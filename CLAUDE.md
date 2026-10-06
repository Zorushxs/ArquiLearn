# ArquiLearn: notes per a Claude

Llibreta d'aprenentatge (programació, patrons de disseny, arquitectura) feta com una web estàtica: el contingut són fitxers Markdown a [llibreta/](llibreta/) i l'app els mostra i els edita des del navegador. Es publica amb GitHub Pages. Qui és l'usuari, què vol aprendre i com treballem és a `CLAUDE.local.md` (només local, no es puja al repo).

## Decisions

- **Sense servidor ni compilació**, com KanjiApp (`D:\Projects\KanjiApp`): HTML, CSS i JS amb rutes relatives, publicat tal qual a GitHub Pages. Un backend (Spring) es va descartar perquè caldria un servidor per accedir-hi des d'internet.
- **El contingut és Markdown**, no un format propi: és portable, git en veu bé els canvis i el temari no depèn de l'app.
- **Llibreries de tercers, sense reinventar res**: [marked](vendor/marked.umd.js) (Markdown → HTML), [highlight.js](vendor/highlight.min.js) (codi pintat) i [DOMPurify](vendor/purify.min.js) (HTML segur). Són a `vendor/` (descarregades, no amb CDN) perquè funcioni sense connexió i no canviïn soles.
- **Diagrames amb Excalidraw** (el que l'usuari fa servir sempre): s'exporten a SVG amb *Embed scene* i es posen com a imatge. Integrar l'editor d'Excalidraw dins de l'app demanaria React i compilació: de moment, no.
- **Editar**: amb File System Access (Chrome i Edge d'escriptori), l'app obre la carpeta `llibreta/` del disc i hi desa; després l'usuari fa commit i push. Sense carpeta oberta (per exemple, al mòbil o a GitHub Pages), és només lectura. Una alternativa per més endavant: desar a GitHub amb l'API i un token.
- **El repo és públic** (GitHub Pages gratuït): a la llibreta no hi va res de la feina ni res privat.

## Tecnologia i convencions (les mateixes que KanjiApp)

- Mòbil primer, tema clar i fosc amb variables CSS. Interfície només en català (no hi ha i18n). Comentaris del codi en català.
- **Cada canvi d'un CSS o JS apuja `?v=N`** a totes les referències d'[index.html](index.html) amb `node tools/versio.js` (ara és `?v=3`). Si no, GitHub Pages serveix els fitxers vells. El contingut (`llibreta/`) es llegeix sense memòria cau i no ho necessita.
- Són scripts clàssics, cadascun amb un IIFE que exposa un objecte global, en aquest ordre (el d'index.html): `Prefs`, `U` (util), `Temari`, `Format`, `Carpeta`, `Render`, `Arbre`, `Pagina`, `Editor`, `Nova`, `App`. Els `const` globals no són a `window` (des d'un altre frame: `win.eval('Render')`).
- **On va cada cosa**:
  - [js/temari.js](js/temari.js) `Temari`: regles sense DOM (rutes, noms, títols, arbre). Es pot provar amb node.
  - [js/format.js](js/format.js) `Format`: els botons de format de l'editor, sense DOM. Cada funció torna `{ from, to, insert, selStart, selEnd }`.
  - [js/carpeta.js](js/carpeta.js) `Carpeta`: **l'única capa que sap d'on surten les dades** (web amb `fetch` o carpeta del disc). Les pantalles només li demanen `read`, `write`, `writeFile`, `remove`, `exists`, `fileUrl` i `pages`.
  - [js/render.js](js/render.js) `Render.into(el, markdown, ruta)`: Markdown → HTML net, amb imatges i enllaços relatius resolts des de la carpeta de la pàgina.
  - `U`: només coses generals (DOM, `U.html`, clics, icones, avisos).
- **HTML amb `U.html`**: ``html`<p>${text}</p>` `` escapa sol. `U.raw(text)` per a l'HTML que ja és segur. Per a les condicions, `cond ? html`…` : ''`.
- **Clics amb `U.onActions(root, { nom(el, e) {…} })`** i `data-act="nom"` als botons.
- **Pantalles**: `{ nav, render(root, arg), leave() }`. `leave` (opcional) diu si es pot sortir; l'editor pregunta si hi ha canvis sense desar.
- Rutes amb hash: `#/` (inici, és `llibreta/inici.md`), `#/p/<ruta.md>`, `#/e/<ruta.md>` (editar), `#/nova[/<tema>]`. Cada tros de la ruta va codificat amb `Temari.encodePath`.
- **Estil**: una instrucció per línia, línies de menys de ~130 caràcters, noms que diguin què són. Classes CSS específiques (no genèriques), per evitar col·lisions.
- Commits: en anglès, `Add: …` / `Fix: …`, amb una llista de punts opcional.

## La llibreta

- Cada carpeta és un tema (pot tenir subtemes) i cada `.md` és una pàgina. El títol és el primer `# Títol` del text.
- Un número davant del nom (`01 Introducció`) serveix per ordenar i no es mostra.
- Les imatges de cada tema van a la seva carpeta `img/`, i al text hi van amb ruta relativa (`![](img/dibuix.svg)`). Els noms no porten espais.
- Enllaçar una altra pàgina: ruta relativa al `.md` (`[Strategy](../Patrons/Strategy.md)`); l'app la converteix en `#/p/...`.
- `llibreta/index.json` és la llista de pàgines (`{ version, pages: [{ path, title }] }`), perquè una web estàtica no pot llistar carpetes. L'app el reescriu quan desa; si s'editen els `.md` fora de l'app, `node tools/index.js`.

## Proves

Són a [tests/](tests/README.md). Després de cada canvi, passa-les totes i afegeix proves per al que hagis fet:

- `node tests/logic.test.js`: `Temari` i `Format`.
- `bash tests/browser/run.sh`: l'app sencera en un Chrome sense finestra. Primer en mode web i després amb una carpeta que és l'OPFS del navegador ([tests/browser/opfs.js](tests/browser/opfs.js)), la mateixa API que una carpeta del disc.
- Captures amb [tests/browser/frames.html](tests/browser/frames.html) (`folder=1` per veure l'editor).

## Full de ruta

- **v0 (fet)**: temari en arbre, pàgines amb codi pintat, taules i imatges/SVG; crear, editar (barra de format, vista prèvia, Ctrl+S) i esborrar pàgines; imatges amb botó, enganxar o arrossegar.
- Idees, només si l'usuari les demana: canviar el nom o moure pàgines i temes, cerca, botó de copiar als blocs de codi, desar a GitHub des del mòbil, preguntes de repàs, editor d'Excalidraw integrat.
