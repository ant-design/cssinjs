import hash from '@emotion/hash';
import { removeCSS, updateCSS } from 'rc-util/lib/Dom/dynamicCSS';
import { useContext } from 'react';
import StyleContext, {
  ATTR_MARK,
  ATTR_TOKEN,
  CSS_IN_JS_INSTANCE,
} from '../StyleContext';
import { isClientSide } from '../util';
import type { TokenWithCSSVar } from '../util/css-variables';
import { transformToken } from '../util/css-variables';
import useGlobalCache from './useGlobalCache';

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

  const cache = useGlobalCache<[TokenWithCSSVar<T>, string, T, string]>(
    'variables',
    [...config.path, key, tokenKey],
    () => {
      const styleId = hash([...config.path, key].join('%'));
      const originToken = fn();
      const [mergedToken, cssVarsStr] = transformToken(originToken, key, {
        prefix,
        unitless,
      });
      return [mergedToken, cssVarsStr, originToken, styleId];
    },
    ([, , , styleId], fromHMR) => {
      if ((fromHMR || autoClear) && isClientSide) {
        removeCSS(styleId, { mark: ATTR_MARK });
      }
    },
    ([, cssVarsStr, , styleId]) => {
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

export default useCSSVarRegister;
