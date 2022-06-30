import React from 'react';
import { TinyColor } from '@ctrl/tinycolor';
import type { Theme } from '../../../src';
import { createTheme, useCacheToken } from '../../../src';
import type { CSSObject } from '../../../src';

export type GetStyle = (prefixCls: string, token: DerivativeToken) => CSSObject;

export interface DesignToken {
  primaryColor: string;
  textColor: string;
  reverseTextColor: string;

  componentBackgroundColor: string;

  borderRadius: number;
  borderColor: string;
  borderWidth: number;
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
}>({
  token: defaultDesignToken,
});

export function useToken(): [Theme<any, any>, DerivativeToken, string] {
  const { token: rootDesignToken = defaultDesignToken, hashed } =
    React.useContext(DesignTokenContext);
  const theme = React.useContext(ThemeContext);

  const [token, hashId] = useCacheToken<DerivativeToken, DesignToken>(
    theme,
    [defaultDesignToken, rootDesignToken],
    {
      salt: typeof hashed === 'string' ? hashed : '',
    },
  );
  return [theme, token, hashed ? hashId : ''];
}
