export function init() {
    const images = document.querySelectorAll('img[src]');
    images.forEach(img => {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';

        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.onload = () => { img.style.opacity = '1'; };
            img.onerror = () => { img.style.opacity = '1'; };
        }
    });
}
