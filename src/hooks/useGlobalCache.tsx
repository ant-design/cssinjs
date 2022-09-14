import * as React from 'react';
import StyleContext from '../StyleContext';
import type { KeyType } from '../Cache';
import useHMR from './useHMR';

export default function useClientCache<CacheType>(
  prefix: string,
  keyPath: KeyType[],
  cacheFn: () => CacheType,
  onCacheRemove?: (cache: CacheType, fromHMR: boolean) => void,
): CacheType {
  const { cache: globalCache } = React.useContext(StyleContext);
  const fullPath = [prefix, ...keyPath];

  const HMRUpdate = useHMR();

  // Create cache
  React.useMemo(
    () => {
      globalCache.update(fullPath, (prevCache) => {
        const [times = 0, cache] = prevCache || [];

        // HMR should always ignore cache since developer may change it
        let tmpCache = cache;
        if (process.env.NODE_ENV !== 'production' && cache && HMRUpdate) {
          onCacheRemove?.(tmpCache, HMRUpdate);
          tmpCache = null;
        }

        const mergedCache = tmpCache || cacheFn();

        return [times + 1, mergedCache];
      });
    },
    /* eslint-disable react-hooks/exhaustive-deps */
    [fullPath.join('_')],
    /* eslint-enable */
  );

  // Remove if no need anymore
  React.useEffect(
    () => () => {
      globalCache.update(fullPath, (prevCache) => {
        const [times = 0, cache] = prevCache || [];
        const nextCount = times - 1;

        if (nextCount === 0) {
          onCacheRemove?.(cache, false);
          return null;
        }

        return [times - 1, cache];
      });
    },
    fullPath,
  );

  return globalCache.get(fullPath)![1];
}
