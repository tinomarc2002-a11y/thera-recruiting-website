/* ============================================================
   consent.js — Einwilligungsbanner mit Kategorieauswahl
   ------------------------------------------------------------
   Microsoft Clarity wird ausschliesslich nach aktiver Einwilligung
   geladen (§ 25 TDDDG). Ohne Zustimmung entsteht keine Verbindung zu
   Microsoft und es werden keine Cookies gesetzt.

   Aufbau:
   - Erste Ansicht: Alle akzeptieren, Nur notwendige, Einstellungen.
     Annehmen und Ablehnen liegen auf derselben Ebene, gleich gross,
     ohne Vorauswahl. Eine hervorgehobene Zustimmung neben einem
     versteckten Ablehnen waere keine freiwillige Einwilligung.
   - Zweite Ansicht: je Kategorie ein Schalter. Notwendig ist fest
     an und nicht abwaehlbar, weil dort nur die Entscheidung selbst
     gespeichert wird.

   Drei Kategorien, und jede steht fuer eine Verarbeitung, die es
   wirklich gibt. Eine erfundene Rubrik waere eine Falschangabe
   gegenueber dem Besucher. Statistik und Microsoft-Kennungen sind
   getrennt, weil Clarity zwei unabhaengige Signale kennt und die
   Kennungen auf Microsoft-Domains einem anderen Zweck dienen als die
   Reichweitenmessung auf dieser Website.

   Widerruf: dauerhafter Schalter unten links, zusaetzlich der Link
   im Fussbereich. Beim Entzug der Statistik-Einwilligung werden die
   Clarity-Cookies geloescht und die Seite neu geladen, weil ein
   bereits geladenes Skript sich nicht zurueckholen laesst.
   ============================================================ */
