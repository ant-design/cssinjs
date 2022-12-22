import classNames from 'classnames';
import React from 'react';
import './layer.less';
import { useStyleRegister, Theme } from '@ant-design/cssinjs';

const theme = new Theme([() => ({})]);

const Div = ({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) => {
  // Shared
  useStyleRegister(
    {
      theme,
      token: { _tokenKey: 'test' },
      path: ['shared'],
      layer: 'shared',
    },
    () => ({
      'html body .layer-div': {
        color: 'rgba(0,0,0,0.65)',
      },
    }),
  );

  // Layer
  useStyleRegister(
    {
      theme,
      token: { _tokenKey: 'test' },
      path: ['layer'],
      layer: 'shared, layer',
    },
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

  return <div className={classNames(className, 'layer-div')} {...rest} />;
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
