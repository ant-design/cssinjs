import * as React from 'react';
import type Theme from './Theme';

export default function useCacheToken(
  theme: Theme<any, any>,
  ...tokens: object[]
) {
  const mergedDesignToken = React.useMemo(
    () => Object.assign({}, ...tokens),
    [...tokens],
  );

  return React.useMemo(
    () => theme.getDerivativeToken(mergedDesignToken),
    [theme, mergedDesignToken],
  );
}
