/* ==========================================================================
   HALO DETAILING — site-wide behaviour
   Header state, mobile menu, scroll reveals and the WhatsApp booking form.
   Contains no page content: every label, message and link is read from the HTML.
   ========================================================================== */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ---- Header: solid background after scrolling ---- */
  var header = document.querySelector('.site-header');
  if (header) {
    var syncHeader = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });
  }

  /* ---- Mobile menu ---- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = toggle ? document.getElementById(toggle.getAttribute('aria-controls')) : null;

  if (toggle && nav) {
    var background = document.querySelectorAll('main, .site-footer, .whatsapp-float, .mobile-actions');

    var setMenu = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      background.forEach(function (el) { el.inert = open; });
      if (open) {
        var firstLink = nav.querySelector('a');
        if (firstLink) firstLink.focus({ preventScroll: true });
      }
    };

    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
      }
    });

    window.matchMedia('(min-width: 1025px)').addEventListener('change', function (event) {
      if (event.matches) setMenu(false);
    });
  }

  /* ---- Scroll reveals (.reveal) ---- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---- Booking form → WhatsApp ----
     The WhatsApp number is the form's action URL, the opening line is the hidden
     "text" field, and every other line is built from each field's own <label>.
     In WordPress this form is replaced by the Elementor Form widget. */
  document.querySelectorAll('.booking-form').forEach(function (form) {
    var dateInput = form.querySelector('input[type="date"]');
    if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;

      var intro = form.querySelector('input[name="text"]');
      var lines = [intro ? intro.value : ''];

      form.querySelectorAll('.form-field').forEach(function (field) {
        var control = field.querySelector('input, select, textarea');
        var label = field.querySelector('.form-label');
        if (!control || !label) return;

        var value = control.tagName === 'SELECT'
          ? (control.value ? control.options[control.selectedIndex].text : '')
          : control.value.trim();
        if (!value) return;

        var labelCopy = label.cloneNode(true);
        labelCopy.querySelectorAll('.form-required').forEach(function (mark) { mark.remove(); });
        lines.push(labelCopy.textContent.trim() + ': ' + value);
      });

      var url = form.getAttribute('action') + '?text=' + encodeURIComponent(lines.join('\n'));
      window.open(url, '_blank', 'noopener');

      var success = form.querySelector('.form-success');
      if (success) success.hidden = false;
    });
  });
})();
