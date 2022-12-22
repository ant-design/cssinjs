import React from 'react';
import { createRoot } from 'react-dom/client';
import { StyleProvider } from '@ant-design/cssinjs';
import Button from './components/Button';

export default function App() {
  const pRef = React.useRef<HTMLParagraphElement>(null);

  React.useEffect(() => {
    const rootElement = document.createElement('div');
    pRef.current?.parentElement?.appendChild(rootElement);

    const shadowRoot = rootElement.attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    container.id = 'reactRoot';
    shadowRoot.appendChild(container);
    const root = createRoot(container);

    root.render(
      <React.StrictMode>
        <StyleProvider container={shadowRoot}>
          <div style={{ border: '6px solid #000', padding: 8 }}>
            <h1>Shadow Root!</h1>
            <Button type="primary">Hello World!</Button>
          </div>
        </StyleProvider>
      </React.StrictMode>,
    );
  }, []);

  return <p ref={pRef} />;
}
