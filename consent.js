/* ============================================================
   consent.js — Einwilligungsbanner + Microsoft Clarity
   ------------------------------------------------------------
   Clarity wird AUSSCHLIESSLICH nach aktiver Einwilligung geladen
   (§ 25 TDDDG). Ohne Zustimmung findet keinerlei Verbindung zu
   Microsoft statt und es werden keine Cookies gesetzt.

   Ablehnen und Zustimmen sind gleichwertig gestaltet, es gibt
   keine Vorauswahl. Die Entscheidung ist jederzeit widerrufbar
   über den Link "Cookie-Einstellungen" im Fussbereich.
   ============================================================ */
(function () {
  'use strict';

  // Clarity-Projekt-ID (clarity.microsoft.com → Projekt → Einstellungen → Setup)
  var CLARITY_ID = 'xxsexsw7ui';

  var KEY = 'tr-consent';           // localStorage-Schluessel
  var VERSION = '1';                // bei Aenderung des Zwecks hochzaehlen
  var clarityGeladen = false;

  function gespeichert() {
    try {
      var roh = localStorage.getItem(KEY);
      if (!roh) return null;
      var d = JSON.parse(roh);
      return d && d.v === VERSION ? d : null;
    } catch (e) { return null; }
  }

  function speichern(status) {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        v: VERSION, status: status, ts: new Date().toISOString()
      }));
    } catch (e) { /* localStorage gesperrt – dann gilt Ablehnung fuer diese Sitzung */ }
  }

  function clarityLaden() {
    if (clarityGeladen) return;
    if (!CLARITY_ID || CLARITY_ID.indexOf('HIER_EINTRAGEN') !== -1) {
      console.warn('[consent] Clarity-Projekt-ID fehlt – Tracking bleibt inaktiv.');
      return;
    }
    clarityGeladen = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1;
      t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  }

  function stile() {
    if (document.getElementById('tr-consent-style')) return;
    var s = document.createElement('style');
    s.id = 'tr-consent-style';
    s.textContent = [
      '.tr-cc{position:fixed;left:0;right:0;bottom:0;z-index:9000;display:flex;justify-content:center;',
      'padding:14px;pointer-events:none;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}',
      '.tr-cc-box{pointer-events:auto;max-width:560px;width:100%;background:#0d2b4e;color:#fff;',
      'border:1px solid rgba(255,255,255,.16);border-radius:18px;padding:22px 22px 18px;',
      'box-shadow:0 22px 60px rgba(0,0,0,.38);transform:translateY(16px);opacity:0;',
      'transition:transform .38s cubic-bezier(.34,1.4,.64,1),opacity .32s ease}',
      '.tr-cc.show .tr-cc-box{transform:none;opacity:1}',
      '.tr-cc h2{font-size:16px;font-weight:800;letter-spacing:-.02em;margin:0 0 8px;color:#fff}',
      '.tr-cc p{font-size:13.5px;line-height:1.6;color:rgba(255,255,255,.76);margin:0 0 16px}',
      '.tr-cc a{color:#5fcde3;text-decoration:underline;text-underline-offset:2px}',
      '.tr-cc-btns{display:flex;flex-direction:column;gap:9px}',
      '.tr-cc button{font-family:inherit;font-size:14.5px;font-weight:700;border-radius:99px;',
      'min-height:48px;padding:13px 22px;cursor:pointer;border:1.5px solid transparent;',
      'transition:background .2s,border-color .2s,transform .2s,filter .2s;width:100%}',
      '.tr-cc button:active{transform:scale(.98)}',
      '.tr-cc .ja{background:linear-gradient(135deg,#38bdf8,#0f7bc8);color:#fff;box-shadow:0 5px 18px rgba(14,165,233,.34)}',
      '.tr-cc .ja:hover{filter:brightness(1.07)}',
      '.tr-cc .nein{background:rgba(255,255,255,.09);color:#fff;border-color:rgba(255,255,255,.26)}',
      '.tr-cc .nein:hover{background:rgba(255,255,255,.16)}',
      '.tr-cc-note{font-size:11.5px;color:rgba(255,255,255,.45);margin:12px 0 0;text-align:center}',
      '.tr-cc-btns{flex-direction:row-reverse}.tr-cc button{width:auto;flex:1 1 0;min-width:0}',
      // Auf dem Handy war der Banner 460 von 812 Pixeln hoch und verdeckte die
      // Bedienelemente des Quiz. Deshalb hier kompakter.
      '@media(max-width:519px){.tr-cc{padding:9px}',
      '.tr-cc-box{padding:15px 15px 13px;border-radius:14px}',
      '.tr-cc h2{font-size:14.5px;margin-bottom:6px}',
      '.tr-cc p{font-size:12.5px;line-height:1.5;margin-bottom:11px}',
      '.tr-cc button{font-size:13px;padding:11px 8px}',
      '.tr-cc-note{font-size:10.5px;margin-top:9px}}',
      '@media(prefers-reduced-motion:reduce){.tr-cc-box{transition:none;transform:none;opacity:1}}'
    ].join('');
    document.head.appendChild(s);
  }

  function bannerZeigen() {
    stile();
    var wrap = document.createElement('div');
    wrap.className = 'tr-cc';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'false');
    wrap.setAttribute('aria-label', 'Hinweis zur Websiteanalyse');
    wrap.innerHTML =
      '<div class="tr-cc-box">' +
        '<h2>Dürfen wir verstehen, wie Sie unsere Seite nutzen?</h2>' +
        '<p>Wir würden <strong>Microsoft Clarity</strong> einsetzen, um zu sehen, wo Besucher ' +
        'hängen bleiben. Dabei werden Cookies gesetzt und Daten an Microsoft in die USA ' +
        'übertragen. <strong>Ohne Ihre Zustimmung passiert nichts davon.</strong> ' +
        '<a href="/datenschutz">Datenschutzerklärung</a></p>' +
        '<div class="tr-cc-btns">' +
          '<button type="button" class="ja">Einverstanden</button>' +
          '<button type="button" class="nein">Nicht einverstanden</button>' +
        '</div>' +
        '<p class="tr-cc-note">Jederzeit widerrufbar über „Cookie-Einstellungen“ im Seitenfuß.</p>' +
      '</div>';
    document.body.appendChild(wrap);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { wrap.classList.add('show'); });
    });

    function schliessen(status) {
      speichern(status);
      if (status === 'granted') clarityLaden();
      wrap.classList.remove('show');
      setTimeout(function () { wrap.remove(); }, 340);
    }
    wrap.querySelector('.ja').addEventListener('click', function () { schliessen('granted'); });
    wrap.querySelector('.nein').addEventListener('click', function () { schliessen('denied'); });
  }

  /* Link "Cookie-Einstellungen" in allen Fussbereichen ergaenzen */
  function widerrufLink() {
    document.querySelectorAll('.foot-links, .foot-col ul').forEach(function (ziel) {
      if (ziel.querySelector('[data-consent-reset]')) return;
      var a = document.createElement('a');
      a.href = '#';
      a.textContent = 'Cookie-Einstellungen';
      a.setAttribute('data-consent-reset', '');
      a.addEventListener('click', function (e) {
        e.preventDefault();
        try { localStorage.removeItem(KEY); } catch (err) {}
        if (!document.querySelector('.tr-cc')) bannerZeigen();
      });
      if (ziel.tagName === 'UL') {
        var li = document.createElement('li'); li.appendChild(a); ziel.appendChild(li);
      } else {
        ziel.appendChild(a);
      }
    });
  }

  function start() {
    var s = gespeichert();
    if (s && s.status === 'granted') { clarityLaden(); }
    else if (!s) { bannerZeigen(); }
    widerrufLink();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else { start(); }
})();
