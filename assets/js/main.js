(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  const setActiveNav = () => {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    $$('[data-nav-link], #mobilePanel a').forEach((link) => {
      const isActive = link.getAttribute('href') === path;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const setupMobileMenu = () => {
    const toggle = $('#mobileToggle');
    const panel = $('#mobilePanel');
    if (!toggle || !panel) return;

    const focusableSelector = 'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])';
    const closeMenu = () => {
      panel.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      toggle.focus();
    };

    const trapFocus = (event) => {
      if (!panel.classList.contains('open') || event.key !== 'Tab') return;
      const focusables = $$(focusableSelector, panel);
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    toggle.addEventListener('click', () => {
      const open = !panel.classList.contains('open');
      panel.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        const firstLink = panel.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });

    panel.addEventListener('click', (event) => {
      if (event.target.matches('a')) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && panel.classList.contains('open')) closeMenu();
      trapFocus(event);
    });
  };

  const setupReveal = () => {
    const revealElements = $$('.reveal');
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealElements.forEach((el) => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealElements.forEach((el) => observer.observe(el));
  };

  const setupSmoothAnchorScroll = () => {
    if (prefersReducedMotion) return;
    $$('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        const href = anchor.getAttribute('href');
        if (!href || href.length <= 1) return;
        const target = document.querySelector(href);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  const setupBackToTop = () => {
    const button = $('#backToTop');
    if (!button) return;

    window.addEventListener('scroll', () => {
      button.classList.toggle('show', window.scrollY > 520);
    });

    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  };

  const setupContactForm = () => {
    const form = $('#contactForm');
    const status = $('#formStatus');
    if (!form || !status) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      status.className = 'status';

      const payload = Object.fromEntries(new FormData(form).entries());
      if (payload.website) {
        status.textContent = 'Submission blocked.';
        status.classList.add('error');
        return;
      }

      if (String(payload.name || '').trim().length < 2) {
        status.textContent = 'Please enter your full name.';
        status.classList.add('error');
        return;
      }

      const email = String(payload.email || '').trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        status.textContent = 'Please enter a valid email address.';
        status.classList.add('error');
        return;
      }

      if (String(payload.message || '').trim().length < 20) {
        status.textContent = 'Please share at least 20 characters so I can help you better.';
        status.classList.add('error');
        return;
      }

      status.textContent = 'Sending…';
      const endpoint = form.dataset.endpoint || 'http://localhost:3000/api/contact';

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Could not send your message right now.');
        }

        form.reset();
        status.textContent = 'Thanks, your message was sent successfully.';
        status.classList.add('success');
      } catch (error) {
        status.textContent = error.message || 'Something went wrong. Please try again later.';
        status.classList.add('error');
      }
    });
  };

  const loadFeaturedProjects = async () => {
    const container = $('#selectedWorksGrid');
    if (!container) return;

    try {
      const response = await fetch('assets/data/projects.json');
      const projects = await response.json();
      const featured = projects.slice(0, 3);

      container.innerHTML = featured.map((project) => `
        <article class="card reveal">
          <a href="${project.caseStudy}">
            <div class="card-thumb">
              <img src="${project.gallery[0]}" alt="${project.title} preview">
            </div>
            <div class="card-body">
              <p class="card-meta">${project.year}</p>
              <h3>${project.title}</h3>
              <p>${project.shortDescription}</p>
              <div class="tags">${project.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}</div>
            </div>
          </a>
        </article>
      `).join('');

      setupReveal();
    } catch {
      container.innerHTML = '<p>Projects are temporarily unavailable.</p>';
    }
  };

  setActiveNav();
  setupMobileMenu();
  setupReveal();
  setupSmoothAnchorScroll();
  setupBackToTop();
  setupContactForm();
  loadFeaturedProjects();
})();