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
| `script.js` | Vanilla JS — smooth scroll, mobile menu, IntersectionObserver animations, parallax, ripple effects |
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

A local server is required if the JS is migrated to ES modules (§3.14), since `import` does not work over `file://`.

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

---

## 3. Proposed Changes

### 3.1 Font Loading — Self-Host with `font-display: swap`

**Current:** Two render-blocking `<link>` tags to Google Fonts and cdnjs.

**Proposed:**

- Self-host Inter as WOFF2 (subset to Latin, weights 400/500/600/700 — drop unused 300). Place in `assets/fonts/`.
- Use `@font-face` declarations with `font-display: swap` to eliminate invisible-text flash.
- Add `<link rel="preload" as="font" type="font/woff2" crossorigin>` for the 400 and 700 weights.
- Keep Font Awesome on CDN but add `<link rel="preconnect" href="https://cdnjs.cloudflare.com">` and load it with `media="print" onload="this.media='all'"` to defer it.

**Impact:** Removes two cross-origin blocking requests. First paint shows text immediately with system fallback.

### 3.2 Script Loading — `defer` Attribute

**Current:** `<script src="script.js">` at end of `<body>` with no attribute.

**Proposed:** Add `defer` attribute. The script already waits for `DOMContentLoaded` internally, so behavior is unchanged, but the browser can begin parsing/fetching it earlier.

```html
<script src="script.js" defer></script>
```

### 3.3 Below-Fold Rendering — `content-visibility: auto`

**Current:** All five sections are rendered eagerly on load.

**Proposed:** Add `content-visibility: auto` with `contain-intrinsic-size` to below-fold sections (Experience, Education, Contact) to skip their rendering until scrolled into view:

```css
.experience, .education, .contact {
    content-visibility: auto;
    contain-intrinsic-size: auto 600px;
}
```

**Impact:** Reduces initial rendering work and Time to Interactive, especially on mobile. Supported in all evergreen browsers.

### 3.4 `backdrop-filter` Cost Reduction

**Current:** `.glass` applies `backdrop-filter: blur(20px)` to ~8 elements. JS also mutates `navbar.style.backdropFilter` on every scroll event. The floating `.shape` elements behind them also use `backdrop-filter: blur(10px)`.

**Proposed:**

- Remove `backdrop-filter` from `.shape` elements — they're decorative circles over a static gradient and gain nothing from it.
- Replace per-scroll JS style mutation on navbar with a CSS class toggle:

```js
navbar.classList.toggle('scrolled', window.scrollY > 100);
```

```css
.navbar.scrolled { background: rgba(255, 255, 255, 0.1); }
```

- Throttle scroll listeners with `requestAnimationFrame` to avoid layout thrashing from parallax + navbar combined.

**Impact:** Fewer compositing layers, no per-frame inline style writes.

### 3.5 Image Optimization

**Current:** Single JPEG hero image, no `srcset`, no lazy loading, no modern format.

**Proposed:**

- Convert hero image to AVIF with JPEG fallback using `<picture>`:

```html
<picture>
  <source srcset="assets/images/Robotics_Picture.avif" type="image/avif">
  <img src="assets/images/Robotics_Picture.jpeg" alt="..." loading="eager"
       width="400" height="300" fetchpriority="high">
</picture>
```

- Add explicit `width`/`height` attributes to prevent layout shift (improves CLS).
- Set `fetchpriority="high"` since it's above the fold.

### 3.6 Scroll Listener Optimization

**Current:** Two separate `scroll` event listeners — one for navbar background, one for parallax shapes. Both fire on every scroll event with direct DOM style mutations.

**Proposed:** Merge into a single `scroll` listener throttled with `requestAnimationFrame`:

```js
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            updateNavbar();
            updateParallax();
            ticking = false;
        });
        ticking = true;
    }
});
```

### 3.7 Preconnect Hints

Add resource hints to `<head>` for external origins:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://cdnjs.cloudflare.com">
```

If fonts are self-hosted (§3.1), only the cdnjs preconnect is needed.

### 3.8 Respect `prefers-reduced-motion`

**Current:** CSS has a `prefers-reduced-motion: no-preference` block, but JS unconditionally runs parallax, scroll animations, and ripple effects.

**Proposed:** Gate JS animations on the media query:

```js
const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
if (motionOk) {
    // parallax, scroll-reveal, ripple setup
}
```

### 3.9 CSS Custom Properties for Design Tokens

**Current:** Brand colors, spacing, and border-radius values are hardcoded across `style.css` (~20 occurrences of `#1e90ff`, ~10 of `rgba(255, 255, 255, 0.05)`, etc.). Changing the accent color requires a find-and-replace across the entire file.