(function () {
  'use strict';

  var CLARITY_ID = 'xxsexsw7ui';
  var KEY = 'tr-consent';
  var VERSION = '2';
  // Eine Einwilligung gilt nicht unbegrenzt. Die Aufsichtsbehoerden
  // erwarten eine erneute Abfrage nach angemessener Zeit; zwoelf Monate
  // sind der in Deutschland uebliche Rahmen. Danach faellt der
  // gespeicherte Eintrag weg und es wird neu gefragt.
  var GUELTIG_TAGE = 365;
  var clarityGeladen = false;

  // Kategorien. "pflicht" heisst: nicht abwaehlbar.
  //
  // Statistik und Microsoft-Kennungen sind getrennt, weil Clarity ueber
  // seine Schnittstelle zwei unabhaengige Signale kennt: analytics_Storage
  // steuert die eigenen Cookies _clck und _clsk, ad_Storage die
  // Drittanbieter-Cookies auf Microsoft-Domains. MUID nutzt Microsoft
  // nach eigener Angabe auch fuer Werbung. Das ist ein anderer Zweck und
  // gehoert deshalb in eine eigene Entscheidung.
  var KATEGORIEN = [
    {
      id: 'notwendig',
      pflicht: true,
      name: 'Notwendig',
      text: 'Speichert allein Ihre Entscheidung auf dieser Seite, damit wir Sie nicht ' +
            'bei jedem Besuch erneut fragen. Kein Versand an Dritte, kein Cookie.'
    },
    {
      id: 'statistik',
      pflicht: false,
      name: 'Statistik',
      text: 'Microsoft Clarity zeigt uns, welche Seiten wie oft aufgerufen werden und wo ' +
            'Besucher haengen bleiben. Setzt die Cookies _clck und _clsk auf dieser ' +
            'Website und uebertraegt Nutzungsdaten an Microsoft in die USA.'
    },
    {
      id: 'werbung',
      pflicht: false,
      name: 'Microsoft-Kennungen',
      text: 'Erlaubt Microsoft zusaetzlich, wiedererkennbare Kennungen auf eigenen Domains ' +
            'zu setzen (MUID, CLID und weitere). Microsoft nutzt diese nach eigener Angabe ' +
            'auch fuer Werbung. Fuer unsere Auswertung ist das nicht noetig, wir empfehlen ' +
            'diese Kategorie ausgeschaltet zu lassen.'
    }
  ];

  /* ---------- Speicher ---------- */

  function abgelaufen(ts) {
    if (!ts) return true;
    var alter = Date.now() - new Date(ts).getTime();
    if (isNaN(alter)) return true;
    return alter > GUELTIG_TAGE * 864e5;
  }

  function gespeichert() {
    try {
      var roh = localStorage.getItem(KEY);
      if (!roh) return null;
      var d = JSON.parse(roh);
      if (!d) return null;
      // Fassung 1 kannte nur ein Ja oder Nein fuer alles. Diese
      // Entscheidung betraf denselben Zweck und gilt weiter, sonst
      // wuerden wir jeden erneut fragen, der schon geantwortet hat.
      if (d.v === '1' && d.status) {
        d = { v: VERSION, kategorien: {
          statistik: d.status === 'granted',
          werbung: false
        }, ts: d.ts };
      }
      if (d.v !== VERSION || !d.kategorien) return null;
      if (abgelaufen(d.ts)) {
        try { localStorage.removeItem(KEY); } catch (e2) {}
        return null;
      }
      return d;
    } catch (e) { return null; }
  }

  function speichern(kategorien) {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        v: VERSION, kategorien: kategorien, ts: new Date().toISOString()
      }));
    } catch (e) { /* Speicher gesperrt, dann gilt Ablehnung fuer diese Sitzung */ }
  }

  // Clarity setzt laut Microsoft nicht nur eigene Cookies (_clck, _clsk),
  // sondern auch Drittanbieter-Cookies auf Microsoft-Domains: CLID,
  // MUID, ANONCHK, MR und SM. An die kommt document.cookie nicht heran,
  // weil sie auf einer fremden Domain liegen. Nur Clarity selbst kann
  // sie loeschen, ueber consent false. Deshalb zuerst dieser Aufruf und
  // erst danach das Aufraeumen der eigenen Cookies.
  function clarityCookiesLoeschen() {
    try {
      if (typeof window.clarity === 'function') window.clarity('consent', false);
    } catch (e) { /* Clarity nicht erreichbar, dann bleibt der Reload */ }
    ['_clck', '_clsk', 'CLID', 'ANONCHK', 'MR', 'MUID', 'SM'].forEach(function (n) {
      ['/', location.pathname].forEach(function (pfad) {
        document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + pfad;
        document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + pfad +
                          '; domain=.' + location.hostname;
      });
    });
  }

  function clarityLaden(kategorien) {
    if (!CLARITY_ID) return;
    if (!clarityGeladen) {
      clarityGeladen = true;
      (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r); t.async = 1;
        t.src = 'https://www.clarity.ms/tag/' + i;
        y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
      })(window, document, 'clarity', 'script', CLARITY_ID);
    }

    // Seit dem 31. Oktober 2025 verlangt Clarity fuer Besuche aus dem
    // EWR ein ausdrueckliches Einwilligungssignal. Ohne dieses Signal
    // laeuft der Dienst im No-Consent-Modus und vergibt je Seitenaufruf
    // eine neue Kennung. Der Aufruf landet in der Warteschlange des
    // Ladeschnipsels und wird abgearbeitet, sobald das Skript da ist.
    //
    // Die beiden Flaggen entsprechen genau den beiden Kategorien im
    // Banner. Es wird nie mehr gemeldet, als der Besucher erlaubt hat.
    try {
      window.clarity('consentv2', {
        ad_Storage: kategorien.werbung ? 'granted' : 'denied',
        analytics_Storage: kategorien.statistik ? 'granted' : 'denied'
      });
    } catch (e) { /* ohne Signal laeuft Clarity im eingeschraenkten Modus */ }
  }

  // Eine Erweiterung der Erlaubnis laesst sich sofort anwenden. Eine
  // Einschraenkung nicht: Ein geladenes Skript laesst sich nicht
  // zurueckholen, und bereits gesetzte Cookies muessen weg. Deshalb wird
  // bei jeder Ruecknahme aufgeraeumt und neu geladen.
  function anwenden(neu, alt) {
    var ruecknahme = alt && (
      (alt.statistik && !neu.statistik) ||
      (alt.werbung && !neu.werbung)
    );
    if (ruecknahme) {
      clarityCookiesLoeschen();
      location.reload();
      return;
    }
    if (neu.statistik) {
      clarityLaden(neu);
    } else if (clarityGeladen) {
      clarityCookiesLoeschen();
      location.reload();
    }
  }

  /* ---------- Stile ---------- */

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
      'max-height:calc(100vh - 28px);overflow-y:auto;',
      'transition:transform .38s cubic-bezier(.34,1.4,.64,1),opacity .32s ease}',
      '.tr-cc.show .tr-cc-box{transform:none;opacity:1}',
      '.tr-cc h2{font-size:16px;font-weight:800;letter-spacing:-.02em;margin:0 0 8px;color:#fff}',
      '.tr-cc p{font-size:13.5px;line-height:1.6;color:rgba(255,255,255,.76);margin:0 0 16px}',
      '.tr-cc a{color:#5fcde3;text-decoration:underline;text-underline-offset:2px}',
      '.tr-cc-btns{display:flex;flex-direction:row-reverse;gap:9px;flex-wrap:wrap}',
      '.tr-cc button{font-family:inherit;font-size:14.5px;font-weight:700;border-radius:99px;',
      'min-height:48px;padding:13px 18px;cursor:pointer;border:1.5px solid transparent;',
      'transition:background .2s,border-color .2s,transform .2s,filter .2s;flex:1 1 0;min-width:0}',
      '.tr-cc button:active{transform:scale(.98)}',
      '.tr-cc .ja{background:linear-gradient(135deg,#38bdf8,#0f7bc8);color:#fff;box-shadow:0 5px 18px rgba(14,165,233,.34)}',
      '.tr-cc .ja:hover{filter:brightness(1.07)}',
      '.tr-cc .nein{background:rgba(255,255,255,.09);color:#fff;border-color:rgba(255,255,255,.26)}',
      '.tr-cc .nein:hover{background:rgba(255,255,255,.16)}',
      '.tr-cc .mehr{background:none;color:rgba(255,255,255,.72);border-color:transparent;',
      'text-decoration:underline;text-underline-offset:3px;flex:0 0 100%;min-height:40px;font-weight:600;font-size:13px}',
      '.tr-cc .mehr:hover{color:#fff}',
      '.tr-cc-note{font-size:11.5px;color:rgba(255,255,255,.45);margin:12px 0 0;text-align:center}',
      // Kategorieliste
      '.tr-cc-cats{margin:0 0 16px;display:flex;flex-direction:column;gap:10px}',
      '.tr-cc-cat{background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.12);',
      'border-radius:12px;padding:13px 14px}',
      '.tr-cc-cat-top{display:flex;align-items:center;justify-content:space-between;gap:12px}',
      '.tr-cc-cat-name{font-size:14px;font-weight:750;color:#fff}',
      '.tr-cc-cat p{font-size:12.5px;line-height:1.5;margin:7px 0 0;color:rgba(255,255,255,.66)}',
      // Schalter
      '.tr-sw{position:relative;flex:none;width:46px;height:26px}',
      '.tr-sw input{position:absolute;inset:0;opacity:0;margin:0;width:100%;height:100%;cursor:pointer}',
      '.tr-sw input:disabled{cursor:not-allowed}',
      '.tr-sw span{position:absolute;inset:0;border-radius:99px;background:rgba(255,255,255,.20);',
      'transition:background .2s;pointer-events:none}',
      '.tr-sw span::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;',
      'border-radius:50%;background:#fff;transition:transform .2s}',
      '.tr-sw input:checked+span{background:#0f7bc8}',
      '.tr-sw input:checked+span::after{transform:translateX(20px)}',
      '.tr-sw input:disabled+span{background:#0f7bc8;opacity:.5}',
      '.tr-sw input:focus-visible+span{outline:2px solid #5fcde3;outline-offset:2px}',
      // Dauerhafter Schalter unten links
      '.tr-cc-fab{position:fixed;left:16px;bottom:16px;z-index:8500;width:46px;height:46px;',
      'border-radius:50%;background:#0d2b4e;border:1px solid rgba(255,255,255,.22);cursor:pointer;',
      'display:flex;align-items:center;justify-content:center;padding:0;',
      'box-shadow:0 6px 20px rgba(13,43,78,.34);transition:transform .2s,box-shadow .2s}',
      '.tr-cc-fab:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(13,43,78,.44)}',
      '.tr-cc-fab svg{width:23px;height:23px;display:block}',
      '.tr-cc-fab:focus-visible{outline:2px solid #0f7bc8;outline-offset:3px}',
      '@media(max-width:519px){.tr-cc{padding:9px}',
      '.tr-cc-box{padding:15px 15px 13px;border-radius:14px;max-height:calc(100vh - 18px)}',
      '.tr-cc h2{font-size:14.5px;margin-bottom:6px}',
      '.tr-cc p{font-size:12.5px;line-height:1.5;margin-bottom:11px}',
      '.tr-cc button{font-size:13px;padding:11px 8px}',
      '.tr-cc-note{font-size:10.5px;margin-top:9px}',
      '.tr-cc-fab{left:12px;bottom:12px;width:42px;height:42px}}',
      '@media(prefers-reduced-motion:reduce){.tr-cc-box{transition:none;transform:none;opacity:1}',
      '.tr-sw span,.tr-sw span::after,.tr-cc-fab{transition:none}}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ---------- Banner ---------- */

  // Der Banner liegt fest ueber dem Seitenende. Ohne zusaetzlichen Platz
  // verdeckt er Inhalte, auf schmalen Schirmen etwa die Antwortflaechen
  // im Funnel.
  function platzSchaffen(wrap) {
    var box = wrap.querySelector('.tr-cc-box');
    if (!box) return;
    document.body.style.paddingBottom =
      (Math.ceil(box.getBoundingClientRect().height) + 28) + 'px';
  }

  function esc(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function bannerZeigen(vorauswahl) {
    if (document.querySelector('.tr-cc')) return;
    stile();

    var vorher = gespeichert();
    var stand = {};
    KATEGORIEN.forEach(function (k) {
      stand[k.id] = k.pflicht ? true
        : !!(vorher && vorher.kategorien && vorher.kategorien[k.id]);
    });

    var wrap = document.createElement('div');
    wrap.className = 'tr-cc';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'false');
    wrap.setAttribute('aria-label', 'Einstellungen zu Cookies und Websiteanalyse');
    document.body.appendChild(wrap);

    function uebersicht() {
      wrap.innerHTML =
        '<div class="tr-cc-box">' +
          '<h2>Dürfen wir verstehen, wie Sie unsere Seite nutzen?</h2>' +
          '<p>Notwendige Speicherung brauchen wir, damit wir Sie nicht bei jedem Besuch ' +
          'erneut fragen. Für die Statistik würden wir <strong>Microsoft Clarity</strong> ' +
          'einsetzen. <strong>Ohne Ihre Zustimmung passiert das nicht.</strong> ' +
          '<a href="/datenschutz">Datenschutzerklärung</a></p>' +
          '<div class="tr-cc-btns">' +
            '<button type="button" class="ja">Alle akzeptieren</button>' +
            '<button type="button" class="nein">Nur notwendige</button>' +
            '<button type="button" class="mehr">Einstellungen anpassen</button>' +
          '</div>' +
          '<p class="tr-cc-note">Jederzeit änderbar über das Cookie-Symbol unten links.</p>' +
        '</div>';
      wrap.querySelector('.ja').addEventListener('click', function () {
        KATEGORIEN.forEach(function (k) { stand[k.id] = true; });
        fertig();
      });
      wrap.querySelector('.nein').addEventListener('click', function () {
        KATEGORIEN.forEach(function (k) { stand[k.id] = k.pflicht; });
        fertig();
      });
      wrap.querySelector('.mehr').addEventListener('click', einstellungen);
      nachZeichnen();
    }

    function einstellungen() {
      var reihen = KATEGORIEN.map(function (k) {
        return '<div class="tr-cc-cat">' +
            '<div class="tr-cc-cat-top">' +
              '<span class="tr-cc-cat-name" id="lbl-' + k.id + '">' + esc(k.name) + '</span>' +
              '<label class="tr-sw">' +
                '<input type="checkbox" data-kat="' + k.id + '"' +
                  (stand[k.id] ? ' checked' : '') +
                  (k.pflicht ? ' disabled' : '') +
                  ' aria-labelledby="lbl-' + k.id + '">' +
                '<span></span>' +
              '</label>' +
            '</div>' +
            '<p>' + esc(k.text) + (k.pflicht ? ' Diese Kategorie ist nicht abwählbar.' : '') + '</p>' +
          '</div>';
      }).join('');

      wrap.innerHTML =
        '<div class="tr-cc-box">' +
          '<h2>Was möchten Sie erlauben?</h2>' +
          '<div class="tr-cc-cats">' + reihen + '</div>' +
          '<div class="tr-cc-btns">' +
            '<button type="button" class="ja alle">Alle akzeptieren</button>' +
            '<button type="button" class="nein sichern">Auswahl speichern</button>' +
          '</div>' +
          '<p class="tr-cc-note">Details in der <a href="/datenschutz">Datenschutzerklärung</a>.</p>' +
        '</div>';

      wrap.querySelectorAll('input[data-kat]').forEach(function (i) {
        i.addEventListener('change', function () {
          stand[i.getAttribute('data-kat')] = i.checked;
        });
      });
      wrap.querySelector('.alle').addEventListener('click', function () {
        KATEGORIEN.forEach(function (k) { stand[k.id] = true; });
        fertig();
      });
      wrap.querySelector('.sichern').addEventListener('click', fertig);
      nachZeichnen();
      var erster = wrap.querySelector('input[data-kat]:not(:disabled)');
      if (erster) erster.focus();
    }

    // Der Platz am Seitenende wird sofort reserviert und nicht erst im
    // Animationsschritt. In einem Hintergrundtab oder im Energiesparmodus
    // pausiert requestAnimationFrame, und dann bliebe der Banner
    // unsichtbar ueber dem Inhalt liegen. Bei einem Einwilligungsbanner
    // darf das nicht von der Bildwiederholung abhaengen.
    function nachZeichnen() {
      platzSchaffen(wrap);
      var einblenden = function () {
        wrap.classList.add('show');
        platzSchaffen(wrap);
      };
      requestAnimationFrame(function () { requestAnimationFrame(einblenden); });
      setTimeout(einblenden, 60);
    }

    function fertig() {
      var alt = vorher && vorher.kategorien ? vorher.kategorien : null;
      speichern(stand);
      wrap.classList.remove('show');
      setTimeout(function () {
        wrap.remove();
        document.body.style.paddingBottom = '';
        schalterZeigen();
        anwenden(stand, alt);
      }, 340);
    }

    addEventListener('resize', function () {
      if (document.body.contains(wrap)) platzSchaffen(wrap);
    });

    if (vorauswahl === 'einstellungen') einstellungen(); else uebersicht();
  }

  /* ---------- Dauerhafter Schalter unten links ---------- */

  function schalterZeigen() {
    stile();
    if (document.querySelector('.tr-cc-fab')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'tr-cc-fab';
    b.setAttribute('aria-label', 'Cookie-Einstellungen ändern');
    b.title = 'Cookie-Einstellungen ändern';
    b.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<path d="M12 2.6a9.4 9.4 0 108.9 12.4 4.2 4.2 0 01-4.9-5.4 3.6 3.6 0 01-4-4 9.6 9.6 0 00-4-3z" ' +
          'stroke="#f5aa1c" stroke-width="1.7" stroke-linejoin="round"/>' +
        '<circle cx="9" cy="13.4" r="1.25" fill="#5fcde3"/>' +
        '<circle cx="13.6" cy="16.6" r="1.1" fill="#5fcde3"/>' +
        '<circle cx="8.2" cy="8.4" r="1" fill="#5fcde3"/>' +
      '</svg>';
    b.addEventListener('click', function () { bannerZeigen('einstellungen'); });
    document.body.appendChild(b);
  }

  /* ---------- Link im Fussbereich ---------- */

  function widerrufLink() {
    document.querySelectorAll('.foot-links, .foot-col ul').forEach(function (ziel) {
      if (ziel.querySelector('[data-consent-reset]')) return;
      var a = document.createElement('a');
      a.href = '#';
      a.textContent = 'Cookie-Einstellungen';
      a.setAttribute('data-consent-reset', '');
      a.addEventListener('click', function (e) {
        e.preventDefault();
        bannerZeigen('einstellungen');
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
    if (s) {
      if (s.kategorien.statistik) clarityLaden(s.kategorien);
      schalterZeigen();
    } else {
      bannerZeigen();
    }
    widerrufLink();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else { start(); }
})();
