let navbar;

export function init() {
    navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('a[href^="#"]');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    // Smooth scrolling for anchor links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - navbar.offsetHeight - 20;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        });
    });

    // Mobile menu toggle
    if (hamburger && navMenu) {
        const toggleMenu = () => {
            const isActive = hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', String(isActive));
        };

        hamburger.addEventListener('click', toggleMenu);
        hamburger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    updateNavbar();
}

export function updateNavbar() {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 100);
}
