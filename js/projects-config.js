/**
 * BUILTBYJIMI - UNIFIED PROJECTS CONFIGURATION & CONTENT STORE
 * =============================================================
 * Single source of truth for all projects across:
 * - Homepage Featured Work Grid (index.html)
 * - Projects Showcase Carousel & Filters (projects.html)
 * - Modular Project Detail Pages & Side Drawer Transitions (project-detail.html)
 *
 * =============================================================
 * 📋 TEMPLATE: HOW TO ADD OR MODIFY A PROJECT
 * =============================================================
 * Copy and paste the template below into the `PROJECTS_CONFIG` dictionary:
 *
 * "your-project-slug": {
 *   id: "your-project-slug",
 *   number: "09",
 *   title: "Project Title",
 *   subtitle: "Punchy one-sentence tagline",
 *   industry: "INDUSTRY NAME",
 *   year: "2024",
 *   categories: ["branding"], // Choose: "branding" | "digital-design" | "business-design"
 *   thumbnail: "assets/projects/thumbnails/your-thumbnail.png",
 *   summary: "Short description for project cards, quick-view modals, and search previews.",
 *
 *   // --- Project Detail Header Info ---
 *   services: [
 *     "BRANDING",
 *     "CREATIVE DIRECTION",
 *     "VISUAL IDENTITY",
 *     "PRINT DESIGN"
 *   ],
 *   hero: {
 *     type: "brand_graphic", // "brand_graphic" or "image"
 *     bg: "#0a192f",
 *     textColor: "#ffffff",
 *     title: "HERO\nTITLE",
 *     imageSrc: "assets/projects/assets/your-project/logo.png"
 *   },
 *
 *   // --- Narrative Story (Header Right Column) ---
 *   narrative: {
 *     subheading: "Narrative Headline",
 *     paragraphs: [
 *       "First paragraph outlining context, challenge, and client vision.",
 *       "Second paragraph detailing the design execution and approach.",
 *       "Closing paragraph highlighting the impact and result."
 *     ],
 *     links: [
 *       { label: "Visit Project ↗", url: "https://example.com", external: true }
 *     ]
 *   },
 *
 *   // --- Asset Stream (1-Col or 2-Col Rows, Images or Looping Videos) ---
 *   blocks: [
 *     // 1-Column Full Width Asset:
 *     {
 *       layout: "1-col",
 *       type: "image",
 *       src: "assets/projects/assets/your-project/mockup.png",
 *       alt: "Showcase mockup"
 *     },
 *     // 2-Column Side-by-Side Asset Pair:
 *     {
 *       layout: "2-col",
 *       items: [
 *         { type: "image", src: "assets/projects/assets/your-project/item-1.png", alt: "Detail 1" },
 *         { type: "image", src: "assets/projects/assets/your-project/item-2.png", alt: "Detail 2" }
 *       ]
 *     },
 *     // Video Asset (Looping with no controls):
 *     {
 *       layout: "1-col",
 *       type: "video",
 *       src: "assets/projects/assets/your-project/reel.mp4",
 *       poster: "assets/projects/assets/your-project/poster.png",
 *       label: "Motion Reel"
 *     }
 *   ],
 *
 *   // --- Pinned Side Drawer Transition ---
 *   pinBaseImage: "assets/projects/assets/your-project/mockup.png",
 *   nextProjectId: "next-project-slug"
 * }
 * =============================================================
 */

