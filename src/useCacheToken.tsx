import type Theme from './Theme';
import useGlobalCache from './useGlobalCache';

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
  const cachedToken = useGlobalCache('token', [theme, ...tokens], () => {
    const mergedDesignToken = Object.assign({}, ...tokens);
    return theme.getDerivativeToken(mergedDesignToken);
  });

  return cachedToken;
}
