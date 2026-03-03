(() => {
  const page = document.querySelector('#projectPage');
  if (!page) return;

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

  const setList = (element, items = []) => {
    element.innerHTML = items.map((item) => `<li>${item}</li>`).join('');
  };

  fetch('assets/data/projects.json')
    .then((response) => response.json())
    .then((projects) => {
      const index = projects.findIndex((project) => project.slug === slug);
      if (index < 0) throw new Error('Project not found.');

      const project = projects[index];
      document.title = `${project.title} — Flavio Priano`;

      html.title.textContent = project.title;
      html.subtitle.textContent = project.shortDescription;
      html.overview.textContent = project.sections.overview;
      html.problem.textContent = project.sections.problem;
      html.solution.textContent = project.sections.solution;
      setList(html.features, project.sections.features);
      setList(html.metrics, project.metrics || []);
      setList(html.results, project.sections.results);
      setList(html.architecture, project.sections.architecture);
      html.stack.textContent = project.stack.join(', ');
      html.role.textContent = project.role;
      html.year.textContent = project.year;
      html.gallery.innerHTML = project.gallery
        .map((image, imageIndex) => `<img src="${image}" alt="${project.title} gallery image ${imageIndex + 1}">`)
        .join('');

      const prev = projects[(index - 1 + projects.length) % projects.length];
      const next = projects[(index + 1) % projects.length];
      html.prev.href = prev.caseStudy;
      html.prev.textContent = `← ${prev.title}`;
      html.next.href = next.caseStudy;
      html.next.textContent = `${next.title} →`;
    })
    .catch((error) => {
      page.innerHTML = `<div class="container section"><h1>Case study unavailable</h1><p>${error.message}</p></div>`;
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