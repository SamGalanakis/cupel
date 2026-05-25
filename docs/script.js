// Rail scroll-spy: mark the section currently in view as current in the top rail.
(function () {
  const steps = document.querySelectorAll('.step');
  const items = new Map();
  for (const link of document.querySelectorAll('.rail a')) {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) continue;
    items.set(href.slice(1), link);
  }
  if (!items.size) return;

  let lastCurrent = null;
  const setCurrent = (id) => {
    if (lastCurrent === id) return;
    if (lastCurrent && items.get(lastCurrent)) items.get(lastCurrent).classList.remove('is-current');
    const link = id && items.get(id);
    if (link) {
      link.classList.add('is-current');
      // Keep the active rail item in view when it scrolls horizontally.
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
