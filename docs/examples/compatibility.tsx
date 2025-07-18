import {
  createTheme,
  StyleProvider,
  useStyleRegister,
} from '@ant-design/cssinjs';
import React from 'react';

const CompatDemo: React.FC = () => {
  useStyleRegister(
    { theme: createTheme(() => ({})), token: {}, path: ['.compat-demo'] },
    () => ({
      '.compat-demo': {
        display: 'flex',
        userSelect: 'none',
        background: 'linear-gradient(to right, #1677ff, #49b1f5)',
        padding: 16,
        color: '#fff',
      },
    }),
  );

  return (
    <div className="compat-demo">
      CSS Compatibility Demo (with vendor prefixing)
    </div>
  );
};

export default () => (
  <StyleProvider compatibility={{ prefixer: true }}>
    <CompatDemo />
  </StyleProvider>
);
