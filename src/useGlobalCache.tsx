import * as React from 'react';
import StyleContext from './StyleContext';
import type { KeyType } from './Cache';

export default function useClientCache<CacheType>(
  prefix: string,
  keyPath: KeyType[],
  cacheFn: () => CacheType,
  onCacheRemove?: (cache: CacheType) => void,
): CacheType {
  const { cache: globalCache } = React.useContext(StyleContext);
  const fullPath = [prefix, ...keyPath];

  // Create cache
  React.useMemo(
    () => {
      globalCache.update(fullPath, (prevCache) => {
        const [times = 0, cache] = prevCache || [];
        const mergedCache = cache || cacheFn();

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
