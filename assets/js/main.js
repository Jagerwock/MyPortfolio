(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const path = window.location.pathname.split('/').pop() || 'index.html';
  $$('[data-nav-link]').forEach((link) => {
    if (link.getAttribute('href') === path) link.classList.add('active');
  });

  const mobileToggle = $('#mobileToggle');
  const mobilePanel = $('#mobilePanel');
  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', () => {
      const open = mobilePanel.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', String(open));
    });
  }

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.15 })
    : null;

  $$('.reveal').forEach((el) => observer ? observer.observe(el) : el.classList.add('visible'));

  const topBtn = $('#backToTop');
  if (topBtn) {
    window.addEventListener('scroll', () => {
      topBtn.classList.toggle('show', window.scrollY > 600);
    });
    topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  const form = $('#contactForm');
  if (form) {
    const status = $('#formStatus');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      status.textContent = 'Sending...';
      const payload = Object.fromEntries(new FormData(form).entries());
      const endpoint = form.dataset.endpoint || 'http://localhost:3000/api/contact';
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed.');
        status.textContent = 'Thanks — your message was sent.';
        form.reset();
      } catch (err) {
        status.textContent = err.message || 'Could not send message.';
      }
    });
  }
})();