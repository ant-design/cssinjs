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
import { styleValidate, warning } from './util';

const isClientSide = canUseDom();

const SKIP_CHECK = '_skip_check_';

export type CSSProperties = CSS.PropertiesFallback<number | string>;
export type CSSPropertiesWithMultiValues = {
  [K in keyof CSSProperties]:
    | CSSProperties[K]
    | Extract<CSSProperties[K], string>[]
    | {
        [SKIP_CHECK]: boolean;
        value: CSSProperties[K] | Extract<CSSProperties[K], string>[];
      };
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

function isCompoundCSSProperty(value: CSSObject[string]) {
  return typeof value === 'object' && value && SKIP_CHECK in value;
}

export let animationStatistics: Record<string, boolean> = {};

// Parse CSSObject to style content
export const parseStyle = (
  interpolation: CSSInterpolation,
  hashId?: string,
  path?: string,
  root = true,
  injectHash = false,
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
      animationStatistics[keyframe.getName(hashId)] = false;
      styleStr += `@keyframes ${keyframe.getName(hashId)}${parseStyle(
        keyframe.style,
        hashId,
        path,
        false,
      )}`;
    } else {
      // Normal CSSObject
      Object.keys(style).forEach((key) => {
        const value = style[key];

        if (
          typeof value === 'object' &&
          value &&
          !isCompoundCSSProperty(value)
        ) {
          let subInjectHash = false;

          // 当成嵌套对象来处理
          let mergedKey = key.trim();

          // 拆分多个选择器
          if ((root || injectHash) && hashId) {
            if (mergedKey.startsWith('@')) {
              // 略过媒体查询，交给子节点继续插入 hashId
              subInjectHash = true;
            } else {
              // 注入 hashId
              const keys = key.split(',').map((k) => `.${hashId}${k.trim()}`);
              mergedKey = keys.join(',');
            }
          }

          styleStr += `${mergedKey}${parseStyle(
            value as any,
            hashId,
            path,
            false,
            subInjectHash,
          )}`;
        } else {
          const actualValue = (value as any)?.value ?? value;
          if (
            process.env.NODE_ENV !== 'production' &&
            (typeof value !== 'object' || !(value as any)?.[SKIP_CHECK])
          ) {
            styleValidate(key, actualValue, path);
          }

          // 如果是样式则直接插入
          const styleName = key.replace(
            /[A-Z]/g,
            (match) => `-${match.toLowerCase()}`,
          );

          // Auto suffix with px
          let formatValue = actualValue;
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

function Empty() {
  return null;
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
      const styleStr = normalizeStyle(
        parseStyle(styleObj, hashId, path.join('-')),
      );
      const styleId = uniqueHash(fullPath, styleStr);

      // Animation check
      Object.entries(animationStatistics).forEach(([key, value]) => {
        if (value) {
          warning(
            `CSS animation '${key}' is used without declaring keyframes, which may cause animation loss.`,
            path.join('-'),
          );
        }
      });
      animationStatistics = {};

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
    let styleNode: React.ReactElement;

    if (isMergedClientSide || !defaultCache) {
      styleNode = <Empty />;
    } else {
      styleNode = (
        <style
          {...{
            [ATTR_TOKEN]: cachedTokenKey,
            [ATTR_MARK]: cachedStyleId,
          }}
          dangerouslySetInnerHTML={{ __html: cachedStyleStr }}
        />
      );
    }

    return (
      <>
        {styleNode}
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
