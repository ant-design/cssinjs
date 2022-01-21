import React from 'react';
import { useToken, DerivativeToken } from './util/theme';
import { compile, serialize, stringify } from 'stylis';
import * as CSS from 'csstype';

function parseStyle(styleStr: string) {
  return serialize(compile(styleStr), stringify);
}

export type CSSProperties = CSS.PropertiesFallback<number | string>;
export type CSSPropertiesWithMultiValues = {
  [K in keyof CSSProperties]:
    | CSSProperties[K]
    | Extract<CSSProperties[K], string>[];
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

export type CSSInterpolation = InterpolationPrimitive | ArrayCSSInterpolation;

export type CSSOthersObject = Record<string, CSSInterpolation>;

export interface CSSObject
  extends CSSPropertiesWithMultiValues,
    CSSPseudos,
    CSSOthersObject {}

type GetStyle = (prefixCls: string, token: DerivativeToken) => CSSObject;

const getButtonStyle: GetStyle = (prefixCls, token) => ({
  [`.${prefixCls}`]: {
    backgroundColor: token.primaryColor,
    color: token.textColor,

    '&:hover': {
      backgroundColor: token.primaryColorDisabled,
    },

    '.antd-test': {
      color: 'red',
    },
  },
});

const parseJsonStyle = (style: CSSObject) => {
  let styleStr = '{';

  Object.keys(style).forEach((key) => {
    const value = style[key];

    if (typeof value === 'object' && value) {
      // 当成嵌套对象来出来
      styleStr += `${key}${parseJsonStyle(value as any)}`;
    } else {
      // 直接插入
      styleStr += `${key}:${value};`;
    }
  });

  styleStr += '}';

  return styleStr;
};

const useTokenClassName = (prefixCls: string, style: CSSObject) => {};

const Button = ({
  className,
  ...restProps
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const token = useToken();
  const style = getButtonStyle('ant-btn', token);
  console.log(JSON.stringify(style, null, 2));

  console.log(parseJsonStyle(style));
  console.log(parseStyle(`.ant-btn ${parseJsonStyle(style)}`));

  return <button className={className} {...restProps} />;
};

export default function App() {
  return <Button>Button</Button>;
}
