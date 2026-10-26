(function () {
  function pick() {
    var q = new URLSearchParams(location.search).get('lang') ||
      new URLSearchParams(location.hash.replace(/^#/, '')).get('lang');
    if (q === 'ru' || q === 'en') return q;
    try {
      var s = localStorage.getItem('lang');
      if (s === 'ru' || s === 'en') return s;
    } catch (e) {}
    var n = (navigator.language || 'en').toLowerCase();
    return /^(ru|uk|be|kk)/.test(n) ? 'ru' : 'en';
  }
  function apply(lang) {
    document.body.classList.toggle('lang-en', lang === 'en');
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang-switch button').forEach(function (b) {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
    try { localStorage.setItem('lang', lang); } catch (e) {}
  }
  document.addEventListener('DOMContentLoaded', function () {
    apply(pick());
    document.querySelectorAll('.lang-switch button').forEach(function (b) {
      b.addEventListener('click', function () { apply(b.dataset.lang); });
    });
  });
})();
