import hash from '@emotion/hash';
import { updateCSS } from 'rc-util/lib/Dom/dynamicCSS';
import { useContext } from 'react';
import StyleContext, {
  ATTR_MARK,
  ATTR_TOKEN,
  CSS_IN_JS_INSTANCE,
} from '../StyleContext';
import type Theme from '../theme/Theme';
import { flattenToken, memoResult, token2key } from '../util';
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
  cssVar?: {
    prefix?: string;
    unitless?: Record<string, boolean>;
    ignore?: Record<string, boolean>;
  };
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

// Camel case to kebab case
const token2CSSVar = (token: string, prefix = '') => {
  return `--${prefix ? `${prefix}-` : ''}${token
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z0-9]+)/g, '$1-$2')
    .replace(/([a-z])([A-Z0-9])/g, '$1-$2')
    .toLowerCase()}`;
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
): [DerivativeToken & { _tokenKey: string }, string, DerivativeToken, any] {
  const {
    cache: { instanceId },
    container,
  } = useContext(StyleContext);
  const {
    salt = '',
    override = EMPTY_OVERRIDE,
    formatToken,
    getComputedToken: compute,
    cssVar,
  } = option;

  // Basic - We do basic cache here
  const mergedToken = memoResult(() => Object.assign({}, ...tokens), tokens);

  const tokenStr = flattenToken(mergedToken);
  const overrideTokenStr = flattenToken(override);

  const cssVarStr = !!cssVar ? 'css-variables' : '';

  const cachedToken = useGlobalCache<
    [
      DerivativeToken & { _tokenKey: string },
      string,
      DerivativeToken & { _tokenKey: string },
      any,
    ]
  >(
    'token',
    [salt, theme.id, tokenStr, overrideTokenStr, cssVarStr],
    () => {
      const mergedDerivativeToken = compute
        ? compute(mergedToken, override, theme)
        : getComputedToken(mergedToken, override, theme, formatToken);

      // Replace token value with css variables
      const actualToken = { ...mergedDerivativeToken };
      const cssVarMapping: any = {};
      if (!!cssVar) {
        Object.entries(mergedDerivativeToken).forEach(([key, value]) => {
          if (
            (typeof value === 'string' || typeof value === 'number') &&
            !cssVar?.ignore?.[key]
          ) {
            const tokenVar = token2CSSVar(key, cssVar.prefix);
            cssVarMapping[key] = tokenVar;
            mergedDerivativeToken[key] = `var(${tokenVar})`;
          }
        });
      }

      // Optimize for `useStyleRegister` performance
      const tokenKey = token2key(mergedDerivativeToken, salt);
      mergedDerivativeToken._tokenKey = tokenKey;
      recordCleanToken(tokenKey);

      const hashId = `${hashPrefix}-${hash(tokenKey)}`;
      mergedDerivativeToken._hashId = hashId; // Not used

      return [mergedDerivativeToken, hashId, actualToken, cssVarMapping];
    },
    (cache) => {
      // Remove token will remove all related style
      cleanTokenStyle(cache[0]._tokenKey, instanceId);
    },
    ([_, hashId, actualTokens, cssVarMapping]) => {
      if (cssVar) {
        const declaration = `.${hashId} {${Object.entries(cssVarMapping)
          .map(([key, value]) => {
            let actualValue = (actualTokens as any)[key];
            if (typeof actualValue === 'number' && !cssVar.unitless?.[key]) {
              actualValue = `${actualValue}px`;
            }
            return `${value}: ${actualValue};`;
          })
          .join('')}}`;
        const style = updateCSS(declaration, `css-variables-${hashId}`, {
          mark: ATTR_MARK,
          prepend: 'queue',
          attachTo: container,
          priority: -999,
        });

        (style as any)[CSS_IN_JS_INSTANCE] = instanceId;

        // Used for `useCacheToken` to remove on batch when token removed
        style.setAttribute(ATTR_TOKEN, actualTokens._tokenKey);
      }
    },
  );

  return cachedToken;
}
