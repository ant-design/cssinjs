import React from 'react';
// import Button from './components/Button';
import Spin from './components/Spin';
import { DesignTokenContext } from './components/theme';
import type { DesignToken } from './components/theme';

const orangeTheme: Partial<DesignToken> = {
  primaryColor: 'orange',
};

export default function App() {
  const [, forceUpdate] = React.useState({});
  React.useEffect(() => {
    forceUpdate({});
  }, []);

  return (
    <div style={{ background: 'rgba(0,0,0,0.1)', padding: 16 }}>
      <Spin />

      <DesignTokenContext.Provider value={{ token: orangeTheme, hashed: true }}>
        <Spin />
      </DesignTokenContext.Provider>
    </div>
  );
}
