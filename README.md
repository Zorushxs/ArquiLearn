# ArquiLearn

Llibreta d'aprenentatge de programació: patrons de disseny, principis i arquitectura. El contingut són fitxers Markdown a [llibreta/](llibreta/), i la web els mostra amb el codi pintat, taules, imatges i diagrames d'Excalidraw. També s'hi poden crear i editar pàgines des del navegador.

HTML, CSS i JavaScript sense compilació. Es publica tal qual amb GitHub Pages.

## Llegir

Obre la web (GitHub Pages) i tria una pàgina del temari. En local, cal un servidor perquè el navegador pugui llegir els `.md`:

```bash
python tests/browser/server.py
```

i ves a http://127.0.0.1:8768/.

## Editar

1. En local, amb **Chrome o Edge d'escriptori**, prem **Editar** a dalt i tria la carpeta `llibreta` (o la del repo: hi entra sola).
2. **Pàgina nova** al lateral: tria el tema (un de nou o un que ja tens; `Patrons/Comportament` per a un subtema) i el títol.
3. A l'editor tens la barra de format, la vista prèvia i **Desar** (o Ctrl+S). Les imatges es poden afegir amb el botó, enganxant-les (Ctrl+V) o arrossegant-les, i es desen a la carpeta `img/` del tema.
4. Commit i push: GitHub Pages publica la versió nova.

El navegador recorda la carpeta; si torna a demanar permís, a dalt hi surt el botó per tornar-la a obrir.

### Diagrames amb Excalidraw

Dibuixa a [excalidraw.com](https://excalidraw.com) i fes **Export image → SVG** amb **Embed scene** activat. Afegeix l'SVG com qualsevol imatge. Per canviar-lo, obre'l a Excalidraw, modifica'l i torna'l a exportar amb el mateix nom.

### Com s'organitza la llibreta

- Cada carpeta és un **tema** (pot tenir subtemes) i cada `.md` és una **pàgina**. El títol és el primer `# Títol`.
- Un número davant del nom (`01 Introducció`) ordena els temes i les pàgines i no es mostra.
- `llibreta/inici.md` és la pàgina d'inici.
- `llibreta/index.json` és la llista de pàgines que llegeix la web. L'app el reescriu quan desa; si edites els `.md` amb un altre programa, executa `node tools/index.js`.

## Publicar

Al repo de GitHub: **Settings → Pages → Deploy from a branch**, branca `main`, carpeta `/ (root)`. Abans de pujar canvis de CSS o JS, `node tools/versio.js` (perquè el navegador no faci servir els fitxers vells).

## Estructura

```
index.html          Esquelet de la pàgina
css/styles.css      Estils (mòbil primer, tema clar i fosc)
js/prefs.js         Preferències del navegador (tema, pestanya de l'editor)
js/util.js          Utilitats: plantilla html que escapa sola, clics, icones, avisos
js/temari.js        Regles del temari: rutes, noms, títols i arbre
js/format.js        Botons de format de l'editor
js/carpeta.js       D'on surten les dades: la web (només lectura) o la carpeta del disc
js/render.js        Markdown → HTML segur, amb codi pintat i rutes relatives resoltes
js/arbre.js         El lateral amb el temari
js/pagina.js        Pantalla d'una pàgina (i l'inici)
js/editor.js        Pantalla per editar
js/nova.js          Pantalla de pàgina nova
js/app.js           Arrencada, rutes i carpeta
vendor/             marked, highlight.js i DOMPurify
llibreta/           El contingut
tools/              versio.js (?v=N) i index.js (index.json)
tests/              Proves (vegeu tests/README.md)
```
