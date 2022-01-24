import * as React from 'react';
import canUseDom from 'rc-util/lib/Dom/canUseDom';
import CacheEntity from './Cache';

const globalCache = new CacheEntity<any, any>();
const timesCount = new CacheEntity<any, number>();

if (process.env.NODE_ENV !== 'production' && canUseDom) {
  (window as any)._CssInJsCache = globalCache;
  (window as any)._CssInJsTimes = timesCount;
}

function useClientCache<KeyType, CacheType>(
  prefix: string,
  keyPath: KeyType[],
  cacheFn: (cache: CacheType | null) => CacheType,
  onCacheRemove?: () => void,
): CacheType {
  // Create cache
  const fullPath = [prefix, ...keyPath];
  globalCache.update(fullPath, (cache) => cache || cacheFn(cache));

  // Clean up if removed
  const initRef = React.useRef(false);
  if (!initRef.current) {
    initRef.current = true;
    timesCount.update(fullPath, (cache) => {
      const nextCount = (cache || 0) + 1;

      return nextCount;
    });
  }
  React.useEffect(
    () => () => {
      timesCount.update(fullPath, (cache) => {
        const nextCount = (cache || 0) - 1;

        if (nextCount === 0) {
          // Also clean up global cache
          globalCache.update(fullPath, () => null);
          return null;
        }

        return nextCount;
      });
    },
    fullPath,
  );

  return globalCache.get(fullPath);
}

function useServerCache<KeyType, CacheType>(
  prefix: string,
  keyPath: KeyType[],
  cacheFn: (cache: CacheType | null) => CacheType,
): CacheType {
  return cacheFn(null);
}

export default canUseDom() ? useClientCache : useServerCache;
