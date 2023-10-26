import { removeCSS, updateCSS } from 'rc-util/lib/Dom/dynamicCSS';
import { useContext } from 'react';
import StyleContext, {
  ATTR_MARK,
  ATTR_TOKEN,
  CSS_IN_JS_INSTANCE,
} from '../StyleContext';
import { isClientSide, toStyleStr } from '../util';
import type { TokenWithCSSVar } from '../util/css-variables';
import { transformToken } from '../util/css-variables';
import type { ExtractStyle } from './useGlobalCache';
import useGlobalCache from './useGlobalCache';
import { uniqueHash } from './useStyleRegister';

export const CSS_VAR_PREFIX = 'cssVar';

type CSSVarCacheValue<T> = [
  cssVarToken: TokenWithCSSVar<T>,
  cssVarStr: string,
  styleId: string,
  cssVarKey: string,
];

const useCSSVarRegister = <V, T extends Record<string, V>>(
  config: {
    path: string[];
    key: string;
    prefix?: string;
    unitless?: Record<string, boolean>;
    token: any;
  },
  fn: () => T,
) => {
  const { key, prefix, unitless, token } = config;
  const {
    cache: { instanceId },
    container,
    autoClear,
  } = useContext(StyleContext);
  const { _tokenKey: tokenKey } = token;

  const cache = useGlobalCache<CSSVarCacheValue<T>>(
    CSS_VAR_PREFIX,
    [...config.path, key, tokenKey],
    () => {
      const originToken = fn();
      const [mergedToken, cssVarsStr] = transformToken(originToken, key, {
        prefix,
        unitless,
      });
      const styleId = uniqueHash([...config.path, key], cssVarsStr);
      return [mergedToken, cssVarsStr, styleId, key];
    },
    ([, , styleId], fromHMR) => {
      if ((fromHMR || autoClear) && isClientSide) {
        removeCSS(styleId, { mark: ATTR_MARK });
      }
    },
    ([, cssVarsStr, styleId]) => {
      if (!cssVarsStr) {
        return;
      }
      const style = updateCSS(cssVarsStr, styleId, {
        mark: ATTR_MARK,
        prepend: 'queue',
        attachTo: container,
        priority: -999,
      });

      (style as any)[CSS_IN_JS_INSTANCE] = instanceId;

      // Used for `useCacheToken` to remove on batch when token removed
      style.setAttribute(ATTR_TOKEN, key);
    },
  );

  return cache;
};

export const extract: ExtractStyle<CSSVarCacheValue<any>> = (
  cache,
  effectStyles,
  options,
) => {
  const [, styleStr, styleId, cssVarKey] = cache;
  const { plain } = options || {};

  if (!styleStr) {
    return null;
  }

  const order = -999;

  // ====================== Style ======================
  // Used for rc-util
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

export default useCSSVarRegister;
