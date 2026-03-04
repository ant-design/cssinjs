import hash from '@emotion/hash';
import { updateCSS } from '@rc-component/util/lib/Dom/dynamicCSS';
import { useContext } from 'react';
import StyleContext, {
  ATTR_MARK,
  ATTR_TOKEN,
  CSS_IN_JS_INSTANCE,
} from '../StyleContext';
import type Theme from '../theme/Theme';
import { flattenToken, memoResult, token2key, toStyleStr } from '../util';
import { transformToken } from '../util/css-variables';
import type { ExtractStyle } from './useGlobalCache';
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

  /**
   * Transform token to css variables.
   */
  cssVar: {
    hashed?: boolean;
    /** Prefix for css variables */
    prefix?: string;
    /** Tokens that should not be appended with unit */
    unitless?: Record<string, boolean>;
    /** Tokens that should not be transformed to css variables */
    ignore?: Record<string, boolean>;
    /** Tokens that preserves origin value */
    preserve?: Record<string, boolean>;
    /** Key for current theme. Useful for customizing and should be unique */
    key: string;
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

const TOKEN_THRESHOLD = -1;

// Remove will check current keys first
function cleanTokenStyle(tokenKey: string, instanceId: string) {
  tokenKeys.set(tokenKey, (tokenKeys.get(tokenKey) || 0) - 1);

  const cleanableKeyList = new Set<string>();
  tokenKeys.forEach((value, key) => {
    if (value <= 0) cleanableKeyList.add(key);
  });

  // Should keep tokens under threshold for not to insert style too often
  if (tokenKeys.size - cleanableKeyList.size > TOKEN_THRESHOLD) {
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

export const TOKEN_PREFIX = 'token';

type TokenCacheValue<DerivativeToken> = [
  token: DerivativeToken,
  hashId: string,
  realToken: DerivativeToken,
  cssVarStr: string,
  cssVarKey: string,
];

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
  option: Option<DerivativeToken, DesignToken>,
): TokenCacheValue<DerivativeToken> {
  const {
    cache: { instanceId },
    container,
    hashPriority,
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

  const cssVarStr = flattenToken(cssVar);

  const cachedToken = useGlobalCache<TokenCacheValue<DerivativeToken>>(
    TOKEN_PREFIX,
    [salt, theme.id, tokenStr, overrideTokenStr, cssVarStr],
    () => {
      const mergedDerivativeToken = compute
        ? compute(mergedToken, override, theme)
        : getComputedToken(mergedToken, override, theme, formatToken);
      const actualToken = { ...mergedDerivativeToken };

      // Optimize for `useStyleRegister` performance
      const mergedSalt = `${salt}_${cssVar.prefix}`;
      const hashId = hash(mergedSalt);
      const hashCls = `${hashPrefix}-${hashId}`;
      actualToken._tokenKey = token2key(actualToken, mergedSalt);

      // Replace token value with css variables
      const [tokenWithCssVar, cssVarsStr] = transformToken(
        mergedDerivativeToken,
        cssVar.key,
        {
          prefix: cssVar.prefix,
          ignore: cssVar.ignore,
          unitless: cssVar.unitless,
          preserve: cssVar.preserve,
          hashPriority,
          hashCls: cssVar.hashed ? hashCls : undefined,
        },
      ) as [any, string];
      tokenWithCssVar._hashId = hashId;

      recordCleanToken(cssVar.key);
      return [tokenWithCssVar, hashCls, actualToken, cssVarsStr, cssVar.key];
    },
    ([, , , , themeKey]) => {
      // Remove token will remove all related style
      cleanTokenStyle(themeKey, instanceId);
    },
    ([, , , cssVarsStr, themeKey]) => {
      if (!cssVarsStr) {
        return;
      }
      const style = updateCSS(cssVarsStr, hash(`css-var-${themeKey}`), {
        mark: ATTR_MARK,
        prepend: 'queue',
        attachTo: container,
        priority: -999,
      });

      (style as any)[CSS_IN_JS_INSTANCE] = instanceId;

      // Used for `useCacheToken` to remove on batch when token removed
      style.setAttribute(ATTR_TOKEN, themeKey);
    },
  );

  return cachedToken;
}

export const extract: ExtractStyle<TokenCacheValue<any>> = (
  cache,
  effectStyles,
  options,
) => {
  const [, , realToken, styleStr, cssVarKey] = cache;
  const { plain } = options || {};

  if (!styleStr) {
    return null;
  }

  const styleId = realToken._tokenKey;
  const order = -999;

  // ====================== Style ======================
  // Used for @rc-component/util
  const sharedAttrs = {
    'data-rc-order': 'prependQueue',
    'data-rc-priority': `${order}`,
  };

  const styleText = toStyleStr(
    styleStr,
    cssVarKey,
    styleId,
    sharedAttrs,
    plain,
  );

  return [order, styleId, styleText];
};
