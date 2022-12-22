import React from 'react';
import { hydrate } from 'react-dom';
import { renderToString } from 'react-dom/server';
import { StyleProvider, createCache, extractStyle } from '@ant-design/cssinjs';
import Button from './components/Button';
import Spin from './components/Spin';
import { DesignTokenContext } from './components/theme';

const Demo = () => {
  const sharedProps: React.HTMLAttributes<HTMLButtonElement> = {
    onClick: ({ target }) => {
      console.log('Click:', target);
    },
  };

  return (
    <div style={{ display: 'flex', columnGap: 8 }}>
      {new Array(3).fill(0).map((_, i) => (
        <Button key={i} {...sharedProps} type="ghost">
          Button {i + 1}
        </Button>
      ))}
      <Spin />

      <DesignTokenContext.Provider
        value={{ token: { primaryColor: 'red' }, hashed: true }}
      >
        <Button {...sharedProps} type="ghost">
          Button
        </Button>
        <Spin />
      </DesignTokenContext.Provider>
      <DesignTokenContext.Provider
        value={{ token: { primaryColor: 'green' }, hashed: 'v5' }}
      >
        <Button {...sharedProps} type="ghost">
          Button
        </Button>
        <Spin />
      </DesignTokenContext.Provider>
    </div>
  );
};

const Pre: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
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
  const cacheRef = React.useRef(createCache());

  const [ssrHTML, ssrStyle] = React.useMemo(() => {
    const html = renderToString(
      <StyleProvider
        // Tell cssinjs not insert dom style. No need in real world
        mock="server"
        cache={cacheRef.current}
      >
        <Demo />
      </StyleProvider>,
    );

    const style = extractStyle(cacheRef.current);

    return [html, style];
  }, []);

  // 模拟一个空白文档，并且注水
  React.useEffect(() => {
    console.log('Prepare env...');
    setTimeout(() => {
      const styles = document.createElement('div');
      styles.innerHTML = ssrStyle;

      Array.from(styles.childNodes).forEach((style) => {
        document.head.appendChild(style);
      });

      setTimeout(() => {
        console.log('Hydrate...');
        const container = document.getElementById('ssr');
        hydrate(<Demo />, container);
      }, 500);
    }, 50);
  }, []);

  return (
    <div style={{ background: 'rgba(0,0,0,0.1)', padding: 16 }}>
      <h3>服务端渲染提前获取所有样式</h3>

      <Pre>{ssrStyle}</Pre>
      <Pre>{ssrHTML}</Pre>

      <div id="ssr" dangerouslySetInnerHTML={{ __html: ssrHTML }} />
    </div>
  );
}
