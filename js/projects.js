/**
 * BUILTBYJIMI - PROJECTS PAGE CONTROLLER
 * Ultra-smooth, truly infinite continuous scroll carousel across all projects (no bounds),
 * with touch/swipe drag, continuous mouse wheel / trackpad scrolling, momentum fling,
 * auto-snap, keyboard navigation, category filter tabs, and detail modal.
 */

document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('carouselTrack');
  const viewport = document.getElementById('carouselViewport');
  const filterTabs = document.querySelectorAll('.filter-tab');

  // Modal elements
  const modalOverlay = document.getElementById('projectModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalNum = document.getElementById('modalNum');
  const modalImg = document.getElementById('modalImg');
  const modalIndustry = document.getElementById('modalIndustry');
  const modalRole = document.getElementById('modalRole');
  const modalDesc = document.getElementById('modalDesc');
  const modalLink = document.getElementById('modalLink');

  let allProjectsList = (typeof PROJECTS_DATA !== 'undefined' && Array.isArray(PROJECTS_DATA)) ? [...PROJECTS_DATA] : [];
  let activeFilter = null; // null = all projects
  let filteredList = [...allProjectsList];

  // Carousel positioning & physics
  let currentX = 0;
  let targetX = 0;
  let singleSetWidth = 0;
  let centerAnchor = 0;
  let rafId = null;
  let activeCard = null;
  let isSnapping = false;

  // Pointer drag state
  let isPointerDown = false;
  let hasDragged = false;
  let dragStartX = 0;
  let lastPointerX = 0;

  function buildListFromConfig(configDict) {
    return Object.values(configDict).map(p => {
      const isLive = Boolean(p.isLive !== false);
      return {
        id: p.id,
        number: p.number || '01',
        title: p.title || '',
        subtitle: p.subtitle || '',
        industry: p.industry || '',
        role: p.services ? p.services.slice(0, 3).join(' | ') : '',
        categories: p.categories || [],
        image: p.thumbnail || '',
        description: p.summary || '',
        isLive: isLive,
        link: isLive ? `/${p.id}` : null
      };
    });
  }

  async function syncLiveProjects() {
    try {
      const res = await fetch(`/api/projects?_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.projects && Object.keys(data.projects).length > 0) {
          allProjectsList = buildListFromConfig(data.projects);
          applyFilter(false);
          try {
            localStorage.setItem('builtbyjimi_projects_cache', JSON.stringify(data.projects));
          } catch (_) {}
          return;
        }
      }
    } catch (_) {}

    try {
      const cached = localStorage.getItem('builtbyjimi_projects_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Object.keys(parsed).length > 0) {
          allProjectsList = buildListFromConfig(parsed);
          applyFilter(false);
        }
      }
    } catch (_) {}
  }

  function applyFilter(resetPosition = true) {
    if (!activeFilter) {
      filteredList = [...allProjectsList];
    } else {
      filteredList = allProjectsList.filter((p) => p.categories && p.categories.includes(activeFilter));
    }
    renderCards(resetPosition);
  }

  /* --------------------------------------------------------------------------
     GEOMETRY & INFINITE MODULO WRAPPING
     -------------------------------------------------------------------------- */
  function measureSetWidth() {
    const N = filteredList.length;
    if (N <= 1) {
      singleSetWidth = 0;
      centerAnchor = 0;
      return;
    }

    const cards = track.querySelectorAll('.project-card');
    if (cards.length < 3 * N) return;

    const cardA = cards[2 * N];
    const cardB = cards[3 * N];

    if (cardA && cardB) {
      singleSetWidth = cardB.offsetLeft - cardA.offsetLeft;
      const viewportCenter = viewport.offsetWidth / 2;
      const cardCenter = cardA.offsetLeft + cardA.offsetWidth / 2;
      centerAnchor = viewportCenter - cardCenter;
    }
  }

  // Wraps currentX and targetX seamlessly by singleSetWidth so it loops perpetually
  function wrapOffset() {
    if (singleSetWidth <= 0 || filteredList.length <= 1) return;

    const halfSet = singleSetWidth / 2;
    const minX = centerAnchor - singleSetWidth - halfSet;
    const maxX = centerAnchor + halfSet;

    while (currentX < minX) {
      currentX += singleSetWidth;
      targetX += singleSetWidth;
    }
    while (currentX > maxX) {
      currentX -= singleSetWidth;
      targetX -= singleSetWidth;
    }
  }

  function updateActiveCard() {
    const cards = track.querySelectorAll('.project-card');
    if (cards.length === 0) return;

    const viewportCenterTrack = (viewport.offsetWidth / 2) - currentX;
    let closestCard = null;
    let minDistance = Infinity;

    cards.forEach((card) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(cardCenter - viewportCenterTrack);
      if (dist < minDistance) {
        minDistance = dist;
        closestCard = card;
      }
    });

    if (closestCard && closestCard !== activeCard) {
      if (activeCard) activeCard.classList.remove('active');
      closestCard.classList.add('active');
      activeCard = closestCard;
    }
  }

  function applyTransform() {
    track.style.transform = `translate3d(${currentX.toFixed(2)}px, 0, 0)`;
  }

  /* --------------------------------------------------------------------------
     ANIMATION LOOP (RAF Physics & Damping)
     -------------------------------------------------------------------------- */
  function tick() {
    const dist = targetX - currentX;
    if (Math.abs(dist) > 0.4) {
      currentX += dist * (isSnapping ? 0.15 : 0.18);
      wrapOffset();
      applyTransform();
      updateActiveCard();
      rafId = requestAnimationFrame(tick);
    } else {
      currentX = targetX;
      wrapOffset();
      applyTransform();
      updateActiveCard();
      isSnapping = false;
      rafId = null;
    }
  }

  function startAnimation() {
    if (!rafId) {
      rafId = requestAnimationFrame(tick);
    }
  }

  function snapToNearestCard() {
    const cards = track.querySelectorAll('.project-card');
    if (cards.length === 0) return;

    const viewportCenterTrack = (viewport.offsetWidth / 2) - targetX;
    let closestCard = null;
    let minDistance = Infinity;

    cards.forEach((card) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(cardCenter - viewportCenterTrack);
      if (dist < minDistance) {
        minDistance = dist;
        closestCard = card;
      }
    });

    if (closestCard) {
      isSnapping = true;
      targetX = (viewport.offsetWidth / 2) - (closestCard.offsetLeft + closestCard.offsetWidth / 2);
      startAnimation();
    }
  }

  function snapToCard(card) {
    if (!card) return;
    isSnapping = true;
    targetX = (viewport.offsetWidth / 2) - (card.offsetLeft + card.offsetWidth / 2);
    startAnimation();
  }

  function goToNext() {
    if (!activeCard) snapToNearestCard();
    const next = activeCard ? activeCard.nextElementSibling : null;
    if (next && next.classList.contains('project-card')) {
      snapToCard(next);
    } else {
      snapToNearestCard();
    }
  }

  function goToPrev() {
    if (!activeCard) snapToNearestCard();
    const prev = activeCard ? activeCard.previousElementSibling : null;
    if (prev && prev.classList.contains('project-card')) {
      snapToCard(prev);
    } else {
      snapToNearestCard();
    }
  }

  /* --------------------------------------------------------------------------
     RENDER 5 VIRTUAL SETS FOR UNBROKEN INFINITE SCROLL
     -------------------------------------------------------------------------- */
  function renderCards(resetPosition = true) {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    track.innerHTML = '';
    activeCard = null;

    if (filteredList.length === 0) {
      track.innerHTML = '<div style="padding: 60px; text-align: center; color: #888;">No projects found in this category.</div>';
      return;
    }

    const N = filteredList.length;
    const repeatCount = N > 1 ? 5 : 1;
    let cardGlobalIndex = 0;

    for (let set = 0; set < repeatCount; set++) {
      filteredList.forEach((proj, realIdx) => {
        const thisCardIndex = cardGlobalIndex;
        const isAvailable = Boolean(proj.link || proj.isLive || proj.id === 'becht' || proj.id === 'asiancooks');
        const cleanHref = `/${proj.id}`;
        const card = document.createElement(isAvailable ? 'a' : 'div');
        card.className = `project-card ${isAvailable ? '' : 'is-unavailable'}`.trim();
        if (isAvailable) {
          card.href = cleanHref;
        }
        card.setAttribute('data-global-index', thisCardIndex);
        card.setAttribute('data-real-index', realIdx);
        card.setAttribute('data-id', proj.id);
        card.setAttribute('aria-label', `${proj.title} — ${proj.subtitle || proj.industry}`);

        card.innerHTML = `
          <div class="card-header-bar">
            <h2 class="card-title">${proj.title}</h2>
          </div>

          <div class="card-media-box">
            <img class="card-media-img" src="${proj.image}" alt="${proj.title}" draggable="false">
          </div>

          <div class="card-meta-bar">
            <div class="card-number-tag">
              <span class="card-dot-active"></span>
              <span>${proj.number}</span>
            </div>
            <div class="card-details-box">
              <div class="meta-row">
                <span class="meta-label">INDUSTRY</span>
                <span class="meta-val">${proj.industry}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">ROLE</span>
                <span class="meta-val">${proj.role}</span>
              </div>
            </div>
          </div>
        `;

        // When image loads, recalculate set width and keep active card centered
        const img = card.querySelector('.card-media-img');
        if (img) {
          img.addEventListener('load', () => {
            measureSetWidth();
            if (activeCard && !hasDragged && !isSnapping) {
              currentX = (viewport.offsetWidth / 2) - (activeCard.offsetLeft + activeCard.offsetWidth / 2);
              targetX = currentX;
              applyTransform();
              updateActiveCard();
            }
          });
        }

        // Card Click Handler
        card.addEventListener('click', (e) => {
          if (hasDragged) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }

          if (card !== activeCard) {
            e.preventDefault();
            e.stopPropagation();
            snapToCard(card);
            return;
          }

          if (!isAvailable) {
            e.preventDefault();
            openModal(proj);
          }
        });

        track.appendChild(card);
        cardGlobalIndex++;
      });
    }

    void track.offsetWidth;
    measureSetWidth();

    // Center on project 0 of middle set (Set 2)
    const startIndex = N > 1 ? 2 * N : 0;
    const startCard = track.children[startIndex];
    if (startCard) {
      if (activeCard) activeCard.classList.remove('active');
      activeCard = startCard;
      activeCard.classList.add('active');
      currentX = (viewport.offsetWidth / 2) - (startCard.offsetLeft + startCard.offsetWidth / 2);
      targetX = currentX;
      applyTransform();
      updateActiveCard();
    }
  }

  /* --------------------------------------------------------------------------
     INPUT CONTROLS: PINCH SCROLL SWITCH, TOUCH/POINTER DRAG, KEYBOARD
     -------------------------------------------------------------------------- */
  // Scrolling just a pinch automatically switches to adjacent card with respect to direction
  let isWheelThrottled = false;
  let wheelAccumulator = 0;
  let wheelResetTimer = null;

  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (filteredList.length <= 1) return;
    if (isWheelThrottled) return;

    // Detect direction from either vertical (deltaY) or horizontal (deltaX) scroll
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    wheelAccumulator += delta;

    // Threshold: just a pinch (6px of delta) switches immediately
    if (Math.abs(wheelAccumulator) >= 6) {
      isWheelThrottled = true;
      if (wheelAccumulator > 0) {
        goToNext();
      } else {
        goToPrev();
      }
      wheelAccumulator = 0;

      // 360ms cooldown lets the adjacent card smoothly slide and center before next pinch
      setTimeout(() => {
        isWheelThrottled = false;
        wheelAccumulator = 0;
      }, 360);
    } else {
      clearTimeout(wheelResetTimer);
      wheelResetTimer = setTimeout(() => {
        wheelAccumulator = 0;
      }, 140);
    }
  }, { passive: false });

  // Direct Pointer / Touch Swipe
  viewport.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (filteredList.length <= 1) return;

    isPointerDown = true;
    hasDragged = false;
    dragStartX = e.clientX;
    lastPointerX = e.clientX;
  });

  window.addEventListener('pointermove', (e) => {
    if (!isPointerDown) return;
    const diff = e.clientX - dragStartX;
    if (Math.abs(diff) > 10) {
      hasDragged = true;
      viewport.classList.add('is-dragging');
    }
  });

  window.addEventListener('pointerup', (e) => {
    if (!isPointerDown) return;
    isPointerDown = false;
    viewport.classList.remove('is-dragging');

    if (hasDragged) {
      const diff = e.clientX - dragStartX;
      // Light pinch swipe (24px) switches to adjacent card in direction of gesture
      if (diff < -24) {
        goToNext();
      } else if (diff > 24) {
        goToPrev();
      }
      setTimeout(() => {
        hasDragged = false;
      }, 60);
    }
  });

  window.addEventListener('pointercancel', () => {
    isPointerDown = false;
    hasDragged = false;
    viewport.classList.remove('is-dragging');
  });

  // Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      goToNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      goToPrev();
    } else if (e.key === 'Enter') {
      if (activeCard && activeCard.tagName.toLowerCase() === 'a') {
        const href = activeCard.getAttribute('href');
        if (href) window.location.href = href;
      }
    }
  });

  // Filter Tabs
  filterTabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const filter = tab.getAttribute('data-filter');
      activeFilter = (filter === activeFilter) ? null : filter;

      filterTabs.forEach((t) => {
        const isSelected = t.getAttribute('data-filter') === activeFilter;
        t.classList.toggle('active', isSelected);
        t.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      });

      applyFilter(true);
    });
  });

  // Quick View Modal
  function openModal(proj) {
    if (!proj) return;
    modalTitle.textContent = proj.title;
    modalNum.textContent = `PROJECT // ${proj.number}`;
    modalImg.src = proj.image;
    modalImg.alt = proj.title;
    modalIndustry.textContent = proj.industry;
    modalRole.textContent = proj.role;
    modalDesc.textContent = proj.description;
    const isAvailable = Boolean(proj.link || proj.isLive || proj.id === 'becht' || proj.id === 'asiancooks');
    if (isAvailable) {
      modalLink.href = `/${proj.id}`;
      modalLink.textContent = "Open Case Study →";
      modalLink.style.display = 'inline-flex';
    } else {
      modalLink.style.display = 'none';
    }

    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // Responsive resize
  window.addEventListener('resize', () => {
    measureSetWidth();
    if (activeCard) {
      snapToCard(activeCard);
    } else {
      snapToNearestCard();
    }
  });

  // Load & sync initial cards
  renderCards(true);
  syncLiveProjects();

  // Real-time broadcast sync from CMS Dashboard
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel('builtbyjimi_cms');
    channel.onmessage = async (event) => {
      if (event.data && event.data.type === 'PROJECTS_UPDATED') {
        console.log('[CMS Sync] Received project update broadcast in gallery, re-syncing...');
        await syncLiveProjects();
      }
    };
  }

  window.addEventListener('storage', async (e) => {
    if (e.key === 'builtbyjimi_cms_updated' || e.key === 'builtbyjimi_projects_cache') {
      await syncLiveProjects();
    }
  });
});

