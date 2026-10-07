/* ============================================================
   zapier.js — schickt jede Anfrage zusätzlich an Zapier
   ------------------------------------------------------------
   Formspree bleibt unverändert und verschickt weiter die
   Benachrichtigung. Zusätzlich geht derselbe Datensatz an einen
   Catch Hook in Zapier, der dort die E-Mail-Strecke auslöst.

   Einrichtung in Zapier:
   1. Neuen Zap anlegen, Trigger „Webhooks by Zapier“ → „Catch Hook“.
   2. Die angezeigte Adresse (https://hooks.zapier.com/hooks/catch/…)
      unten bei HOOK eintragen und die Seite neu veröffentlichen.
   3. Einmal das Formular auf der Website abschicken, damit Zapier
      die Felder kennt, danach die Aktionen bauen.

   Gesendet wird formularkodiert, dadurch gibt es keine
   CORS-Vorabanfrage. Fehler werden bewusst verschluckt, damit eine
   Störung bei Zapier den Besucher nie aufhält.
   ============================================================ */
(function () {
  var HOOK = '';

  function flach(daten) {
    var felder = new URLSearchParams();
    Object.keys(daten || {}).forEach(function (schluessel) {
      var wert = daten[schluessel];
      if (wert === undefined || wert === null) return;
      if (typeof wert === 'object') { wert = JSON.stringify(wert); }
      felder.append(schluessel, String(wert));
    });
    felder.append('quelle_seite', location.pathname);
    felder.append('gesendet_am', new Date().toISOString());
    return felder;
  }

  window.trZapier = function (daten) {
    if (!HOOK) return;
    try {
      fetch(HOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: flach(daten).toString(),
        keepalive: true
      }).catch(function () {});
    } catch (e) { /* Besucher darf das nie merken */ }
  };
})();
