import React from 'react';
import Button from './components/Button';
import { DesignTokenContext } from './components/theme';

const randomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;

export default function App() {
  const [primaryColor, setPrimaryColor] = React.useState(randomColor());

  return (
    <div style={{ background: 'rgba(0,0,0,0.1)', padding: 16 }}>
      <h3>随机样式，新的 Token 生成删除原本的全部 style</h3>

      <DesignTokenContext.Provider
        value={{
          token: {
            primaryColor,
          },
        }}
      >
        <Button type="primary" onClick={() => setPrimaryColor(randomColor())}>
          Random Primary Color
        </Button>
      </DesignTokenContext.Provider>
    </div>
  );
}
