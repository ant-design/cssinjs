import React from 'react';
import { TinyColor } from '@ctrl/tinycolor';
import { Theme, useStyleRegister, CSSObject } from '../../../src';

export type GetStyle = (prefixCls: string, token: DerivativeToken) => CSSObject;

export interface DesignToken {
  primaryColor: string;
  borderRadius: number;
  textColor: string;
}

export interface DerivativeToken extends DesignToken {
  primaryColorDisabled: string;
}

const defaultDesignToken: DesignToken = {
  primaryColor: 'blue',
  borderRadius: 2,
  textColor: '#FFFFFF',
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

const ThemeContext = React.createContext(
  new Theme<DesignToken, DerivativeToken>(derivative),
);

const DesignTokenContext =
  React.createContext<Partial<DesignToken>>(defaultDesignToken);

export function useToken() {
  const rootDesignToken = React.useContext(DesignTokenContext);
  const mergedDesignToken = React.useMemo(
    () => ({
      ...defaultDesignToken,
      ...rootDesignToken,
    }),
    [rootDesignToken],
  );
  const theme = React.useContext(ThemeContext);

  return React.useMemo(
    () => theme.getDerivativeToken(mergedDesignToken),
    [theme, mergedDesignToken],
  );
}
