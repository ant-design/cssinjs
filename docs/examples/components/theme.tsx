import type { CSSObject, Theme } from '@ant-design/cssinjs';
import { createTheme, useCacheToken } from '@ant-design/cssinjs';
import { TinyColor } from '@ctrl/tinycolor';
import React from 'react';

export type GetStyle = (prefixCls: string, token: DerivativeToken) => CSSObject;

export interface DesignToken {
  primaryColor: string;
  textColor: string;
  reverseTextColor: string;

  componentBackgroundColor: string;

  borderRadius: number;
  borderColor: string;
  borderWidth: number;

  lineHeight: number;
  lineHeightBase: number;
}

export interface DerivativeToken extends DesignToken {
  primaryColorDisabled: string;
}

const defaultDesignToken: DesignToken = {
  primaryColor: '#1890ff',
  textColor: '#333333',
  reverseTextColor: '#FFFFFF',

  componentBackgroundColor: '#FFFFFF',

  borderRadius: 2,
  borderColor: 'black',
  borderWidth: 1,

  lineHeight: 1.5,
  lineHeightBase: 1.5,
};

// 模拟推导过程
function derivative(designToken: DesignToken): DerivativeToken {
  return {
    ...designToken,
    primaryColorDisabled: new TinyColor(designToken.primaryColor)
      .setAlpha(0.5)
      .toString(),
  };
}

export const ThemeContext = React.createContext(createTheme(derivative));

export const DesignTokenContext = React.createContext<{
  token?: Partial<DesignToken>;
  hashed?: string | boolean;
  cssVar?: {
    key: string;
  };
}>({
  token: defaultDesignToken,
});

export function useToken(): [
  Theme<any, any>,
  DerivativeToken,
  string,
  string | undefined,
] {
  const {
    token: rootDesignToken = {},
    hashed,
    cssVar,
  } = React.useContext(DesignTokenContext);
  const theme = React.useContext(ThemeContext);

  const [token, hashId] = useCacheToken<DerivativeToken, DesignToken>(
    theme,
    [defaultDesignToken, rootDesignToken],
    {
      salt: typeof hashed === 'string' ? hashed : '',
      cssVar: cssVar && {
        prefix: 'rc',
        key: cssVar.key,
        unitless: {
          lineHeight: true,
        },
      },
    },
  );
  return [theme, token, hashed ? hashId : '', cssVar?.key];
}
