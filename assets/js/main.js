/* ═══════════════════════════════════════════════
   【你的名字】個人網站 — 互動腳本
   全部功能都有「如果元素不存在就不執行」的保護，
   你刪掉任何一段 HTML 都不會出錯。
   ═══════════════════════════════════════════════ */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ── 1. 深色／淺色模式切換 ── */
  var toggle = $('#themeToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var root = document.documentElement;
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      var meta = $('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', next === 'dark' ? '#0c0c0e' : '#f7f4ee');
    });
  }

  /* ── 2. 導覽列：捲動陰影 + 目前所在區段高亮 ── */
  var nav = $('#nav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  var navLinks = $$('.nav-links a');
  var sections = navLinks
    .map(function (a) {
      var id = a.getAttribute('href');
      return id && id.charAt(0) === '#' ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ── 3. 手機選單 ── */
  var burger = $('#burger');
  var menu = $('#navLinks');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── 4. 進場動畫 ──
     保險設計：內容絕對不能因為動畫沒跑就永遠看不見。
     所以除了 IntersectionObserver 之外，另外掛三道保險：
       a. 瀏覽器不支援 → 直接全部顯示
       b. 視窗載入完成 → 全部顯示
       c. 1.5 秒後仍未顯示 → 強制全部顯示
  */
  var revealables = $$('.reveal');
  var revealAll = function () { revealables.forEach(function (el) { el.classList.add('is-in'); }); };

  if (!('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en, i) {
        if (!en.isIntersecting) return;
        var el = en.target;
        setTimeout(function () { el.classList.add('is-in'); }, i * 70);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(function (el) { io.observe(el); });

    window.addEventListener('load', function () { setTimeout(revealAll, 400); });
    setTimeout(revealAll, 1500);
  }

  /* ── 5. 複製 Email ── */
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var original = btn.textContent;
      var done = function () {
        btn.textContent = '已複製 ✓';
        setTimeout(function () { btn.textContent = original; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else {
        /* 舊瀏覽器備援 */
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  });

  /* ── 6. 頁尾年份 ── */
  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

})();
