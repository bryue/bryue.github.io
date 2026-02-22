# Copilot Instructions

For the full design system, rationale, and proposed changes backlog, see [docs/DESIGN.md](../docs/DESIGN.md).

## Architecture

Single-page static portfolio site deployed via GitHub Pages. No build system or framework — all files are served directly.

- `index.html` — Single HTML file with all content sections: Home, About, Experience, Education, Contact
- `style.css` — All styles, including responsive breakpoints, design tokens as CSS custom properties on `:root`
- `js/main.js` — ES module entry point; imports and initializes all modules
- `js/navigation.js` — Smooth scroll, mobile menu toggle, navbar scroll class
- `js/animations.js` — IntersectionObserver scroll reveal, parallax, ripple effect
- `js/images.js` — Image fade-in on load, error handling
- `assets/` — Resume PDF (`Brandon_Yue_Resume.pdf`) and images (`images/`)

## Key Conventions

**CSS custom properties:** All design tokens are defined as CSS custom properties on `:root` in `style.css` (e.g., `--color-primary`, `--color-surface`, `--radius-card`, `--blur-glass`). Always use these instead of hardcoding colors, radii, or blur values.

**Glass morphism design system:** The `.glass` utility class (defined in `style.css`) is the shared visual style for all cards and panels — uses `var(--color-surface)`, `backdrop-filter: blur(var(--blur-glass))`, subtle border, and box-shadow. Apply it to any new card or panel.

**Section structure pattern:**
```html
<section id="name" class="name">
  <div class="container">
    <div class="section-header">
      <h2 class="section-title">...</h2>
      <p class="section-subtitle">...</p>
    </div>
    <div class="name-content">
      <article class="name-card glass"> ... </article>
    </div>
  </div>
</section>
```

**Card inner pattern:** Cards use `.{section}-info > .{section}-icon + .{section}-details`. Icons are 80×80px gradient circles containing Font Awesome icons. Experience and education cards share consolidated CSS rules via grouped selectors.

**Semantic HTML:** Use `<article>` for content cards, `<time datetime="...">` for date ranges, `aria-label` on interactive elements lacking visible text.

**Tech tags:** Use `<span class="tech-tag">Label</span>` inside a `.experience-tech` wrapper.

**ES modules:** JavaScript is split into ES modules under `js/`. Each module exports an `init()` function. `main.js` gates animation modules on `prefers-reduced-motion`. All scroll listeners are rAF-throttled.

**Responsive breakpoints:** `768px` (tablet — stacks hero grid, shows hamburger) and `480px` (mobile — single-column everything, reduced font sizes and padding).

**Scroll offset:** Smooth-scroll in `navigation.js` subtracts `navbar.offsetHeight + 20px` from `offsetTop` to account for the fixed navbar.

**No nav link for new sections** is automatic — manually add `<li><a href="#id" class="nav-link">Label</a></li>` to `.nav-menu` and a footer link in `.footer-links`.
