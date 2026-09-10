import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';

afterEach(() => {
  localStorage.clear();
});

// jsdom não implementa estas APIs, usadas pelos componentes Radix (shadcn/ui)
// para posicionamento de popovers/menus (Select, Dialog, DropdownMenu).
if (typeof window !== 'undefined') {
  window.HTMLElement.prototype.scrollIntoView ??= () => {};
  window.HTMLElement.prototype.hasPointerCapture ??= () => false;
  window.HTMLElement.prototype.releasePointerCapture ??= () => {};

  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
}
