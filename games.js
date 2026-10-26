// Games list with one tab per store, filled from games.json.
// ?store=google|apple|rustore picks the tab; apple hides the other tabs
// (iOS builds must not show other stores). ?from=<bundle id> leaves that game
// out. Parameters may also come after # (claude.ai previews drop the query).
(function () {
  var STORES = {
    google: { title: 'Google Play', url: function (id) { return 'https://play.google.com/store/apps/details?id=' + encodeURIComponent(id); } },
    apple: { title: 'App Store', url: function (id) { return 'https://apps.apple.com/app/id' + encodeURIComponent(id); } },
    rustore: { title: 'RuStore', url: function (id) { return 'https://www.rustore.ru/catalog/app/' + encodeURIComponent(id); } }
  };
  var ORDER = ['google', 'apple', 'rustore'];

  function params() {
    var p = new URLSearchParams(location.search);
    new URLSearchParams(location.hash.replace(/^#/, '')).forEach(function (v, k) { if (!p.has(k)) p.set(k, v); });
    return p;
  }

  function guessStore() {
    var ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'apple';
    return 'google';
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function both(tag, cls, ru, en) {
    var f = document.createDocumentFragment();
    var r = el(tag, (cls ? cls + ' ' : '') + 'l10n', ru); r.lang = 'ru';
    var e = el(tag, (cls ? cls + ' ' : '') + 'l10n', en); e.lang = 'en';
    f.appendChild(r); f.appendChild(e);
    return f;
  }

  function render(root, games, p) {
    var asked = p.get('store');
    var current = STORES[asked] ? asked : guessStore();
    var locked = asked === 'apple';
    var from = p.get('from');
    games = games.filter(function (g) { return g.id !== from; });

    var tabs = el('div', 'tabs');
    tabs.setAttribute('role', 'tablist');
    var lists = {};
    ORDER.forEach(function (key) {
      var tab = el('button', 'tab', STORES[key].title);
      tab.type = 'button';
      tab.setAttribute('role', 'tab');
      tab.dataset.store = key;
      tab.addEventListener('click', function () { select(key); });
      tabs.appendChild(tab);

      var list = el('div', 'games');
      list.setAttribute('role', 'tabpanel');
      var shown = games.filter(function (g) { return g.stores && g.stores[key]; });
      shown.forEach(function (g) {
        var a = el('a', 'game');
        a.href = STORES[key].url(g.stores[key]);
        a.rel = 'noopener';
        var img = el('img');
        img.src = g.icon; img.alt = ''; img.width = 64; img.height = 64; img.loading = 'lazy';
        a.appendChild(img);
        var name = el('span', 'name');
        name.appendChild(both('span', '', g.name.ru, g.name.en));
        a.appendChild(name);
        a.appendChild(el('span', 'chevron', '›'));
        list.appendChild(a);
      });
      if (!shown.length) list.appendChild(both('p', 'empty muted', 'Скоро здесь появятся наши игры.', 'Our games are coming here soon.'));
      lists[key] = list;
    });

    function select(key) {
      current = key;
      tabs.querySelectorAll('.tab').forEach(function (t) {
        var on = t.dataset.store === key;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      ORDER.forEach(function (k) { lists[k].hidden = k !== key; });
    }

    if (!locked) root.appendChild(tabs);
    ORDER.forEach(function (k) { root.appendChild(lists[k]); });
    select(current);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var root = document.getElementById('games');
    if (!root) return;
    fetch('games.json')
      .then(function (r) { return r.json(); })
      .then(function (games) { render(root, games, params()); })
      .catch(function () { root.appendChild(both('p', 'empty muted', 'Не удалось загрузить список игр.', 'Could not load the games list.')); });
  });
})();
