/* ==========================================================================
   SHOWPIECE 3 — "The Halo Process" (behaviour only)
   Targets: .process, .process-steps, .process-step, .process-step-image
   On screens ≥ 1025px each step's image is moved into a sticky stage (created
   here); the photo for the step in view is revealed with a circular wipe while
   a progress line fills. Everything shown comes from the markup, so adding a
   .process-step just works. Below 1025px, or with reduced motion, the markup
   is left exactly as authored.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktop = window.matchMedia('(min-width: 1025px)');

  document.querySelectorAll('.process').forEach(init);

  function init(section) {
    var list = section.querySelector('.process-steps');
    var steps = Array.prototype.slice.call(section.querySelectorAll('.process-step'));
    if (!list || !steps.length) return;

    var stage = document.createElement('div');
    stage.className = 'process-stage';

    var progress = document.createElement('div');
    progress.className = 'process-progress';
    progress.setAttribute('aria-hidden', 'true');
    var bar = document.createElement('span');
    bar.className = 'process-progress-bar';
    progress.appendChild(bar);

    var items = steps.map(function (step) {
      return {
        step: step,
        image: step.querySelector('.process-step-image'),
        marker: document.createComment('process-step-image'),
        frame: null
      };
    });

    var enhanced = false;
    var active = -1;
    var queued = false;

    function enhance() {
      if (enhanced) return;
      enhanced = true;

      items.forEach(function (item) {
        if (!item.image) return;
        item.image.parentNode.insertBefore(item.marker, item.image); // remember where it lived
        item.frame = document.createElement('div');
        item.frame.className = 'process-stage-frame';
        item.frame.appendChild(item.image);
        item.image.loading = 'eager';
        stage.appendChild(item.frame);
      });
      list.parentNode.insertBefore(stage, list.nextSibling);
      list.insertBefore(progress, list.firstChild);
      section.classList.add('is-enhanced');

      active = -1;
      update();
      window.addEventListener('scroll', queueUpdate, { passive: true });
      window.addEventListener('resize', queueUpdate);
    }

    function restore() {
      if (!enhanced) return;
      enhanced = false;
      window.removeEventListener('scroll', queueUpdate);
      window.removeEventListener('resize', queueUpdate);

      items.forEach(function (item) {
        if (item.image && item.marker.parentNode) {
          item.marker.parentNode.replaceChild(item.image, item.marker);
        }
        if (item.frame) item.frame.remove();
        item.frame = null;
        item.step.classList.remove('is-active');
      });
      stage.remove();
      progress.remove();
      section.classList.remove('is-enhanced');
      section.style.removeProperty('--process-progress');
    }

    function queueUpdate() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; update(); });
    }

    function update() {
      var line = window.innerHeight * 0.55;
      var current = 0;
      items.forEach(function (item, i) {
        if (item.step.getBoundingClientRect().top < line) current = i;
      });

      var rect = list.getBoundingClientRect();
      var p = Math.min(Math.max((line - rect.top) / rect.height, 0), 1);
      section.style.setProperty('--process-progress', p.toFixed(4));

      if (current === active) return;
      active = current;
      items.forEach(function (item, i) {
        item.step.classList.toggle('is-active', i === active);
        if (item.frame) item.frame.classList.toggle('is-shown', i <= active);
      });
    }

    function sync() {
      if (desktop.matches && !reduceMotion) enhance();
      else restore();
    }

    sync();
    desktop.addEventListener('change', sync);
  }
})();
