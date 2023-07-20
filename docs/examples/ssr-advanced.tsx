import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import Button from './components/Button';
import Spin from './components/Spin';
import { DesignTokenContext } from './components/theme';

export const Demo = () => {
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

  const [ssrHTML, ssrStyle, plainStyle] = React.useMemo(() => {
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
    const rawStyle = extractStyle(cacheRef.current, true);

    console.log('cache:', cacheRef.current);

    return [html, style, rawStyle];
  }, []);

  // 模拟一个空白文档，并且注水
  React.useEffect(() => {
    console.log('Prepare env...');

    const container = document.createElement('div');
    document.body.appendChild(container);
    container.innerHTML = ssrHTML;

    setTimeout(() => {
      const styles = document.createElement('div');
      styles.innerHTML = ssrStyle;

      Array.from(styles.childNodes).forEach((style) => {
        document.head.appendChild(style);
      });

      setTimeout(() => {
        console.log('Hydrate...');

        // const container = document.getElementById('ssr');
        hydrateRoot(
          container!,
          <StyleProvider cache={createCache()}>
            <Demo />
          </StyleProvider>,
        );
      }, 500);
    }, 50);

    return () => {
      document.body.removeChild(container);
    };
  }, []);

  return (
    <div style={{ background: 'rgba(0,0,0,0.1)', padding: 16 }}>
      <h3>服务端渲染提前获取所有样式</h3>

      <Pre>{plainStyle}</Pre>
      <Pre>{ssrStyle}</Pre>
      <Pre>{ssrHTML}</Pre>

      <h4>SSR Style</h4>
      <div id="ssr" dangerouslySetInnerHTML={{ __html: ssrHTML }} />
      <div className="ant-cssinjs-cache-path" />
    </div>
  );
}
