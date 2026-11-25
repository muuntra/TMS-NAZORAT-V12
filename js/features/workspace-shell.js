/* Responsive navigation, condensed header actions and collapsible data hub. */
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const main = $('main');
  const aside = $('.sb2');
  const content = $('.mc');
  const header = $('.top');
  const actions = $('.top .acts');
  const tabs = $('#tabs');
  const controls = $('#workspace-controls');
  if (!main || !aside || !content || !header || !actions || !tabs || !controls) return;

  const primaryActions = new Set(['brf', 'upb', 'exp', 'th']);
  const menu = document.createElement('details');
  menu.className = 'actions-menu';
  menu.innerHTML = '<summary>Actions</summary><div class="action-items"></div>';
  const menuItems = $('.action-items', menu);
  [...actions.children].forEach((item) => {
    if (!primaryActions.has(item.id)) menuItems.appendChild(item);
  });
  actions.appendChild(menu);
  const placeActionMenu = () => {
    const target = window.innerWidth <= 900 ? aside : actions;
    if (menu.parentElement !== target) target.appendChild(menu);
  };
  placeActionMenu();

  const branch = $('#brf');
  if (branch) branch.setAttribute('aria-label', 'Filialni tanlang');
  const upload = $('#upb');
  if (upload) {
    upload.innerHTML = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"/></svg><span>Excel yuklash</span>';
    upload.setAttribute('aria-label', 'Excel yuklash va fayl panelini ochish');
    upload.setAttribute('aria-controls', 'workspace-controls');
    upload.setAttribute('aria-expanded', 'false');
  }
  const exportButton = $('#exp');
  if (exportButton) exportButton.textContent = 'Excel eksport';
  const legacyToggle = $('#tg');
  if (legacyToggle) legacyToggle.remove();

  const hubSummary = document.createElement('section');
  hubSummary.className = 'data-hub-summary';
  hubSummary.setAttribute('aria-label', 'Yuklangan fayllar holati');
  hubSummary.innerHTML = '<span class="hub-summary-copy" aria-live="polite"></span><div class="hub-file-pills"></div><button type="button" class="t">Fayllar va parametrlar</button>';
  content.insertBefore(hubSummary, controls);
  const summaryCopy = $('.hub-summary-copy', hubSummary);
  const summaryPills = $('.hub-file-pills', hubSummary);
  const summaryButton = $('button', hubSummary);
  const uploadSlots = [
    ['fs', 'fn_s'], ['fd', 'fn_d'], ['fp', 'fn_p'], ['fh', 'fn_h'], ['fm', 'fn_m'],
  ];
  let manuallyChanged = false;

  function isLoaded(statusId) {
    const status = document.getElementById(statusId);
    return !!status && status.classList.contains('ok');
  }

  function renderHubStatus() {
    const readySlots = uploadSlots.map(([inputId, statusId]) => ({
      input: document.getElementById(inputId),
      status: document.getElementById(statusId),
    }));
    const loadedCount = readySlots.filter(({ status }) => status && status.classList.contains('ok')).length;
    summaryCopy.textContent = `${loadedCount}/5 fayl yuklandi`;
    summaryPills.replaceChildren();
    readySlots.forEach(({ input, status }) => {
      if (!input || !status || !status.classList.contains('ok')) return;
      const label = input.closest('.ft');
      const title = label && $('.ftt', label);
      const pill = document.createElement('span');
      pill.className = 'hub-file-pill loaded';
      pill.textContent = `✓ ${title ? title.textContent.trim() : input.id}`;
      summaryPills.appendChild(pill);
    });
    const mandatoryReady = isLoaded('fn_s') && isLoaded('fn_d');
    if (!manuallyChanged) content.classList.toggle('hf', mandatoryReady);
    if (upload) upload.setAttribute('aria-expanded', String(!content.classList.contains('hf')));
  }

  function setHubOpen(open, manual = true) {
    if (manual) manuallyChanged = true;
    content.classList.toggle('hf', !open);
    if (upload) upload.setAttribute('aria-expanded', String(open));
    if (open) controls.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  summaryButton.addEventListener('click', () => setHubOpen(true));
  content.addEventListener('click', (event) => {
    if (event.target.closest('[data-open-hub]')) setHubOpen(true);
  });
  if (upload) {
    upload.onclick = null;
    upload.addEventListener('click', (event) => {
      event.preventDefault();
      setHubOpen(content.classList.contains('hf'));
    });
  }

  const files = $('.files', controls);
  const statusObserver = new MutationObserver(renderHubStatus);
  if (files) statusObserver.observe(files, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  controls.addEventListener('change', (event) => {
    if (event.target.matches('input[type="file"]')) setTimeout(renderHubStatus, 0);
  });
  renderHubStatus();

  const batchUpload = document.createElement('button');
  batchUpload.id = 'batch-upload';
  batchUpload.type = 'button';
  batchUpload.className = 't';
  batchUpload.textContent = 'Bir nechta Excel tanlash';
  batchUpload.addEventListener('click', () => $('#upf')?.click());
  const hubHeading = $('.mh', controls);
  if (hubHeading) hubHeading.appendChild(batchUpload);

  const pageTitle = $('.pt');
  const title = $('#pt');
  const menuButton = document.createElement('button');
  menuButton.className = 'mobile-nav-toggle t';
  menuButton.type = 'button';
  menuButton.setAttribute('aria-label', 'Navigatsiya menyusini ochish');
  menuButton.setAttribute('aria-controls', 'tabs');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.innerHTML = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
  if (pageTitle && title) pageTitle.insertBefore(menuButton, title);

  const backdrop = document.createElement('button');
  backdrop.id = 'nav-backdrop';
  backdrop.type = 'button';
  backdrop.setAttribute('aria-label', 'Navigatsiya menyusini yopish');
  main.insertBefore(backdrop, content);
  aside.setAttribute('aria-label', 'Navigatsiya');

  function syncDrawerAccessibility() {
    const hidden = window.innerWidth <= 900 && !document.body.classList.contains('mobile-nav-open');
    aside.inert = hidden;
    aside.setAttribute('aria-hidden', String(hidden));
  }
  syncDrawerAccessibility();

  function closeNavigation(returnFocus = false) {
    document.body.classList.remove('mobile-nav-open');
    content.inert = false;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Navigatsiya menyusini ochish');
    syncDrawerAccessibility();
    if (returnFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    const open = !document.body.classList.contains('mobile-nav-open');
    document.body.classList.toggle('mobile-nav-open', open);
    content.inert = open;
    syncDrawerAccessibility();
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Navigatsiya menyusini yopish' : 'Navigatsiya menyusini ochish');
    if (open) $('#tabs button.on', aside)?.focus();
  });
  backdrop.addEventListener('click', () => closeNavigation(true));
  tabs.addEventListener('click', (event) => {
    if (event.target.closest('button[data-t]')) closeNavigation(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (document.body.classList.contains('mobile-nav-open')) closeNavigation(true);
      if (menu.open) menu.open = false;
    }
    if (!document.body.classList.contains('mobile-nav-open') || event.key !== 'Tab') return;
    const focusable = [...aside.querySelectorAll('button:not([disabled]), #tabs button:not([disabled])')].filter((node) => node.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  document.addEventListener('click', (event) => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
  menuItems.addEventListener('click', (event) => {
    if (event.target.closest('button')) setTimeout(() => { menu.open = false; }, 0);
  });

  window.addEventListener('resize', () => {
    placeActionMenu();
    if (window.innerWidth > 900 && document.body.classList.contains('mobile-nav-open')) closeNavigation(false);
    else syncDrawerAccessibility();
  });
})();
