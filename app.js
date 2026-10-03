(() => {
  const root = document.documentElement;
  const menu = document.getElementById('chapter-menu');
  const progress = document.getElementById('progress');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sequenceViewport = window.matchMedia('(min-width: 900px) and (min-height: 650px)');
  const sequences = [...document.querySelectorAll('.scroll-sequence')].map(element => ({
    element,
    items: [...element.querySelectorAll(element.dataset.sequence === 'churches' ? '.churches-labels p' : '.recognition-gallery figure')]
  }));
  const imageFrames = [...document.querySelectorAll('.cold-open, .hero, .opening-spread, .original-cloud-visual, .sheen-callback, .witness, .merton-spread')].map(frame => ({
    frame,
    image: frame.querySelector('img')
  }));
  let queued = false;
  let revealObserver;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  function updateScroll() {
    queued = false;
    const height = window.innerHeight;
    const header = document.querySelector('.site-header').offsetHeight;
    const scrollable = root.scrollHeight - height;
    if (progress) progress.style.width = `${scrollable > 0 ? clamp(window.scrollY / scrollable * 100, 0, 100) : 0}%`;
    if (root.classList.contains('scroll-sequences')) {
      sequences.forEach(({ element, items }) => {
        const rect = element.getBoundingClientRect();
        const travel = rect.height - (height - header);
        const position = clamp((header - rect.top) / Math.max(1, travel), 0, 1);
        const complete = position >= .91;
        element.classList.toggle('sequence-complete', complete);
        const current = Math.min(items.length - 1, Math.floor(position / .91 * items.length));
        items.forEach((item, index) => item.classList.toggle('is-current', !complete && current === index));
      });
    }
    if (!reducedMotion.matches && window.innerWidth > 760) {
      imageFrames.forEach(({ frame, image }) => {
        const rect = frame.getBoundingClientRect();
        if (image && rect.top < height && rect.bottom > 0) {
          const drift = clamp((height / 2 - (rect.top + rect.height / 2)) / height * 18, -18, 18);
          image.style.setProperty('--image-drift', `${drift.toFixed(2)}px`);
        }
      });
    }
  }
  function queueScroll() {
    if (!queued) { queued = true; requestAnimationFrame(updateScroll); }
  }
  function configureMotion() {
    const enabled = !reducedMotion.matches;
    root.classList.toggle('scroll-sequences', enabled && sequenceViewport.matches);
    imageFrames.forEach(({ image }) => image?.classList.toggle('image-drift', enabled));
    if (!enabled) {
      revealObserver?.disconnect();
      document.querySelectorAll('.motion-pending').forEach(element => element.classList.remove('motion-pending'));
    }
    queueScroll();
  }
  function initializeReveals() {
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        entry.target.classList.remove('motion-pending');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -20px 0px' });
    const targets = document.querySelectorAll('.sheen-intro, .watch-heading, .sheen-left, .sheen-fact, .sheen-quote .wrap, .hero-content, .benedict-quote-layout, .spread-copy, .cloud-copy, .culture-heading, .culture-card, .heroes-grid figure, .chapter-heading, .scripture-head, .statement p, .conversation-strip, .image-pair figure, .callout, .phenomena-heading, .phenomena-groups figure, .chesterton-beat .wrap, .sheen-callback .wrap, .witness > div, .litany > div, .patrons-grid figure, .benedict-statement, .closing-inner');
    targets.forEach(element => {
      // Visible and restored frames never wait for an animation to reveal their words.
      if (element.getBoundingClientRect().top < window.innerHeight) return;
      element.classList.add('motion-reveal', 'motion-pending');
      revealObserver.observe(element);
    });
  }
  menu?.querySelectorAll('nav a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu) menu.open = false;
  });
  window.addEventListener('scroll', queueScroll, { passive: true });
  window.addEventListener('resize', configureMotion, { passive: true });
  reducedMotion.addEventListener('change', configureMotion);
  sequenceViewport.addEventListener('change', configureMotion);
  window.addEventListener('load', queueScroll, { once: true });
  document.fonts?.ready.then(queueScroll);
  configureMotion();
  initializeReveals();

  const loadVideo = document.getElementById('load-video');
  loadVideo?.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/Bta7B7quts4?rel=0&autoplay=1&playsinline=1';
    iframe.title = 'Fulton Sheen: Gloom, Laughter and Humor — archival video';
    iframe.allow = 'autoplay; accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    document.getElementById('sheen-video').replaceChildren(iframe);
  }, { once: true });
})();
