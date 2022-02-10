import React from 'react';
import { renderToString } from 'react-dom/server';
import { StyleContext, Cache, extractStyle } from '../../src';
import Button from './components/Button';
import Spin from './components/Spin';
import { DesignTokenContext } from './components/theme';

const Demo = () => (
  <div style={{ display: 'flex', columnGap: 8 }}>
    <Button type="ghost">Button</Button>
    <Spin />

    <DesignTokenContext.Provider
      value={{ token: { primaryColor: 'red' }, hashed: true }}
    >
      <Button type="ghost">Button</Button>
      <Spin />
    </DesignTokenContext.Provider>
    <DesignTokenContext.Provider
      value={{ token: { primaryColor: 'green' }, hashed: 'v5' }}
    >
      <Button type="ghost">Button</Button>
      <Spin />
    </DesignTokenContext.Provider>
  </div>
);

const Pre: React.FC = ({ children }) => (
  <pre
    style={{
      background: '#FFF',
      padding: 8,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    }}
  >
    {children}
  </pre>
);

export default function App() {
  const cacheRef = React.useRef(new Cache());

  const [ssrHTML, ssrStyle] = React.useMemo(() => {
    const html = renderToString(
      <StyleContext.Provider
        value={{
          // Tell cssinjs not insert dom style. No need in real world
          insertStyle: false,
          cache: cacheRef.current,
        }}
      >
        <Demo />
      </StyleContext.Provider>,
    );

    const style = extractStyle(cacheRef.current);

    return [html, style];
  }, []);

  return (
    <div style={{ background: 'rgba(0,0,0,0.1)', padding: 16 }}>
      <h3>服务端渲染提前获取所有样式</h3>

      <Pre>{ssrStyle}</Pre>
      <Pre>{ssrHTML}</Pre>

      <div
        dangerouslySetInnerHTML={{ __html: `${ssrStyle}<div>${ssrHTML}</div>` }}
      />
    </div>
  );
}
