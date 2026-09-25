/* ==========================================================================
   SHOWPIECE 1 — "Halo Light" hero (behaviour only)
   Targets: .hero, .hero-media, .hero-video, .hero-headline
   - Splits whatever text is inside .hero-headline into words for a staggered
     reveal (inline accents such as .hero-headline-accent are preserved).
   - Plays .hero-video on screens ≥ 768px; phones, Save-Data and reduced-motion
     users get the poster image instead.
   - Draws a ring of light (the halo) on a canvas that follows the pointer and
     drifts on its own on touch screens. Colours come from --halo-glow / --halo-core.
   ========================================================================== */
(function () {
  'use strict';

  var hero = document.querySelector('.hero');
  if (!hero) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Headline: split existing words ---------- */
  function splitWords(heading) {
    var original = heading.textContent.replace(/\s+/g, ' ').trim();
    var visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    var index = 0;

    function addWords(text, template) {
      text.split(/\s+/).filter(Boolean).forEach(function (word) {
        var mask = document.createElement('span');
        mask.className = 'hero-word';
        var inner = document.createElement('span');
        inner.className = 'hero-word-inner';
        inner.style.setProperty('--i', index++);
        if (template) {
          var wrap = template.cloneNode(false);
          wrap.textContent = word;
          inner.appendChild(wrap);
        } else {
          inner.textContent = word;
        }
        mask.appendChild(inner);
        visual.appendChild(mask);
        visual.appendChild(document.createTextNode(' '));
      });
    }

    Array.prototype.slice.call(heading.childNodes).forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        addWords(node.textContent);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'BR') visual.appendChild(document.createElement('br'));
        else addWords(node.textContent, node);
      }
    });

    var label = document.createElement('span');
    label.className = 'sr-only';
    label.textContent = original;

    heading.textContent = '';
    heading.appendChild(label);
    heading.appendChild(visual);
  }

  if (!reduceMotion) {
    hero.querySelectorAll('.hero-headline').forEach(splitWords);
    hero.classList.add('has-intro');

    var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    var timeout = new Promise(function (resolve) { setTimeout(resolve, 700); });
    Promise.race([fontsReady, timeout]).then(function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          hero.classList.add('is-ready');
          setTimeout(function () { hero.classList.add('is-settled'); }, 2200);
        });
      });
    });
  }

  /* ---------- 2. Background video ---------- */
  var video = hero.querySelector('.hero-video');
  var connection = navigator.connection || {};
  var saveData = !!connection.saveData || /(^|-)2g$/.test(connection.effectiveType || '');
  var largeScreen = window.matchMedia('(min-width: 768px)');
  var heroInView = true;

  function syncVideo() {
    if (!video) return;
    if (largeScreen.matches && !reduceMotion && !saveData && heroInView) {
      video.muted = true;
      var attempt = video.play();
      if (attempt && attempt.catch) attempt.catch(function () {});
    } else {
      video.pause();
    }
  }

  if (video) {
    syncVideo();
    largeScreen.addEventListener('change', syncVideo);
  }

  if (reduceMotion) return;

  /* ---------- 3. Scroll depth (drives CSS parallax via --hero-scroll) ---------- */
  var scrollQueued = false;
  function syncScroll() {
    scrollQueued = false;
    var progress = Math.min(Math.max(window.scrollY / hero.offsetHeight, 0), 1);
    hero.style.setProperty('--hero-scroll', progress.toFixed(3));
  }
  window.addEventListener('scroll', function () {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(syncScroll); }
  }, { passive: true });
  syncScroll();

  /* ---------- 4. The halo canvas ---------- */
  var canvas = document.createElement('canvas');
  canvas.className = 'hero-halo-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  var media = hero.querySelector('.hero-media');
  if (media) media.insertAdjacentElement('afterend', canvas);
  else hero.insertBefore(canvas, hero.firstChild);

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  function toRGB(color, fallback) {
    var probe = document.createElement('canvas').getContext('2d');
    probe.fillStyle = fallback;
    probe.fillStyle = color || fallback;
    var value = probe.fillStyle;
    if (value.charAt(0) === '#') {
      return [parseInt(value.slice(1, 3), 16), parseInt(value.slice(3, 5), 16), parseInt(value.slice(5, 7), 16)];
    }
    var parts = value.match(/[\d.]+/g) || [];
    return parts.slice(0, 3).map(Number);
  }

  var styles = getComputedStyle(hero);
  var glow = toRGB(styles.getPropertyValue('--halo-glow').trim(), '#22E07A');
  var core = toRGB(styles.getPropertyValue('--halo-core').trim(), '#EFFFF6');
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

  var width = 0, height = 0;
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = hero.clientWidth;
    height = hero.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(hero);
  else window.addEventListener('resize', resize);

  var pos = { x: width * 0.66, y: height * 0.3 };
  var target = { x: pos.x, y: pos.y };
  var lastPointer = -Infinity;

  hero.addEventListener('pointermove', function (event) {
    if (event.pointerType !== 'mouse') return;
    var rect = hero.getBoundingClientRect();
    target.x = event.clientX - rect.left;
    target.y = event.clientY - rect.top;
    lastPointer = performance.now();
  });

  var startTime = performance.now();
  var rafId = 0;
  var running = false;

  function draw(t, vx) {
    ctx.clearRect(0, 0, width, height);

    var rx = Math.min(Math.max(width * 0.15, 72), 260) * (1 + Math.sin(t * 1.3) * 0.025);
    var ry = rx * 0.28;
    var tilt = Math.max(Math.min(vx * 0.004, 0.22), -0.22);

    // soft pool of light cast beneath the ring
    var poolY = pos.y + ry * 2.2;
    var pool = ctx.createRadialGradient(pos.x, poolY, 0, pos.x, poolY, rx * 2.6);
    pool.addColorStop(0, rgba(glow, 0.16));
    pool.addColorStop(1, rgba(glow, 0));
    ctx.fillStyle = pool;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(tilt);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);

    ctx.shadowColor = rgba(glow, 0.95);
    ctx.shadowBlur = 34;
    ctx.lineWidth = 10;
    ctx.strokeStyle = rgba(glow, 0.2);
    ctx.stroke();

    ctx.shadowBlur = 14;
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = rgba(glow, 0.7);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = rgba(core, 0.95);
    ctx.stroke();

    // a glint travelling around the ring
    var angle = t * 1.1;
    var gx = Math.cos(angle) * rx;
    var gy = Math.sin(angle) * ry;
    var glint = ctx.createRadialGradient(gx, gy, 0, gx, gy, 28);
    glint.addColorStop(0, rgba(core, 0.95));
    glint.addColorStop(0.3, rgba(glow, 0.45));
    glint.addColorStop(1, rgba(glow, 0));
    ctx.fillStyle = glint;
    ctx.beginPath();
    ctx.arc(gx, gy, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function frame(now) {
    var t = (now - startTime) / 1000;
    if (now - lastPointer > 2500) {
      // idle: slow figure-eight over the car (on phones the car sits in the top of the hero)
      var mediaHeight = media ? media.offsetHeight : height;
      target.x = width * ((width < 768 ? 0.55 : 0.66) + Math.sin(t * 0.35) * 0.14);
      target.y = mediaHeight * (0.3 + Math.sin(t * 0.7) * 0.06);
    }
    var prevX = pos.x;
    pos.x += (target.x - pos.x) * 0.06;
    pos.y += (target.y - pos.y) * 0.06;
    draw(t, pos.x - prevX);
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running || document.hidden || !heroInView) return;
    running = true;
    rafId = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      heroInView = entries[0].isIntersecting;
      if (heroInView) start(); else stop();
      syncVideo();
    }).observe(hero);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  start();
})();