**Proposed:** Define CSS custom properties on `:root` and reference them throughout:

```css
:root {
    --color-primary: #1e90ff;
    --color-primary-dark: #0066cc;
    --color-primary-light: #00bfff;
    --color-bg: #0a0a0a;
    --color-surface: rgba(255, 255, 255, 0.05);
    --color-text: #ffffff;
    --color-text-muted: #d0d0d0;
    --color-text-subtle: #b0b0b0;
    --radius-card: 20px;
    --radius-button: 12px;
    --blur-glass: 20px;
}
```

**Impact:** Single source of truth for the design system. Theming (e.g., light mode) becomes a `:root` override instead of a rewrite.

### 3.10 Extract Injected CSS from JavaScript

**Current:** `script.js` appends a `<style>` block to `<head>` containing ripple animation, mobile menu active states, and hamburger transforms (~50 lines). These are static styles with no runtime dependency.

**Proposed:** Move all injected CSS into `style.css`. Remove the `document.head.appendChild(style)` block from `script.js`.

**Impact:** All styles live in one file. Avoids a flash where JS-dependent styles aren't applied until script execution. Eliminates a class of bugs where the style block is appended multiple times.

### 3.11 Semantic HTML Improvements

**Current:** Experience and education entries use generic `<div>` containers. The nav uses `<ul>` but the content sections don't leverage semantic elements.

**Proposed:**

- Wrap the experience timeline in `<article>` elements instead of plain `<div class="experience-card">`.
- Add `<time datetime="...">` around date ranges for machine readability.
- Add `aria-label` to icon-only links and the hamburger button for screen reader accessibility.

```html
<article class="experience-card glass">
  ...
  <p class="experience-years">
      <time datetime="2023-07/2026-02">July 2023 – Present</time>
  </p>
  ...
</article>
```

```html
<button class="hamburger" aria-label="Toggle navigation" aria-expanded="false">
```

**Impact:** Better accessibility, SEO, and self-documenting markup.

### 3.12 Consistent Section Naming Convention

**Current:** Section CSS classes follow the pattern `.{section-name}` with child classes `.{section-name}-content`, `.{section-name}-card`, etc. This is consistent but undocumented, so new sections risk drifting.

**Proposed:** Document the naming convention in `copilot-instructions.md` (already done) and enforce it by keeping a checklist for new sections:

1. `<section id="x" class="x">` — section wrapper
2. `.x-content` — inner content container
3. `.x-card.glass` — individual card
4. `.x-info` → `.x-icon` + `.x-details` — card internals
5. Nav link in `.nav-menu` + footer link in `.footer-links`

No tooling change needed — this is a convention to maintain.

### 3.13 Consolidate Duplicated CSS into Shared Classes

**Current:** Experience and education cards share nearly identical styles (~60 lines each for `.experience-card`, `.experience-info`, `.experience-icon`, `.experience-details` and their `.education-*` counterparts). The responsive overrides at 768px and 480px also duplicate rules for both prefixes side-by-side.

**Proposed:** Extract shared card styles into reusable classes:

```css
/* Shared card layout */
.info-card         { padding: 3rem; margin-bottom: 2rem; }
.info-card__layout { display: flex; align-items: flex-start; gap: 2rem; }
.info-card__icon   { flex-shrink: 0; width: 80px; height: 80px;
                     background: linear-gradient(45deg, var(--color-primary), var(--color-primary-dark));
                     border-radius: 50%; display: flex; align-items: center;
                     justify-content: center; box-shadow: 0 4px 15px rgba(30, 144, 255, 0.3); }
.info-card__icon i { font-size: 2rem; color: white; }
.info-card__title  { font-size: 1.8rem; color: var(--color-primary); margin-bottom: 0.5rem; font-weight: 700; }
.info-card__subtitle { font-size: 1.3rem; color: var(--color-text); margin-bottom: 0.3rem; font-weight: 600; }
.info-card__meta   { color: var(--color-text-subtle); font-size: 1rem; margin-bottom: 0.3rem; font-weight: 500; }
```

