# divinationLenyli.github.io

A static, dependency-free Progressive Web App (PWA) that runs entirely in the browser. It provides several Chinese divination methods (六爻 / 塔罗 / 雷诺曼 / 卢恩符文 / 占星骰子 / 玄天上帝感应灵签). The app lives in `Divination-PWA/` and is deployed as-is to static hosting (e.g. GitHub Pages).

## Cursor Cloud specific instructions

- This is a pure client-side static site: `index.html`, `app.js` (divination logic), `data.js` (data tables), `sw.js` (service worker), plus `manifest*` and `icons/`. There is no package manager, build step, lint config, or automated test suite. Do not look for `package.json`; there is none.
- Run it in development by serving the `Divination-PWA/` folder over HTTP (PWA service worker / offline features require `http://localhost` or HTTPS, not `file://`), e.g. `python3 -m http.server 8080` run from inside `Divination-PWA/`. Open `http://localhost:8080/index.html`.
- The UI is entirely in Chinese. Core flow: pick a module tab, type a question in the `输入问题：` field, click the divine button (`占 卜` / `抽 牌` / `起 卦` / `掷骰子` / `求 签`), and a result renders in the output area. History is persisted in `localStorage` (`divination_history`).
- The service worker (`sw.js`, cache name `divination-v2`) aggressively caches assets. After editing `app.js`/`data.js`/etc., a plain reload may serve stale files; hard-reload or clear the service worker / cache in DevTools to see changes.
