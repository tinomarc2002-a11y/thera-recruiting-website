/* home.js — Interaktion der Startseite (Navigation, Reveals,
   Parallax, Zaehler, FAQ, Quiz). Ausgelagert aus index.html. */

/* Safety reset — clears any lingering overflow:hidden from previous page state */
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';

  /* Sticky nav */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => nav.classList.toggle('sc', scrollY > 50), { passive: true });

  /* Mobile menu */
  const hbg = document.getElementById('hbg');
  const mob = document.getElementById('mob');
  const mc  = document.getElementById('mobClose');
  function openMob()  { mob.classList.add('open');    hbg.setAttribute('aria-expanded','true');  document.documentElement.style.overflow = 'hidden'; }
  function closeMob() { mob.classList.remove('open'); hbg.setAttribute('aria-expanded','false'); document.documentElement.style.overflow = ''; }
  hbg.addEventListener('click', openMob);
  mc.addEventListener('click', closeMob);
  mob.addEventListener('click', e => { if (e.target === mob) closeMob(); });
  document.querySelectorAll('.mob-l').forEach(a => a.addEventListener('click', closeMob));

  /* Scroll reveal */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } });
  }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.r').forEach(el => io.observe(el));
  /* Fallback: show all hidden elements after 1.5s in case Observer fails */
  setTimeout(() => { document.querySelectorAll('.r:not(.vis)').forEach(el => el.classList.add('vis')); }, 1500);

  /* FAQ accordion */
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const ans  = btn.nextElementSibling;
      const open = item.classList.contains('op');
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('op');
        i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        i.querySelector('.faq-a').classList.remove('op');
      });
      if (!open) { item.classList.add('op'); btn.setAttribute('aria-expanded', 'true'); ans.classList.add('op'); }
    });
  });

  /* Smooth scroll */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 76, behavior: 'smooth' }); }
    });
  });

  /* Count-up on scroll */
  (function(){
    var cntEls = document.querySelectorAll('.cnt[data-to]');
    if(!cntEls.length) return;
    var done = new WeakSet();
    function countUp(el){
      if(done.has(el)) return;
      done.add(el);
      var target = +el.getAttribute('data-to');
      var duration = 1400;
      var start = performance.now();
      function tick(now){
        var p = Math.min((now - start) / duration, 1);
        var ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(ease * target);
        if(p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting) countUp(e.target);
      });
    }, { threshold: 0.5 });
    cntEls.forEach(function(el){ obs.observe(el); });
  })();

  /* Parallax + scroll progress (single rAF-throttled handler) */
  (function(){
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var bar = document.querySelector('.scroll-progress b');
    var els = [].slice.call(document.querySelectorAll('[data-plx]')).map(function(el){
      return { el: el, speed: parseFloat(el.getAttribute('data-plx')) || 0.1 };
    });
    var ticking = false;
    function update(){
      ticking = false;
      if (bar) {
        var dh = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = 'scaleX(' + (dh > 0 ? (window.scrollY / dh) : 0) + ')';
      }
      if (reduce) return;
      var vh2 = window.innerHeight / 2;
      els.forEach(function(item){
        var host = item.el.parentElement;
        var r = host.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) return; // offscreen: skip
        var offset = (r.top + r.height / 2 - vh2) * item.speed;
        item.el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
      });
    }
    function onScroll(){ if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  })();

(function(){
  // Das Hero-Quiz ist auf die eigene Seite /kennenlernen umgezogen.
  // Ohne diese Pruefung wirft der Block auf der Startseite einen Fehler.
  if (!document.getElementById('qNext')) return;
  var cur = 1, total = 4;
  var answers = {};

  function pct(){ return (cur/total*100)+'%'; }

  function show(n){
    document.querySelectorAll('.quiz-step').forEach(function(s){ s.classList.remove('active'); });
    var s = document.getElementById('qs'+n);
    if(s) s.classList.add('active');
    document.getElementById('qBar').style.width = pct();
    document.getElementById('qLabel').textContent = 'Schritt '+n+' von '+total;
    document.getElementById('qBack').style.visibility = n>1?'visible':'hidden';
    document.getElementById('qNext').textContent = n===total ? 'Jetzt senden' : 'Weiter →';
  }

  // Option click/keyboard handler — single-select auto-advances after brief highlight
  document.querySelectorAll('.quiz-opts').forEach(function(grid){
    var mode = grid.getAttribute('data-mode');
    grid.querySelectorAll('.quiz-opt').forEach(function(opt){
      function activate(){
        if(mode==='single'){
          grid.querySelectorAll('.quiz-opt').forEach(function(o){ o.classList.remove('sel'); o.setAttribute('aria-checked','false'); });
          opt.classList.add('sel');
          opt.setAttribute('aria-checked','true');
          // Auto-advance after visual feedback delay
          setTimeout(function(){
            if(cur < total){ cur++; show(cur); }
          }, 280);
        } else {
          var sel = opt.classList.toggle('sel');
          opt.setAttribute('aria-checked', sel ? 'true' : 'false');
        }
      }
      opt.addEventListener('click', activate);
      opt.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); activate(); }
      });
    });
  });

  // Collect selected labels from a step's option grid
  function collectAnswers(stepId){
    var opts = document.querySelectorAll('#'+stepId+' .quiz-opt.sel');
    return Array.prototype.map.call(opts, function(o){ return o.textContent.trim(); }).join(', ');
  }

  // Next / submit
  document.getElementById('qNext').addEventListener('click', function(){
    if(cur < total){
      var grid = document.querySelector('#qs'+cur+' .quiz-opts');
      if(grid && !grid.querySelector('.sel')){ return; } // require selection
      cur++; show(cur);
    } else {
      // Validate step 4
      var name  = document.getElementById('qName').value.trim();
      var email = document.getElementById('qEmail').value.trim();
      var tel   = document.getElementById('qTel').value.trim();
      var dsgvo = document.getElementById('qDsgvo').checked;
      if(!name || !email || !dsgvo){ return; }

      var btn = document.getElementById('qNext');
      btn.disabled = true;
      btn.textContent = 'Wird gesendet …';

      var payload = window.trHerkunft ? trHerkunft() : {};
      Object.assign(payload, {
        name:    name,
        email:   email,
        telefon: tel || '–',
        rolle:   collectAnswers('qs1'),
        anzahl:  collectAnswers('qs2'),
        branche: collectAnswers('qs3'),
        _subject: 'Neue Anfrage von ' + name + ' via Thera-Recruiting.de'
      });

      fetch('https://formspree.io/f/mykvyrbb', {
        method:  'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      })
      .then(function(res){
        if(res.ok){
          window.location.href = '/danke?name=' + encodeURIComponent(name);
        } else {
          btn.disabled = false;
          btn.textContent = 'Jetzt senden';
          alert('Beim Senden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt an info@thera-recruiting.de');
        }
      })
      .catch(function(){
        btn.disabled = false;
        btn.textContent = 'Jetzt senden';
        alert('Keine Verbindung möglich. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.');
      });
    }
  });

  // Back
  document.getElementById('qBack').addEventListener('click', function(){
    if(cur > 1){ cur--; show(cur); }
  });
})();