Then use section-specific classes only for what actually differs (e.g., `.experience-content { max-width: 1000px }` vs `.education-content { max-width: 800px }`). Responsive overrides collapse to a single `.info-card` block.

**Impact:** Eliminates ~100 lines of duplicated CSS. Adding a new card-based section (e.g., Projects, Publications) requires zero new base styles.

### 3.14 Modularize JavaScript by Concern

**Current:** `script.js` is a single 237-line file. All behavior — smooth scroll, mobile menu, navbar effect, IntersectionObserver, parallax, contact form, image loading, ripple effect — lives inside one `DOMContentLoaded` callback with no separation.

**Proposed:** Split into ES modules loaded via `<script type="module">`:

```
js/
  main.js          — imports and initializes modules
  navigation.js    — smooth scroll, mobile menu toggle, navbar scroll class
  animations.js    — IntersectionObserver reveal, parallax, ripple effect
  images.js        — fade-in on load, error handling
```

Each module exports an `init()` function called from `main.js`:

```js
// main.js
import { init as initNav } from './navigation.js';
import { init as initAnimations } from './animations.js';
import { init as initImages } from './images.js';

document.addEventListener('DOMContentLoaded', () => {
    initNav();
    if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        initAnimations();
    }
    initImages();
});
```

**Impact:** Each file has a single responsibility. New behavior (e.g., a contact form, theme toggle) gets its own module. The `prefers-reduced-motion` gate (§3.8) becomes a natural import boundary rather than an `if` block wrapping half the file. ES modules are supported in all evergreen browsers and are `defer`ed by default.

### 3.15 Remove Dead Code

**Current:** `style.css` contains ~120 lines of `.project-*` styles (`.project-card`, `.project-image`, `.project-overlay`, `.project-links`, `.project-content`, `.project-placeholder`) and `script.js` has `.project-card` hover handlers and a `#contact-form` submit handler. None of these elements exist in `index.html`.

**Proposed:** Remove all `.project-*` CSS rules and the JS `projectCards` hover block and `contactForm` handler. If a Projects section is added later, reintroduce styles using the shared `.info-card` classes (§3.13).

**Impact:** Eliminates ~130 lines of unused code across two files. Reduces CSS file size and removes confusion about whether a projects section exists.

### 3.16 Add Meta Tags and Open Graph

**Current:** `<head>` contains only `<title>`, charset, and viewport meta tags. No description, no Open Graph, no favicon.

**Proposed:**

```html
<meta name="description" content="Brandon Yue — Software Engineer specializing in full-stack development, security, and mobility.">
<meta property="og:title" content="Brandon Yue - Software Engineer">
<meta property="og:description" content="Software Engineer specializing in full-stack development, security, and mobility.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://bryue.github.io">
<meta property="og:image" content="https://bryue.github.io/assets/images/Robotics_Picture.jpeg">
<link rel="icon" href="assets/favicon.ico">
```

**Impact:** Better SEO, richer link previews when shared on LinkedIn/Slack/etc.

## 4. Priority Order

| Priority | Change | Effort | Principle |
|----------|--------|--------|-----------|
| 1 | Add `defer` to script tag | Trivial | Performance |
| 2 | Add preconnect hints | Trivial | Performance |
| 3 | Extract injected CSS from JS into `style.css` | Small | Maintainability |
| 4 | CSS custom properties for design tokens | Small | Maintainability |
| 5 | Consolidate duplicated CSS into shared classes | Small | Reuse |
| 6 | Throttle scroll listeners with rAF | Small | Performance |
| 7 | Remove `backdrop-filter` from shapes | Small | Performance |
| 8 | CSS class toggle for scrolled navbar | Small | Performance, Maintainability |
| 9 | `content-visibility: auto` on below-fold sections | Small | Performance |
| 10 | Semantic HTML + ARIA attributes | Small | Maintainability |
| 11 | Add `width`/`height` to hero image | Small | Performance |
| 12 | Respect `prefers-reduced-motion` in JS | Small | Performance |
| 13 | Modularize JS into ES modules | Medium | Reuse, Maintainability |
| 14 | Self-host Inter font with `font-display: swap` | Medium | Performance, Tooling |
| 15 | Convert hero image to AVIF with `<picture>` | Medium | Tooling, Performance |
| 16 | Remove dead project/form code | Small | Maintainability |
| 17 | Add meta tags and Open Graph | Small | Tooling |
