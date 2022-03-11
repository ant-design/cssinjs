import * as React from 'react';
import type * as CSS from 'csstype';
import { updateCSS, removeCSS } from 'rc-util/lib/Dom/dynamicCSS';
import canUseDom from 'rc-util/lib/Dom/canUseDom';
import hash from '@emotion/hash';
// @ts-ignore
import unitless from '@emotion/unitless';
import { compile, serialize, stringify } from 'stylis';
import useGlobalCache from './useGlobalCache';
import StyleContext, { ATTR_MARK, ATTR_TOKEN } from './StyleContext';
import type Cache from './Cache';
import type { Theme } from '.';
import type Keyframes from './Keyframes';
import { styleValidate } from './util';

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
          let mergedKey = key;

          // 拆分多个选择器
          if (root && hashId) {
            const keys = key.split(',').map((k) => `.${hashId}${k.trim()}`);
            mergedKey = keys.join(',');
          }

          styleStr += `${mergedKey}${parseStyle(value as any, hashId, false)}`;
        } else {
          if (process.env.NODE_ENV !== 'production') {
            styleValidate(key, value);
          }

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
  const { token, path, hashId } = info;
  const { autoClear, mock, defaultCache } = React.useContext(StyleContext);
  const tokenKey = token._tokenKey as string;

  const fullPath = [tokenKey, ...path];

  // Check if need insert style
  let isMergedClientSide = isClientSide;
  if (process.env.NODE_ENV !== 'production' && mock !== undefined) {
    isMergedClientSide = mock === 'client';
  }

  const [cachedStyleStr, cachedTokenKey, cachedStyleId] = useGlobalCache(
    'style',
    fullPath,
    // Create cache if needed
    () => {
      const styleObj = styleFn();
      const styleStr = normalizeStyle(parseStyle(styleObj, hashId));
      const styleId = uniqueHash(fullPath, styleStr);

      if (isMergedClientSide) {
        const style = updateCSS(styleStr, styleId, { mark: ATTR_MARK });

        // Used for `useCacheToken` to remove on batch when token removed
        style.setAttribute(ATTR_TOKEN, tokenKey);
      }

      return [styleStr, tokenKey, styleId];
    },
    // Remove cache if no need
    ([, , styleId]) => {
      if (autoClear && isClientSide) {
        removeCSS(styleId, { mark: ATTR_MARK });
      }
    },
  );

  return (node: React.ReactElement) => {
    if (isMergedClientSide || !defaultCache) {
      return node;
    }

    return (
      <>
        <style
          {...{
            [ATTR_TOKEN]: cachedTokenKey,
            [ATTR_MARK]: cachedStyleId,
          }}
          dangerouslySetInnerHTML={{ __html: cachedStyleStr }}
        />
        {node}
      </>
    );
  };
}

// ============================================================================
// ==                                  SSR                                   ==
// ============================================================================
export function extractStyle(cache: Cache) {
  // prefix with `style` is used for `useStyleRegister` to cache style context
  const styleKeys = Array.from(cache.cache.keys()).filter((key) =>
    key.startsWith('style%'),
  );

  // const tokenStyles: Record<string, string[]> = {};

  let styleText = '';

  styleKeys.forEach((key) => {
    const [styleStr, tokenKey, styleId]: [string, string, string] =
      cache.cache.get(key)![1];

    styleText += `<style ${ATTR_TOKEN}="${tokenKey}" ${ATTR_MARK}="${styleId}">${styleStr}</style>`;
  });

  return styleText;
}
