(() => {
  const root = document.querySelector('#projectPage');
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  const html = {
    title: document.querySelector('#projectTitle'),
    subtitle: document.querySelector('#projectSubtitle'),
    overview: document.querySelector('#overview'),
    problem: document.querySelector('#problem'),
    solution: document.querySelector('#solution'),
    features: document.querySelector('#featureList'),
    metrics: document.querySelector('#metricList'),
    results: document.querySelector('#resultList'),
    stack: document.querySelector('#metaStack'),
    role: document.querySelector('#metaRole'),
    year: document.querySelector('#metaYear'),
    architecture: document.querySelector('#architectureList'),
    gallery: document.querySelector('#galleryGrid'),
    prev: document.querySelector('#prevProject'),
    next: document.querySelector('#nextProject')
  };

  fetch('assets/data/projects.json')
    .then((r) => r.json())
    .then((projects) => {
      const i = projects.findIndex((p) => p.slug === slug);
      if (i < 0) throw new Error('Project not found');
      const p = projects[i];
      html.title.textContent = p.title;
      html.subtitle.textContent = p.shortDescription;
      html.overview.textContent = p.sections.overview;
      html.problem.textContent = p.sections.problem;
      html.solution.textContent = p.sections.solution;
      html.features.innerHTML = p.sections.features.map((x) => `<li>${x}</li>`).join('');
      html.metrics.innerHTML = p.metrics.map((x) => `<li>${x}</li>`).join('');
      html.results.innerHTML = p.sections.results.map((x) => `<li>${x}</li>`).join('');
      html.architecture.innerHTML = p.sections.architecture.map((x) => `<li>${x}</li>`).join('');
      html.stack.textContent = p.stack.join(', ');
      html.role.textContent = p.role;
      html.year.textContent = p.year;
      html.gallery.innerHTML = p.gallery.map((g) => `<img src="${g}" alt="${p.title} gallery image">`).join('');

      const prev = projects[(i - 1 + projects.length) % projects.length];
      const next = projects[(i + 1) % projects.length];
      html.prev.href = `project.html?slug=${prev.slug}`;
      html.prev.textContent = `← ${prev.title}`;
      html.next.href = `project.html?slug=${next.slug}`;
      html.next.textContent = `${next.title} →`;
    })
    .catch((err) => {
      root.innerHTML = `<div class="container section"><h1>Case study unavailable</h1><p>${err.message}</p></div>`;
    });

  const metaToggle = document.querySelector('#metaToggle');
  const metaContent = document.querySelector('#metaContent');
  if (metaToggle && metaContent) {
    metaToggle.addEventListener('click', () => {
      const expanded = metaToggle.getAttribute('aria-expanded') === 'true';
      metaToggle.setAttribute('aria-expanded', String(!expanded));
      metaContent.hidden = expanded;
    });
  }
})();