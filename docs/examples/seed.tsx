import React from 'react';
import Button from './components/Button';
import { DesignTokenContext } from './components/theme';
import type { DesignToken } from './components/theme';

const ButtonList = () => (
  <div style={{ background: 'rgba(0,0,0,0.1)', padding: 16 }}>
    <Button>Default</Button>
    <Button type="primary">Primary</Button>
    <Button type="ghost">Ghost</Button>
  </div>
);

export default function App() {
  const redTheme: Partial<DesignToken> = {
    primaryColor: 'red',
  };
  const orangeTheme: Partial<DesignToken> = {
    primaryColor: 'orange',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', rowGap: 8 }}>
      <h3>混合 SeedToken</h3>

      <ButtonList />

      <DesignTokenContext.Provider value={{ token: redTheme, hashed: true }}>
        <ButtonList />
      </DesignTokenContext.Provider>

      <DesignTokenContext.Provider value={{ token: orangeTheme, hashed: true }}>
        <ButtonList />
      </DesignTokenContext.Provider>
    </div>
  );
}
