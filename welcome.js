(() => {
  'use strict';
  const gallery = document.querySelector('#gallery');
  const pauseButton = document.querySelector('#pause');
  const dialog = document.querySelector('#sources');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let photos = [], index = 0, timer, paused = reduced, busy = false, current, controlsTimer, restorePaused;
  const details = {
    'Thérèse of Lisieux': 'Love, lived in the little things.',
    'Mother Teresa': 'A life spent close to those in need.',
    'Edith Stein': 'A searching mind. A courageous heart.',
    'Maximilian Kolbe': 'Love that gave everything.',
    'Josephine Bakhita': 'From slavery to a life of freedom and faith.',
    'John Bosco': 'A home, a future, and hope for young people.',
    'Elizabeth of the Trinity': 'An ordinary life, open to God.',
    'Bernadette Soubirous': 'A simple heart. An enduring witness.',
    'Gianna Beretta Molla': 'Doctor. Wife. Mother.',
    'Frances Xavier Cabrini': 'Crossing oceans to care for others.',
    'André Bessette': 'A humble porter with a welcoming heart.',
    'Father Damien': 'A life shared with those the world kept apart.',
    'Pier Giorgio Frassati': 'Friendship, the mountains, and care for the poor.',
    'Louis Martin': 'Holiness at home. A father’s love.',
    'Pope John Paul II': 'Faith, friendship, and a love of the outdoors.',
    'Pope John XXIII': 'A pastor with a generous heart.',
    'Pope Paul VI': 'A life of prayer and service to the Church.'
  };
  const saintName = p => 'St. ' + p.name.replace(/^Pope /, '').replace(/^Father /, '');
  function schedule() { clearTimeout(timer); if (!paused && !document.hidden && !dialog.open) timer = setTimeout(() => show(index + 1), 14000); }
  async function photoElement(p, className) {
    const img = new Image(); img.src = p.src; img.alt = 'Photograph of ' + saintName(p); img.className = className; await img.decode(); return img;
  }
  async function show(next) {
    if (busy || !photos.length) return;
    busy = true; clearTimeout(timer); index = (next + photos.length) % photos.length;
    const p = photos[index]; const scene = document.createElement('section'); scene.className = 'scene';
    try {
      if (index % 5 === 4 && innerWidth > 700) {
        scene.classList.add('trio');
        for (let n = 0; n < 3; n++) { const person = photos[(index + n) % photos.length]; const figure = document.createElement('figure'); figure.append(await photoElement(person, '')); const caption = document.createElement('figcaption'); caption.textContent = saintName(person); figure.append(caption); scene.append(figure); }
        const title = document.createElement('p'); title.className = 'trio-title'; title.textContent = 'Ordinary people. Extraordinary love.'; scene.append(title);
      } else {
        const portrait = document.createElement('div'); portrait.className = 'portrait'; const photo = await photoElement(p, 'photo'); const haze = photo.cloneNode(); haze.className = 'haze'; haze.alt = ''; haze.setAttribute('aria-hidden', 'true'); portrait.append(haze, photo);
        const copy = document.createElement('div'); copy.className = 'copy';
        const eyebrow = document.createElement('p'); eyebrow.className = 'eyebrow'; eyebrow.textContent = 'Called to be saints';
        const name = document.createElement('h1'); name.textContent = saintName(p);
        const detail = document.createElement('p'); detail.className = 'detail'; detail.textContent = details[p.name] || 'A life shaped by faith, hope, and love.';
        const rule = document.createElement('div'); rule.className = 'rule'; const invitation = document.createElement('p'); invitation.className = 'invitation'; invitation.textContent = 'Welcome · Becoming Catholic';
        copy.append(eyebrow, name, detail, rule, invitation); scene.append(portrait, copy);
      }
      gallery.append(scene); await new Promise(requestAnimationFrame); scene.classList.add('active');
      const old = current; current = scene; if (old) { old.classList.remove('active'); old.setAttribute('aria-hidden', 'true'); setTimeout(() => old.remove(), 1900); }
      gallery.querySelector('.intro')?.remove();
      // Preload upcoming frames; failures are handled when the frame is displayed.
      for (let n = 1; n <= 3; n++) { const img = new Image(); img.src = photos[(index + n) % photos.length].src; }
    } catch { document.querySelector('#status').textContent = 'A photograph could not load. Continuing to the next photograph.'; }
    finally { busy = false; schedule(); }
  }
  function setPaused(value) { paused = value; pauseButton.textContent = paused ? 'Play' : 'Pause'; schedule(); }
  function controls() { document.body.classList.add('show-controls'); clearTimeout(controlsTimer); controlsTimer = setTimeout(() => document.body.classList.remove('show-controls'), 3500); }
  async function fullscreen() { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { document.querySelector('#status').textContent = 'Fullscreen is unavailable. You can use your browser’s fullscreen command.'; } }
  pauseButton.addEventListener('click', () => setPaused(!paused));
  document.querySelector('#previous').addEventListener('click', () => show(index - 1));
  document.querySelector('#next').addEventListener('click', () => show(index + 1));
  document.querySelector('#fullscreen').addEventListener('click', fullscreen);
  document.querySelector('#credits').addEventListener('click', () => { restorePaused = paused; setPaused(true); dialog.showModal(); });
  document.querySelector('#close-credits').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => setPaused(restorePaused));
  document.addEventListener('mousemove', controls); document.addEventListener('touchstart', controls, { passive: true });
  document.addEventListener('keydown', e => { controls(); if (dialog.open || e.target.closest('button,a')) return; if (e.code === 'Space') { e.preventDefault(); setPaused(!paused); } else if (e.key === 'ArrowRight') show(index + 1); else if (e.key === 'ArrowLeft') show(index - 1); else if (e.key.toLowerCase() === 'f') fullscreen(); });
  document.addEventListener('visibilitychange', schedule);
  fetch('welcome-photos.json').then(r => { if (!r.ok) throw new Error('Photo list unavailable'); return r.json(); }).then(data => {
    photos = data; if (!photos.length) throw new Error('No photographs available');
    const list = document.querySelector('#source-list');
    for (const p of photos) { const item = document.createElement('div'); item.className = 'source'; const name = document.createElement('strong'); name.textContent = saintName(p); const credit = document.createElement('div'); credit.textContent = p.credit + ' · ' + p.license; const link = document.createElement('a'); link.href = p.source; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Original photograph and license ↗'; item.append(name, credit, link); list.append(item); }
    setPaused(paused); controls(); show(0);
  }).catch(() => { document.querySelector('.intro-note').textContent = 'The Saints · Welcome'; document.querySelector('#status').textContent = 'Gallery photos could not load. Please refresh the page.'; });
})();
