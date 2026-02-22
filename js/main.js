import { init as initNav, updateNavbar } from './navigation.js';
import { init as initAnimations, updateParallax } from './animations.js';
import { init as initImages } from './images.js';

const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initImages();

    if (motionOk) {
        initAnimations();

        // Single rAF-throttled scroll listener for navbar + parallax
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
    } else {
        // Still toggle navbar class, just without parallax
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    updateNavbar();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
});
