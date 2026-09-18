# BuiltByJimi — Portfolio

A high-performance design studio portfolio website crafted with precision from Figma designs, featuring inertial smooth scrolling, center-pinned hero video shrink animations, interactive services exploration, and responsive layouts for desktop and mobile.

## Tech Stack
- **HTML5 & Vanilla CSS**: Custom CSS variables, responsive typography clamps, and tailored layout systems.
- **Lenis**: Inertial momentum smooth scrolling.
- **GSAP & ScrollTrigger**: Timeline animations, sticky center video scaling, and scroll reveals.
- **Python**: Local dev server with live reloading via `dev.py`.

## Getting Started

### Local Development
Run the livereload development server:
```bash
py -3.12 dev.py
```
Open `http://localhost:3000` in your browser. Any edits made to HTML, CSS, or JS files will automatically refresh in the browser.

## Features
- **Hero Video Interaction**: Fullscreen hero container that pins to viewport center on scroll and gracefully scales down.
- **Services Accordion & Mobile Presentation**: Interactive hover and expand features on desktop, and comprehensive stacked presentation on mobile screens.
- **Featured Work Grid**: Dynamic cards with alternating aspect ratios, typography hierarchy, numbers, and project taglines.
- **Approach & Why Sections**: 100% white 1px dividers, ultra-thin serif typography, and centered manifesto display.
- **Responsive Layout**: Adheres directly to both desktop and mobile Figma frames.
