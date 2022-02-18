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
export default function useCacheToken(
  theme: Theme<any, any>,
  tokens: object[],
  option: Option = {},
) {
  const { salt = '' } = option;

  // Basic
  const mergedToken = Object.assign({}, ...tokens);
  const tokenStr = flattenToken(mergedToken);

  const cachedToken = useGlobalCache(
    'token',
    [salt, tokenStr],
    () => {
      const derivativeToken = theme.getDerivativeToken(mergedToken);

      // Optimize for `useStyleRegister` performance
      const tokenKey = token2key(derivativeToken, salt);
      derivativeToken._tokenKey = tokenKey;
      recordCleanToken(tokenKey);

      const hashId = `css-${hash(tokenKey)}`;
      derivativeToken._hashId = hashId; // Not used

      return [derivativeToken, hashId];
    },
    (cache) => {
      // Remove token will remove all related style
      cleanTokenStyle(cache[0]._tokenKey);
    },
  );

  return cachedToken;
}
