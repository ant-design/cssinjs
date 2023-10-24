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
import { serializeCSSVar, transformToken } from '../util/css-variables';
import useGlobalCache from './useGlobalCache';

const useCSSVarRegister = <T>(
  config: {
    path: string[];
    key: string;
    prefix?: string;
    unitless?: Record<string, boolean>;
    token: any;
  },
  fn: () => Record<string, T>,
) => {
  const { key, prefix, unitless, token } = config;
  const {
    cache: { instanceId },
    container,
    autoClear,
  } = useContext(StyleContext);
  const { _tokenKey: tokenKey } = token;

  const fullPath = [...config.path, key, tokenKey];

  const cache = useGlobalCache<
    [TokenWithCSSVar<T>, Record<string, string>, Record<string, T>, string]
  >(
    'variables',
    fullPath,
    () => {
      const styleId = hash(fullPath.join('%'));
      const originToken = fn();
      const [mergedToken, cssVars] = transformToken(originToken, {
        prefix,
        unitless,
      });
      return [mergedToken, cssVars, originToken, styleId];
    },
    ([, , , styleId], fromHMR) => {
      if ((fromHMR || autoClear) && isClientSide) {
        removeCSS(styleId, { mark: ATTR_MARK });
      }
    },
    ([, cssVars, , styleId]) => {
      if (!Object.keys(cssVars).length) {
        return;
      }
      const declaration = serializeCSSVar(cssVars, key);
      const style = updateCSS(declaration, styleId, {
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
