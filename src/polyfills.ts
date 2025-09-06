/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 */

import 'zone.js';  // Included with Angular CLI.

// Polyfills para navegadores específicos
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Intersection Observer polyfill para navegadores más antiguos
  if (!('IntersectionObserver' in window)) {
    // Cargar dinámicamente el polyfill solo si es necesario
    const script = document.createElement('script');
    script.src = 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver';
    document.head.appendChild(script);
  }
}