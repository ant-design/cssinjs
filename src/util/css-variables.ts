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
    scope?: string;
  },
) => {
  if (!Object.keys(cssVars).length) {
    return '';
  }
  return `.${hashId}${
    options?.scope ? `.${options.scope}` : ''
  }{${Object.entries(cssVars)
    .map(([key, value]) => `${key}:${value};`)
    .join('')}}`;
};

export type TokenWithCSSVar<T> = {
  [key in keyof T]?: string;
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
    scope?: string;
  },
): [TokenWithCSSVar<T>, string] => {
  const cssVars: Record<string, string> = {};
  const result: TokenWithCSSVar<T> = {};
  Object.entries(token).forEach(([key, value]) => {
    if (
      (typeof value === 'string' || typeof value === 'number') &&
      !config?.ignore?.[key]
    ) {
      const cssVar = token2CSSVar(key, config?.prefix);
      cssVars[cssVar] =
        typeof value === 'number' && !config?.unitless?.[key]
          ? `${value}px`
          : String(value);
      result[key as keyof T] = `var(${cssVar})`;
    }
  });
  return [result, serializeCSSVar(cssVars, themeKey, { scope: config?.scope })];
};
