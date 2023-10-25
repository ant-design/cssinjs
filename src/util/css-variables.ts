export const token2CSSVar = (token: string, prefix = '') => {
  return `--${prefix ? `${prefix}-` : ''}${token}`
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z0-9]+)/g, '$1-$2')
    .replace(/([a-z])([A-Z0-9])/g, '$1-$2')
    .toLowerCase();
};

export type TokenWithCSSVar<T> = {
  [key in keyof T]?: string | TokenWithCSSVar<T>;
};

export const transformToken = <
  V,
  T extends Record<string, V> = Record<string, V>,
>(
  token: T,
  config?: {
    prefix?: string;
    ignore?: {
      [key in keyof T]?: boolean;
    };
    unitless?: {
      [key in keyof T]?: boolean;
    };
  },
): [TokenWithCSSVar<T>, Record<string, string>] => {
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
  return [result, cssVars];
};

export const serializeCSSVar = <T extends Record<string, any>>(
  cssVars: T,
  hashId: string,
) => {
  return `.${hashId}{${Object.entries(cssVars)
    .map(([key, value]) => `${key}:${value};`)
    .join('')}}`;
};