export const PROJECTS_CONFIG = {
  "becht": {
    id: "becht",
    number: "01",
    title: "Alfred Becht GmbH",
    subtitle: "Precision Design for a Specialized Market",
    industry: "DENTAL & MEDICAL HYGIENE",
    year: "2024",
    categories: ["branding", "business-design"],
    thumbnail: "assets/projects/assets/becht/projectcardbecht.png",
    summary: "Visual identity, roll-up banners, point-of-sale branding, and official launch event invitations for BN DENTAL celebrating their appointment as the authorized distributor of Alfred Becht GmbH in Algeria.",
    services: [
      "BRANDING",
      "CREATIVE DIRECTION",
      "VISUAL IDENTITY",
      "EVENT INVITATIONS",
      "PRINT DESIGN",
      "ROLL-UP BANNERS",
      "POS MARKETING"
    ],
    hero: {
      type: "brand_graphic",
      bg: "#0a192f",
      textColor: "#ffffff",
      title: "ALFRED\nBECHT",
      imageSrc: "assets/projects/assets/becht/bechtlogo.png"
    },
    narrative: {
      subheading: "Precision Design for a Specialized Market",
      paragraphs: [
        "This project focused on the brand rollout and event identity for BN DENTAL in Algeria, marking their milestone inauguration as the official authorized distributor of Alfred Becht GmbH — the prestigious German manufacturer of clinical hygiene and dental solutions.",
        "As part of this launch, I designed the formal event invitations for the store's official inauguration ceremony, establishing an authoritative and trustworthy tone for dental clinic directors, medical practitioners, and industry partners.",
        "Alongside the invitations, I created the physical point-of-sale branding and large-format roll-up banners. Given the clinical context, the visuals needed to communicate absolute hygiene standards, chemical safety, and German manufacturing reliability.",
        "I established a clear visual hierarchy so technical certifications and product applications are immediately readable in a physical retail space. This project highlights the importance of precision and restraint — where strong design is about clarity, trust, and purpose."
      ],
      links: [
        { label: "Visit Website ↗", url: "https://www.alfredbecht.de/en/home.html", external: true, primary: true }
      ]
    },
    blocks: [
      {
        layout: "1-col",
        type: "image",
        src: "assets/projects/assets/becht/1columnbecht1.png",
        alt: "Alfred Becht GmbH Clinical Point of Sale Roll-up Banners"
      },
      {
        layout: "1-col",
        type: "image",
        src: "assets/projects/assets/becht/1columnBecht2.png",
        alt: "Alfred Becht GmbH Products and Hygiene Catalogue Presentation"
      },
      {
        layout: "1-col",
        type: "image",
        src: "assets/projects/assets/becht/bechtlogo.png",
        alt: "Alfred Becht GmbH Brand Identity"
      },
      {
        layout: "2-col",
        items: [
          { type: "image", src: "assets/projects/assets/becht/finalbecht1.png", alt: "Becht Rollup Design Final Version 1" },
          { type: "image", src: "assets/projects/assets/becht/finalmodel1.png", alt: "Becht Rollup Design Final Version 2" }
        ]
      },
      {
        layout: "2-col",
        items: [
          {
            type: "image",
            src: "assets/projects/assets/becht/2cnxttovidbecht.png",
            alt: "100 Years Becht Identity and Certification Diagram"
          },
          {
            type: "video",
            src: "assets/projects/assets/becht/2cvidbecht.mp4",
            aspect: "1/1",
            alt: "Becht Roll-up Banners on Site Motion Reel"
          }
        ]
      }
    ],
    pinBaseImage: "assets/projects/assets/becht/1columnbecht1.png",
    nextProjectId: "asiancooks"
  },

  "mitidja": {
    id: "mitidja",
    number: "02",
    title: "Mitidja",
    subtitle: "Reviving a Legacy Through Design",
    industry: "HERITAGE FOOD & CHARCUTERIE",
    year: "2024",
    categories: ["branding", "business-design"],
    thumbnail: "assets/projects/thumbnails/mitidja.png",
    summary: "Revitalizing a legacy Algerian charcuterie brand through a modernized visual identity, product catalogue, tri-fold brochures, flyers, and business stationery.",
    services: [
      "BRANDING",
      "IDENTITY REDESIGN",
      "PACKAGING",
      "CATALOGUE DESIGN",
      "PRINT & RETAIL"
    ],
    hero: {
      type: "brand_graphic",
      bg: "#1e1e1e",
      textColor: "#d4af37",
      title: "MITIDJA\nHERITAGE",
      imageSrc: "assets/projects/assets/mitidja/logomitidja.png"
    },
    narrative: {
      subheading: "Reviving a Legacy Through Design",
      paragraphs: [
        "Mitidja is more than a charcuterie brand, it carries local heritage rooted in Algeria. The challenge was not to reinvent it, but to modernize its presence while preserving its identity.",
        "The process started by studying Mitidja's history, products, and positioning. The goal was clear: maintain the authenticity of the brand while bringing it into a more contemporary and cohesive visual system.",
        "I focused on revamping the brand's digital assets, creating a more unified and professional identity. This meant refining layouts, typography, and visual hierarchy to ensure consistency across touchpoints.",
        "With a clear direction, I developed a full set of print-ready assets for campaigns and daily communication: A5 flyers, a complete product catalogue, a tri-fold brochure, and business cards aligned with the new identity. Beyond standard materials, I extended the identity into larger formats: roll-up banners for events and in-store presence."
      ],
      links: [
        { label: "Stand Reel ↗", url: "https://www.instagram.com/p/DSffbSViLw0/", external: true },
        { label: "Brand Reel ↗", url: "https://www.instagram.com/p/DSk2e1DCMLl/", external: true }
      ]
    },
    blocks: [
      {
        layout: "1-col",
        type: "image",
        src: "assets/projects/assets/mitidja/cartevisite.png",
        alt: "Mitidja Business Card Stationery System"
      },
      {
        layout: "2-col",
        items: [
          { type: "image", src: "assets/projects/assets/mitidja/face -A5.png", alt: "Mitidja Flyer Front Design" },
          { type: "image", src: "assets/projects/assets/mitidja/back -A5.png", alt: "Mitidja Flyer Back Design" }
        ]
      },
      {
        layout: "2-col",
        items: [
          { type: "image", src: "assets/projects/assets/mitidja/face.png", alt: "Mitidja Tri-Fold Brochure Face" },
          { type: "image", src: "assets/projects/assets/mitidja/back.png", alt: "Mitidja Tri-Fold Brochure Back" }
        ]
      }
    ],
    pinBaseImage: "assets/projects/assets/mitidja/cartevisite.png",
    nextProjectId: "noctael"
  },

  "noctael": {
    id: "noctael",
    number: "03",
    title: "Noctael",
    subtitle: "From Concept to Launch",
    industry: "STREETWEAR & APPAREL",
    year: "2024",
    categories: ["branding", "digital-design"],
    thumbnail: "assets/projects/thumbnails/noctael.jpg",
    summary: "From initial naming to 3D drop visualization and cinematic reels, a nocturnal minimalist streetwear brand identity brought to life in digital and physical forms.",
    services: [
      "CREATIVE DIRECTION",
      "BRAND IDENTITY",
      "APPAREL DESIGN",
      "3D MODELING",
      "MOTION & CINEMATIC REELS"
    ],
    hero: {
      type: "brand_graphic",
      bg: "#0d0d0d",
      textColor: "#ffffff",
      title: "NOCTAEL\nSTUDIO",
      imageSrc: "assets/projects/assets/noctael/logoreal.jpg"
    },
    narrative: {
      subheading: "From Concept to Launch",
      paragraphs: [
        "It started with a name — NOCTAEL. A fusion of night, minimalism, and something almost otherworldly. The goal was not just to create a brand, but to build a visual identity that feels like it exists in its own space.",
        "The process began with the logo. I explored forms that reflect the core idea of NOCTAEL: sharp, minimal, and nocturnal. The focus was on balance — something that could feel both technical and mysterious. This stage defined the tone for everything that followed.",
        "Once the identity was established, I moved into designing the first drop. I started in flat 2D, focusing on composition, typography, and placement, allowing quick iteration while staying aligned with the brand's visual language.",
        "After refining the designs, I transitioned them into realistic 3D models. By placing the designs onto realistic forms, I could better understand scale, material, and presence. With 3D assets ready, I moved into cinematic animation to highlight textures, lighting, and mood."
      ],
      links: [
        { label: "Drops Show Animation ↗", url: "https://www.instagram.com/p/DMjAJ8KqM7X/", external: true },
        { label: "Launch Reel ↗", url: "https://www.instagram.com/p/DMdun6Vq-DA/", external: true }
      ]
    },
    blocks: [
      {
        layout: "2-col",
        items: [
          { type: "image", src: "assets/projects/assets/noctael/mockup.jpg", alt: "Noctael First Drop Mockup 1" },
          { type: "image", src: "assets/projects/assets/noctael/mockup2.jpg", alt: "Noctael First Drop Mockup 2" }
        ]
      },
      {
        layout: "2-col",
        items: [
          { type: "image", src: "assets/projects/assets/noctael/mockup3.jpg", alt: "Noctael First Drop Mockup 3" },
          { type: "image", src: "assets/projects/assets/noctael/mockup4.jpg", alt: "Noctael First Drop Mockup 4" }
        ]
      },
      {
        layout: "2-col",
        items: [
          { type: "image", src: "assets/projects/assets/noctael/tshirt (1).jpg", alt: "Noctael 3D Model 1" },
          { type: "image", src: "assets/projects/assets/noctael/tshirt (2.).jpg", alt: "Noctael 3D Model 2" }
        ]
      },
      {
        layout: "2-col",
        items: [
          { type: "image", src: "assets/projects/assets/noctael/tshirt (3.).jpg", alt: "Noctael 3D Model 3" },
          { type: "image", src: "assets/projects/assets/noctael/tshirt (4.).jpg", alt: "Noctael 3D Model 4" }
        ]
      },
      {
        layout: "2-col",
        items: [
          { type: "image", src: "assets/projects/assets/noctael/tshirt (5.).jpg", alt: "Noctael 3D Model 5" },
          { type: "image", src: "assets/projects/assets/noctael/tshirt (6.).jpg", alt: "Noctael 3D Model 6" }
        ]
      }
    ],
    pinBaseImage: "assets/projects/assets/noctael/mockup.jpg",
    nextProjectId: "vagdor"
  },

  "vagdor": {
    id: "vagdor",
    number: "04",
    title: "Vag d'Or",
    subtitle: "Exploring New Directions for a Classic Brand",
    industry: "FOOD & FMCG PACKAGING",
    year: "2024",
    categories: ["branding", "business-design"],
    thumbnail: "assets/projects/thumbnails/vagdor.png",
    summary: "Developing packaging iterations and flavor extension systems for a classic Algerian chips brand, balancing brand continuity with modern shelf appeal.",
    services: [
      "BRAND EXTENSION",
      "PACKAGING DESIGN",
      "COLOR SYSTEM",
      "VISUAL IDENTITY",
      "CLIENT COLLABORATION"
    ],
    hero: {
      type: "brand_graphic",
      bg: "#1c1402",
      textColor: "#f4c430",
      title: "VAG D'OR\nFLAVORS",
      imageSrc: "assets/projects/assets/vagdor/vagdorlogo.png"
    },
    narrative: {
      subheading: "Exploring New Directions for a Classic Brand",
      paragraphs: [
        "Vag d'Or is a well-established legacy chips brand in Algeria, with strong recognition and a long-standing visual identity. This project was part of an official initiative to develop new flavors, requiring a fresh yet respectful design direction.",
        "The goal was to introduce new flavor variants while maintaining the familiarity and trust associated with the brand. This meant working within existing constraints while exploring how far the visual system could evolve.",
        "I developed multiple design iterations, experimenting with color systems tied to flavors, packaging layouts, hierarchy, and visual elements to modernize the look while keeping it recognizable.",
        "While the final direction was not adopted, the project provided real-world experience in client collaboration, iteration, and constraint-based design. Every iteration contributes to building a deeper understanding of design and brand evolution."
      ],
      links: [
        { label: "More Info", url: "#", primary: true }
      ]
    },
    blocks: [
      {
        layout: "2-col",
        items: [
          { type: "image", src: "assets/projects/assets/vagdor/chips-bag-mockup.png", alt: "Vag d'Or Flavor Iteration 1" },
          { type: "image", src: "assets/projects/assets/vagdor/chips-bag-mockup (1).png", alt: "Vag d'Or Flavor Iteration 2" }
        ]
      },
      {
        layout: "2-col",
        items: [
          { type: "image", src: "assets/projects/assets/vagdor/chips-bag-mockup (2).png", alt: "Vag d'Or Flavor Iteration 3" },
          { type: "image", src: "assets/projects/assets/vagdor/chips-bag-mockup (3).png", alt: "Vag d'Or Flavor Iteration 4" }
        ]
      },
      {
        layout: "2-col",
        items: [
          { type: "image", src: "assets/projects/assets/vagdor/chips-bag-mockup (4).png", alt: "Vag d'Or Flavor Iteration 5" },
          { type: "image", src: "assets/projects/assets/vagdor/chips-bag-mockup (5).png", alt: "Vag d'Or Flavor Iteration 6" }
        ]
      }
    ],
    pinBaseImage: "assets/projects/assets/vagdor/chips-bag-mockup.png",
    nextProjectId: "carilly"
  },

  "carilly": {
    id: "carilly",
    number: "05",
    title: "Carilly",
    subtitle: "Urban Mobility & Vehicle Rental",
    industry: "MOBILITY & AUTOMOTIVE",
    year: "2024",
    categories: ["digital-design"],
    thumbnail: "assets/projects/thumbnails/carilly.png",
    summary: "A frictionless vehicle rental app eliminating physical counters through digital key handoffs, interactive maps, and transparent pricing.",
    services: [
      "UI/UX DESIGN",
      "MOBILE APP",
      "DESIGN SYSTEM",
      "BRANDING"
    ],
    hero: {
      type: "image",
      bg: "#111111",
      imageSrc: "assets/projects/assets/carilly/carilly.png",
      title: "CARILLY\nMOBILITY"
    },
    narrative: {
      subheading: "Seamless Mobility Platform",
      paragraphs: [
        "Carilly rethinks car rental and on-demand mobility through an intuitive, mobile-first experience.",
        "By eliminating paperwork and complex counter negotiations, the app lets users find, unlock, and drive vehicles across the city in minutes.",
        "The interface focuses on fluid map interactions, clear pricing transparency, and instant digital key verification, bringing modern software polish to regional vehicle rental."
      ],
      links: [
        { label: "More Info", url: "#", primary: true }
      ]
    },
    blocks: [
      {
        layout: "1-col",
        type: "image",
        src: "assets/projects/assets/carilly/carilly.png",
        alt: "Carilly Mobile App Interface"
      }
    ],
    pinBaseImage: "assets/projects/assets/carilly/carilly.png",
    nextProjectId: "designsystem"
  },

  "designsystem": {
    id: "designsystem",
    number: "06",
    title: "Enterprise Design System",
    subtitle: "Scalable Component Architecture",
    industry: "SAAS & ENTERPRISE SOFTWARE",
    year: "2024",
    categories: ["digital-design", "business-design"],
    thumbnail: "assets/projects/thumbnails/designsystem.png",
    summary: "A multi-platform enterprise design system bridging Figma tokens and production components for consistent, accessible digital product development.",
    services: [
      "DESIGN SYSTEMS",
      "COMPONENT LIBRARY",
      "TOKEN ARCHITECTURE",
      "UI/UX"
    ],
    hero: {
      type: "image",
      bg: "#161616",
      imageSrc: "assets/projects/assets/designsystem/designsystem.png",
      title: "DESIGN\nSYSTEM"
    },
    narrative: {
      subheading: "A Unified Visual Language",
      paragraphs: [
        "An enterprise design system built for scale, speed, and cross-team consistency.",
        "Structured around design tokens, robust atomic components, and accessibility standards, this system bridges the gap between Figma design files and production code.",
        "It provides teams with a shared vocabulary, reducing design debt and accelerating product releases across multi-platform web applications."
      ],
      links: [
        { label: "More Info", url: "#", primary: true }
      ]
    },
    blocks: [
      {
        layout: "1-col",
        type: "image",
        src: "assets/projects/assets/designsystem/designsystem.png",
        alt: "Design System Component Hierarchy"
      }
    ],
    pinBaseImage: "assets/projects/assets/designsystem/designsystem.png",
    nextProjectId: "pharma"
  },

  "pharma": {
    id: "pharma",
    number: "07",
    title: "PharmaTech",
    subtitle: "Clinical Pharmacy Management",
    industry: "HEALTHCARE & PHARMACEUTICAL",
    year: "2024",
    categories: ["digital-design"],
    thumbnail: "assets/projects/thumbnails/pharma.png",
    summary: "High-density dashboard interface for prescription verification, inventory supply chains, and clinical analytics in hospital and pharmacy environments.",
    services: [
      "PRODUCT DESIGN",
      "DASHBOARD UI",
      "HEALTHCARE UX",
      "DATA VISUALIZATION"
    ],
    hero: {
      type: "image",
      bg: "#0d1b2a",
      imageSrc: "assets/projects/assets/pharma/pharma.png",
      title: "PHARMATECH\nPORTAL"
    },
    narrative: {
      subheading: "Clinical Management at Scale",
      paragraphs: [
        "PharmaTech is a comprehensive management and inventory dashboard designed for modern pharmacies and healthcare distributors.",
        "The interface streamlines prescription validation, supply chain tracking, and real-time patient record lookups into a clean, high-density dashboard.",
        "Designed to reduce clinical errors and operational overhead in demanding medical environments."
      ],
      links: [
        { label: "More Info", url: "#", primary: true }
      ]
    },
    blocks: [
      {
        layout: "1-col",
        type: "image",
        src: "assets/projects/assets/pharma/pharma.png",
        alt: "PharmaTech Dashboard UI"
      },
      {
        layout: "2-col",
        items: [
          { type: "image", src: "assets/projects/assets/pharma/patient.png", alt: "Patient Management Module" },
          { type: "image", src: "assets/projects/assets/pharma/afaq.png", alt: "Healthcare Analytics Portal" }
        ]
      }
    ],
    pinBaseImage: "assets/projects/assets/pharma/pharma.png",
    nextProjectId: "delivery"
  },

  "delivery": {
    id: "delivery",
    number: "08",
    title: "Express Delivery",
    subtitle: "Courier Dispatch & Tracking Architecture",
    industry: "LOGISTICS & ON-DEMAND DELIVERY",
    year: "2024",
    categories: ["digital-design"],
    thumbnail: "assets/projects/thumbnails/delivery.png",
    summary: "Urban courier dispatch and live telemetry tracking platform uniting fleet operators, couriers, and recipients.",
    services: [
      "DISPATCH UI",
      "MOBILE APP",
      "USER FLOWS",
      "BRANDING"
    ],
    hero: {
      type: "image",
      bg: "#1a1a1a",
      imageSrc: "assets/projects/assets/delivery/delivery.png",
      title: "EXPRESS\nDELIVERY"
    },
    narrative: {
      subheading: "Intelligent Courier Dispatch",
      paragraphs: [
        "An end-to-end logistics platform uniting drivers, dispatch operators, and end customers.",
        "Features live telemetry tracking, optimized multi-stop delivery routes, and digital proof-of-delivery signatures.",
        "Built to provide total operational clarity across urban courier networks."
      ],
      links: [
        { label: "More Info", url: "#", primary: true }
      ]
    },
    blocks: [
      {
        layout: "1-col",
        type: "image",
        src: "assets/projects/assets/delivery/delivery.png",
        alt: "Express Delivery Operations Interface"
      }
    ],
    pinBaseImage: "assets/projects/assets/delivery/delivery.png",
    nextProjectId: "asiancooks"
  },
  "asiancooks": {
    id: "asiancooks",
    number: "09",
    title: "Asian Cooks",
    subtitle: "Authentic Indian Snacks Delivered",
    industry: "AUTHENTIC INDIAN SNACKS & FMCG",
    year: "2024",
    categories: ["branding", "business-design", "digital-design"],
    thumbnail: "assets/projects/assets/asiancooks/projectcardqsiqncooks.png",
    summary: "Complete brand identity, vibrant spice packaging, mascot design, and a mobile-first e-commerce app for an authentic Indian snack delivery brand.",
    services: [
      "BRANDING",
      "MASCOT & LOGO",
      "PACKAGING DESIGN",
      "MOBILE-FIRST E-COMMERCE",
      "UI/UX DESIGN",
      "TYPOGRAPHY"
    ],
    hero: {
      type: "image",
      bg: "#C84B29",
      imageSrc: "assets/projects/assets/asiancooks/1casiancooks3.png",
      title: "ASIAN\nCOOKS"
    },
    narrative: {
      subheading: "Authentic Indian Snacks, Made for Real Moments",
      paragraphs: [
        "Asian Cooks was founded to deliver authentic, high-quality Indian snacks straight to doorsteps with warmth, character, and bold flavor.",
        "I crafted an unmistakable visual universe featuring a playful handcrafted logotype, a welcoming chef mascot, a warm spice-inspired color palette, and bespoke pixel typography.",
        "To fuel digital growth, I engineered a high-converting mobile-first web app with seamless snack browsing, intuitive cart flows, and appetizing visual storytelling."
      ],
      links: [
        { label: "Visit Project ↗", url: "#", primary: true }
      ]
    },
    blocks: [
      {
        layout: "1-col",
        type: "image",
        src: "assets/projects/assets/asiancooks/1casiancooks.png",
        alt: "Asian Cooks Main Logotype, Mascot, and Brand Emblems"
      },
      {
        layout: "1-col",
        type: "image",
        src: "assets/projects/assets/asiancooks/1casiancooks2.png",
        alt: "Brand Typography: Real Ingredients. Big Flavors."
      },
      {
        layout: "2-col",
        items: [
          {
            type: "image",
            src: "assets/projects/assets/asiancooks/2casiancooks.png",
            alt: "Asian Cooks Color Palette"
          },
          {
            type: "image",
            src: "assets/projects/assets/asiancooks/2casiancooks-1.png",
            alt: "Take Snacking to a Whole New Level Slogan Card"
          }
        ]
      },
      {
        layout: "1-col",
        type: "image",
        src: "assets/projects/assets/asiancooks/1casiancooks3.png",
        alt: "Tote Bag & Delivery Box Physical Packaging Mockup"
      },
      {
        layout: "2-col",
        items: [
          {
            type: "video",
            src: "assets/projects/assets/asiancooks/2cvidasiancooks.mp4",
            aspect: "1/1",
            alt: "Asian Cooks Motion Animation"
          },
          {
            type: "image",
            src: "assets/projects/assets/asiancooks/2cnexttovidasiancooks.png",
            alt: "Asian Cooks Packaging and Visual Asset"
          }
        ]
      },
      {
        layout: "1-col",
        type: "image",
        src: "assets/projects/assets/asiancooks/1casiancooks4.png",
        alt: "Mobile-First UX Design Statement"
      },
      {
        layout: "1-col",
        type: "image",
        src: "assets/projects/assets/asiancooks/1casiancooks5.png",
        alt: "Mobile E-commerce App & UX Interface Design"
      }
    ],
    pinBaseImage: "assets/projects/assets/asiancooks/lastassetasianfoods.mp4",
    pinBaseVideo: "assets/projects/assets/asiancooks/lastassetasianfoods.mp4",
    nextProjectId: "becht"
  }
};

/**
 * Helper: Export as Array for cards, carousels, and lists
 */
export function getProjectsList() {
  return Object.values(PROJECTS_CONFIG).map(p => ({
    id: p.id,
    number: p.number,
    title: p.title,
    subtitle: p.subtitle,
    industry: p.industry,
    role: p.services ? p.services.slice(0, 3).join(' | ') : '',
    categories: p.categories,
    image: p.thumbnail,
    description: p.summary,
    link: (p.id === 'becht' || p.id === 'asiancooks') ? `project-detail.html?id=${p.id}` : null
  }));
}

/**
 * Helper: Export detail dictionary with enriched nextProject reference
 */
export function getProjectsDetailData() {
  const result = {};
  const entries = Object.entries(PROJECTS_CONFIG);

  entries.forEach(([key, project], idx) => {
    // Resolve next project reference
    const nextKey = project.nextProjectId || (idx + 1 < entries.length ? entries[idx + 1][0] : entries[0][0]);
    const nextProjectObj = PROJECTS_CONFIG[nextKey] || entries[0][1];

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
