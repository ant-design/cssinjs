import * as React from 'react';
import { note } from 'rc-util/lib/warning';
import StyleContext from '../StyleContext';
import type { KeyType } from '../Cache';

function useProdHMR() {
  return false;
}

export type CacheFn<CacheType> = () => CacheType;

function useDevHMR<CacheType>(
  fullPath: KeyType[],
  cacheFn: CacheFn<CacheType> | CacheFn<CacheType>[],
  shouldCheckHMR?: boolean,
) {
  const { cache: globalCache } = React.useContext(StyleContext);

  let HMRUpdate = false;

  const arrCacheFn = Array.isArray(cacheFn) ? cacheFn : [cacheFn];

  React.useMemo(
    () => {
      globalCache.update(['__HMR__', ...fullPath], (prevCache) => {
        const [, cache] = prevCache || [];
        if (
          shouldCheckHMR &&
          cache &&
          (arrCacheFn.length !== cache.length ||
            arrCacheFn.some((fn, i) => fn !== cache[i]))
        ) {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          HMRUpdate = true;

          note(
            false,
            `Style function not same. It may caused by using the same cache 'path' or refresh with HMR.`,
          );
        }
        return [0, arrCacheFn];
      });
    },
    /* eslint-disable react-hooks/exhaustive-deps */
    [fullPath.join('_')],
    /* eslint-enable */
  );

  return HMRUpdate;
}

export default process.env.NODE_ENV === 'production' ? useProdHMR : useDevHMR;
