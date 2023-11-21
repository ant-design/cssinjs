import React from 'react';
import './basic.less';
import Button from './components/Button';
import { DesignTokenContext } from './components/theme';

export default function App() {
  const [show, setShow] = React.useState(true);

  const [, forceUpdate] = React.useState({});
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

      {show && (
        <div>
          <DesignTokenContext.Provider
            value={{ cssVar: { key: 'default' }, hashed: true }}
          >
            <Button>Default</Button>
            <Button type="primary">Primary</Button>
            <Button type="ghost">Ghost</Button>

            <Button className="btn-override">Override By ClassName</Button>
          </DesignTokenContext.Provider>
          <br />
          <DesignTokenContext.Provider
            value={{
              token: { primaryColor: 'green' },
              cssVar: { key: 'default2' },
              hashed: true,
            }}
          >
            <Button>Default</Button>
            <Button type="primary">Primary</Button>
            <Button type="ghost">Ghost</Button>

            <Button className="btn-override">Override By ClassName</Button>
          </DesignTokenContext.Provider>
        </div>
      )}
    </div>
  );
}
