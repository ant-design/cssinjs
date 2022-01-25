import React from 'react';
import classNames from 'classnames';
import { useToken } from './theme';
import type { DerivativeToken } from './theme';
import { useStyleRegister } from '../../../src/';
import type { CSSInterpolation, CSSObject } from '../../../src/';

// 通用框架
const genSpinStyle = (
  prefixCls: string,
  token: DerivativeToken,
): CSSInterpolation => [
  {
    [`.${prefixCls}`]: {
      width: 20,
      height: 20,
      backgroundColor: token.primaryColor,

      animation: `loadingCircle 1s infinite linear`,
    },

    [`@keyframes loadingCircle`]: {
      to: {
        transform: `rotate(360deg)`,
      },
    },
  },
];

interface SpinProps extends React.HTMLAttributes<HTMLDivElement> {}

const Spin = ({ className, ...restProps }: SpinProps) => {
  const prefixCls = 'ant-btn';

  // 【自定义】制造样式
  const [theme, token, hashId] = useToken();

  // 全局注册，内部会做缓存优化
  useStyleRegister({ theme, token, hashId, path: [prefixCls] }, () => [
    genSpinStyle(prefixCls, token),
  ]);

  return (
    <div className={classNames(prefixCls, hashId, className)} {...restProps} />
  );
};

export default Spin;
