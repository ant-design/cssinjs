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
        fontSize: '20px',
        color: 'white',
      },
    }),
  );

  return (
    <div className="px2rem-box">
      <h1>Test</h1>
    </div>
  );
};

const App = () => (
  <StyleProvider transformers={[px2remTransformer()]}>
    <Demo />
  </StyleProvider>
);

export default App;
