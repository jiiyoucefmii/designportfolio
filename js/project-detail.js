import { PROJECTS_DETAIL_DATA } from './project-detail-data.js';

let currentProjectsData = { ...PROJECTS_DETAIL_DATA };

function buildDetailDataFromConfig(configDict) {
  const result = {};
  const entries = Object.entries(configDict);
  entries.forEach(([key, project], idx) => {
    const nextKey = project.nextProjectId || (idx + 1 < entries.length ? entries[idx + 1][0] : entries[0][0]);
    const nextProjectObj = configDict[nextKey] || entries[0][1];
    result[key] = {
      ...project,
      nextProject: {
        id: nextProjectObj.id,
        title: nextProjectObj.title,
        subtitle: nextProjectObj.subtitle,
        cardImage: nextProjectObj.thumbnail
      }
    };
  });
  return result;
}

function resolveProjectId() {
  // 1. Check URL query param: ?id=becht
  const urlParams = new URLSearchParams(window.location.search);
  const queryId = urlParams.get('id');
  if (queryId && queryId.trim()) return queryId.trim().toLowerCase();

  // 2. Check path slug backwards (e.g. /noctael or /noctael/ or /noctael/index.html)
  const pathParts = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  for (let i = pathParts.length - 1; i >= 0; i--) {
    let seg = pathParts[i].replace(/\.html$/i, '').trim().toLowerCase();
    if (seg && !['index', 'project-detail', 'projects', 'dashboard', 'work'].includes(seg)) {
      return seg;
    }
  }

  return 'becht';
}

async function loadLiveProjectData() {
  // Check API if available with anti-cache query
  try {
    const res = await fetch(`/api/projects?_t=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && data.projects && Object.keys(data.projects).length > 0) {
        currentProjectsData = buildDetailDataFromConfig(data.projects);
        try {
          localStorage.setItem('builtbyjimi_projects_cache', JSON.stringify(data.projects));
        } catch (_) {}
        return;
      }
    }
  } catch (_) {}

  // Fallback to local storage cache if available
  try {
    const cached = localStorage.getItem('builtbyjimi_projects_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Object.keys(parsed).length > 0) {
        currentProjectsData = buildDetailDataFromConfig(parsed);
      }
    }
  } catch (_) {}
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initProjectDetail();
  });
} else {
  initProjectDetail();
}

async function initProjectDetail() {
  // Fetch live updates first
  await loadLiveProjectData();

  // 1. Resolve Project ID from URL path or query
  const projectId = resolveProjectId();
  const project = currentProjectsData[projectId] || PROJECTS_DETAIL_DATA[projectId] || currentProjectsData['becht'] || PROJECTS_DETAIL_DATA['becht'];

  if (!project) {
    window.location.replace('/becht');
    return;
  }

  // Ensure clean URL in browser address bar (e.g. /becht instead of project-detail.html?id=becht)
  const currentPath = window.location.pathname;
  if (window.location.search.includes('id=') || currentPath.includes('project-detail.html')) {
    try {
      window.history.replaceState({ projectId }, '', `/${projectId}`);
    } catch (_) {}
  }

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

// Live real-time sync with CMS Dashboard
if (typeof BroadcastChannel !== 'undefined') {
  const channel = new BroadcastChannel('builtbyjimi_cms');
  channel.onmessage = async (event) => {
    if (event.data && event.data.type === 'PROJECTS_UPDATED') {
      console.log('[CMS Sync] Project update detected, re-rendering project detail...');
      await loadLiveProjectData();
      const projectId = resolveProjectId();
      const updatedProject = currentProjectsData[projectId] || PROJECTS_DETAIL_DATA[projectId];
      if (updatedProject) {
        document.title = `${updatedProject.title} — BuiltByJimi`;
        renderHero(updatedProject);
        renderHeader(updatedProject);
        renderAssetsStream(updatedProject);
        renderNextProject(updatedProject);
        initVideoControllers();
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      }
    }
  };
}

window.addEventListener('storage', async (e) => {
  if (e.key === 'builtbyjimi_cms_updated' || e.key === 'builtbyjimi_projects_cache') {
    await loadLiveProjectData();
    const projectId = resolveProjectId();
    const updatedProject = currentProjectsData[projectId] || PROJECTS_DETAIL_DATA[projectId];
    if (updatedProject) {
      document.title = `${updatedProject.title} — BuiltByJimi`;
      renderHero(updatedProject);
      renderHeader(updatedProject);
      renderAssetsStream(updatedProject);
      renderNextProject(updatedProject);
      initVideoControllers();
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }
  }
});

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

  if (hero.imageSrc) {
    contentHtml = `
      <img class="hero-image-element" src="${hero.imageSrc}" alt="${escapeHtml(project.title)}">
    `;
  } else if (hero.type === 'video' && hero.videoSrc) {
    contentHtml = `
      <video class="hero-video-element" autoplay loop muted playsinline poster="${hero.poster || ''}">
        <source src="${hero.videoSrc}" type="video/mp4">
      </video>
    `;
  } else {
    const textColor = hero.textColor || '#A8CEF8';
    const displayTitle = hero.title || project.title.toUpperCase();
    contentHtml = `
      <div class="hero-brand-graphic" style="color: ${textColor};">
        <h1 class="hero-brand-title">${escapeHtml(displayTitle)}</h1>
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
  const isVid = item.type === 'video' || (item.src && (item.src.toLowerCase().endsWith('.mp4') || item.src.toLowerCase().endsWith('.webm')));
  if (isVid) {
    const aspectStyle = item.aspect ? `style="aspect-ratio: ${item.aspect};"` : '';
    const aspectClass = (item.aspect === '1/1' || item.aspect === '1:1') ? 'aspect-1-1' : '';
    return `
      <div class="asset-card">
        <div class="asset-video-wrapper ${aspectClass}" ${aspectStyle}>
          ${item.src ? `
            <video class="asset-video-element" autoplay loop muted playsinline webkit-playsinline poster="${item.poster || ''}">
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

  const nextUrl = `/${next.id}`;

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
  const videos = document.querySelectorAll('video');

  videos.forEach(video => {
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.play().catch(() => {});
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.15 });

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
