function useProdHMR() {
  return false;
}

let webpackHMR = false;
let viteHMR = false;

function useDevHMR() {
  return webpackHMR || viteHMR;
}

export default process.env.NODE_ENV === 'production' ? useProdHMR : useDevHMR;

if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
  // Webpack `module.hot.accept` do not support any deps update trigger
  // We have to hack handler to force mark as HRM
  if (typeof module !== 'undefined' && module && (module as any).hot) {
    // Use `globalThis` first, and `window` for older browsers
    // const win = globalThis as any;
    const win =
      typeof globalThis !== 'undefined' ? globalThis : (window as any);

    if (win && typeof win.webpackHotUpdate === 'function') {
      const originWebpackHotUpdate = win.webpackHotUpdate;

      win.webpackHotUpdate = (...args: any[]) => {
        webpackHMR = true;
        setTimeout(() => {
          webpackHMR = false;
        }, 0);
        return originWebpackHotUpdate(...args);
      };
    }
  } else if (typeof (import.meta as any).hot === 'object') {
    // Vite needs to wait for the pre token update after receiving a hot update event and
    // cannot immediately reset the 'viteHMR' flag.
    let timerId: NodeJS.Timeout | null = null;
    (import.meta as any).hot.on('vite:beforeUpdate', () => {
      viteHMR = true;
    });

    (import.meta as any).hot.on('vite:afterUpdate', () => {
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }

      timerId = setTimeout(() => {
        viteHMR = false;
      }, 600);
    });
  }
}
