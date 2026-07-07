import React from 'react';
import './basic.less';
import Button from './components/Button';
import { DesignTokenProvider } from './components/theme';

const Demo = () => (
  <>
    <Button>Default</Button>
    <Button type="primary">Primary</Button>
    <Button type="ghost">Ghost</Button>

    <Button className="btn-override">Override By ClassName</Button>
  </>
);

export default function App() {
  const [show, setShow] = React.useState(true);
  const [, forceUpdate] = React.useState({});
  const [color, setColor] = React.useState('royalblue');
  React.useEffect(() => {
    forceUpdate({});
  }, []);

  return (
    <div style={{ background: 'rgba(0,0,0,0.1)', padding: 16 }}>
      <h3>默认情况下不会自动删除添加的样式</h3>

      <label>
        <input type="checkbox" checked={show} onChange={() => setShow(!show)} />
        Show Components
      </label>

      <button onClick={() => { setColor((prev) => prev === 'royalblue' ? 'mediumslateblue' : 'royalblue')}}>Change theme</button>

      {show && (
        <div>
          <Demo />
          <br />
          <DesignTokenProvider
            value={{
              token: { primaryColor: color },
            }}
          >
            <Demo />
          </DesignTokenProvider>
          <br />
          <DesignTokenProvider
            value={{
              token: { primaryColor: 'orange' },
              hashed: true,
            }}
          >
            <Demo />
          </DesignTokenProvider>
        </div>
      )}
    </div>
  );
}
