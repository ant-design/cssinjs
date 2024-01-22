import * as React from 'react';
import { pathKey, type KeyType } from '../Cache';
import StyleContext from '../StyleContext';
import useCompatibleInsertionEffect from './useCompatibleInsertionEffect';
import useEffectCleanupRegister from './useEffectCleanupRegister';
import useHMR from './useHMR';

export type ExtractStyle<CacheValue> = (
  cache: CacheValue,
  effectStyles: Record<string, boolean>,
  options?: {
    plain?: boolean;
  },
) => [order: number, styleId: string, style: string] | null;

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
  const fullPathStr = pathKey(fullPath);

  const register = useEffectCleanupRegister([fullPathStr]);

  const HMRUpdate = useHMR();

  type UpdaterArgs = [times: number, cache: CacheType];

  const buildCache = (updater?: (data: UpdaterArgs) => UpdaterArgs) => {
    globalCache.opUpdate(fullPathStr, (prevCache) => {
      const [times = 0, cache] = prevCache || [undefined, undefined];

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
    [fullPathStr],
    /* eslint-enable */
  );

  let cacheEntity = globalCache.opGet(fullPathStr);

  // HMR clean the cache but not trigger `useMemo` again
  // Let's fallback of this
  // ref https://github.com/ant-design/cssinjs/issues/127
  if (process.env.NODE_ENV !== 'production' && !cacheEntity) {
    buildCache();
    cacheEntity = globalCache.opGet(fullPathStr);
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
        globalCache.opUpdate(fullPathStr, (prevCache) => {
          const [times = 0, cache] = prevCache || [];
          const nextCount = times - 1;

          if (nextCount === 0) {
            // Always remove styles in useEffect callback
            register(() => {
              // With polyfill, registered callback will always be called synchronously
              // But without polyfill, it will be called in effect clean up,
              // And by that time this cache is cleaned up.
              if (polyfill || !globalCache.opGet(fullPathStr)) {
                onCacheRemove?.(cache, false);
              }
            });
            return null;
          }

          return [times - 1, cache];
        });
      };
    },
    [fullPathStr],
  );

  return cacheContent;
}
