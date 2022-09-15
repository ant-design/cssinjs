import * as React from 'react';
import type * as CSS from 'csstype';
import { updateCSS, removeCSS } from 'rc-util/lib/Dom/dynamicCSS';
import canUseDom from 'rc-util/lib/Dom/canUseDom';
import hash from '@emotion/hash';
// @ts-ignore
import unitless from '@emotion/unitless';
import { compile, serialize, stringify } from 'stylis';
import useGlobalCache from './useGlobalCache';
import StyleContext, {
  ATTR_MARK,
  ATTR_TOKEN,
  ATTR_DEV_CACHE_PATH,
  CSS_IN_JS_INSTANCE,
  CSS_IN_JS_INSTANCE_ID,
} from '../StyleContext';
import type Cache from '../Cache';
import type { Theme } from '..';
import type Keyframes from '../Keyframes';
import { styleValidate, supportLayer } from '../util';

const isClientSide = canUseDom();

const SKIP_CHECK = '_skip_check_';

export type CSSProperties = Omit<
  CSS.PropertiesFallback<number | string>,
  'animationName'
> & {
  animationName?:
    | CSS.PropertiesFallback<number | string>['animationName']
    | Keyframes;
};

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
  layer?: string,
  path?: string,
  root = true,
  injectHash = false,
) => {
  let styleStr = '';

  function parseKeyframes(keyframes: Keyframes) {
    if (animationStatistics[keyframes.getName(hashId)]) {
      return '';
    }
    animationStatistics[keyframes.getName(hashId)] = true;
    return `@keyframes ${keyframes.getName(hashId)}${parseStyle(
      keyframes.style,
      hashId,
      layer,
      path,
      false,
    )}`;
  }

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
      styleStr += parseKeyframes(style as unknown as Keyframes);
    } else {
      // Normal CSSObject
      Object.keys(style).forEach((key) => {
        const value = style[key];

        if (
          typeof value === 'object' &&
          value &&
          (key !== 'animationName' || !(value as Keyframes)._keyframe) &&
          !isCompoundCSSProperty(value)
        ) {
          let subInjectHash = false;

          // 当成嵌套对象来处理
          let mergedKey = key.trim();
          // Whether treat child as root. In most case it is false.
          let nextRoot = false;

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
          } else if (
            root &&
            !hashId &&
            (mergedKey === '&' || mergedKey === '')
          ) {
            // In case of `{ '&': { a: { color: 'red' } } }` or `{ '': { a: { color: 'red' } } }` without hashId,
            // we will get `&{a:{color:red;}}` or `{a:{color:red;}}` string for stylis to compile.
            // But it does not conform to stylis syntax,
            // and finally we will get `{color:red;}` as css, which is wrong.
            // So we need to remove key in root, and treat child `{ a: { color: 'red' } }` as root.
            mergedKey = '';
            nextRoot = true;
          }

          styleStr += `${mergedKey}${parseStyle(
            value as any,
            hashId,
            layer,
            `${path} -> ${mergedKey}`,
            nextRoot,
            subInjectHash,
          )}`;
        } else {
          const actualValue = (value as any)?.value ?? value;
          if (
            process.env.NODE_ENV !== 'production' &&
            (typeof value !== 'object' || !(value as any)?.[SKIP_CHECK])
          ) {
            styleValidate(key, actualValue, { path, hashId });
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

          // handle animationName & Keyframe value
          if (key === 'animationName' && (value as Keyframes)?._keyframe) {
            styleStr += parseKeyframes(value as Keyframes);
            formatValue = (value as Keyframes).getName(hashId);
          }

          styleStr += `${styleName}:${formatValue};`;
        }
      });
    }
  });

  if (!root) {
    styleStr = `{${styleStr}}`;
  } else if (layer && supportLayer()) {
    styleStr = `@layer ${layer} {${styleStr}}`;
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
    layer?: string;
  },
  styleFn: () => CSSInterpolation,
) {
  const { token, path, hashId, layer } = info;
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
        parseStyle(styleObj, hashId, layer, path.join('-')),
      );
      const styleId = uniqueHash(fullPath, styleStr);

      // Clear animation statistics
      animationStatistics = {};

      if (isMergedClientSide) {
        const style = updateCSS(styleStr, styleId, {
          mark: ATTR_MARK,
          prepend: 'queue',
        });

        (style as any)[CSS_IN_JS_INSTANCE] = CSS_IN_JS_INSTANCE_ID;

        // Used for `useCacheToken` to remove on batch when token removed
        style.setAttribute(ATTR_TOKEN, tokenKey);

        // Dev usage to find which cache path made this easily
        if (process.env.NODE_ENV !== 'production') {
          style.setAttribute(ATTR_DEV_CACHE_PATH, fullPath.join('|'));
        }
      }

      return [styleStr, tokenKey, styleId];
    },
    // Remove cache if no need
    ([, , styleId], fromHMR) => {
      if ((fromHMR || autoClear) && isClientSide) {
        removeCSS(styleId, { mark: ATTR_MARK });
      }
    },
    // Should update by HMR
    true,
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
