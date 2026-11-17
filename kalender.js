/* ============================================================
   kalender.js — Calendly erst nach Zustimmung laden
   ------------------------------------------------------------
   Das Widget setzt beim Laden Daten im Browser ab und übermittelt
   die IP an Calendly in die USA. § 25 Abs. 1 TDDDG verlangt dafür
   eine Einwilligung, und das berechtigte Interesse aus Art. 6 DSGVO
   ersetzt sie nicht. Deshalb steht hier zuerst ein Platzhalter und
   das Widget wird erst auf Klick nachgeladen.

   Die Entscheidung wird lokal gemerkt, damit niemand bei jedem
   Besuch erneut klicken muss. Gelöscht wird sie zusammen mit den
   übrigen Einwilligungen über den Schalter unten links.
   ============================================================ */
(function () {
  'use strict';

  var KEY = 'tr-kalender';
  var SKRIPT = 'https://assets.calendly.com/assets/external/widget.js';
  var skriptLaeuft = false;

  function erlaubt() {
    try { return localStorage.getItem(KEY) === 'ja'; } catch (e) { return false; }
  }

  function merken() {
    try { localStorage.setItem(KEY, 'ja'); } catch (e) { /* ohne Speicher halt jedes Mal */ }
  }

  function skriptLaden(fertig) {
    if (window.Calendly) { fertig(); return; }
    if (skriptLaeuft) { setTimeout(function () { skriptLaden(fertig); }, 200); return; }
    skriptLaeuft = true;
    var s = document.createElement('script');
    s.src = SKRIPT;
    s.async = true;
    s.onload = fertig;
    document.head.appendChild(s);
  }

  function widgetBauen(box) {
    var url = box.getAttribute('data-kalender');
    if (!url) return;
    // data-url steht vor dem Nachladen im Markup. widget.js greift sich
    // beim Start alle vorhandenen Elemente selbst. Nur wenn das Skript
    // schon laeuft, muss der Aufbau von Hand angestossen werden.
    var ziel = document.createElement('div');
    ziel.className = 'calendly-inline-widget';
    ziel.setAttribute('data-url', url);
    ziel.style.minWidth = '320px';
    ziel.style.height = '700px';
    box.innerHTML = '';
    box.appendChild(ziel);
    if (window.Calendly && typeof window.Calendly.initInlineWidget === 'function') {
      window.Calendly.initInlineWidget({ url: url, parentElement: ziel });
      return;
    }
    skriptLaden(function () {
      // Falls widget.js den Aufbau nicht selbst uebernommen hat
      setTimeout(function () {
        if (!ziel.querySelector('iframe') && window.Calendly &&
            typeof window.Calendly.initInlineWidget === 'function') {
          window.Calendly.initInlineWidget({ url: url, parentElement: ziel });
        }
      }, 400);
    });
  }

  function platzhalter(box) {
    box.innerHTML =
      '<div class="kal-ph">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true" class="kal-ph-i">' +
          '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 11h18"/>' +
        '</svg>' +
        '<p class="kal-ph-t">Der Terminkalender kommt von Calendly. Beim Laden wird Ihre ' +
        'IP-Adresse an Calendly in die USA übertragen und es werden Daten in Ihrem Browser ' +
        'gespeichert. Mehr dazu in der <a href="/datenschutz">Datenschutzerklärung</a>.</p>' +
        '<button type="button" class="kal-ph-btn">Kalender laden</button>' +
      '</div>';
    box.querySelector('.kal-ph-btn').addEventListener('click', function () {
      merken();
      widgetBauen(box);
    });
  }

  function start() {
    var boxen = document.querySelectorAll('[data-kalender]');
    if (!boxen.length) return;
    Array.prototype.forEach.call(boxen, function (box) {
      if (erlaubt()) widgetBauen(box); else platzhalter(box);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
