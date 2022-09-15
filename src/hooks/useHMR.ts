function useProdHMR() {
  return false;
}

let webpackHMR = false;

function useDevHMR() {
  return webpackHMR;
}

export default process.env.NODE_ENV === 'production' ? useProdHMR : useDevHMR;

// Hack Webpack HMR to handle cache OOD
if (module && module.hot) {
  const win = window as any;
  if (typeof win.webpackHotUpdate === 'function') {
    const originWebpackHotUpdate = win.webpackHotUpdate;

    win.webpackHotUpdate = (...args: any[]) => {
      webpackHMR = true;
      setTimeout(() => {
        webpackHMR = false;
      }, 0);
      return originWebpackHotUpdate(...args);
    };
  }
}
