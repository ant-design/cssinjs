import * as React from 'react';
import type { KeyType } from '../Cache';
import StyleContext from '../StyleContext';
import useCompatibleInsertionEffect from './useCompatibleInsertionEffect';
import useEffectCleanupRegister from './useEffectCleanupRegister';
import useHMR from './useHMR';

export default function useGlobalCache<CacheType>(
  prefix: string,
  keyPath: KeyType[],
  cacheFn: () => CacheType,
  onCacheRemove?: (cache: CacheType, fromHMR: boolean) => void,
  // Add additional effect trigger by `useInsertionEffect`
  onCacheEffect?: (cachedValue: CacheType) => void,
): CacheType {
  const { cache: globalCache } = React.useContext(StyleContext);
  const fullPath = [prefix, ...keyPath];
  const deps = fullPath.join('_');

  const register = useEffectCleanupRegister([deps]);

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
    () => {
      buildCache();
    },
    /* eslint-disable react-hooks/exhaustive-deps */
    [deps],
    /* eslint-enable */
  );

  let cacheEntity = globalCache.get(fullPath);

  // HMR clean the cache but not trigger `useMemo` again
  // Let's fallback of this
  // ref https://github.com/ant-design/cssinjs/issues/127
  if (process.env.NODE_ENV !== 'production' && !cacheEntity) {
    buildCache();
    cacheEntity = globalCache.get(fullPath);
  }

  const cacheContent = cacheEntity![1];

  // Remove if no need anymore
  useCompatibleInsertionEffect(
    () => {
      onCacheEffect?.(cacheContent);
    },
    (polyfill) => {
      // It's bad to call build again in effect.
      // But we have to do this since StrictMode will call effect twice
      // which will clear cache on the first time.
      buildCache(([times, cache]) => {
        if (polyfill && times === 0) {
          onCacheEffect?.(cacheContent);
        }
        return [times + 1, cache];
      });

      return () => {
        globalCache.update(fullPath, (prevCache) => {
          const [times = 0, cache] = prevCache || [];
          const nextCount = times - 1;

          if (nextCount === 0) {
            // Always remove styles in useEffect callback
            register(() => onCacheRemove?.(cache, false));
            return null;
          }

          return [times - 1, cache];
        });
      };
    },
    [deps],
  );

  return cacheContent;
}
