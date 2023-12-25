import classNames from 'classnames';
import React from 'react';
import type { DerivativeToken } from './theme';
import { useToken } from './theme';

import type { CSSInterpolation } from '@ant-design/cssinjs';
import { Keyframes, useStyleRegister } from '@ant-design/cssinjs';

const animation = new Keyframes('loadingCircle', {
  to: {
    transform: `rotate(360deg)`,
  },
});

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

      animationName: animation,
      animationDuration: '1s',
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite',
    },
  },
  animation,
];

type SpinProps = React.HTMLAttributes<HTMLDivElement>;

const Spin = ({ className, ...restProps }: SpinProps) => {
  const prefixCls = 'ant-spin';

  // 【自定义】制造样式
  const [theme, token, hashId] = useToken();

  // 全局注册，内部会做缓存优化
  const wrapSSR = useStyleRegister(
    { theme, token, hashId, path: [prefixCls] },
    () => [genSpinStyle(prefixCls, token)],
  );

  return wrapSSR(
    <div className={classNames(prefixCls, hashId, className)} {...restProps} />,
  );
};

export default Spin;
