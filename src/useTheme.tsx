import * as React from 'react';
import type Theme from './Theme';
import type { TokenType } from './Theme';

export default function useDerivativeToken<
  DesignToken extends TokenType,
  DerivativeToken extends TokenType,
>(theme: Theme<DesignToken, DerivativeToken>, designToken: DesignToken) {
  const derivativeToken = React.useMemo(
    () => theme.getDerivativeToken(designToken),
    [theme, designToken],
  );
  return derivativeToken;
}
