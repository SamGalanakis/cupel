// Scroll-spy: mark the section currently in view as current in the sidebar.
(function () {
  const steps = document.querySelectorAll('.step');
  const sidebar = document.querySelector('.sidebar');
  const items = new Map();
  for (const link of document.querySelectorAll('.sidebar a')) {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) continue;
    items.set(href.slice(1), link);
  }
  if (!items.size) return;

  // Keep the active link visible by scrolling the sidebar's OWN overflow only.
  // Never use scrollIntoView: when the sidebar is static (its mobile layout) it
  // is not a scroll container, so scrollIntoView would scroll the whole window
  // back up to the link, fighting the reader.
  const revealInSidebar = (link) => {
    if (!sidebar || sidebar.scrollHeight <= sidebar.clientHeight + 1) return;
    const lr = link.getBoundingClientRect();
    const sr = sidebar.getBoundingClientRect();
    if (lr.top < sr.top) sidebar.scrollTop -= (sr.top - lr.top) + 8;
    else if (lr.bottom > sr.bottom) sidebar.scrollTop += (lr.bottom - sr.bottom) + 8;
  };

  // Reveal only the current section's subsection list; collapse the rest.
  let lastOpenLi = null;
  const openSection = (link) => {
    const li = link.closest('li');
    if (li === lastOpenLi) return;
    if (lastOpenLi) lastOpenLi.classList.remove('is-open');
    if (li && li.querySelector(':scope > .sub')) { li.classList.add('is-open'); lastOpenLi = li; }
    else lastOpenLi = null;
  };

  let lastCurrent = null;
  const setCurrent = (id) => {
    if (lastCurrent === id) return;
    const prev = lastCurrent && items.get(lastCurrent);
    if (prev) { prev.classList.remove('is-current'); prev.removeAttribute('aria-current'); }
    const link = id && items.get(id);
    if (link) {
      link.classList.add('is-current');
      link.setAttribute('aria-current', 'true');
      openSection(link);
      revealInSidebar(link);
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

  // Second spy: highlight the active subsection link within the open section.
  const subTargets = [];
  for (const [id, link] of items) {
    if (!link.closest('.sub')) continue;
    const el = document.getElementById(id);
    if (el) subTargets.push([el, link]);
  }
  if (subTargets.length) {
    const byId = new Map(subTargets.map(([el, link]) => [el.id, link]));
    const subVisible = new Map();
    let lastSub = null;
    const subIo = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) subVisible.set(e.target.id, e.intersectionRatio);
        else subVisible.delete(e.target.id);
      }
      let best = null, bestRatio = -1;
      for (const [id, ratio] of subVisible) { if (ratio > bestRatio) { bestRatio = ratio; best = id; } }
      if (best === lastSub) return;
      if (lastSub) { const l = byId.get(lastSub); if (l) l.classList.remove('is-subcurrent'); }
      if (best) { const l = byId.get(best); if (l) l.classList.add('is-subcurrent'); }
      lastSub = best;
    }, { rootMargin: '-25% 0px -65% 0px', threshold: [0, 1] });
    for (const [el] of subTargets) subIo.observe(el);
  }
})();
