import { init as initNav, updateNavbar } from './navigation.js';
import { init as initAnimations, updateParallax } from './animations.js';
import { init as initImages } from './images.js';

const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

// Async-load Font Awesome (CSP-safe alternative to inline onload)
const faLink = document.getElementById('fa-stylesheet');
if (faLink) {
    if (faLink.sheet) {
        faLink.media = 'all';
    } else {
        faLink.addEventListener('load', () => { faLink.media = 'all'; });
    }
}

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
