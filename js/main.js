import { init as initNav, updateNavbar } from './navigation.js';
import { init as initAnimations, updateParallax } from './animations.js';
import { init as initImages } from './images.js';

const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initImages();
    if (motionOk) initAnimations();

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateNavbar();
                if (motionOk) updateParallax();
                ticking = false;
            });
            ticking = true;
        }
    });
});
