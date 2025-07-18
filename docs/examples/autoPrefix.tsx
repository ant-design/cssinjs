import {
  autoPrefixTransformer,
  createTheme,
  StyleProvider,
  useStyleRegister,
} from '@ant-design/cssinjs';
import React from 'react';

const Demo = () => {
  useStyleRegister(
    { theme: createTheme(() => ({})), token: {}, path: ['.auto-prefix-box'] },
    () => ({
      '.auto-prefix-box': {
        width: '200px',
        height: '200px',
        backgroundColor: '#f0f0f0',
        border: '1px solid #d9d9d9',
        borderRadius: '8px',
        // Properties that will get vendor prefixes
        transform: 'translateX(50px) scale(1.1)',
        transition: 'all 0.3s ease',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)',
        '&:hover': {
          transform: 'translateX(50px) scale(1.2)',
          backgroundColor: '#e6f7ff',
        },
      },
    }),
  );

  return (
    <div className="auto-prefix-box">
      <h3>Auto Prefix Demo</h3>
      <p>Hover to see effect</p>
      <p style={{ fontSize: '12px', color: '#666' }}>
        Check DevTools to see vendor prefixes in CSS
      </p>
    </div>
  );
};

export default () => (
  <StyleProvider transformers={[autoPrefixTransformer()]}>
    <Demo />
  </StyleProvider>
);
