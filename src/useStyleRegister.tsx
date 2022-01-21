import * as React from 'react';
import type * as CSS from 'csstype';
import { updateCSS } from 'rc-util/lib/Dom/dynamicCSS';
import hash from '@emotion/hash';
import { compile, serialize, stringify } from 'stylis';
import CacheEntity from './Cache';

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
function normalizeStyle(styleStr: string) {
  return serialize(compile(styleStr), stringify);
}

export const parseStyle = (style: CSSObject, root = true) => {
  let styleStr = '';

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
      styleStr += `${styleName}:${value};`;
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

const styleCache = new CacheEntity<any, string>();

function registerStyle(styleFn: () => CSSObject, path: any[]) {
  styleCache.update(path, (cached) => {
    if (cached) {
      return cached;
    }

    const styleStr = normalizeStyle(parseStyle(styleFn()));
    const styleId = hash(styleStr);

    updateCSS(styleStr, styleId);

    return styleStr;
  });
}

(window as any).styleCache = styleCache;

/**
 * Register a style to the global style sheet.
 */
export default function useStyleRegister(
  stylePath: any[],
  styleFn: () => CSSObject,
) {
  console.time('useStyleRegister');
  registerStyle(styleFn, stylePath);
  console.timeEnd('useStyleRegister');
}
