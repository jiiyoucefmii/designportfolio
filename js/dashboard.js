/**
 * BUILTBYJIMI CMS & ASSET STUDIO CONTROLLER
 * Handles project switching, visual stream block reordering/swapping,
 * hero section live previews, asset uploads, and backend synchronization.
 */

import { PROJECTS_CONFIG } from './projects-config.js';

class DashboardController {
  constructor() {
    this.projects = { ...PROJECTS_CONFIG };
    this.currentId = 'becht';
    this.currentProject = this.projects[this.currentId];
    this.currentAssets = [];
    this.pickerCallback = null;

    this.initElements();
    this.bindEvents();
    this.loadInitialData();
  }

  initElements() {
    // Topbar & Nav
    this.projectSearchInput = document.getElementById('projectSearchInput');
    this.sidebarProjectsList = document.getElementById('sidebarProjectsList');
    this.topbarProjectTitle = document.getElementById('topbarProjectTitle');
    this.topbarLiveBadge = document.getElementById('topbarLiveBadge');
    this.toggleLiveDetail = document.getElementById('toggleLiveDetail');
    this.btnPreviewProject = document.getElementById('btnPreviewProject');
    this.btnSaveProject = document.getElementById('btnSaveProject');
    this.btnExportConfig = document.getElementById('btnExportConfig');
    this.serverStatusText = document.getElementById('serverStatusText');

    // Tabs
    this.tabButtons = document.querySelectorAll('.tab-btn');
    this.tabPanes = document.querySelectorAll('.tab-pane');

    // Tab 1: Visual Blocks Stream
    this.blocksStreamList = document.getElementById('blocksStreamList');
    this.btnAddBlockSingle = document.getElementById('btnAddBlockSingle');
    this.btnAddBlockDouble = document.getElementById('btnAddBlockDouble');

    // Tab 2: Hero & Transitions
    this.heroTitleInput = document.getElementById('heroTitleInput');
    this.heroBgColorPicker = document.getElementById('heroBgColorPicker');
    this.heroBgColorText = document.getElementById('heroBgColorText');
    this.heroImageSrcInput = document.getElementById('heroImageSrcInput');
    this.btnPickHeroImage = document.getElementById('btnPickHeroImage');
    this.heroLivePreviewBox = document.getElementById('heroLivePreviewBox');
    this.heroLivePreviewOverlay = document.getElementById('heroLivePreviewOverlay');
    this.heroLivePreviewTitle = document.getElementById('heroLivePreviewTitle');
    this.pinBaseImageInput = document.getElementById('pinBaseImageInput');
    this.btnPickPinImage = document.getElementById('btnPickPinImage');
    this.nextProjectIdSelect = document.getElementById('nextProjectIdSelect');

    // Tab 3: Narrative & Meta
    this.projectTitleInput = document.getElementById('projectTitleInput');
    this.projectSubtitleInput = document.getElementById('projectSubtitleInput');
    this.projectIndustryInput = document.getElementById('projectIndustryInput');
    this.projectYearInput = document.getElementById('projectYearInput');
    this.projectNumberInput = document.getElementById('projectNumberInput');
    this.catBranding = document.getElementById('catBranding');
    this.catDigital = document.getElementById('catDigital');
    this.projectSummaryInput = document.getElementById('projectSummaryInput');
    this.projectThumbnailInput = document.getElementById('projectThumbnailInput');
    this.btnPickThumbnail = document.getElementById('btnPickThumbnail');
    this.servicesTagsContainer = document.getElementById('servicesTagsContainer');
    this.newServiceInput = document.getElementById('newServiceInput');
    this.narrativeSubheadingInput = document.getElementById('narrativeSubheadingInput');
    this.narrativeParagraphsInput = document.getElementById('narrativeParagraphsInput');

    // Tab 4: Media Library
    this.mediaLibraryGrid = document.getElementById('mediaLibraryGrid');
    this.mediaCountText = document.getElementById('mediaCountText');
    this.mediaDropzone = document.getElementById('mediaDropzone');
    this.dropzoneFileInput = document.getElementById('dropzoneFileInput');

    // Modal
    this.assetPickerModal = document.getElementById('assetPickerModal');
    this.assetPickerModalTitle = document.getElementById('assetPickerModalTitle');
    this.modalMediaGrid = document.getElementById('modalMediaGrid');
    this.modalAssetSearch = document.getElementById('modalAssetSearch');
    this.btnModalClose = document.getElementById('btnModalClose');
    this.btnModalUploadTrigger = document.getElementById('btnModalUploadTrigger');
    this.modalFileInput = document.getElementById('modalFileInput');

    // Toasts
    this.toastContainer = document.getElementById('toastContainer');
  }

