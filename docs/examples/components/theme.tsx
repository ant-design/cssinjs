import React from 'react';
import { TinyColor } from '@ctrl/tinycolor';
import { Theme, useCacheToken } from '../../../src';
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

export const ThemeContext = React.createContext(
  new Theme<DesignToken, DerivativeToken>(derivative),
);

export const DesignTokenContext = React.createContext<{
  token?: Partial<DesignToken>;
  hashed?: boolean;
  salt?: string;
}>({
  token: defaultDesignToken,
});

export function useToken() {
  const {
    token: rootDesignToken = defaultDesignToken,
    hashed,
    salt,
  } = React.useContext(DesignTokenContext);
  const theme = React.useContext(ThemeContext);

  const [token, hashId] = useCacheToken(
    theme,
    [defaultDesignToken, rootDesignToken],
    {
      salt,
    },
  );
  return [theme, token, hashed ? hashId : ''];
}
