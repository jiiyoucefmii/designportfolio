/**
 * BUILTBYJIMI - PROJECTS PAGE CONTROLLER
 * Infinite seamlessly looping carousel across all projects (no bounds),
 * with touch/swipe, wheel, keyboard navigation, filter tabs, and detail modal.
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

  let activeFilter = null; // null = no category filter, shows all projects
  let filteredList = [...PROJECTS_DATA];
  let currentIndex = 0;
  let isAnimating = false;

  // Pointer drag state
  let isDragging = false;
  let startX = 0;
  let currentX = 0;
  let startOffset = 0;
  let hasMoved = false;

  // Calculate target translate offset to center a card
  function getTargetOffset(idx) {
    const cards = track.querySelectorAll('.project-card');
    const targetCard = cards[idx];
    if (!targetCard) return 0;
    const viewportWidth = viewport.offsetWidth;
    const cardLeft = targetCard.offsetLeft;
    const cardWidth = targetCard.offsetWidth;
    return (viewportWidth / 2) - (cardLeft + cardWidth / 2);
  }

  // Update active class on cards
  function updateActiveClasses(targetIdx) {
    const cards = track.querySelectorAll('.project-card');
    cards.forEach((card, idx) => {
      card.classList.toggle('active', idx === targetIdx);
    });
  }

  // Go to a specific index (instant or animated)
  function goToIndex(targetIdx, animate = true) {
    const cards = track.querySelectorAll('.project-card');
    if (cards.length === 0) return;

    currentIndex = targetIdx;
    updateActiveClasses(currentIndex);

    const targetOffset = getTargetOffset(currentIndex);

    if (!animate) {
      track.style.transition = 'none';
      track.style.transform = `translateX(${targetOffset}px)`;
      void track.offsetWidth; // force reflow
      return;
    }

    isAnimating = true;
    track.style.transition = 'transform 0.52s cubic-bezier(0.16, 1, 0.3, 1)';
    track.style.transform = `translateX(${targetOffset}px)`;
  }

  function goToNext() {
    goToIndex(currentIndex + 1, true);
  }

  function goToPrev() {
    goToIndex(currentIndex - 1, true);
  }

  // Seamless boundary wrap when transition finishes
  track.addEventListener('transitionend', (e) => {
    if (e.target !== track) return;
    isAnimating = false;
    const N = filteredList.length;
    if (N <= 1) return;

    // If we scrolled past middle set into Copy 2 (idx >= 2 * N)
    if (currentIndex >= 2 * N) {
      currentIndex = currentIndex - N;
      goToIndex(currentIndex, false); // instantaneous jump to identical item in Copy 1
    }
    // If we scrolled before middle set into Copy 0 (idx < N)
    else if (currentIndex < N) {
      currentIndex = currentIndex + N;
      goToIndex(currentIndex, false); // instantaneous jump to identical item in Copy 1
    }
  });

  // Render cards into track with 3 infinite loop copies
  function renderCards() {
    track.style.transition = 'none';
    track.style.transform = 'none';
    track.innerHTML = '';

    if (filteredList.length === 0) {
      track.innerHTML = '<div style="padding: 60px; text-align: center; color: #888;">No projects found in this category.</div>';
      return;
    }

    const N = filteredList.length;
    // For infinite wrap, duplicate 3 sets if more than 1 item
    const repeatCount = N > 1 ? 3 : 1;
    let cardGlobalIndex = 0;

    for (let set = 0; set < repeatCount; set++) {
      filteredList.forEach((proj, realIdx) => {
        const thisCardIndex = cardGlobalIndex;
        const isAvailable = Boolean(proj.link || proj.isLive || proj.id === 'becht' || proj.id === 'asiancooks');
        const card = document.createElement(isAvailable ? 'a' : 'div');
        card.className = `project-card ${isAvailable ? '' : 'is-unavailable'}`.trim();
        if (isAvailable) {
          card.href = proj.link || `project-detail.html?id=${proj.id}`;
        }
        card.setAttribute('data-index', thisCardIndex);
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

        // When thumbnail image loads, refresh carousel centering so variable card width is accounted for
        const img = card.querySelector('.card-media-img');
        if (img) {
          img.addEventListener('load', () => {
            if (!isDragging && !isAnimating) {
              goToIndex(currentIndex, false);
            }
          });
        }

        // Click handler: if user dragged or project is unavailable, prevent navigation
        card.addEventListener('click', (e) => {
          if (hasMoved || !isAvailable) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          // Normal click allows native browser navigation to card.href
        });

        track.appendChild(card);
        cardGlobalIndex++;
      });
    }

    // Start in the middle set (Copy 1) at offset 0
    currentIndex = N > 1 ? N : 0;
    updateActiveClasses(currentIndex);

    // Force layout reflow with transform: none so all cards have accurate rendered dimensions and offsetLeft
    void track.offsetWidth;

    // Center the active card
    const targetOffset = getTargetOffset(currentIndex);
    track.style.transform = `translateX(${targetOffset}px)`;
  }

  // Pointer drag events for desktop, tablet, and mobile
  viewport.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
    currentX = e.clientX;
    startOffset = getTargetOffset(currentIndex);
    track.style.transition = 'none';
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    currentX = e.clientX;
    const deltaX = currentX - startX;
    if (Math.abs(deltaX) > 8) {
      hasMoved = true;
      viewport.classList.add('is-dragging');
    }
    if (hasMoved) {
      track.style.transform = `translateX(${startOffset + deltaX}px)`;
    }
  });

  window.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    viewport.classList.remove('is-dragging');

    if (hasMoved) {
      const deltaX = currentX - startX;
      const threshold = 45;

      if (deltaX < -threshold) {
        goToNext();
      } else if (deltaX > threshold) {
        goToPrev();
      } else {
        // Snap back smoothly
        goToIndex(currentIndex, true);
      }
    }
  });

  window.addEventListener('pointercancel', () => {
    if (!isDragging) return;
    isDragging = false;
    viewport.classList.remove('is-dragging');
    if (hasMoved) {
      goToIndex(currentIndex, true);
    }
  });

  // Mouse wheel horizontal scroll conversion
  let wheelCooldown = false;
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (wheelCooldown) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 15) {
      wheelCooldown = true;
      if (delta > 0) {
        goToNext();
      } else {
        goToPrev();
      }
      setTimeout(() => {
        wheelCooldown = false;
      }, 260);
    }
  }, { passive: false });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      goToNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      goToPrev();
    } else if (e.key === 'Enter') {
      const cards = track.querySelectorAll('.project-card');
      const activeCard = cards[currentIndex];
      if (activeCard && activeCard.tagName.toLowerCase() === 'a') {
        const href = activeCard.getAttribute('href');
        if (href) window.location.href = href;
      }
    }
  });

  // Filter tabs handling
  filterTabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const filter = tab.getAttribute('data-filter');

      if (filter === activeFilter) {
        // Toggle off - deselect filter
        activeFilter = null;
      } else {
        activeFilter = filter;
      }

      filterTabs.forEach((t) => {
        const isSelected = t.getAttribute('data-filter') === activeFilter;
        t.classList.toggle('active', isSelected);
        t.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      });

      if (!activeFilter) {
        filteredList = [...PROJECTS_DATA];
      } else {
        filteredList = PROJECTS_DATA.filter((p) => p.categories && p.categories.includes(activeFilter));
      }

      renderCards();
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
    const isAvailable = proj.id === 'becht' || proj.id === 'asiancooks';
    if (isAvailable) {
      modalLink.href = `project-detail.html?id=${proj.id}`;
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

  // Responsive window resize
  window.addEventListener('resize', () => {
    goToIndex(currentIndex, false);
  });

  // Re-center when all window resources (including cached/decoded images) finish loading
  window.addEventListener('load', () => {
    goToIndex(currentIndex, false);
  });

  // Initial render
  renderCards();
});
