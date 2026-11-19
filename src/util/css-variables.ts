import type { HashPriority } from '../StyleContext';
import { where } from '../util';

export const token2CSSVar = (token: string, prefix = '') => {
  return `--${prefix ? `${prefix}-` : ''}${token}`
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z0-9]+)/g, '$1-$2')
    .replace(/([a-z])([A-Z0-9])/g, '$1-$2')
    .toLowerCase();
};

export const serializeCSSVar = <T extends Record<string, any>>(
  cssVars: T,
  hashId: string,
  options?: {
    scope?: string | string[];
    /**
     * How the scope class combines with the cssVar key class:
     *
     * - `self` (default): `.key.scope` — the scope class must sit on the same
     *   node that carries the cssVar key class.
     * - `descendant`: `.key .scope` — the scope class matches any descendant of
     *   the cssVar key node. Useful when a single host (e.g. an App wrapper)
     *   carries the cssVar key so component scopes don't need to repeat it.
     */
    scopeType?: 'self' | 'descendant';
    hashCls?: string;
    hashPriority?: HashPriority;
  },
) => {
  const { hashCls, hashPriority = 'low', scope, scopeType = 'self' } = options || {};
  if (!Object.keys(cssVars).length) {
    return '';
  }

  const baseSelector = `${where({ hashCls, hashPriority })}.${hashId}`;
  const scopes = [scope].flat().filter(Boolean);
  const selector = scopes.length
    ? scopes
        .map((s) =>
          scopeType === 'descendant' ? `${baseSelector} .${s}` : `${baseSelector}.${s}`,
        )
        .join(', ')
    : baseSelector;

  return `${selector}{${Object.entries(cssVars)
    .map(([key, value]) => `${key}:${value};`)
    .join('')}}`;
};

export type TokenWithCSSVar<
  V,
  T extends Record<string, V> = Record<string, V>,
> = {
  [key in keyof T]?: string | V;
};

export const transformToken = <
  V,
  T extends Record<string, V> = Record<string, V>,
>(
  token: T,
  themeKey: string,
  config?: {
    prefix?: string;
    ignore?: {
      [key in keyof T]?: boolean;
    };
    unitless?: {
      [key in keyof T]?: boolean;
    };
    preserve?: {
      [key in keyof T]?: boolean;
    };
    scope?: string | string[];
    scopeType?: 'self' | 'descendant';
    hashCls?: string;
    hashPriority?: HashPriority;
  },
): [TokenWithCSSVar<V, T>, string] => {
  const {
    hashCls,
    hashPriority = 'low',
    prefix,
    unitless,
    ignore,
    preserve,
  } = config || {};
  const cssVars: Record<string, string> = {};
  const result: TokenWithCSSVar<V, T> = {};
  Object.entries(token).forEach(([key, value]) => {
    if (preserve?.[key]) {
      result[key as keyof T] = value;
    } else if (
      (typeof value === 'string' || typeof value === 'number') &&
      !ignore?.[key]
    ) {
      const cssVar = token2CSSVar(key, prefix);
      cssVars[cssVar] =
        typeof value === 'number' && !unitless?.[key]
          ? `${value}px`
          : String(value);
      result[key as keyof T] = `var(${cssVar})`;
    }
  });
  return [
    result,
    serializeCSSVar(cssVars, themeKey, {
      scope: config?.scope,
      scopeType: config?.scopeType,
      hashCls,
      hashPriority,
    }),
  ];
};
