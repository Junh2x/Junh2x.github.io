(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 히어로 등장 ── */
  var hero = document.querySelector('.hero');
  if (hero) requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('in'); }); });

  /* ── 스크롤 리빌 ── */
  var rv = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  if (reduce || !('IntersectionObserver' in window)) {
    rv.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    rv.forEach(function (el) { io.observe(el); });
  }

  /* ── 접기·펼치기 ── */
  document.querySelectorAll('.more').forEach(function (btn) {
    var entry = btn.closest('.entry'); var fold = entry && entry.querySelector('.fold'); var label = btn.querySelector('.more-t');
    if (!fold) return;
    btn.addEventListener('click', function () {
      var open = fold.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (label) label.textContent = open ? '접기' : '자세히 보기';
    });
  });

  /* ── 이메일 복사 ── */
  var timer;
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    var lbl = btn.querySelector('.c-copy-t');
    var orig = lbl ? lbl.textContent : null;
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function () {
        btn.classList.add('copied');
        if (lbl) lbl.textContent = '복사됨!';
        clearTimeout(timer);
        timer = setTimeout(function () { btn.classList.remove('copied'); if (lbl && orig != null) lbl.textContent = orig; }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, function () { fb(text, done); }); }
      else { fb(text, done); }
    });
  });
  function fb(text, done) {
    var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'absolute'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) {} document.body.removeChild(ta);
  }

  /* ── 진행바 · 우측 레일 · 맨 위로 ── */
  var bar = document.getElementById('progressBar');
  var toTop = document.getElementById('toTop');
  var aura = document.querySelector('.bg-aura');
  var railDots = {};
  document.querySelectorAll('.rail-dot').forEach(function (a) { railDots[a.getAttribute('href').slice(1)] = a; });
  var railTargets = Object.keys(railDots).map(function (id) { return { id: id, el: document.getElementById(id) }; }).filter(function (t) { return t.el; });
  var railActive = null;

  function onScroll() {
    var sy = window.scrollY, dh = document.documentElement.scrollHeight - window.innerHeight;
    var pct = dh > 0 ? sy / dh * 100 : 0;
    if (bar) bar.style.width = pct + '%';
    if (aura) aura.style.transform = 'translate3d(0,' + (sy * -0.05).toFixed(1) + 'px,0)';
    if (toTop) toTop.classList.toggle('show', sy > window.innerHeight * 0.6);

    var line = sy + window.innerHeight * 0.32;
    var cur = railTargets.length ? railTargets[0].id : null;
    for (var i = 0; i < railTargets.length; i++) {
      if (railTargets[i].el.getBoundingClientRect().top + sy <= line) cur = railTargets[i].id;
    }
    // 마지막 섹션(CONTACT)은 화면에 충분히 들어오면 활성화 (하단 여백이 부족한 경우 대비)
    if (railTargets.length) {
      var last = railTargets[railTargets.length - 1];
      if (last.el.getBoundingClientRect().top < window.innerHeight * 0.55) cur = last.id;
    }
    if (cur !== railActive) {
      if (railActive && railDots[railActive]) railDots[railActive].classList.remove('active');
      if (cur && railDots[cur]) railDots[cur].classList.add('active');
      railActive = cur;
    }
  }
  var ticking = false;
  window.addEventListener('scroll', function () { if (ticking) return; ticking = true; requestAnimationFrame(function () { onScroll(); ticking = false; }); }, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

})();
