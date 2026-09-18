/**
 * Modular Project Detail Renderer & Video Controller
 * BUILTBYJIMI
 */

import { PROJECTS_DETAIL_DATA } from './project-detail-data.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initProjectDetail();
  });
} else {
  initProjectDetail();
}

function initProjectDetail() {
  // 1. Resolve Project ID from URL query param
  const urlParams = new URLSearchParams(window.location.search);
  let projectId = urlParams.get('id');

  // Project detail is only available currently for becht and asiancooks
  const allowedProjects = ['becht', 'asiancooks'];
  if (!projectId || !allowedProjects.includes(projectId) || !PROJECTS_DETAIL_DATA[projectId]) {
    window.location.replace('project-detail.html?id=becht');
    return;
  }

  const project = PROJECTS_DETAIL_DATA[projectId];
  if (!project) return;

  // 2. Set Page Title
  document.title = `${project.title} — BuiltByJimi`;

  // 3. Render All Modular Sections
  renderHero(project);
  renderHeader(project);
  renderAssetsStream(project);
  renderNextProject(project);

  // 4. Bind Hero Top Action Buttons
  setupHeroActions();

  // 5. Initialize Video Controllers & Intersection Observers
  initVideoControllers();

  // 6. Initialize GSAP ScrollTrigger Pinned Side Drawer Reveal
  initNextProjectScrollPin();

  // 7. Refresh ScrollTrigger once full window and media assets load
  window.addEventListener('load', () => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });

  setTimeout(() => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }, 300);

  setTimeout(() => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }, 1000);
}

/**
 * 1. Render Fullscreen Hero Section (16px outer padding)
 */
function renderHero(project) {
  const mediaWrapper = document.getElementById('heroMediaWrapper');
  const heroBox = document.getElementById('heroBox');
  if (!mediaWrapper || !heroBox || !project.hero) return;

  const hero = project.hero;

  // Apply custom background if defined
  if (hero.bg) {
    heroBox.style.backgroundColor = hero.bg;
  }

  let contentHtml = '';

  if (hero.type === 'brand_graphic') {
    const textColor = hero.textColor || '#A8CEF8';
    const displayTitle = hero.title || project.title.toUpperCase();
    contentHtml = `
      <div class="hero-brand-graphic" style="color: ${textColor};">
        <h1 class="hero-brand-title">${escapeHtml(displayTitle)}</h1>
      </div>
    `;
  } else if (hero.type === 'video' && hero.videoSrc) {
    contentHtml = `
      <video class="hero-video-element" autoplay loop muted playsinline poster="${hero.poster || ''}">
        <source src="${hero.videoSrc}" type="video/mp4">
      </video>
    `;
  } else if (hero.imageSrc) {
    contentHtml = `
      <img class="hero-image-element" src="${hero.imageSrc}" alt="${escapeHtml(project.title)}">
    `;
  } else {
    // Default graphic
    contentHtml = `
      <div class="hero-brand-graphic" style="color: #A8CEF8;">
        <h1 class="hero-brand-title">${escapeHtml(project.title.toUpperCase())}</h1>
      </div>
    `;
  }

  mediaWrapper.innerHTML = contentHtml;
}

/**
 * Hero Action Buttons (Expand to Fullscreen & Scroll Down)
 */
