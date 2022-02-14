import * as React from 'react';
import type * as CSS from 'csstype';
import { updateCSS, removeCSS } from 'rc-util/lib/Dom/dynamicCSS';
import canUseDom from 'rc-util/lib/Dom/canUseDom';
import hash from '@emotion/hash';
// @ts-ignore
import unitless from '@emotion/unitless';
import { compile, serialize, stringify } from 'stylis';
import useGlobalCache from './useGlobalCache';
import StyleContext from './StyleContext';
import type Cache from './Cache';
import type { Theme } from '.';
import { token2key } from './util';
import type Keyframes from './Keyframes';

const isClientSide = canUseDom();

export type CSSProperties = CSS.PropertiesFallback<number | string>;
export type CSSPropertiesWithMultiValues = {
  [K in keyof CSSProperties]:
    | CSSProperties[K]
    | Extract<CSSProperties[K], string>[];
};

export type CSSPseudos = { [K in CSS.Pseudos]?: CSSObject };

type ArrayCSSInterpolation = CSSInterpolation[];

export type InterpolationPrimitive =
  | null
  | undefined
  | boolean
  | number
  | string
  | CSSObject;

export type CSSInterpolation =
  | InterpolationPrimitive
  | ArrayCSSInterpolation
  | Keyframes;

export type CSSOthersObject = Record<string, CSSInterpolation>;

export interface CSSObject
  extends CSSPropertiesWithMultiValues,
    CSSPseudos,
    CSSOthersObject {}

// ============================================================================
// ==                                 Parser                                 ==
// ============================================================================
// Preprocessor style content to browser support one
function normalizeStyle(styleStr: string) {
  return serialize(compile(styleStr), stringify);
}

// Parse CSSObject to style content
export const parseStyle = (
  interpolation: CSSInterpolation,
  hashId?: string,
  root = true,
) => {
  let styleStr = '';

  function flattenList(
    list: ArrayCSSInterpolation,
    fullList: CSSObject[] = [],
  ) {
    list.forEach((item) => {
      if (Array.isArray(item)) {
        flattenList(item, fullList);
      } else if (item) {
        fullList.push(item as CSSObject);
      }
    });

    return fullList;
  }

  const flattenStyleList = flattenList(
    Array.isArray(interpolation) ? interpolation : [interpolation],
  );

  flattenStyleList.forEach((style) => {
    if ((style as any)._keyframe) {
      // Keyframe
      const keyframe = style as unknown as Keyframes;
      styleStr += `@keyframes ${keyframe.getName(hashId)}${parseStyle(
        keyframe.style,
        hashId,
        false,
      )}`;
    } else {
      // Normal CSSObject
      Object.keys(style).forEach((key) => {
        const value = style[key];

        if (typeof value === 'object' && value) {
          // 当成嵌套对象来处理
          const mergedKey = root && hashId ? `.${hashId}${key}` : key;
          styleStr += `${mergedKey}${parseStyle(value as any, hashId, false)}`;
        } else {
          // 如果是样式则直接插入
          const styleName = key.replace(
            /[A-Z]/g,
            (match) => `-${match.toLowerCase()}`,
          );

          // Auto suffix with px
          let formatValue = value;
          if (
            !unitless[key] &&
            typeof formatValue === 'number' &&
            formatValue !== 0
          ) {
            formatValue = `${formatValue}px`;
          }

          styleStr += `${styleName}:${formatValue};`;
        }
      });
    }
  });

  if (!root) {
    styleStr = `{${styleStr}}`;
  }

  return styleStr;
};

// ============================================================================
// ==                                Register                                ==
// ============================================================================
// We takes `theme.id` as part of hash to avoid HMR hit to remove the same style
function uniqueHash(path: (string | number)[], styleStr: string) {
  return hash(`${path.join('%')}${styleStr}`);
}

/**
 * Register a style to the global style sheet.
 */
export default function useStyleRegister(
  info: {
    theme: Theme<any, any>;
    token: any;
    path: string[];
    hashId?: string;
  },
  styleFn: () => CSSInterpolation,
) {
  const { theme, token, path, hashId } = info;
  const { autoClear, mock } = React.useContext(StyleContext);
  const tokenKey = (token._tokenKey as string) || token2key(token);

  const fullPath = [theme.id, tokenKey, ...path];

  useGlobalCache(
    'style',
    fullPath,
    // Create cache if needed
    () => {
      const styleObj = styleFn();
      const styleStr = normalizeStyle(parseStyle(styleObj, hashId));
      const styleId = uniqueHash(fullPath, styleStr);

      let shouldInsertStyle = isClientSide;
      if (process.env.NODE_ENV !== 'production' && mock !== undefined) {
        shouldInsertStyle = mock !== 'server';
      }

      if (shouldInsertStyle) {
        const style = updateCSS(styleStr, styleId);

        // Used for `useCacheToken` to remove on batch when token removed
        style.setAttribute('data-token-key', tokenKey);
      }

      return [styleStr, tokenKey];
    },
    // Remove cache if no need
    ([styleStr]) => {
      if (autoClear && isClientSide) {
        const styleId = uniqueHash(fullPath, styleStr);
        removeCSS(styleId);
      }
    },
  );
}

// ============================================================================
// ==                                  SSR                                   ==
// ============================================================================
/**
 * @private Do not use since this is a internal API
 */
export function getTokenStyles(cache: Cache) {
  // prefix with `style` is used for `useStyleRegister` to cache style context
  const styleKeys = Array.from(cache.cache.keys()).filter((key) =>
    key.startsWith('style%'),
  );

  const tokenStyles: Record<string, string[]> = {};

  styleKeys.forEach((key) => {
    const [styleStr, tokenKey] = cache.cache.get(key)![1];

    tokenStyles[tokenKey] = (tokenStyles[tokenKey] || []).concat(styleStr);
  });

  return Object.keys(tokenStyles).map((tokenKey) => {
    const styleStrList = tokenStyles[tokenKey];
    const styleStr = styleStrList.join('');

    // Wrap with style tag
    return {
      token: tokenKey,
      style: styleStr,
    };
  });
}

export function extractStyle(cache: Cache) {
  const styleList = getTokenStyles(cache);

  // Fill with styles
  let styleText = '';

  styleList.forEach(({ token, style }) => {
    // Wrap with style tag
    styleText += `<style data-token-key="${token}">${style}</style>`;
  });

  return styleText;
}
