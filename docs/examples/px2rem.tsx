import {
  createTheme,
  px2remTransformer,
  StyleProvider,
  useStyleRegister,
} from '@ant-design/cssinjs';
import React from 'react';

const Demo = () => {
  useStyleRegister(
    { theme: createTheme(() => ({})), token: {}, path: ['.px2rem-box'] },
    () => ({
      '.px2rem-box': {
        width: '400px',
        backgroundColor: 'green',
        fontSize: '32px',
        border: '10PX solid #f0f',
        color: 'white',
      },
      '@media only screen and (max-width: 600px)': {
        '.px2rem-box': {
          backgroundColor: 'red',
        },
      },
    }),
  );

  return <div className="px2rem-box">px2rem</div>;
};

const App = () => (
  <StyleProvider transformers={[px2remTransformer()]}>
    <Demo />
  </StyleProvider>
);

export default App;
