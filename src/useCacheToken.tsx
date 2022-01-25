import hash from '@emotion/hash';
import type Theme from './Theme';
import useGlobalCache from './useGlobalCache';
import { token2key } from './util';

/**
 * Cache theme derivative token as global shared one
 * @param theme Theme entity
 * @param tokens List of tokens, used for cache. Please do not dynamic generate object directly
 * @returns Call Theme.getDerivativeToken(tokenObject) to get token
 */
export default function useCacheToken(
  theme: Theme<any, any>,
  ...tokens: object[]
) {
  const tokenStr = token2key(Object.assign({}, ...tokens));

  const cachedToken = useGlobalCache('token', [theme.id, tokenStr], () => {
    const mergedDesignToken = Object.assign({}, ...tokens);
    const derivativeToken = theme.getDerivativeToken(mergedDesignToken);

    // Optimize for `useStyleRegister` performance
    const tokenKey = token2key(derivativeToken);
    derivativeToken._tokenKey = tokenKey;

    const hashId = hash(tokenKey);
    derivativeToken._hashId = hashId;

    return [derivativeToken, hashId];
  });

  return cachedToken;
}
