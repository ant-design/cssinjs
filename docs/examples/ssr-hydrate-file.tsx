import { createCache, StyleProvider } from '@ant-design/cssinjs';
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { Demo } from './ssr-advanced';
// import './ssr-hydrate-file.css';

// Copy from `ssr-advanced-hydrate.tsx`
const HTML = `
<div style="display:flex;column-gap:8px"><button class="ant-btn ant-btn-ghost">Button <!-- -->1</button><button class="ant-btn ant-btn-ghost">Button <!-- -->2</button><button class="ant-btn ant-btn-ghost">Button <!-- -->3</button><div class="ant-spin"></div><button class="ant-btn ant-btn-ghost css-dev-only-do-not-override-11z9nrm">Button</button><div class="ant-spin css-dev-only-do-not-override-11z9nrm"></div><button class="ant-btn ant-btn-ghost css-dev-only-do-not-override-s8g2cg">Button</button><div class="ant-spin css-dev-only-do-not-override-s8g2cg"></div></div>
`.trim();

export default function App() {
  const [doRender, setDoRender] = React.useState(false);

  React.useEffect(() => {
    if (!doRender) {
      return;
    }

    console.clear();

    const container = document.createElement('div');
    container.innerHTML = HTML;
    document.body.appendChild(container);

    console.log('🥶 Hydrating...');
    // debugger;
    hydrateRoot(
      container,
      <StyleProvider cache={createCache()}>
        <Demo />
      </StyleProvider>,
    );

    return () => {
      document.body.removeChild(container);
    };
  }, [doRender]);

  return (
    <button
      onClick={() => {
        setDoRender(false);

        setTimeout(() => {
          setDoRender(true);
        }, 100);
      }}
    >
      Render
    </button>
  );
}
