import * as React from 'react';
import type * as CSS from 'csstype';
import { updateCSS } from 'rc-util/lib/Dom/dynamicCSS';
import hash from '@emotion/hash';
import unitless from '@emotion/unitless';
import { compile, serialize, stringify } from 'stylis';
import CacheEntity from './Cache';
import useGlobalCache from './useGlobalCache';

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

export type CSSInterpolation = InterpolationPrimitive | ArrayCSSInterpolation;

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
export const parseStyle = (interpolation: CSSInterpolation, root = true) => {
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
    Object.keys(style).forEach((key) => {
      const value = style[key];

      if (typeof value === 'object' && value) {
        // 当成嵌套对象来出来
        styleStr += `${key}${parseStyle(value as any, false)}`;
      } else {
        // 直接插入
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
  });

  if (!root) {
    styleStr = `{${styleStr}}`;
  }

  return styleStr;
};

// ============================================================================
// ==                                Register                                ==
// ============================================================================

/**
 * Register a style to the global style sheet.
 */
export default function useStyleRegister(
  stylePath: any[],
  styleFn: () => CSSInterpolation,
) {
  useGlobalCache('style', stylePath, (cache) => {
    if (cache) {
      return cache;
    }

    const styleStr = normalizeStyle(parseStyle(styleFn()));
    const styleId = hash(styleStr);

    updateCSS(styleStr, styleId);

    return styleStr;
  });
}
