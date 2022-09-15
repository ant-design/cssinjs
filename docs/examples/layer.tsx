import classNames from 'classnames';
import React from 'react';
import './layer.less';
import { useStyleRegister, Theme } from '../../src';

const theme = new Theme([() => ({})]);

const Div = ({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) => {
  // 全局注册，内部会做缓存优化
  const wrapSSR = useStyleRegister(
    { theme, token: { _tokenKey: 'test' }, path: ['layer'], layer: 'layer' },
    () => ({
      '.layer-div': {
        // color: 'blue',
        color: 'pink',

        a: {
          color: 'orange',
          cursor: 'pointer',

          '&:hover': {
            color: 'red',
          },
        },
      },
    }),
  );

  return wrapSSR(
    <div className={classNames(className, 'layer-div')} {...rest} />,
  );
};

export default function App() {
  return (
    <Div>
      Layer: blue & `a` orange. User: `a` green
      <div>
        A simple <a>link</a>
      </div>
    </Div>
  );
}