function setupHeroActions() {
  const expandBtn = document.getElementById('heroExpandBtn');
  const skipBtn = document.getElementById('heroSkipBtn');
  const heroBox = document.getElementById('heroBox');
  const headerSection = document.getElementById('headerSection');

  if (expandBtn && heroBox) {
    expandBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        if (heroBox.requestFullscreen) heroBox.requestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    });
  }

  if (skipBtn && headerSection) {
    skipBtn.addEventListener('click', () => {
      headerSection.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

/**
 * 2. Render Project Header (Matching exact Figma Desktop & Mobile designs)
 */
function renderHeader(project) {
  const headerSection = document.getElementById('headerSection');
  if (!headerSection) return;

  const narrative = project.narrative || {};
  const paragraphsHtml = (narrative.paragraphs || [])
    .map(p => `<p>${escapeHtml(p)}</p>`)
    .join('');

  const servicesHtml = (project.services || [])
    .map(s => `<span class="badge-grey">${escapeHtml(s.toUpperCase())}</span>`)
    .join('');

  headerSection.innerHTML = `
    <div class="detail-header-frame">
      <!-- Title Row (Large Editorial Serif) -->
      <div class="header-title-row">
        <h2 class="header-project-title">${escapeHtml(project.title)}</h2>
      </div>

      <!-- Divider line under title -->
      <div class="header-divider-line"></div>

      <!-- Main Content Grid (Desktop 2-Col / Mobile Stack) -->
      <div class="header-content-grid">
        <!-- Left Column: Metadata Box -->
        <div class="header-left-meta">
          <!-- Industry -->
          <div class="meta-industry-block">
            <span class="meta-label">INDUSTRY</span>
            <span class="badge-green">${escapeHtml((project.industry || 'Digital').toUpperCase())}</span>
          </div>

          <!-- What I Did -->
          <div class="meta-services-block">
            <span class="meta-label">WHAT I DID</span>
            <div class="badges-grey-group">
              ${servicesHtml}
            </div>
          </div>
        </div>

        <!-- Right Column: Narrative Story & Actions -->
        <div class="header-right-story">
          <div class="story-copy-box">
            ${narrative.subheading ? `<h3 class="story-subheading">${escapeHtml(narrative.subheading)}</h3>` : ''}
            <div class="story-paragraphs">
              ${paragraphsHtml}
            </div>
          </div>

          <div class="story-actions-row">
            <button class="story-btn-more" id="storyMoreBtn">More Info</button>
            ${(narrative.links || []).map(link => `
              <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="story-btn-green" id="storyProjectLink">
                ${escapeHtml(link.label || 'Visit Website ↗')}
              </a>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 3. Render Assets Presenting Layout (1-Col or 2-Col, 16px side padding, 20px gaps)
 */
function renderAssetsStream(project) {
  const stream = document.getElementById('assetsStream');
  if (!stream || !project.blocks) return;

  const rowsMarkup = project.blocks.map((block, idx) => {
    // 2-Column Asset Row
    if (block.layout === '2-col' && Array.isArray(block.items)) {
      const colItemsHtml = block.items.map((item, itemIdx) => renderSingleAssetMarkup(item, `${idx}-${itemIdx}`)).join('');
      return `
        <div class="asset-row-2col" id="asset-row-${idx}">
          ${colItemsHtml}
        </div>
      `;
    }

    // 1-Column Asset Row
    return `
      <div class="asset-row-1col" id="asset-row-${idx}">
        ${renderSingleAssetMarkup(block, idx)}
      </div>
    `;
  }).join('');

  stream.innerHTML = rowsMarkup;

  // Refresh ScrollTrigger as images load to guarantee trigger positions are 100% accurate
  const streamImgs = stream.querySelectorAll('img');
  streamImgs.forEach(img => {
    if (!img.complete) {
      img.addEventListener('load', () => {
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      });
    }
  });
}

/**
 * Render single asset element (Video or Image)
 */
function renderSingleAssetMarkup(item, id) {
  if (item.type === 'video') {
    const aspectStyle = item.aspect ? `style="aspect-ratio: ${item.aspect};"` : '';
    const aspectClass = (item.aspect === '1/1' || item.aspect === '1:1') ? 'aspect-1-1' : '';
    return `
      <div class="asset-card">
        <div class="asset-video-wrapper ${aspectClass}" ${aspectStyle}>
          ${item.src ? `
            <video class="asset-video-element" autoplay loop muted playsinline poster="${item.poster || ''}">
              <source src="${item.src}" type="video/mp4">
            </video>
          ` : `
            <img class="asset-video-poster" src="${item.poster || ''}" alt="${escapeHtml(item.label || 'Project visual')}">
          `}
        </div>
      </div>
    `;
  }

  // Regular image (no lazy-load delay so document height is computed immediately)
  return `
    <div class="asset-card">
      <img src="${item.src}" alt="${escapeHtml(item.alt || 'Project showcase')}">
    </div>
  `;
}

/**
 * 4. Render Next Project Side Drawer & Teaser Data
 */
function renderNextProject(project) {
  const next = project.nextProject;
  if (!next) return;

  const baseInner = document.querySelector('.next-base-inner');
  const drawerLink = document.getElementById('nextDrawerLink');
  const teaserImg = document.getElementById('nextTeaserImg');
  const teaserTitle = document.getElementById('nextTeaserTitle');
  const teaserSubtitle = document.getElementById('nextTeaserSubtitle');

  const nextUrl = `./project-detail.html?id=${next.id}`;

  const mediaSrc = project.pinBaseVideo || project.pinBaseImage || project.hero?.imageSrc || '';
  const isVideo = mediaSrc.toLowerCase().endsWith('.mp4') || project.pinBaseType === 'video';

  if (baseInner) {
    if (isVideo) {
      baseInner.innerHTML = `
        <video class="next-base-video" id="nextBaseVideo" autoplay loop muted playsinline>
          <source src="${mediaSrc}" type="video/mp4">
        </video>
      `;
      const vid = baseInner.querySelector('video');
      if (vid) vid.play().catch(() => {});
    } else {
      baseInner.innerHTML = `
        <img class="next-base-img" id="nextBaseImg" src="${mediaSrc}" alt="${project.title || 'Current Project Visual'}">
      `;
    }
  }

  if (drawerLink) drawerLink.href = nextUrl;
  if (teaserImg) {
    teaserImg.src = next.cardImage || next.coverImage || next.drawerImage || '';
    teaserImg.alt = next.title || 'Next Project';
  }

  if (teaserTitle) teaserTitle.textContent = next.title || '';
  if (teaserSubtitle) teaserSubtitle.textContent = next.subtitle ? next.subtitle.toUpperCase() : '';
}

/**
 * 5. GSAP ScrollTrigger: Pinned Horizontal Reveal / Side Drawer Transition (Desktop only)
 * On mobile screens (<= 768px), drawer is static with zero animation as shown in nextprojectframemobile.
 */
function initNextProjectScrollPin() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP or ScrollTrigger not loaded');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const pinSection = document.getElementById('nextProjectPinSection');
  const drawerPanel = document.getElementById('nextDrawerLink');
  const baseAsset = document.getElementById('nextBaseAsset');

  if (!pinSection || !drawerPanel) return;

  // Kill existing scroll triggers for this section if re-initializing
  ScrollTrigger.getAll().forEach(t => {
    if (t.trigger === pinSection) t.kill();
  });

  ScrollTrigger.matchMedia({
    // Desktop: Smooth pinned horizontal side drawer reveal
    "(min-width: 769px)": function() {
      gsap.set(drawerPanel, { clearProps: "transform" });
      gsap.set(drawerPanel, { xPercent: 100 });
      if (baseAsset) gsap.set(baseAsset, { opacity: 1, display: 'block' });

      const pinTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: pinSection,
          start: "top top",
          end: "+=220%",
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      pinTimeline.fromTo(drawerPanel,
        { xPercent: 100 },
        { xPercent: 0, ease: "none" },
        0
      );

      if (baseAsset) {
        pinTimeline.fromTo(baseAsset,
          { opacity: 1 },
          { opacity: 0.7, ease: "none" },
          0
        );
      }
    },

    // Mobile: Strictly static, no pinning, no translate
    "(max-width: 768px)": function() {
      gsap.set(drawerPanel, { clearProps: "all" });
      if (baseAsset) gsap.set(baseAsset, { clearProps: "all" });
    }
  });

  ScrollTrigger.refresh();
}

/**
 * Video Autoplay & Viewport IntersectionObserver (Continuous Loop, No Controls)
 */
function initVideoControllers() {
  const videos = document.querySelectorAll('.asset-video-element');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.25 });

  videos.forEach(video => {
    observer.observe(video);
  });
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
