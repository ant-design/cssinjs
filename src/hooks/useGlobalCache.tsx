import * as React from 'react';
import type { KeyType } from '../Cache';
import StyleContext from '../StyleContext';
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

  type UpdaterArgs = [times: number, cache: CacheType];

  const buildCache = (updater?: (data: UpdaterArgs) => UpdaterArgs) => {
    globalCache.update(fullPath, (prevCache) => {
      const [times = 0, cache] = prevCache || [];

      // HMR should always ignore cache since developer may change it
      let tmpCache = cache;
      if (process.env.NODE_ENV !== 'production' && cache && HMRUpdate) {
        onCacheRemove?.(tmpCache, HMRUpdate);
        tmpCache = null;
      }

      const mergedCache = tmpCache || cacheFn();

      const data: UpdaterArgs = [times, mergedCache];

      // Call updater if need additional logic
      return updater ? updater(data) : data;
    });
  };

  // Create cache
  React.useMemo(
    () => buildCache(),
    /* eslint-disable react-hooks/exhaustive-deps */
    [fullPath.join('_')],
    /* eslint-enable */
  );

  // Remove if no need anymore
  React.useEffect(() => {
    // It's bad to call build again in effect.
    // But we have to do this since StrictMode will call effect twice
    // which will clear cache on the first time.
    buildCache(([times, cache]) => [times + 1, cache]);

    return () => {
      globalCache.update(fullPath, (prevCache) => {
        const [times = 0, cache] = prevCache || [];
        const nextCount = times - 1;

        if (nextCount === 0) {
          onCacheRemove?.(cache, false);
          return null;
        }

        return [times - 1, cache];
      });
    };
  }, fullPath);

  return globalCache.get(fullPath)![1];
}
