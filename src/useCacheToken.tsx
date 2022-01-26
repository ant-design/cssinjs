import hash from '@emotion/hash';
import type Theme from './Theme';
import useGlobalCache from './useGlobalCache';
import { token2key } from './util';

export interface Option {
  /**
   * Generate token with salt.
   * This is used to generate different hashId even same derivative token for different version.
   */
  salt?: string;
}

/**
 * Cache theme derivative token as global shared one
 * @param theme Theme entity
 * @param tokens List of tokens, used for cache. Please do not dynamic generate object directly
 * @param option Additional config
 * @returns Call Theme.getDerivativeToken(tokenObject) to get token
 */
export default function useCacheToken(
  theme: Theme<any, any>,
  tokens: object[],
  option: Option = {},
) {
  const { salt = '' } = option;
  const tokenStr = token2key(Object.assign({}, ...tokens));

  const cachedToken = useGlobalCache(
    'token',
    [theme.id, salt, tokenStr],
    () => {
      const mergedDesignToken = Object.assign({}, ...tokens);
      const derivativeToken = theme.getDerivativeToken(mergedDesignToken);

      // Optimize for `useStyleRegister` performance
      const tokenKey = `${salt}_${token2key(derivativeToken)}`;
      derivativeToken._tokenKey = tokenKey;

      const hashId = `css-${hash(tokenKey)}`;
      derivativeToken._hashId = hashId;

      return [derivativeToken, hashId];
    },
  );

  return cachedToken;
}
