(() => {
  const menu = document.getElementById('chapter-menu');
  const status = document.getElementById('chapter-status');
  const progress = document.getElementById('progress');
  const chapters = [...document.querySelectorAll('.chapter[data-chapter]')];

  function updateScroll() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${scrollable > 0 ? Math.min(100, Math.max(0, window.scrollY / scrollable * 100)) : 0}%`;
    const line = window.scrollY + window.innerHeight * .36;
    let active = chapters[0];
    for (const chapter of chapters) if (chapter.offsetTop <= line) active = chapter;
    status.textContent = active.dataset.chapter;
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();

  menu.querySelectorAll('nav a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') menu.open = false;
  });

  const loadVideo = document.getElementById('load-video');
  loadVideo.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/Bta7B7quts4?rel=0';
    iframe.title = 'Fulton Sheen: Gloom, Laughter and Humor — archival video';
    iframe.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    document.getElementById('sheen-video').replaceChildren(iframe);
  }, { once: true });
})();
