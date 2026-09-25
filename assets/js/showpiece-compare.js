/* ==========================================================================
   SHOWPIECE 2 — Before / After reveal (behaviour only)
   Targets: .compare-item, .compare-before, .compare-after, .compare-label,
            .compare-title
   Each .compare-item becomes a draggable comparison: the images, labels and
   caption all come from its markup, so adding another .compare-item to the
   page just works. A hidden range input gives keyboard and screen-reader
   control; the accessible name is built from the item's own title and labels.
   =================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.compare-item').forEach(init);

  function init(item) {
    var before = item.querySelector('.compare-before');
    var after = item.querySelector('.compare-after');
    if (!before || !after) return;

    /* stage: after image underneath, before image clipped on top */
    var stage = document.createElement('div');
    stage.className = 'compare-stage';
    var w = after.getAttribute('width');
    var h = after.getAttribute('height');
    if (w && h && window.matchMedia('(min-width: 768px)').matches) stage.style.aspectRatio = w + ' / ' + h;
    before.parentNode.insertBefore(stage, before);
    stage.appendChild(after);
    stage.appendChild(before);
    item.querySelectorAll('.compare-label').forEach(function (label) { stage.appendChild(label); });

    var handle = document.createElement('div');
    handle.className = 'compare-handle';
    handle.setAttribute('aria-hidden', 'true');
    var knob = document.createElement('span');
    knob.className = 'compare-knob';
    handle.appendChild(knob);
    stage.appendChild(handle);

    var range = document.createElement('input');
    range.type = 'range';
    range.min = '0';
    range.max = '100';
    range.step = '1';
    range.className = 'compare-range';
    var nameParts = ['.compare-title', '.compare-label-before', '.compare-label-after']
      .map(function (sel) { var el = item.querySelector(sel); return el ? el.textContent.trim() : ''; })
      .filter(Boolean);
    range.setAttribute('aria-label', nameParts.join(' · '));
    stage.appendChild(range);

    item.classList.add('is-enhanced');

    var touched = false;
    function set(percent) {
      var p = Math.min(Math.max(percent, 0), 100);
      stage.style.setProperty('--compare-pos', p + '%');
      range.value = String(Math.round(p));
    }
    set(50);

    function fromPointer(event) {
      var rect = stage.getBoundingClientRect();
      set(((event.clientX - rect.left) / rect.width) * 100);
    }

    var dragging = false;
    stage.addEventListener('pointerdown', function (event) {
      dragging = true;
      touched = true;
      stage.classList.add('is-dragging');
      if (stage.setPointerCapture) stage.setPointerCapture(event.pointerId);
      // touch: wait for a horizontal move so vertical page scrolling still works
      if (event.pointerType === 'mouse') fromPointer(event);
    });
    stage.addEventListener('pointermove', function (event) {
      if (dragging) fromPointer(event);
    });
    function endDrag() {
      dragging = false;
      stage.classList.remove('is-dragging');
    }
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('lostpointercapture', endDrag);

    range.addEventListener('input', function () {
      touched = true;
      set(Number(range.value));
    });

    /* one-time hint sweep the first time the slider scrolls into view */
    if (!reduceMotion && 'IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        if (!touched) sweep();
      }, { threshold: 0.6 });
      observer.observe(stage);
    }

    function sweep() {
      var keys = [50, 80, 22, 50];
      var duration = 2400;
      var start = performance.now();
      function ease(x) { return 0.5 - Math.cos(Math.PI * x) / 2; }
      (function step(now) {
        if (touched) return;
        var p = Math.min((now - start) / duration, 1);
        var span = p * (keys.length - 1);
        var seg = Math.min(Math.floor(span), keys.length - 2);
        set(keys[seg] + (keys[seg + 1] - keys[seg]) * ease(span - seg));
        if (p < 1) requestAnimationFrame(step);
      })(start);
    }
  }
})();
