// Preferències d'aquest navegador (localStorage), totes les claus en un sol lloc.
// Si el navegador no deixa llegir o escriure, l'app funciona igual.
const Prefs = (() => {
  const KEYS = {
    theme: 'arqui:tema',          // 'light' | 'dark' (index.html també el llegeix abans de pintar)
    editorTab: 'arqui:pestanya',  // 'write' | 'preview': què es veu de l'editor al mòbil
    sideMode: 'arqui:lateral',    // 'open' | 'accordion': com es veu el temari
  };

  function get(name) {
    try { return localStorage.getItem(KEYS[name]); } catch { return null; }
  }

  function set(name, value) {
    try { localStorage.setItem(KEYS[name], value); } catch {}
  }

  return { get, set };
})();
