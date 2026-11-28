(() => {
  'use strict';

  // Progressive enhancement: reveal animations are enabled only when JS is available.
  document.documentElement.classList.add('js');

  const toggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navItems = navLinks ? navLinks.querySelectorAll('a') : [];

  function closeMenu({ returnFocus = false } = {}) {
    if (!toggle || !navLinks) return;
    navLinks.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    document.body.classList.remove('nav-open');
    if (returnFocus) toggle.focus();
  }

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
      navLinks.classList.toggle('open', !isOpen);
      document.body.classList.toggle('nav-open', !isOpen);

      if (!isOpen && navItems.length) navItems[0].focus();
    });

    navItems.forEach(link => link.addEventListener('click', () => closeMenu()));
    document.addEventListener('keydown', event => {
      const menuIsOpen = toggle.getAttribute('aria-expanded') === 'true';
      if (event.key === 'Escape' && menuIsOpen) {
        closeMenu({ returnFocus: true });
        return;
      }

      // Keep keyboard focus inside the full-screen mobile navigation while it is open.
      if (event.key === 'Tab' && menuIsOpen && window.innerWidth <= 680) {
        const focusable = Array.from(navLinks.querySelectorAll('a[href]'));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 680) closeMenu();
    });
  }


  // Product catalogue is data-driven for straightforward future admin/API integration.
  const productGrid = document.getElementById('product-grid');
  const productItems = Array.isArray(window.ROYAL_PRODUCTS) ? window.ROYAL_PRODUCTS : [];

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  if (productGrid) {
    const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    productGrid.innerHTML = productItems.map(product => `
      <article class="product-card reveal">
        <div class="product-image">
          <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.alt || product.name)}" loading="lazy" decoding="async">
          ${product.tag ? `<span class="product-tag">${escapeHTML(product.tag)}</span>` : ''}
        </div>
        <div class="product-info">
          <div><h3>${escapeHTML(product.name)}</h3><p>${escapeHTML(product.description)}</p></div>
          <strong>${money.format(Number(product.price) || 0)}</strong>
        </div>
      </article>`).join('');
    if (!productItems.length) {
      productGrid.innerHTML = '<p class="catalogue-empty">Our menu is being refreshed. Please check back soon.</p>';
    }
  }

  // If an externally hosted image fails, show a designed fallback instead of a broken icon.
  document.addEventListener('error', event => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement)) return;
    const frame = img.closest('.product-image, .about-photo, .offer-art');
    if (!frame) return;
    frame.classList.add('image-fallback');
    frame.setAttribute('role', 'img');
    frame.setAttribute('aria-label', img.alt || 'Royal Bakery image');
    img.hidden = true;
  }, true);

  // Detect hero background failure; keep a branded gradient as the fallback.
  const heroImage = document.querySelector('.hero-image[data-image-src]');
  if (heroImage && 'Image' in window) {
    const probe = new Image();
    probe.onerror = () => {
      const hero = heroImage.closest('.hero');
      if (hero) hero.classList.add('no-image');
    };
    probe.src = heroImage.dataset.imageSrc;
  }

  // Reveal content as it enters the viewport.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
    if (productGrid) productGrid.querySelectorAll('.reveal').forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
    if (productGrid) productGrid.querySelectorAll('.reveal').forEach(item => item.classList.add('is-visible'));
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  if (form && status) {
    const fields = {
      name: {
        input: document.getElementById('name'),
        error: document.getElementById('name-error'),
        validate: value => value.trim().length >= 2
          ? ''
          : 'Please enter at least 2 characters.'
      },
      email: {
        input: document.getElementById('email'),
        error: document.getElementById('email-error'),
        validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
          ? ''
          : 'Please enter a valid email address.'
      },
      message: {
        input: document.getElementById('message'),
        error: document.getElementById('message-error'),
        validate: value => value.trim().length >= 10
          ? ''
          : 'Please enter at least 10 characters.'
      }
    };

    function validateField(field) {
      if (!field.input || !field.error) return false;
      const message = field.validate(field.input.value);
      field.error.textContent = message;
      field.input.classList.toggle('invalid', Boolean(message));
      field.input.setAttribute('aria-invalid', String(Boolean(message)));
      return message === '';
    }

    Object.values(fields).forEach(field => {
      if (!field.input) return;
      field.input.addEventListener('blur', () => validateField(field));
      field.input.addEventListener('input', () => {
        if (field.input.classList.contains('invalid')) validateField(field);
        status.classList.remove('success');
      });
    });

    form.addEventListener('submit', event => {
      event.preventDefault();
      const valid = Object.values(fields).map(validateField).every(Boolean);

      if (!valid) {
        status.textContent = 'Please correct the highlighted fields and try again.';
        status.classList.remove('success');
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Demo only: no backend or email service is connected.
      status.textContent = 'Thank you. Your details passed validation, but this demo form does not send or store messages.';
      status.classList.add('success');
      form.reset();

      Object.values(fields).forEach(field => {
        if (!field.input || !field.error) return;
        field.input.classList.remove('invalid');
        field.input.setAttribute('aria-invalid', 'false');
        field.error.textContent = '';
      });
    });
  }
})();
