/* Arrowly website – shared behaviour */

/* ===== SETTINGS: change this one line when the app is live on Google Play ===== */
const PLAY_STORE_LIVE = false;
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.arrow.arrow';
/* ============================================================================== */

(function () {
  // Store buttons: "Coming soon" until the listing is live.
  document.querySelectorAll('.js-store').forEach((a) => {
    if (PLAY_STORE_LIVE) {
      a.href = PLAY_STORE_URL;
      a.target = '_blank';
      a.rel = 'noopener';
    } else {
      a.classList.add('is-soon');
    }
  });
  document.querySelectorAll('.js-store-small').forEach((el) => {
    el.textContent = PLAY_STORE_LIVE ? 'Get it on' : 'Coming soon to';
  });
  document.querySelectorAll('.js-store-short').forEach((el) => {
    el.textContent = PLAY_STORE_LIVE ? 'Get the app' : 'Coming soon';
  });
  document.querySelectorAll('.js-cta-text').forEach((el) => {
    if (PLAY_STORE_LIVE) {
      el.textContent = 'Download Arrowly free on Google Play. Train your brain, relax your mind and see how far you can go.';
    }
  });

  // Year
  document.querySelectorAll('.js-year').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // Header border on scroll
  const header = document.querySelector('.site-header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const toggle = document.querySelector('.menu-toggle');
  const links = document.getElementById('nav-links');
  if (toggle && links) {
    const use = toggle.querySelector('use');
    const set = (open) => {
      links.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (use) use.setAttribute('href', open ? '#i-close' : '#i-menu');
    };
    toggle.addEventListener('click', () => set(!links.classList.contains('is-open')));
    links.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  }

  // Reveal on scroll
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el, i) => {
      el.style.transitionDelay = (i % 4) * 60 + 'ms';
      io.observe(el);
    });

    // Legal pages: highlight the current section in the table of contents
    const toc = document.querySelectorAll('.toc a');
    if (toc.length) {
      const map = new Map([...toc].map((a) => [a.getAttribute('href').slice(1), a]));
      const so = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            toc.forEach((a) => a.classList.remove('is-active'));
            const a = map.get(en.target.id);
            if (a) a.classList.add('is-active');
          }
        });
      }, { rootMargin: '-30% 0px -60% 0px' });
      document.querySelectorAll('.prose section[id]').forEach((s) => so.observe(s));
    }
  } else {
    items.forEach((el) => el.classList.add('is-in'));
  }
})();
