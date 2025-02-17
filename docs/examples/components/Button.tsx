import {
  CSSInterpolation,
  CSSObject,
  unit,
  useCSSVarRegister,
  useStyleRegister,
} from '@ant-design/cssinjs';
import classNames from 'classnames';
import React from 'react';
import type { DerivativeToken } from './theme';
import { useToken } from './theme';

// 通用框架
const genSharedButtonStyle = (
  prefixCls: string,
  token: DerivativeToken,
): CSSInterpolation => ({
  [`.${prefixCls}`]: {
    borderColor: token.borderColor,
    borderWidth: token.borderWidth,
    borderRadius: token.borderRadius,
    lineHeight: token.lineHeight,
    padding: token.buttonPadding,

    cursor: 'pointer',

    transition: 'background 0.3s',

    '&:hover': {
      opacity: 0.6,
    },

    '&:active': {
      opacity: 0.3,
    },
  },
});

// 实心底色样式
const genSolidButtonStyle = (
  prefixCls: string,
  token: DerivativeToken,
  postFn: () => CSSObject,
): CSSInterpolation => [
  genSharedButtonStyle(prefixCls, token),
  {
    [`.${prefixCls}`]: {
      ...postFn(),
    },
  },
];

// 默认样式
const genDefaultButtonStyle = (
  prefixCls: string,
  token: DerivativeToken,
): CSSInterpolation =>
  genSolidButtonStyle(prefixCls, token, () => ({
    backgroundColor: token.componentBackgroundColor,
    color: token.textColor,

    '&:hover': {
      borderColor: token.primaryColor,
      color: token.primaryColor,
    },
  }));

// 主色样式
const genPrimaryButtonStyle = (
  prefixCls: string,
  token: DerivativeToken,
): CSSInterpolation =>
  genSolidButtonStyle(prefixCls, token, () => ({
    backgroundColor: token.primaryColor,
    border: `${unit(token.borderWidth)} solid ${token.primaryColor}`,
    color: token.reverseTextColor,

    '&:hover': {
      backgroundColor: token.primaryColorDisabled,
    },
  }));

// 透明按钮
const genGhostButtonStyle = (
  prefixCls: string,
  token: DerivativeToken,
): CSSInterpolation => [
  genSharedButtonStyle(prefixCls, token),
  {
    [`.${prefixCls}`]: {
      backgroundColor: 'transparent',
      color: token.primaryColor,
      border: `${unit(token.borderWidth)} solid ${token.primaryColor}`,

      '&:hover': {
        borderColor: token.primaryColor,
        color: token.primaryColor,
      },
    },
  },
];

interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  type?: 'primary' | 'ghost' | 'dashed' | 'link' | 'text' | 'default';
}

const Button = ({ className, type, ...restProps }: ButtonProps) => {
  const prefixCls = 'ant-btn';

  // 【自定义】制造样式
  const [theme, token, hashId, cssVarKey, realToken] = useToken();

  // default 添加默认样式选择器后可以省很多冲突解决问题
  const defaultCls = `${prefixCls}-default`;
  const primaryCls = `${prefixCls}-primary`;
  const ghostCls = `${prefixCls}-ghost`;

  const [cssVarToken] = useCSSVarRegister(
    {
      path: [prefixCls],
      key: cssVarKey,
      token: realToken,
      prefix: prefixCls,
      unitless: {
        lineHeight: true,
      },
      ignore: {
        lineHeightBase: true,
      },
      scope: prefixCls,
      hashId,
    },
    () => ({
      buttonPadding: '4px 8px',
    }),
  );

  const mergedToken: any = {
    ...token,
    ...cssVarToken,
  };

  // 全局注册，内部会做缓存优化
  useStyleRegister({ theme, token, hashId, path: [prefixCls] }, () => [
    genDefaultButtonStyle(defaultCls, mergedToken),
    genPrimaryButtonStyle(primaryCls, mergedToken),
    genGhostButtonStyle(ghostCls, mergedToken),
  ]);

  const typeCls =
    (
      {
        primary: primaryCls,
        ghost: ghostCls,
      } as any
    )[type as any] || defaultCls;

  return (
    <button
      className={classNames(prefixCls, typeCls, hashId, className, cssVarKey)}
      {...restProps}
    />
  );
};

export default Button;
