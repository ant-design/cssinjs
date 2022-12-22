import type { CSSInterpolation } from '@ant-design/cssinjs';
import { useStyleRegister } from '@ant-design/cssinjs';
import classNames from 'classnames';
import React from 'react';
import type { DerivativeToken } from './components/theme';
import { DesignTokenContext, useToken } from './components/theme';

// Style 1
const genStyle1 = (
  prefixCls: string,
  token: DerivativeToken,
): CSSInterpolation => [
  {
    [`.${prefixCls}`]: {
      width: 20,
      height: 20,
      backgroundColor: token.primaryColor,
      borderRadius: token.borderRadius,
    },
  },
];

// Style 2
const genStyle2 = (
  prefixCls: string,
  token: DerivativeToken,
): CSSInterpolation => [
  {
    [`.${prefixCls}`]: {
      width: 20,
      height: 20,
      backgroundColor: token.primaryColor,
      borderRadius: token.borderRadius * 3,
    },
  },
];

// Component
const genComponent = (genStyle: typeof genStyle1) => {
  return ({ className, ...restProps }: any) => {
    const prefixCls = 'ant-box';

    // 【自定义】制造样式
    const [theme, token, hashId] = useToken();

    // 全局注册，内部会做缓存优化
    useStyleRegister({ theme, token, hashId, path: [prefixCls] }, () => [
      genStyle(prefixCls, token),
    ]);

    return (
      <div
        className={classNames(prefixCls, hashId, className)}
        {...restProps}
      />
    );
  };
};

const Box1 = genComponent(genStyle1);
const Box2 = genComponent(genStyle2);

export default function App() {
  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.1)',
        padding: 16,
      }}
    >
      <h3>相同 Token 不同 Salt 互不冲突</h3>

      <div
        style={{
          display: 'flex',
          columnGap: 8,
        }}
      >
        <DesignTokenContext.Provider value={{ hashed: '123' }}>
          <Box1 />
        </DesignTokenContext.Provider>
        <DesignTokenContext.Provider value={{ hashed: '234' }}>
          <Box2 />
        </DesignTokenContext.Provider>
      </div>
    </div>
  );
}
