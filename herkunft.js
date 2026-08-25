/* ============================================================
   herkunft.js — Woher kam die Anfrage?
   ------------------------------------------------------------
   Haengt an jede Formularsendung an, auf welcher Seite sie
   ausgeloest wurde und was den Besucher hergefuehrt hat.

   Bewusst OHNE localStorage, sessionStorage oder Cookies: Es
   wird nichts auf dem Geraet abgelegt, sondern nur im Moment
   des Absendens ausgelesen, was der Browser ohnehin mitliefert.
   Damit greift die Einwilligungspflicht nach § 25 TDDDG nicht,
   anders als bei Clarity in consent.js.

   Der Weg innerhalb der Seite kommt ueber den Parameter "von",
   den die Handlungsaufforderungen an den Link zum Kennenlern-
   Funnel anhaengen. So bleibt sichtbar, welcher Ratgeber die
   Anfrage ausgeloest hat, auch wenn abgeschickt wird erst auf
   /kennenlernen.
   ============================================================ */
(function () {
  'use strict';

  function lesbar(pfad) {
    if (!pfad || pfad === '/') return 'Startseite';
    var name = pfad.replace(/^\//, '').replace(/\.html$/, '');
    return name === 'index' ? 'Startseite' : name;
  }

  window.trHerkunft = function () {
    var p, daten = {};
    try { p = new URLSearchParams(location.search); } catch (e) { p = null; }

    daten['Formular auf'] = lesbar(location.pathname);

    var von = p && p.get('von');
    if (von) daten['Ausgeloest von'] = lesbar('/' + von.replace(/^\//, ''));

    var ref = document.referrer;
    if (!ref) {
      daten['Verweis'] = 'direkt aufgerufen oder Lesezeichen';
    } else if (ref.indexOf(location.origin) === 0) {
      daten['Verweis'] = 'interne Seite: ' + lesbar(ref.slice(location.origin.length).split('?')[0]);
    } else {
      daten['Verweis'] = ref;
    }

    if (p) {
      var quelle = p.get('utm_source');
      if (quelle) {
        daten['Kampagne'] = quelle +
          (p.get('utm_medium') ? ' / ' + p.get('utm_medium') : '') +
          (p.get('utm_campaign') ? ' / ' + p.get('utm_campaign') : '');
      }
      var gclid = p.get('gclid') || p.get('fbclid');
      if (gclid) daten['Anzeigenklick'] = p.get('gclid') ? 'Google Ads' : 'Meta Ads';
    }

    return daten;
  };
})();
