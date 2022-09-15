import url from 'url';

function useProdHMR() {
  return false;
}

let webpackHMR = false;

function useDevHMR() {
  return webpackHMR;
}

export default process.env.NODE_ENV === 'production' ? useProdHMR : useDevHMR;

// Webpack do not provide the HMR accept any deps update interface
// We have to hack handler to force mark as HRM
if (process.env.NODE_ENV !== 'production' && module && module.hot) {
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
