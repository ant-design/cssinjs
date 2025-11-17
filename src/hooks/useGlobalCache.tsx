import * as React from 'react';
import { useInsertionEffect } from 'react';
import { pathKey, type KeyType } from '../Cache';
import StyleContext from '../StyleContext';
import useHMR from './useHMR';

export type ExtractStyle<CacheValue> = (
  cache: CacheValue,
  effectStyles: Record<string, boolean>,
  options?: {
    plain?: boolean;
    autoPrefix?: boolean;
  },
) => [order: number, styleId: string, style: string] | null;

const effectMap = new Map<string, boolean>();

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
  useInsertionEffect(() => {
    buildCache(([times, cache]) => [times + 1, cache]);
    if (!effectMap.has(fullPathStr)) {
      onCacheEffect?.(cacheContent);
      effectMap.set(fullPathStr, true);

      // 微任务清理混存，可以认为是单次 batch render 中只触发一次 effect
      Promise.resolve().then(() => {
        effectMap.delete(fullPathStr);
      });
    }

    return () => {
      globalCache.opUpdate(fullPathStr, (prevCache) => {
        const [times = 0, cache] = prevCache || [];
        const nextCount = times - 1;

        if (nextCount === 0) {
          onCacheRemove?.(cache, false);
          effectMap.delete(fullPathStr);
          return null;
        }

        return [times - 1, cache];
      });
    };
  }, [fullPathStr]);

  return cacheContent;
}
