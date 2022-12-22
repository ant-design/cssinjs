import React from 'react';
import Button from './components/Button';
import { DesignTokenContext, ThemeContext } from './components/theme';
import type { DesignToken, DerivativeToken } from './components/theme';
import { createTheme } from '@ant-design/cssinjs';

function derivativeA(designToken: DesignToken): DerivativeToken {
  return {
    ...designToken,
    primaryColor: 'red',
    primaryColorDisabled: 'red',
  };
}

function derivativeB(designToken: DesignToken): DerivativeToken {
  return {
    ...designToken,
    primaryColor: 'green',
    primaryColorDisabled: 'green',
  };
}

const ButtonList = () => (
  <div style={{ background: 'rgba(0,0,0,0.1)', padding: 16 }}>
    <Button>Default</Button>
    <Button type="primary">Primary</Button>
    <Button type="ghost">Ghost</Button>
  </div>
);

export default function App() {
  const [, forceUpdate] = React.useState({});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', rowGap: 8 }}>
      <h3>混合主题</h3>

      <DesignTokenContext.Provider value={{ hashed: true }}>
        <ButtonList />

        <ThemeContext.Provider value={createTheme(derivativeA)}>
          <ButtonList />
        </ThemeContext.Provider>

        <ThemeContext.Provider value={createTheme(derivativeB)}>
          <ButtonList />
        </ThemeContext.Provider>
      </DesignTokenContext.Provider>

      <button
        onClick={() => {
          forceUpdate({});
        }}
      >
        Force ReRender
      </button>
    </div>
  );
}
