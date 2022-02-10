import React from 'react';
import { renderToString } from 'react-dom/server';
import { CacheContext, Cache } from '../../src';
import Button from './components/Button';
import Spin from './components/Spin';

const Demo = () => (
  <div style={{ display: 'flex', columnGap: 8 }}>
    <Button type="ghost">Button</Button>
    <Spin />
  </div>
);

function extractStyle(cache: Cache) {
  const keys = Array.from(cache.cache.keys());
  const styleKeys = keys.filter((key) => key.startsWith('style%'));

  const styleValues = styleKeys.map((key) => cache.cache.get(key)![1]);

  return styleValues.join('\n');
}

const Pre: React.FC = ({ children }) => (
  <pre style={{ background: '#FFF', padding: 8, whiteSpace: 'pre-wrap' }}>
    {children}
  </pre>
);

export default function App() {
  const cacheRef = React.useRef(new Cache());

  const [ssrHTML, ssrStyle] = React.useMemo(() => {
    const html = renderToString(
      <CacheContext.Provider
        value={{
          cache: cacheRef.current,
        }}
      >
        <Demo />
      </CacheContext.Provider>,
    );

    const style = extractStyle(cacheRef.current);

    return [html, style];
  }, []);

  return (
    <div style={{ background: 'rgba(0,0,0,0.1)', padding: 16 }}>
      <h3>服务端渲染提前获取所有样式</h3>

      <Pre>{ssrStyle}</Pre>
      <Pre>{ssrHTML}</Pre>

      <div dangerouslySetInnerHTML={{ __html: `<div>${ssrHTML}</div>` }} />
    </div>
  );
}
