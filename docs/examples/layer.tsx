import { StyleProvider, Theme, useStyleRegister } from '@ant-design/cssinjs';
import classNames from 'classnames';
import React from 'react';

const theme = new Theme([() => ({})]);

const Div = ({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) => {
  // Layer
  useStyleRegister(
    {
      theme,
      token: { _tokenKey: 'test' },
      path: ['layer'],
      layer: {
        name: 'layer',
        dependencies: ['shared'],
      },
    },
    () => ({
      '.layer-div': {
        color: 'blue',

        a: {
          color: 'pink',
          cursor: 'pointer',

          '&:hover': {
            color: 'red',
          },
        },
      },
    }),
  );

  // Shared
  useStyleRegister(
    {
      theme,
      token: { _tokenKey: 'test' },
      path: ['shared'],
      layer: {
        name: 'shared',
      },
    },
    () => ({
      'html body .layer-div': {
        color: 'green',
      },
    }),
  );

  return <div className={classNames(className, 'layer-div')} {...rest} />;
};

export default function App() {
  return (
    <StyleProvider layer>
      <Div>
        Text should be blue.
        <div>
          The link should be <a>pink</a>
        </div>
      </Div>
    </StyleProvider>
  );
}
