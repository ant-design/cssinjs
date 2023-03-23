import { createCache, StyleProvider } from '@ant-design/cssinjs';
import React from 'react';
import { createRoot } from 'react-dom/client';
import Button from './components/Button';
import Spin from './components/Spin';
import { DesignTokenContext } from './components/theme';

export default function App() {
  const [visible, setVisible] = React.useState(true);
  const pRef = React.useRef<HTMLParagraphElement>(null);

  React.useEffect(() => {
    if (!visible) {
      return;
    }

    const rootElement = document.createElement('div');
    pRef.current?.parentElement?.appendChild(rootElement);

    const shadowRoot = rootElement.attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    container.id = 'reactRoot';
    shadowRoot.appendChild(container);
    const root = createRoot(container);

    root.render(
      <React.StrictMode>
        <DesignTokenContext.Provider value={{ hashed: true }}>
          <StyleProvider container={shadowRoot} cache={createCache()}>
            <div style={{ border: '6px solid #000', padding: 8 }}>
              <h1>Shadow Root!</h1>
              <Button type="primary">Hello World!</Button>
              <Spin />
            </div>
          </StyleProvider>
        </DesignTokenContext.Provider>
      </React.StrictMode>,
    );

    return () => {
      rootElement.remove();
    };
  }, [visible]);

  return (
    <>
      <button
        onClick={() => {
          setVisible(!visible);
        }}
      >
        Trigger {String(visible)}
      </button>
      <p ref={pRef} />
    </>
  );
}