  bindEvents() {
    // Search filter
    this.projectSearchInput.addEventListener('input', (e) => this.renderSidebar(e.target.value));

    // Tabs switching
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.tabButtons.forEach(b => b.classList.remove('active'));
        this.tabPanes.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(btn.dataset.tab);
        if (target) target.classList.add('active');
      });
    });

    // Save shortcut (Ctrl+S / Cmd+S)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveChanges();
      }
    });

    this.btnSaveProject.addEventListener('click', () => this.saveChanges());
    this.btnExportConfig.addEventListener('click', () => this.exportConfigJSON());

    // Live toggle
    this.toggleLiveDetail.addEventListener('change', (e) => {
      this.currentProject.isLive = e.target.checked;
      this.updateLiveBadges();
      this.renderSidebar(this.projectSearchInput.value);
      this.showToast(e.target.checked ? 'Project marked as LIVE DETAIL. Hit "Save Changes" (Ctrl+S) to publish.' : 'Project set to CARD ONLY. Hit "Save Changes" (Ctrl+S) to apply.');
    });

    // Hero Live Controls
    this.heroTitleInput.addEventListener('input', (e) => {
      if (!this.currentProject.hero) this.currentProject.hero = {};
      this.currentProject.hero.title = e.target.value;
      this.updateHeroPreview();
    });

    this.heroBgColorPicker.addEventListener('input', (e) => {
      this.heroBgColorText.value = e.target.value;
      this.setHeroBgColor(e.target.value);
    });

    this.heroBgColorText.addEventListener('input', (e) => {
      this.heroBgColorPicker.value = e.target.value;
      this.setHeroBgColor(e.target.value);
    });

    document.querySelectorAll('.color-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        this.heroBgColorPicker.value = color;
        this.heroBgColorText.value = color;
        this.setHeroBgColor(color);
      });
    });

    this.btnPickThumbnail = document.getElementById('btnPickThumbnail');
    if (this.btnPickThumbnail) {
      this.btnPickThumbnail.addEventListener('click', () => {
        this.openAssetPicker('Choose Card Thumbnail (Work Carousel & Grid)', (asset) => {
          this.currentProject.thumbnail = asset.relPath;
          if (this.projectThumbnailInput) this.projectThumbnailInput.value = asset.relPath;
          this.showToast(`Set "${asset.name}" as Card Thumbnail`);
        });
      });
    }

    this.btnPickHeroImage.addEventListener('click', () => {
      this.openAssetPicker('Choose Hero Image / Graphic', (asset) => {
        if (!this.currentProject.hero) this.currentProject.hero = {};
        this.currentProject.hero.imageSrc = asset.relPath;
        this.currentProject.hero.type = 'image';
        this.heroImageSrcInput.value = asset.relPath;
        this.updateHeroPreview();
        this.showToast(`Set "${asset.name}" as Hero Image`);
      });
    });

    this.btnPickPinImage.addEventListener('click', () => {
      this.openAssetPicker('Choose Pinned Base Container Asset', (asset) => {
        this.currentProject.pinBaseImage = asset.relPath;
        this.pinBaseImageInput.value = asset.relPath;
      });
    });

    this.nextProjectIdSelect.addEventListener('change', (e) => {
      this.currentProject.nextProjectId = e.target.value;
    });

    // Narrative & Meta listeners
    this.projectTitleInput.addEventListener('input', (e) => {
      this.currentProject.title = e.target.value;
      this.topbarProjectTitle.textContent = e.target.value;
      this.renderSidebar();
    });

    this.projectSubtitleInput.addEventListener('input', (e) => {
      this.currentProject.subtitle = e.target.value;
    });

    this.projectIndustryInput.addEventListener('input', (e) => {
      this.currentProject.industry = e.target.value;
    });

    this.projectYearInput.addEventListener('input', (e) => {
      this.currentProject.year = e.target.value;
    });

    this.projectNumberInput.addEventListener('input', (e) => {
      this.currentProject.number = e.target.value;
      this.renderSidebar();
    });

    this.catBranding.addEventListener('change', () => this.syncCategoriesFromInputs());
    this.catDigital.addEventListener('change', () => this.syncCategoriesFromInputs());

    this.projectSummaryInput.addEventListener('input', (e) => {
      this.currentProject.summary = e.target.value;
    });

    // Services Manager
    this.newServiceInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = this.newServiceInput.value.trim().toUpperCase();
        if (val) {
          if (!this.currentProject.services) this.currentProject.services = [];
          if (!this.currentProject.services.includes(val)) {
            this.currentProject.services.push(val);
            this.renderServicesTags();
          }
          this.newServiceInput.value = '';
        }
      }
    });

    this.narrativeSubheadingInput.addEventListener('input', (e) => {
      if (!this.currentProject.narrative) this.currentProject.narrative = {};
      this.currentProject.narrative.subheading = e.target.value;
    });

    this.narrativeParagraphsInput.addEventListener('input', (e) => {
      if (!this.currentProject.narrative) this.currentProject.narrative = {};
      this.currentProject.narrative.paragraphs = e.target.value
        .split('\n\n')
        .map(p => p.trim())
        .filter(Boolean);
    });

    // Blocks stream buttons
    this.btnAddBlockSingle.addEventListener('click', () => {
      this.openAssetPicker('Select Asset for 1-Col Block', (asset) => {
        if (!this.currentProject.blocks) this.currentProject.blocks = [];
        this.currentProject.blocks.push({
          layout: '1-col',
          type: asset.isVideo ? 'video' : 'image',
          src: asset.relPath,
          alt: asset.name.replace(/\.[^/.]+$/, '')
        });
        this.renderBlocksStream();
        this.showToast('1-Column Block added');
      });
    });

    this.btnAddBlockDouble.addEventListener('click', () => {
      this.openAssetPicker('Select First Item for 2-Col Pair (Column 1)', (asset1) => {
        if (!this.currentProject.blocks) this.currentProject.blocks = [];
        const isVid1 = asset1.isVideo || (asset1.relPath && asset1.relPath.toLowerCase().endsWith('.mp4'));
        const newBlock = {
          layout: '2-col',
          items: [
            {
              type: isVid1 ? 'video' : 'image',
              src: asset1.relPath,
              alt: asset1.name ? asset1.name.replace(/\.[^/.]+$/, '') : ''
            },
            {
              type: 'image',
              src: '',
              alt: ''
            }
          ]
        };
        this.currentProject.blocks.push(newBlock);
        this.renderBlocksStream();
        this.showToast('Column 1 selected! Now select Column 2 (or pick later).');

        setTimeout(() => {
          this.openAssetPicker('Select Second Item for 2-Col Pair (Column 2)', (asset2) => {
            const isVid2 = asset2.isVideo || (asset2.relPath && asset2.relPath.toLowerCase().endsWith('.mp4'));
            newBlock.items[1] = {
              type: isVid2 ? 'video' : 'image',
              src: asset2.relPath,
              alt: asset2.name ? asset2.name.replace(/\.[^/.]+$/, '') : ''
            };
            this.renderBlocksStream();
            this.showToast('2-Column Pair added successfully!');
          });
        }, 100);
      });
    });

    // Dropzone Uploads
    this.mediaDropzone.addEventListener('click', () => this.dropzoneFileInput.click());
    this.dropzoneFileInput.addEventListener('change', (e) => this.handleFilesUpload(e.target.files));

    ['dragenter', 'dragover'].forEach(name => {
      this.mediaDropzone.addEventListener(name, (e) => {
        e.preventDefault();
        this.mediaDropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      this.mediaDropzone.addEventListener(name, (e) => {
        e.preventDefault();
        this.mediaDropzone.classList.remove('dragover');
      });
    });

    this.mediaDropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files.length) {
        this.handleFilesUpload(e.dataTransfer.files);
      }
    });

    // Modal controls
    this.btnModalClose.addEventListener('click', () => this.closeAssetPicker());
    this.assetPickerModal.addEventListener('click', (e) => {
      if (e.target === this.assetPickerModal) this.closeAssetPicker();
    });

    this.btnModalUploadTrigger.addEventListener('click', () => this.modalFileInput.click());
    this.modalFileInput.addEventListener('change', async (e) => {
      if (e.target.files.length) {
        const file = e.target.files[0];
        const uploaded = await this.uploadSingleFile(file);
        if (uploaded && this.pickerCallback) {
          const cb = this.pickerCallback;
          this.closeAssetPicker();
          cb(uploaded);
        }
      }
    });

    this.modalAssetSearch.addEventListener('input', (e) => {
      this.renderModalAssets(e.target.value);
    });
  }

  async loadInitialData() {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        if (data && data.projects && Object.keys(data.projects).length > 0) {
          this.projects = data.projects;
          this.serverStatusText.textContent = 'Server Connected (Port 3000)';
        }
      }
    } catch (e) {
      console.warn('Using bundled projects config fallback', e);
      this.serverStatusText.textContent = 'Offline / Direct Mode';
    }

    // Set default project
    if (!this.projects[this.currentId]) {
      this.currentId = Object.keys(this.projects)[0];
    }
    this.currentProject = this.projects[this.currentId];

    this.populateNextProjectDropdown();
    this.renderSidebar();
    this.selectProject(this.currentId);
  }

  selectProject(id) {
    if (!this.projects[id]) return;
    this.currentId = id;
    this.currentProject = this.projects[id];

    // Update Topbar
    this.topbarProjectTitle.textContent = this.currentProject.title || id;
    this.btnPreviewProject.href = `/${id}`;
    this.updateLiveBadges();

    // Populate Tab 1: Visual Blocks
    this.renderBlocksStream();

    // Populate Tab 2: Hero & Transitions
    this.heroTitleInput.value = (this.currentProject.hero && this.currentProject.hero.title) || '';
    const bg = (this.currentProject.hero && this.currentProject.hero.bg) || '#212121';
    this.heroBgColorPicker.value = bg;
    this.heroBgColorText.value = bg;
    this.setHeroBgColor(bg);

    const heroImg = (this.currentProject.hero && this.currentProject.hero.imageSrc) || '';
    this.heroImageSrcInput.value = heroImg;
    this.updateHeroPreview();

    this.pinBaseImageInput.value = this.currentProject.pinBaseImage || '';
    this.nextProjectIdSelect.value = this.currentProject.nextProjectId || '';

    // Populate Tab 3: Narrative & Meta
    this.projectTitleInput.value = this.currentProject.title || '';
    this.projectSubtitleInput.value = this.currentProject.subtitle || '';
    this.projectIndustryInput.value = this.currentProject.industry || '';
    this.projectYearInput.value = this.currentProject.year || '2024';
    this.projectNumberInput.value = this.currentProject.number || '01';

    const cats = this.currentProject.categories || [];
    this.catBranding.checked = cats.includes('branding');
    this.catDigital.checked = cats.includes('digital-design');

    this.projectSummaryInput.value = this.currentProject.summary || '';
    if (this.projectThumbnailInput) {
      this.projectThumbnailInput.value = this.currentProject.thumbnail || '';
    }
    this.renderServicesTags();

    if (this.currentProject.narrative) {
      this.narrativeSubheadingInput.value = this.currentProject.narrative.subheading || '';
      this.narrativeParagraphsInput.value = (this.currentProject.narrative.paragraphs || []).join('\n\n');
    } else {
      this.narrativeSubheadingInput.value = '';
      this.narrativeParagraphsInput.value = '';
    }

    // Populate Tab 4: Media Assets
    this.loadProjectAssets();

    // Update Sidebar Active state
    document.querySelectorAll('.project-nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === id);
    });
  }

  updateLiveBadges() {
    const isLive = Boolean(
      this.currentProject.isLive !== undefined
        ? this.currentProject.isLive
        : (this.currentId === 'becht' || this.currentId === 'asiancooks')
    );
    this.currentProject.isLive = isLive;
    this.toggleLiveDetail.checked = isLive;
    if (isLive) {
      this.topbarLiveBadge.className = 'nav-item-badge badge-live';
      this.topbarLiveBadge.textContent = 'LIVE DETAIL';
    } else {
      this.topbarLiveBadge.className = 'nav-item-badge badge-card';
      this.topbarLiveBadge.textContent = 'CARD ONLY';
    }
  }

  renderSidebar(filterQuery = '') {
    const query = filterQuery.toLowerCase().trim();
    this.sidebarProjectsList.innerHTML = '';

    Object.entries(this.projects).forEach(([id, p]) => {
      const match = !query || p.title.toLowerCase().includes(query) || (p.industry && p.industry.toLowerCase().includes(query));
      if (!match) return;

      const isLive = Boolean(p.isLive !== undefined ? p.isLive : (id === 'becht' || id === 'asiancooks'));
      const item = document.createElement('div');
      item.className = `project-nav-item ${id === this.currentId ? 'active' : ''}`;
      item.dataset.id = id;

      item.innerHTML = `
        <div class="nav-item-num">${p.number || '01'}</div>
        <div class="nav-item-info">
          <div class="nav-item-title">${p.title}</div>
          <div class="nav-item-subtitle">${p.subtitle || p.industry || ''}</div>
        </div>
        <span class="nav-item-badge ${isLive ? 'badge-live' : 'badge-card'}">
          ${isLive ? 'LIVE' : 'CARD'}
        </span>
      `;

      item.addEventListener('click', () => this.selectProject(id));
      this.sidebarProjectsList.appendChild(item);
    });
  }

  populateNextProjectDropdown() {
    this.nextProjectIdSelect.innerHTML = '';
    Object.entries(this.projects).forEach(([id, p]) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = `${p.number || ''} — ${p.title}`;
      this.nextProjectIdSelect.appendChild(opt);
    });
  }

  setHeroBgColor(color) {
    if (!this.currentProject.hero) this.currentProject.hero = {};
    this.currentProject.hero.bg = color;
    this.heroLivePreviewBox.style.backgroundColor = color;
  }

  updateHeroPreview() {
    const title = (this.currentProject.hero && this.currentProject.hero.title) || this.currentProject.title || '';
    this.heroLivePreviewTitle.innerHTML = title.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');

    const img = (this.currentProject.hero && this.currentProject.hero.imageSrc) || '';
    if (img) {
      this.heroLivePreviewOverlay.style.backgroundImage = `url('${img}')`;
    } else {
      this.heroLivePreviewOverlay.style.backgroundImage = 'none';
    }
  }

  syncCategoriesFromInputs() {
    const cats = [];
    if (this.catBranding.checked) cats.push('branding');
    if (this.catDigital.checked) cats.push('digital-design');
    this.currentProject.categories = cats;
  }

  renderServicesTags() {
    const services = this.currentProject.services || [];
    // Remove existing pills except input
    const existingPills = this.servicesTagsContainer.querySelectorAll('.tag-pill');
    existingPills.forEach(p => p.remove());

    services.forEach((s, idx) => {
      const pill = document.createElement('div');
      pill.className = 'tag-pill';
      pill.innerHTML = `
        <span>${s}</span>
        <span class="remove-tag" data-idx="${idx}">&times;</span>
      `;
      pill.querySelector('.remove-tag').addEventListener('click', (e) => {
        e.stopPropagation();
        this.currentProject.services.splice(idx, 1);
        this.renderServicesTags();
      });
      this.servicesTagsContainer.insertBefore(pill, this.newServiceInput);
    });
  }

  /* --------------------------------------------------------------------------
     VISUAL BLOCKS STREAM
     -------------------------------------------------------------------------- */
  renderBlocksStream() {
    const blocks = this.currentProject.blocks || [];
    this.blocksStreamList.innerHTML = '';

    if (blocks.length === 0) {
      this.blocksStreamList.innerHTML = `
        <div style="padding: 40px; text-align: center; color: var(--text-muted); font-size: 13px;">
          No showcase blocks added yet. Click "+ Add 1-Col Block" or "+ Add 2-Col Pair" above.
        </div>
      `;
      return;
    }

    blocks.forEach((block, idx) => {
      const card = document.createElement('div');
      card.className = 'stream-block-card';

      const isSingle = block.layout === '1-col';

      card.innerHTML = `
        <div class="block-card-header">
          <div class="block-type-pill">
            <span class="block-index-badge">#${idx + 1}</span>
            <span>${isSingle ? '1-Column Full Width' : '2-Column Side-by-Side'}</span>
            ${block.type === 'video' ? '<span style="color: #4ea8de; font-size: 10px;">[VIDEO]</span>' : ''}
          </div>
          <div class="block-controls">
            ${!isSingle ? `
              <button class="block-action-btn swap-col-btn" title="Swap Columns">⇄</button>
            ` : ''}
            <button class="block-action-btn move-up-btn" title="Move Up" ${idx === 0 ? 'disabled style="opacity:0.3;"' : ''}>▲</button>
            <button class="block-action-btn move-down-btn" title="Move Down" ${idx === blocks.length - 1 ? 'disabled style="opacity:0.3;"' : ''}>▼</button>
            <button class="block-action-btn delete-btn" title="Delete Block">✕</button>
          </div>
        </div>
        <div class="block-body">
          ${isSingle ? this.getSingleBlockHTML(block) : this.getDoubleBlockHTML(block)}
        </div>
      `;

      // Event bindings for block card
      const moveUpBtn = card.querySelector('.move-up-btn');
      if (moveUpBtn && idx > 0) {
        moveUpBtn.addEventListener('click', () => {
          const temp = blocks[idx];
          blocks[idx] = blocks[idx - 1];
          blocks[idx - 1] = temp;
          this.renderBlocksStream();
        });
      }

      const moveDownBtn = card.querySelector('.move-down-btn');
      if (moveDownBtn && idx < blocks.length - 1) {
        moveDownBtn.addEventListener('click', () => {
          const temp = blocks[idx];
          blocks[idx] = blocks[idx + 1];
          blocks[idx + 1] = temp;
          this.renderBlocksStream();
        });
      }

      const swapBtn = card.querySelector('.swap-col-btn');
      if (swapBtn && block.items && block.items.length === 2) {
        swapBtn.addEventListener('click', () => {
          const temp = block.items[0];
          block.items[0] = block.items[1];
          block.items[1] = temp;
          this.renderBlocksStream();
          this.showToast(`Swapped columns in Block #${idx + 1}`);
        });
      }

      const deleteBtn = card.querySelector('.delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          blocks.splice(idx, 1);
          this.renderBlocksStream();
          this.showToast(`Block #${idx + 1} deleted`);
        });
      }

      // Slot replacement click
      if (isSingle) {
        const slot = card.querySelector('.block-media-preview-single');
        if (slot) {
          slot.addEventListener('click', () => {
            this.openAssetPicker('Replace Media for 1-Col Block', (asset) => {
              block.src = asset.relPath;
              block.type = asset.isVideo ? 'video' : 'image';
              this.renderBlocksStream();
            });
          });
        }
      } else {
        const slots = card.querySelectorAll('.double-slot-box');
        slots.forEach(sBox => {
          const slotIdx = parseInt(sBox.dataset.slot, 10);
          sBox.addEventListener('click', () => {
            this.openAssetPicker(`Replace Media for Column ${slotIdx + 1}`, (asset) => {
              block.items[slotIdx].src = asset.relPath;
              block.items[slotIdx].type = (asset.isVideo || asset.relPath.toLowerCase().endsWith('.mp4')) ? 'video' : 'image';
              this.renderBlocksStream();
            });
          });
        });
      }

      card.querySelectorAll('video').forEach(vid => {
        vid.muted = true;
        vid.defaultMuted = true;
        vid.loop = true;
        vid.play().catch(() => {});
      });

      this.blocksStreamList.appendChild(card);
    });
  }

  getSingleBlockHTML(block) {
    const isVid = block.type === 'video' || (block.src && (block.src.toLowerCase().endsWith('.mp4') || block.src.toLowerCase().endsWith('.webm')));
    return `
      <div class="block-media-preview-single">
        ${isVid ? `<video src="${block.src}" muted loop autoplay playsinline webkit-playsinline></video>` : `<img src="${block.src}" alt="${block.alt || ''}">`}
        <div class="slot-actions-overlay">
          <button class="slot-btn">Change Media</button>
        </div>
      </div>
    `;
  }

  getDoubleBlockHTML(block) {
    const items = block.items || [{}, {}];
    return `
      <div class="block-media-preview-double">
        ${items.map((item, idx) => {
          const isVid = item.type === 'video' || (item.src && (item.src.toLowerCase().endsWith('.mp4') || item.src.toLowerCase().endsWith('.webm')));
          return `
            <div class="double-slot-box" data-slot="${idx}">
              <span class="slot-label">COL ${idx + 1}</span>
              ${item.src ? (isVid ? `<video src="${item.src}" muted loop autoplay playsinline webkit-playsinline></video>` : `<img src="${item.src}" alt="${item.alt || ''}">`) : '<div style="color: var(--text-muted); font-size: 11px;">Empty Slot</div>'}
              <div class="slot-actions-overlay">
                <button class="slot-btn">Replace</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  /* --------------------------------------------------------------------------
     MEDIA LIBRARY & ASSETS API
     -------------------------------------------------------------------------- */
  async loadProjectAssets() {
    this.mediaLibraryGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 30px; color: var(--text-muted);">
        Loading assets...
      </div>
    `;

    try {
      const res = await fetch(`/api/assets?project=${this.currentId}`);
      if (res.ok) {
        const data = await res.json();
        this.currentAssets = data.files || [];
        this.renderMediaLibrary();
        return;
      }
    } catch (e) {
      console.warn('API /api/assets not available, checking extracted media.', e);
    }

    // Fallback: extract from project's own blocks + hero
    const fallbackList = [];
    if (this.currentProject.thumbnail) fallbackList.push({ name: 'thumbnail', relPath: this.currentProject.thumbnail, isImage: true });
    if (this.currentProject.hero && this.currentProject.hero.imageSrc) {
      fallbackList.push({ name: 'hero', relPath: this.currentProject.hero.imageSrc, isImage: true });
    }
    (this.currentProject.blocks || []).forEach(b => {
      if (b.src) fallbackList.push({ name: b.alt || 'block', relPath: b.src, isImage: b.type !== 'video' });
      if (b.items) {
        b.items.forEach(it => {
          if (it.src) fallbackList.push({ name: it.alt || 'block', relPath: it.src, isImage: it.type !== 'video' });
        });
      }
    });

    this.currentAssets = fallbackList;
    this.renderMediaLibrary();
  }

  renderMediaLibrary() {
    this.mediaCountText.textContent = `${this.currentAssets.length} Assets in project folder`;
    this.mediaLibraryGrid.innerHTML = '';

    if (this.currentAssets.length === 0) {
      this.mediaLibraryGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
          No files uploaded for this project yet. Drag files into the box above.
        </div>
      `;
      return;
    }

    this.currentAssets.forEach(asset => {
      const card = document.createElement('div');
      card.className = 'media-card';

      const isVid = asset.isVideo || (asset.relPath && (asset.relPath.toLowerCase().endsWith('.mp4') || asset.relPath.toLowerCase().endsWith('.webm'))) || (asset.name && (asset.name.toLowerCase().endsWith('.mp4') || asset.name.toLowerCase().endsWith('.webm')));

      card.innerHTML = `
        <div class="media-thumb">
          ${isVid ? `<video src="${asset.relPath}" muted loop autoplay playsinline webkit-playsinline></video>` : `<img src="${asset.relPath}" alt="${asset.name}" loading="lazy">`}
        </div>
        <div class="media-info">
          <div class="media-filename" title="${asset.name}">${asset.name}</div>
          <div class="media-meta">
            <span>${isVid ? 'MP4 VIDEO' : 'IMAGE'}</span>
            <span>${asset.sizeFormatted || ''}</span>
          </div>
          <div class="media-actions">
            <button class="media-btn btn-use-card" title="Set as Card Thumbnail">Card</button>
            <button class="media-btn btn-use-hero" title="Set as Hero Banner">Hero</button>
            <button class="media-btn btn-add-stream" title="Add as 1-Col Block">+ Stream</button>
            <button class="media-btn btn-copy-path" title="Copy Relative Path">Copy</button>
          </div>
        </div>
      `;

      const vid = card.querySelector('video');
      if (vid) {
        vid.muted = true;
        vid.defaultMuted = true;
        vid.loop = true;
        vid.play().catch(() => {});
      }

      card.querySelector('.btn-use-card').addEventListener('click', () => {
        this.currentProject.thumbnail = asset.relPath;
        if (this.projectThumbnailInput) this.projectThumbnailInput.value = asset.relPath;
        this.showToast(`Set "${asset.name}" as Card Thumbnail`);
      });

      card.querySelector('.btn-use-hero').addEventListener('click', () => {
        if (!this.currentProject.hero) this.currentProject.hero = {};
        this.currentProject.hero.imageSrc = asset.relPath;
        this.currentProject.hero.type = 'image';
        this.heroImageSrcInput.value = asset.relPath;
        this.updateHeroPreview();
        this.showToast(`Set "${asset.name}" as Hero Image`);
      });

      card.querySelector('.btn-add-stream').addEventListener('click', () => {
        if (!this.currentProject.blocks) this.currentProject.blocks = [];
        this.currentProject.blocks.push({
          layout: '1-col',
          type: isVid ? 'video' : 'image',
          src: asset.relPath,
          alt: asset.name.replace(/\.[^/.]+$/, '')
        });
        this.renderBlocksStream();
        this.showToast(`Added "${asset.name}" to Visual Stream`);
      });

      card.querySelector('.btn-copy-path').addEventListener('click', () => {
        navigator.clipboard.writeText(asset.relPath);
        this.showToast('Copied asset path to clipboard');
      });

      this.mediaLibraryGrid.appendChild(card);
    });
  }

  async handleFilesUpload(files) {
    if (!files || files.length === 0) return;
    this.showToast(`Uploading ${files.length} file(s)...`);

    for (let i = 0; i < files.length; i++) {
      await this.uploadSingleFile(files[i]);
    }

    this.showToast('All files uploaded successfully!');
    await this.loadProjectAssets();
  }

  async uploadSingleFile(file) {
    try {
      const url = `/api/upload?project=${this.currentId}&filename=${encodeURIComponent(file.name)}`;
      const res = await fetch(url, {
        method: 'POST',
        body: file
      });
      if (res.ok) {
        const data = await res.json();
        return {
          name: data.name,
          relPath: data.relPath,
          isVideo: file.type.startsWith('video/'),
          isImage: file.type.startsWith('image/')
        };
      } else {
        const err = await res.json();
        this.showToast(`Upload failed: ${err.message || 'Server error'}`, true);
      }
    } catch (e) {
      this.showToast(`Upload error: ${e.message}`, true);
    }
    return null;
  }

  /* --------------------------------------------------------------------------
     ASSET PICKER MODAL
     -------------------------------------------------------------------------- */
  openAssetPicker(title, onSelectCallback) {
    this.assetPickerModalTitle.textContent = title;
    this.pickerCallback = onSelectCallback;
    this.modalAssetSearch.value = '';
    this.renderModalAssets('');
    this.assetPickerModal.classList.add('active');
  }

  closeAssetPicker() {
    this.assetPickerModal.classList.remove('active');
    this.pickerCallback = null;
  }

  renderModalAssets(query = '') {
    const q = query.toLowerCase().trim();
    this.modalMediaGrid.innerHTML = '';

    const filtered = this.currentAssets.filter(a => !q || a.name.toLowerCase().includes(q));

    if (filtered.length === 0) {
      this.modalMediaGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 30px; color: var(--text-muted);">
          No matching assets found. Use the "+ Upload New File" button above.
        </div>
      `;
      return;
    }

    filtered.forEach(asset => {
      const card = document.createElement('div');
      card.className = 'media-card';
      card.style.cursor = 'pointer';

      const isVid = asset.isVideo || (asset.relPath && (asset.relPath.toLowerCase().endsWith('.mp4') || asset.relPath.toLowerCase().endsWith('.webm'))) || (asset.name && (asset.name.toLowerCase().endsWith('.mp4') || asset.name.toLowerCase().endsWith('.webm')));

      card.innerHTML = `
        <div class="media-thumb">
          ${isVid ? `<video src="${asset.relPath}" muted loop autoplay playsinline webkit-playsinline></video>` : `<img src="${asset.relPath}" alt="${asset.name}">`}
        </div>
        <div class="media-info">
          <div class="media-filename">${asset.name}</div>
        </div>
      `;

      const vid = card.querySelector('video');
      if (vid) {
        vid.muted = true;
        vid.defaultMuted = true;
        vid.loop = true;
        vid.play().catch(() => {});
      }

      card.addEventListener('click', () => {
        if (this.pickerCallback) {
          const cb = this.pickerCallback;
          this.closeAssetPicker();
          cb(asset);
        }
      });

      this.modalMediaGrid.appendChild(card);
    });
  }

  /* --------------------------------------------------------------------------
     FORM SYNC & SAVE WORKFLOW
     -------------------------------------------------------------------------- */
  syncFormToProject() {
    if (!this.currentProject) return;

    this.currentProject.title = this.projectTitleInput.value.trim();
    this.currentProject.subtitle = this.projectSubtitleInput.value.trim();
    this.currentProject.industry = this.projectIndustryInput.value.trim();
    this.currentProject.year = this.projectYearInput.value.trim();
    this.currentProject.number = this.projectNumberInput.value.trim();
    if (this.projectThumbnailInput && this.projectThumbnailInput.value) {
      this.currentProject.thumbnail = this.projectThumbnailInput.value.trim();
    }
    this.currentProject.summary = this.projectSummaryInput.value.trim();

    this.syncCategoriesFromInputs();

    if (!this.currentProject.hero) this.currentProject.hero = {};
    this.currentProject.hero.title = this.heroTitleInput.value;
    this.currentProject.hero.bg = this.heroBgColorText.value || this.heroBgColorPicker.value;
    if (this.heroImageSrcInput.value) {
      this.currentProject.hero.imageSrc = this.heroImageSrcInput.value;
      this.currentProject.hero.type = 'image';
    }

    if (this.pinBaseImageInput.value) {
      this.currentProject.pinBaseImage = this.pinBaseImageInput.value;
    }
    this.currentProject.nextProjectId = this.nextProjectIdSelect.value;

    if (!this.currentProject.narrative) this.currentProject.narrative = {};
    this.currentProject.narrative.subheading = this.narrativeSubheadingInput.value.trim();
    this.currentProject.narrative.paragraphs = this.narrativeParagraphsInput.value
      .split('\n\n')
      .map(p => p.trim())
      .filter(Boolean);

    this.currentProject.isLive = this.toggleLiveDetail.checked;
  }

  async saveChanges() {
    this.syncFormToProject();
    this.btnSaveProject.style.opacity = '0.6';
    this.btnSaveProject.textContent = 'Saving...';

    try {
      const payload = { projects: this.projects };
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        this.showToast('All changes saved! Directly applied to portfolio projects.');
        this.btnPreviewProject.href = `/${this.currentId}`;
        this.renderSidebar(this.projectSearchInput.value);

        // Update local storage cache
        try {
          localStorage.setItem('builtbyjimi_projects_cache', JSON.stringify(this.projects));
          localStorage.setItem('builtbyjimi_cms_updated', Date.now().toString());
        } catch (_) {}

        // Broadcast to all open portfolio tabs
        if (typeof BroadcastChannel !== 'undefined') {
          const channel = new BroadcastChannel('builtbyjimi_cms');
          channel.postMessage({ type: 'PROJECTS_UPDATED', timestamp: Date.now(), projectId: this.currentId });
        }
      } else {
        const data = await res.json();
        this.showToast(`Save failed: ${data.message}`, true);
      }
    } catch (e) {
      console.warn('Backend /api/save unreachable. Falling back to JSON export.', e);
      this.showToast('Server offline. Exported configuration JSON file instead.', true);
      this.exportConfigJSON();
    } finally {
      this.btnSaveProject.style.opacity = '1';
      this.btnSaveProject.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        Save Changes <span class="kbd-shortcut">Ctrl+S</span>
      `;
    }
  }

  exportConfigJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.projects, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `projects-config-backup-${Date.now()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    this.showToast('Downloaded configuration backup JSON');
  }

  showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${isError 
          ? '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>' 
          : '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
        }
      </svg>
      <span>${message}</span>
    `;
    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new DashboardController();
});
