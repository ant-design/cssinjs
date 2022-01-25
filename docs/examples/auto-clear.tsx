import React from 'react';
import Button from './components/Button';
import { Cache, CacheContext } from '../../src/';

const cache = new Cache();

export default function App() {
  const [show, setShow] = React.useState(true);

  const [, forceUpdate] = React.useState({});
  React.useEffect(() => {
    forceUpdate({});
  }, []);

  return (
    <CacheContext.Provider value={{ autoClear: true, cache }}>
      <div style={{ background: 'rgba(0,0,0,0.1)', padding: 16 }}>
        <h3>配置同步自动删除添加的样式</h3>

        <label>
          <input
            type="checkbox"
            checked={show}
            onChange={() => setShow(!show)}
          />
          Show Components
        </label>

        {show && (
          <>
            <Button>Default</Button>
            <Button type="primary">Primary</Button>
            <Button type="ghost">Ghost</Button>
          </>
        )}
      </div>
    </CacheContext.Provider>
  );
}
