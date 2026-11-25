/* ===== Polish v11: micro-interactions, keyboard shortcuts, loading bar, toast upgrades ===== */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* --- top loading bar --- */
  const bar = document.createElement('div');
  bar.id = 'ldb';
  bar.innerHTML = '<i></i>';
  document.body.appendChild(bar);
  let ldt = 0;
  window.__ldb = (on) => {
    const i = bar.firstElementChild;
    if (on) {
      bar.classList.add('run');
      i.style.width = '30%';
      clearTimeout(ldt);
      ldt = setTimeout(() => { if (bar.classList.contains('run')) i.style.width = '70%'; }, 400);
    } else {
      i.style.width = '100%';
      clearTimeout(ldt);
      ldt = setTimeout(() => { bar.classList.remove('run'); i.style.width = '0'; }, 300);
    }
  };
  const obs = new MutationObserver(() => {
    window.__ldb(1);
    clearTimeout(obs._t);
    obs._t = setTimeout(() => window.__ldb(0), 200);
  });
  const out = $('#out');
  if (out) obs.observe(out, { childList: true, subtree: true });

  /* --- smooth theme transition --- */
  const thBtn = $('#th');
  if (thBtn) {
    const orig = thBtn.onclick;
    thBtn.onclick = (e) => {
      document.documentElement.classList.add('thx');
      if (orig) orig.call(thBtn, e);
      setTimeout(() => document.documentElement.classList.remove('thx'), 400);
    };
  }
  // theme icon update
  const updThemeIcon = () => {
    const dark = document.documentElement.dataset.theme === 'dark' ||
      (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme:dark)').matches);
    thBtn.innerHTML = `<svg class="ico" viewBox="0 0 24 24">${dark
      ? '<path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>'
      : '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8"/>'}</svg>`;
  };
  if (thBtn) { updThemeIcon(); new MutationObserver(updThemeIcon).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }); }

  /* --- keyboard shortcuts --- */
  const SHORTCUTS = [
    ['/', 'Qidiruvni fokuslash'],
    ['g + P', 'Panel'],
    ['g + R', 'Reja'],
    ['g + Z', 'Zayavka'],
    ['g + M', 'Moliya'],
    ['g + O', 'Остатки'],
    ['g + D', 'Динамика'],
    ['g + V', 'Внимание'],
    ['g + K', 'Контроль'],
    ['g + I', 'Информация'],
    ['t', 'Mavzu (yorug\'/qorong\'i)'],
    ['?', 'Yorliqlar ro\'yxati'],
    ['Esc', 'Yopish / qidiruvni tozalash'],
  ];
  const TAB_KEYS = { p: 'Панель', r: 'Reja', z: 'Заявка', m: 'Moliya', o: 'Остатки', d: 'Динамика', v: 'Внимание', k: 'Контроль', i: 'Информация' };

  const isTyping = () => /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '');

  let gPressed = false, gTimer = null;
  document.addEventListener('keydown', (e) => {
    // ? shows shortcuts overlay
    if (e.key === '?' && !isTyping()) {
      e.preventDefault();
      toggleShortcuts();
      return;
    }
    if (e.key === 'Escape') {
      const ov = $('#scOv');
      if (ov) { ov.remove(); return; }
      const fpop = $('#fpop');
      if (fpop) { fpop.remove(); return; }
      const flt = $('#flt');
      if (flt && document.activeElement === flt) { flt.value = ''; flt.dispatchEvent(new Event('input', { bubbles: true })); flt.blur(); return; }
      const modal = $('.modal.on');
      if (modal) { modal.classList.remove('on'); return; }
    }
    if (isTyping()) return;
    // 't' toggles theme
    if (e.key === 't' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      thBtn && thBtn.click();
      return;
    }
    // 'g' prefix for tab navigation
    if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
      gPressed = true;
      clearTimeout(gTimer);
      gTimer = setTimeout(() => { gPressed = false; }, 700);
      return;
    }
    if (gPressed) {
      const tab = TAB_KEYS[e.key.toLowerCase()];
      if (tab) {
        e.preventDefault();
        const btn = $(`#tabs button[data-t="${tab}"]`);
        if (btn && !btn.classList.contains('dis')) btn.click();
      }
      gPressed = false;
      clearTimeout(gTimer);
    }
  });

  function toggleShortcuts() {
    let ov = $('#scOv');
    if (ov) { ov.remove(); return; }
    ov = document.createElement('div');
    ov.id = 'scOv';
    ov.className = 'sc-ov';
    ov.innerHTML = `<div class="sc-cd"><div class="sc-hd"><b>Klaviatura yorliqlari</b><button class="t" id="scX">✕</button></div><div class="sc-list">${SHORTCUTS.map(([k, d]) => `<div class="sc-row"><span class="sc-key">${k.split('+').map(p => `<kbd>${p.trim()}</kbd>`).join('<span class="sc-plus">+</span>')}</span><span class="sc-desc">${d}</span></div>`).join('')}</div><div class="sc-ft">Yorliqlar brauzerda saqlanadi</div></div>`;
    document.body.appendChild(ov);
    ov.onclick = (e) => { if (e.target === ov) ov.remove(); };
    $('#scX').onclick = () => ov.remove();
  }

  /* --- enhanced toast: stack multiple, auto-dismiss, icons --- */
  const _toast = window.__toast;
  window.__toast = (msg, type = 'info') => {
    let c = $('#tmcTS');
    if (!c) { c = document.createElement('div'); c.id = 'tmcTS'; c.className = 'tmc-ts'; document.body.appendChild(c); }
    const t = document.createElement('div');
    t.className = `tmc-t ${type}`;
    const ic = { info: '💬', ok: '✓', warn: '⚠', err: '✕' }[type] || '💬';
    t.innerHTML = `<span class="tmc-ic">${ic}</span><span>${msg}</span>`;
    c.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3200);
    // keep max 4
    while (c.children.length > 4) c.firstElementChild.remove();
  };

  /* --- empty state for tables with no visible rows --- */
  const checkEmpty = () => {
    $$('#out table').forEach(tb => {
      if (tb.closest('#sopan,#rpan,#tv,#tdr')) return;
      const visible = tb.querySelectorAll('tbody tr:not(.sh):not(.fh)').length;
      let es = tb.nextElementSibling;
      if (es && es.classList.contains('es-msg')) { if (visible) es.remove(); return; }
      if (!visible && tb.querySelectorAll('tbody tr').length > 0) {
        es = document.createElement('div');
        es.className = 'es-msg';
        es.innerHTML = '<svg class="ico" viewBox="0 0 24 24"><path d="M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z"/></svg> Hech narsa topilmadi';
        tb.after(es);
      }
    });
  };
  const flt = $('#flt');
  if (flt) flt.addEventListener('input', () => setTimeout(checkEmpty, 50));
  const outObs = new MutationObserver(() => setTimeout(checkEmpty, 100));
  if (out) outObs.observe(out, { childList: true, subtree: true });

  /* --- ripple effect on buttons --- */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('button:not(.t):not(.seg button):not(#tabs button):not(.sw input)');
    if (!b || b.closest('#fpop,#sopan,#rpan')) return;
    const r = b.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'rp';
    ripple.style.left = (e.clientX - r.left) + 'px';
    ripple.style.top = (e.clientY - r.top) + 'px';
    b.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });

  /* --- scroll-to-top button --- */
  const stb = document.createElement('button');
  stb.id = 'sttb'; stb.className = 't'; stb.innerHTML = '<svg class="ico" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  stb.title = 'Yuqoriga';
  document.body.appendChild(stb);
  stb.onclick = () => { if (out) out.scrollTo({ top: 0, behavior: 'smooth' }); };
  if (out) out.addEventListener('scroll', () => { stb.classList.toggle('vis', out.scrollTop > 400); }, { passive: true });
})();
