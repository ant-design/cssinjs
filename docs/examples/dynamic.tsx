import React from 'react';
import Button from './components/Button';
import Spin from './components/Spin';
import { DesignTokenContext } from './components/theme';

const randomColor = () =>
  `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')}`;

export default function App() {
  const [show, setShow] = React.useState(true);
  const [primaryColor, setPrimaryColor] = React.useState(randomColor());

  return (
    <div style={{ background: 'rgba(0,0,0,0.1)', padding: 16 }}>
      <h3>随机样式，新的 Token 生成删除原本的全部 style</h3>

      <label>
        <input type="checkbox" checked={show} onChange={() => setShow(!show)} />
        Show Components
      </label>

      <DesignTokenContext.Provider
        value={{
          token: {
            primaryColor,
          },
        }}
      >
        {show && (
          <div style={{ display: 'flex', columnGap: 8 }}>
            <Button
              type="primary"
              onClick={() => setPrimaryColor(randomColor())}
            >
              Random Primary Color
            </Button>
            <Spin />
          </div>
        )}
      </DesignTokenContext.Provider>
    </div>
  );
}
