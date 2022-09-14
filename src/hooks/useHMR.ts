import * as React from 'react';

function useProdHMR() {
  return false;
}

let mounted = false;

function useDevHMR() {
  const ret = React.useMemo(() => {
    return mounted;
  }, []);

  mounted = true;

  return ret;
}

export default process.env.NODE_ENV === 'production' ? useProdHMR : useDevHMR;
