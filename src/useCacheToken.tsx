import hash from '@emotion/hash';
import { ATTR_TOKEN } from './StyleContext';
import type Theme from './Theme';
import useGlobalCache from './useGlobalCache';
import { flattenToken, token2key } from './util';

export interface Option {
  /**
   * Generate token with salt.
   * This is used to generate different hashId even same derivative token for different version.
   */
  salt?: string;
  override?: object;
}

const tokenKeys = new Map<string, number>();
function recordCleanToken(tokenKey: string) {
  tokenKeys.set(tokenKey, (tokenKeys.get(tokenKey) || 0) + 1);
}

function removeStyleTags(key: string) {
  if (typeof document !== 'undefined') {
    const styles = document.querySelectorAll(`style[${ATTR_TOKEN}="${key}"]`);

    styles.forEach((style) => {
      style.parentNode?.removeChild(style);
    });
  }
}

// Remove will check current keys first
function cleanTokenStyle(tokenKey: string) {
  tokenKeys.set(tokenKey, (tokenKeys.get(tokenKey) || 0) - 1);

  const tokenKeyList = Array.from(tokenKeys.keys());
  const cleanableKeyList = tokenKeyList.filter((key) => {
    const count = tokenKeys.get(key) || 0;

    return count <= 0;
  });

  if (cleanableKeyList.length < tokenKeyList.length) {
    cleanableKeyList.forEach((key) => {
      removeStyleTags(key);
      tokenKeys.delete(key);
    });
  }
}

/**
 * Cache theme derivative token as global shared one
 * @param theme Theme entity
 * @param tokens List of tokens, used for cache. Please do not dynamic generate object directly
 * @param option Additional config
 * @returns Call Theme.getDerivativeToken(tokenObject) to get token
 */
export default function useCacheToken<
  DerivativeToken = object,
  DesignToken = DerivativeToken,
>(
  theme: Theme<any, any>,
  tokens: Partial<DesignToken>[],
  option: Option = {},
): [DerivativeToken & { _tokenKey: string }, string] {
  const { salt = '', override = {} } = option;

  // Basic
  const mergedToken = Object.assign({}, ...tokens);
  const tokenStr = flattenToken(mergedToken);
  const overrideTokenStr = flattenToken(override);

  const cachedToken = useGlobalCache<
    [DerivativeToken & { _tokenKey: string }, string]
  >(
    'token',
    [salt, tokenStr, overrideTokenStr],
    () => {
      const derivativeToken = theme.getDerivativeToken(mergedToken);

      // Merge with override
      const mergedDerivativeToken = {
        ...derivativeToken,
        ...override,
      };

      // Optimize for `useStyleRegister` performance
      const tokenKey = token2key(mergedDerivativeToken, salt);
      mergedDerivativeToken._tokenKey = tokenKey;
      recordCleanToken(tokenKey);

      const hashId = `css-${hash(tokenKey)}`;
      mergedDerivativeToken._hashId = hashId; // Not used

      return [mergedDerivativeToken, hashId];
    },
    (cache) => {
      // Remove token will remove all related style
      cleanTokenStyle(cache[0]._tokenKey);
    },
  );

  return cachedToken;
}
