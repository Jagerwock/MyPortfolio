(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (selector, context = document) => context.querySelector(selector);

  const setupBackToTop = () => {
    const button = $('#backToTop');
    if (!button) return;

    window.addEventListener('scroll', () => {
      button.classList.toggle('show', window.scrollY > 520);
    }, { passive: true });

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
        <article class="card reveal-card" data-animate="card">
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

      document.dispatchEvent(new CustomEvent('portfolio:content-updated', { detail: { scope: container } }));
    } catch {
      container.innerHTML = '<p>Projects are temporarily unavailable.</p>';
    }
  };

  setupBackToTop();
  setupContactForm();
  loadFeaturedProjects();
})();