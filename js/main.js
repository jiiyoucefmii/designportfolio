/**
 * BUILTBYJIMI - MAIN JAVASCRIPT
 * Animation Architecture:
 * - Lenis: Premium smooth scrolling with momentum
 * - GSAP & ScrollTrigger: Main scroll animations, pinned center video shrink timeline,
 *   staggered text reveals, work card parallax, and manifesto spotlight
 * - CSS: Micro hover/focus transitions
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lenis Smooth Scroll
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
  });

  // Connect Lenis to GSAP ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  } else {
    // Fallback animation frame loop
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // 2. GSAP + ScrollTrigger: Sticky Hero Video Pinning & Shrink Timeline
  // Requirement: "for the hero section video on scroll it should stay in center of the screen
  // until it gets smaller then the scroll should continue to other content"
  const heroSection = document.getElementById('heroSection');
  const heroVideoWrapper = document.getElementById('heroVideoWrapper');

  if (heroSection && heroVideoWrapper && typeof gsap !== 'undefined') {
    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5, // buttery smooth scrub with Lenis
        invalidateOnRefresh: true,
      }
    });

    // Initial state: full screen minus 16px padding on all directions
    // Target state on scroll: 253px on desktop, 220px on mobile
    const getTargetScale = () => {
      const initialHeight = window.innerHeight - 32;
      const targetHeight = window.innerWidth <= 768 ? 220 : 253;
      return Math.min(Math.max(targetHeight / initialHeight, 0.28), 0.85);
    };

    heroTl.fromTo(
      heroVideoWrapper,
      {
        scale: 1.0,
        borderRadius: 8,
      },
      {
        scale: () => getTargetScale(),
        borderRadius: 16,
        boxShadow: '0 30px 80px rgba(0, 0, 0, 0.95)',
        ease: 'power2.inOut',
      }
    );

    // Ensure responsive resize updates target scale accurately
    window.addEventListener('resize', () => {
      ScrollTrigger.refresh();
    });

    // 3. GSAP Parallax & Reveal: Staggered Featured Work Cards
    const workCards = document.querySelectorAll('.work-card');
    if (workCards.length > 0) {
      workCards.forEach((card, index) => {
        // Staggered fade in & slide up
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
          y: 60,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          delay: (index % 3) * 0.12,
        });

        // Subtle image parallax effect within card wrap
        const img = card.querySelector('.card-image-wrap img');
        if (img) {
          gsap.fromTo(img, 
            { yPercent: -6 },
            {
              yPercent: 6,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              }
            }
          );
        }
      });
    }

    // 4. GSAP Text Reveal for WHO statement and Manifesto
    const whoStatement = document.querySelector('.who-statement');
    if (whoStatement) {
      gsap.from(whoStatement, {
        scrollTrigger: {
          trigger: whoStatement,
          start: 'top 85%',
        },
        y: 40,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out'
      });
    }

    const manifestoHeading = document.querySelector('.manifesto-heading');
    if (manifestoHeading) {
      gsap.from(manifestoHeading, {
        scrollTrigger: {
          trigger: manifestoHeading,
          start: 'top 80%',
        },
        y: 50,
        opacity: 0,
        duration: 1.4,
        ease: 'power3.out'
      });
    }

    // Services list subtle stagger
    const serviceItems = document.querySelectorAll('.service-item');
    if (serviceItems.length > 0) {
      gsap.from(serviceItems, {
        scrollTrigger: {
          trigger: '.services-list',
          start: 'top 80%',
        },
        y: 35,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: 'power2.out'
      });
    }
  }

  // 5. Video Controls: Play/Pause, Mute/Unmute & Progress
  const heroVideo = document.getElementById('heroVideo');
  const playPauseBtn = document.getElementById('videoPlayPauseBtn');
  const muteBtn = document.getElementById('videoMuteBtn');
  const progressFill = document.getElementById('videoProgressFill');
  const progressBar = document.querySelector('.video-progress-bar');
  const skipTopBtn = document.getElementById('skipTopBtn');

  if (heroVideo && playPauseBtn) {
    const iconPause = playPauseBtn.querySelector('.icon-pause');
    const iconPlay = playPauseBtn.querySelector('.icon-play');

    playPauseBtn.addEventListener('click', () => {
      if (heroVideo.paused) {
        heroVideo.play();
        if (iconPause) iconPause.style.display = 'block';
        if (iconPlay) iconPlay.style.display = 'none';
      } else {
        heroVideo.pause();
        if (iconPause) iconPause.style.display = 'none';
        if (iconPlay) iconPlay.style.display = 'block';
      }
    });

    heroVideo.addEventListener('timeupdate', () => {
      if (heroVideo.duration) {
        const pct = (heroVideo.currentTime / heroVideo.duration) * 100;
        if (progressFill) progressFill.style.width = `${pct}%`;
      }
    });

    if (progressBar) {
      progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const clickPos = (e.clientX - rect.left) / rect.width;
        if (heroVideo.duration) {
          heroVideo.currentTime = clickPos * heroVideo.duration;
        }
      });
    }
  }

  if (heroVideo && muteBtn) {
    const iconMuted = muteBtn.querySelector('.icon-muted');
    const iconUnmuted = muteBtn.querySelector('.icon-unmuted');

    muteBtn.addEventListener('click', () => {
      heroVideo.muted = !heroVideo.muted;
      if (heroVideo.muted) {
        if (iconMuted) iconMuted.style.display = 'block';
        if (iconUnmuted) iconUnmuted.style.display = 'none';
      } else {
        if (iconMuted) iconMuted.style.display = 'none';
        if (iconUnmuted) iconUnmuted.style.display = 'block';
      }
    });
  }

  // 6. Smooth Scroll To Top with Lenis
  if (skipTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 600) {
        skipTopBtn.classList.add('visible');
      } else {
        skipTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    skipTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      lenis.scrollTo(0, { duration: 1.5 });
    });
  }

  // 7. Interactive Services Accordion:
  // - Clicking a non-selected service starts by dropping down its subtitles first
  // - Shortly after (staggered delay), the previous drop down collapses smoothly
  // - Animations run slower and more luxuriously
  const serviceItemsList = document.querySelectorAll('.service-item');
  let currentActiveItem = document.querySelector('.service-item.active-highlight');

  serviceItemsList.forEach((item) => {
    const toggleBtn = item.querySelector('.service-toggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (item === currentActiveItem) return;

      const previousItem = currentActiveItem;

      // 1. FIRST: Drop down subtitles of clicked service immediately
      item.classList.add('active-highlight');
      const title = item.querySelector('.service-title');
      if (title) title.classList.add('lime-accent');
      toggleBtn.setAttribute('aria-expanded', 'true');
      currentActiveItem = item;

      // 2. SHORTLY AFTER: Collapse the previous service item
      if (previousItem) {
        setTimeout(() => {
          previousItem.classList.remove('active-highlight');
          const prevTitle = previousItem.querySelector('.service-title');
          const prevBtn = previousItem.querySelector('.service-toggle');
          if (prevTitle) prevTitle.classList.remove('lime-accent');
          if (prevBtn) prevBtn.setAttribute('aria-expanded', 'false');
        }, 180); // 180ms organic overlap delay
      }

      // 3. Refresh ScrollTrigger & Lenis after transitions settle
      setTimeout(() => {
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      }, 850);
    });
  });

  // Smooth scroll for nav anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          lenis.scrollTo(targetEl, { duration: 1.4 });
        }
      }
    });
  });

  // Dynamic Work Cards Clickability Sync from PROJECTS_DATA
  if (typeof PROJECTS_DATA !== 'undefined' && Array.isArray(PROJECTS_DATA)) {
    document.querySelectorAll('.work-card[data-project-id]').forEach((card) => {
      const id = card.getAttribute('data-project-id');
      const proj = PROJECTS_DATA.find((p) => p.id === id);
      const isLive = proj && Boolean(proj.isLive || proj.link || id === 'becht' || id === 'asiancooks');
      const currentInner = card.querySelector('.card-inner');
      if (!currentInner) return;

      if (isLive) {
        let linkEl = currentInner;
        if (currentInner.tagName !== 'A') {
          linkEl = document.createElement('a');
          linkEl.className = 'card-inner';
          linkEl.href = (proj && proj.link) || `project-detail.html?id=${id}`;
          linkEl.innerHTML = currentInner.innerHTML;
          currentInner.replaceWith(linkEl);
        } else {
          linkEl.href = (proj && proj.link) || `project-detail.html?id=${id}`;
          linkEl.classList.remove('is-non-clickable');
        }

        // Live image & text sync
        if (proj.image) {
          const img = linkEl.querySelector('.card-image-wrap img');
          if (img && img.getAttribute('src') !== proj.image) {
            img.src = proj.image;
          }
        }
        if (proj.title) {
          const title = linkEl.querySelector('.card-title');
          if (title) title.textContent = proj.title;
        }
        if (proj.subtitle || proj.industry) {
          const sub = linkEl.querySelector('.card-subtitle');
          if (sub) sub.textContent = proj.subtitle || proj.industry;
        }
      } else {
        if (currentInner.tagName === 'A') {
          const div = document.createElement('div');
          div.className = 'card-inner is-non-clickable';
          div.innerHTML = currentInner.innerHTML;
          currentInner.replaceWith(div);
        } else {
          currentInner.classList.add('is-non-clickable');
        }
      }
    });
  }
});
