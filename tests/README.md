# Proves

No cal instal·lar res a part de Node, Python i Chrome.

- **Lògica** (rutes, noms, títols, arbre del temari i botons de format): `node tests/logic.test.js`
- **Navegador** (l'app sencera): `bash tests/browser/run.sh` des de Git Bash. Engega un servidor local, obre `tests/browser/harness.html` amb Chrome sense finestra i mostra només el que falla. Primer prova el mode web (només lectura) i després el d'editar, amb una carpeta que és l'OPFS del navegador ([browser/opfs.js](browser/opfs.js)): crear, editar, desar, imatges i esborrar. També la pots obrir a mà: `python tests/browser/server.py` i ves a http://127.0.0.1:8768/tests/browser/harness.html.

`tests/browser/frames.html` serveix per fer captures a mida exacta (paràmetres al principi del fitxer).
