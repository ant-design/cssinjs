import hash from '@emotion/hash';
import * as React from 'react';
import { useContext } from 'react';
import StyleContext, { ATTR_TOKEN, CSS_IN_JS_INSTANCE } from '../StyleContext';
import type Theme from '../theme/Theme';
import { flattenToken, token2key } from '../util';
import useEffectCleanupRegister from './useEffectCleanupRegister';
import useGlobalCache from './useGlobalCache';

const EMPTY_OVERRIDE = {};

// Generate different prefix to make user selector break in production env.
// This helps developer not to do style override directly on the hash id.
const hashPrefix =
  process.env.NODE_ENV !== 'production'
    ? 'css-dev-only-do-not-override'
    : 'css';

export interface Option<DerivativeToken, DesignToken> {
  /**
   * Generate token with salt.
   * This is used to generate different hashId even same derivative token for different version.
   */
  salt?: string;
  override?: object;
  /**
   * Format token as you need. Such as:
   *
   * - rename token
   * - merge token
   * - delete token
   *
   * This should always be the same since it's one time process.
   * It's ok to useMemo outside but this has better cache strategy.
   */
  formatToken?: (mergedToken: any) => DerivativeToken;
  /**
   * Get final token with origin token, override token and theme.
   * The parameters do not contain formatToken since it's passed by user.
   * @param origin The original token.
   * @param override Extra tokens to override.
   * @param theme Theme instance. Could get derivative token by `theme.getDerivativeToken`
   */
  getComputedToken?: (
    origin: DesignToken,
    override: object,
    theme: Theme<any, any>,
  ) => DerivativeToken;
}

const tokenKeys = new Map<string, number>();
function recordCleanToken(tokenKey: string) {
  tokenKeys.set(tokenKey, (tokenKeys.get(tokenKey) || 0) + 1);
}

function removeStyleTags(key: string, instanceId: string) {
  if (typeof document !== 'undefined') {
    const styles = document.querySelectorAll(`style[${ATTR_TOKEN}="${key}"]`);

    styles.forEach((style) => {
      if ((style as any)[CSS_IN_JS_INSTANCE] === instanceId) {
        style.parentNode?.removeChild(style);
      }
    });
  }
}

const TOKEN_THRESHOLD = 0;

// Remove will check current keys first
function cleanTokenStyle(tokenKey: string, instanceId: string) {
  tokenKeys.set(tokenKey, (tokenKeys.get(tokenKey) || 0) - 1);

  const tokenKeyList = Array.from(tokenKeys.keys());
  const cleanableKeyList = tokenKeyList.filter((key) => {
    const count = tokenKeys.get(key) || 0;

    return count <= 0;
  });

  // Should keep tokens under threshold for not to insert style too often
  if (tokenKeyList.length - cleanableKeyList.length > TOKEN_THRESHOLD) {
    cleanableKeyList.forEach((key) => {
      removeStyleTags(key, instanceId);
      tokenKeys.delete(key);
    });
  }
}

export const getComputedToken = <
  DerivativeToken = object,
  DesignToken = DerivativeToken,
>(
  originToken: DesignToken,
  overrideToken: object,
  theme: Theme<any, any>,
  format?: (token: DesignToken) => DerivativeToken,
) => {
  const derivativeToken = theme.getDerivativeToken(originToken);

  // Merge with override
  let mergedDerivativeToken = {
    ...derivativeToken,
    ...overrideToken,
  };

  // Format if needed
  if (format) {
    mergedDerivativeToken = format(mergedDerivativeToken);
  }

  return mergedDerivativeToken;
};

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
  option: Option<DerivativeToken, DesignToken> = {},
): [DerivativeToken & { _tokenKey: string }, string] {
  const {
    cache: { instanceId },
  } = useContext(StyleContext);
  const {
    salt = '',
    override = EMPTY_OVERRIDE,
    formatToken,
    getComputedToken: compute,
  } = option;

  const register = useEffectCleanupRegister();

  // Basic - We do basic cache here
  const mergedToken = React.useMemo(
    () => Object.assign({}, ...tokens),
    [tokens],
  );
  const tokenStr = React.useMemo(
    () => flattenToken(mergedToken),
    [mergedToken],
  );
  const overrideTokenStr = React.useMemo(
    () => flattenToken(override),
    [override],
  );

  const cachedToken = useGlobalCache<
    [DerivativeToken & { _tokenKey: string }, string]
  >(
    'token',
    [salt, theme.id, tokenStr, overrideTokenStr],
    () => {
      const mergedDerivativeToken = compute
        ? compute(mergedToken, override, theme)
        : getComputedToken(mergedToken, override, theme, formatToken);

      // Optimize for `useStyleRegister` performance
      const tokenKey = token2key(mergedDerivativeToken, salt);
      mergedDerivativeToken._tokenKey = tokenKey;
      recordCleanToken(tokenKey);

      const hashId = `${hashPrefix}-${hash(tokenKey)}`;
      mergedDerivativeToken._hashId = hashId; // Not used

      return [mergedDerivativeToken, hashId];
    },
    (cache) => {
      // Remove token will remove all related style
      // Always remove styles in useEffect callback
      register(() => {
        cleanTokenStyle(cache[0]._tokenKey, instanceId);
      });
    },
  );

  return cachedToken;
}
