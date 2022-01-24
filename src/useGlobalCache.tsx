import * as React from 'react';
import canUseDom from 'rc-util/lib/Dom/canUseDom';
import CacheEntity from './Cache';

// Cache record times & real cache
const globalCache = new CacheEntity<any, [number, any]>();

if (process.env.NODE_ENV !== 'production' && canUseDom) {
  (window as any)._CssInJsCache = globalCache;
}

function useClientCache<KeyType, CacheType>(
  prefix: string,
  keyPath: KeyType[],
  cacheFn: () => CacheType,
  onCacheRemove?: (cache: CacheType) => void,
): CacheType {
  const fullPath = [prefix, ...keyPath];

  // Create cache
  const initRef = React.useRef(false);
  if (!initRef.current) {
    initRef.current = true;

    globalCache.update(fullPath, (prevCache) => {
      const [times = 0, cache] = prevCache || [];
      const mergedCache = cache || cacheFn();

      return [times + 1, mergedCache];
    });
  }

  // Remove if no need anymore
  React.useEffect(
    () => () => {
      globalCache.update(fullPath, (prevCache) => {
        const [times = 0, cache] = prevCache || [];
        const nextCount = times - 1;

        if (nextCount === 0) {
          onCacheRemove?.(cache);
          return null;
        }

        return [times - 1, cache];
      });
    },
    fullPath,
  );

  return globalCache.get(fullPath)![1];
}

function useServerCache<KeyType, CacheType>(
  prefix: string,
  keyPath: KeyType[],
  cacheFn: () => CacheType,
): CacheType {
  return cacheFn();
}

export default canUseDom() ? useClientCache : useServerCache;
