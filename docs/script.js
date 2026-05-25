// Scroll-spy: mark the section currently in view as current in the sidebar.
(function () {
  const steps = document.querySelectorAll('.step');
  const items = new Map();
  for (const link of document.querySelectorAll('.sidebar a')) {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) continue;
    items.set(href.slice(1), link);
  }
  if (!items.size) return;

  let lastCurrent = null;
  const setCurrent = (id) => {
    if (lastCurrent === id) return;
    const prev = lastCurrent && items.get(lastCurrent);
    if (prev) { prev.classList.remove('is-current'); prev.removeAttribute('aria-current'); }
    const link = id && items.get(id);
    if (link) {
      link.classList.add('is-current');
      link.setAttribute('aria-current', 'true');
      link.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
    lastCurrent = id;
  };

  if (!('IntersectionObserver' in window)) {
    if (steps[0]) setCurrent(steps[0].id);
    return;
  }

  const visible = new Map();
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio);
        else visible.delete(entry.target.id);
      }
      let best = null;
      let bestRatio = -1;
      for (const [id, ratio] of visible) {
        if (!items.has(id)) continue;
        if (ratio > bestRatio) { bestRatio = ratio; best = id; }
      }
      if (best) setCurrent(best);
    },
    { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
  );

  for (const s of steps) { if (s.id) io.observe(s); }
})();
