# Design Document — bryue.github.io

Personal portfolio site for Brandon Yue. This document retroactively describes the current design and proposes targeted changes aligned with three guiding principles:

1. **Use the most up-to-date tooling** — leverage modern CSS/JS features with broad browser support.
2. **Be as performant as possible for any browser** — minimize render-blocking resources, compositing cost, and layout thrashing.
3. **Readability and maintainability** — keep the codebase easy to understand, modify, and extend without tribal knowledge. Reuse code wherever possible and modularize to avoid duplication.

---

## 1. Current Architecture

No build system. Four static files served directly by GitHub Pages:

| File | Role |
|------|------|
| `index.html` | Single-page layout with five sections: Home, About, Experience, Education, Contact |
| `style.css` | All visual styling including responsive breakpoints (768px, 480px) |
| `js/main.js` | Entry point ES module — imports navigation, animations, and image modules |
| `assets/` | Resume PDF, hero image |

### External Dependencies

| Resource | Loaded from |
|----------|-------------|
| Inter font (300–700) | Google Fonts CDN |
| Font Awesome 6.0.0 | cdnjs |

### Browser Support Targets

Evergreen browsers only — latest two versions of Chrome, Firefox, Safari, and Edge. No IE11 support. This permits use of `backdrop-filter`, `content-visibility`, CSS custom properties, ES modules, and `IntersectionObserver` without polyfills.

### Local Development

No build step. To preview locally, open `index.html` directly in a browser or use any static file server:

```sh
# Python
python3 -m http.server 8000

# Node
npx serve .
```

A local server is required since the JS uses ES modules, and `import` does not work over `file://`.

---

## 2. Visual Design System

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0a0a0a` | Page base |
| Surface | `rgba(255,255,255,0.05)` | Glass cards |
| Primary | `#1e90ff` | Accent, links, headings, icons |
| Primary dark | `#0066cc` | Gradient endpoints |
| Primary light | `#00bfff` / `#87ceeb` | Gradient highlights |
| Text | `#ffffff` | Headings, nav, primary text |
| Text muted | `#d0d0d0` | Body paragraphs |
| Text subtle | `#b0b0b0` | Dates, subtitles, footers |

### Typography

- **Font family:** Inter (Google Fonts), sans-serif fallback
- **Scale:** Hero title 3.5rem → section title 2.5rem → card title 1.8rem → body 1rem
- **Weights:** 300 (unused currently), 400, 500, 600, 700

### Glass Morphism

The `.glass` utility class is the core surface treatment:

```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 20px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
```

Applied to: navbar, about card, experience cards, education cards, contact card, hero image card.

### Component Patterns

- **Section:** `<section id="x" class="x">` → `.container` → `.section-header` (h2 + subtitle) → `.x-content` → `.x-card.glass`
- **Card icons:** 80×80px circle with `linear-gradient(45deg, #1e90ff, #0066cc)`, containing a Font Awesome icon
- **Tech tags:** `<span class="tech-tag">` — pill-shaped, blue-tinted background
- **Buttons:** `.btn.btn-primary` (gradient fill) / `.btn.btn-secondary` (glass outline)

### Animation

- **Scroll reveal:** IntersectionObserver fades in cards (`opacity 0→1`, `translateY 30px→0`, 0.6s ease)
- **Parallax:** Floating `.shape` circles translate on scroll at varying rates
- **Ripple:** Button click spawns a `<span class="ripple">` with radial scale animation
- **Float:** Background shapes loop a 20s `translateY` + `rotate` keyframe


