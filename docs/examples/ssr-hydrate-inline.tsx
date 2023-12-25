import { createCache, StyleProvider } from '@ant-design/cssinjs';
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { Demo } from './ssr-advanced';

// Copy from `ssr-advanced-hydrate.tsx`
const HTML = `
<div style="display:flex;column-gap:8px"><button class="ant-btn ant-btn-ghost">Button <!-- -->1</button><button class="ant-btn ant-btn-ghost">Button <!-- -->2</button><button class="ant-btn ant-btn-ghost">Button <!-- -->3</button><div class="ant-spin"></div><button class="ant-btn ant-btn-ghost css-dev-only-do-not-override-11z9nrm">Button</button><div class="ant-spin css-dev-only-do-not-override-11z9nrm"></div><button class="ant-btn ant-btn-ghost css-dev-only-do-not-override-s8g2cg">Button</button><div class="ant-spin css-dev-only-do-not-override-s8g2cg"></div></div>
`.trim();

const STYLE = `
<style data-token-hash="4ztxvs" data-css-hash="5d348p">.ant-btn-default{border-color:black;border-width:1px;border-radius:2px;cursor:pointer;transition:background 0.3s;}.ant-btn-default:hover{opacity:0.6;}.ant-btn-default:active{opacity:0.3;}.ant-btn-default{background-color:#FFFFFF;color:#333333;}.ant-btn-default:hover{border-color:#1890ff;color:#1890ff;}.ant-btn-primary{border-color:black;border-width:1px;border-radius:2px;cursor:pointer;transition:background 0.3s;}.ant-btn-primary:hover{opacity:0.6;}.ant-btn-primary:active{opacity:0.3;}.ant-btn-primary{background-color:#1890ff;border:1px solid #1890ff;color:#FFFFFF;}.ant-btn-primary:hover{background-color:rgba(24, 144, 255, 0.5);}.ant-btn-ghost{border-color:black;border-width:1px;border-radius:2px;cursor:pointer;transition:background 0.3s;}.ant-btn-ghost:hover{opacity:0.6;}.ant-btn-ghost:active{opacity:0.3;}.ant-btn-ghost{background-color:transparent;color:#1890ff;border:1px solid #1890ff;}.ant-btn-ghost:hover{border-color:#1890ff;color:#1890ff;}</style><style data-token-hash="4ztxvs" data-css-hash="3dk1gi">.ant-spin{width:20px;height:20px;background-color:#1890ff;animation-name:loadingCircle;animation-duration:1s;animation-timing-function:linear;animation-iteration-count:infinite;}</style><style data-token-hash="4ztxvs" data-css-hash="_effect-loadingCircle">@keyframes loadingCircle{to{transform:rotate(360deg);}}</style><style data-token-hash="1hednoc" data-css-hash="tqroew">:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-default{border-color:black;border-width:1px;border-radius:2px;cursor:pointer;transition:background 0.3s;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-default:hover{opacity:0.6;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-default:active{opacity:0.3;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-default{background-color:#FFFFFF;color:#333333;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-default:hover{border-color:red;color:red;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-primary{border-color:black;border-width:1px;border-radius:2px;cursor:pointer;transition:background 0.3s;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-primary:hover{opacity:0.6;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-primary:active{opacity:0.3;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-primary{background-color:red;border:1px solid red;color:#FFFFFF;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-primary:hover{background-color:rgba(255, 0, 0, 0.5);}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-ghost{border-color:black;border-width:1px;border-radius:2px;cursor:pointer;transition:background 0.3s;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-ghost:hover{opacity:0.6;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-ghost:active{opacity:0.3;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-ghost{background-color:transparent;color:red;border:1px solid red;}:where(.css-dev-only-do-not-override-11z9nrm).ant-btn-ghost:hover{border-color:red;color:red;}</style><style data-token-hash="1hednoc" data-css-hash="5avnn1">:where(.css-dev-only-do-not-override-11z9nrm).ant-spin{width:20px;height:20px;background-color:red;animation-name:css-dev-only-do-not-override-11z9nrm-loadingCircle;animation-duration:1s;animation-timing-function:linear;animation-iteration-count:infinite;}</style><style data-token-hash="1hednoc" data-css-hash="_effect-css-dev-only-do-not-override-11z9nrm-loadingCircle">@keyframes css-dev-only-do-not-override-11z9nrm-loadingCircle{to{transform:rotate(360deg);}}</style><style data-token-hash="xhw1a7" data-css-hash="521jz7">:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-default{border-color:black;border-width:1px;border-radius:2px;cursor:pointer;transition:background 0.3s;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-default:hover{opacity:0.6;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-default:active{opacity:0.3;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-default{background-color:#FFFFFF;color:#333333;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-default:hover{border-color:green;color:green;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-primary{border-color:black;border-width:1px;border-radius:2px;cursor:pointer;transition:background 0.3s;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-primary:hover{opacity:0.6;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-primary:active{opacity:0.3;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-primary{background-color:green;border:1px solid green;color:#FFFFFF;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-primary:hover{background-color:rgba(0, 128, 0, 0.5);}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-ghost{border-color:black;border-width:1px;border-radius:2px;cursor:pointer;transition:background 0.3s;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-ghost:hover{opacity:0.6;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-ghost:active{opacity:0.3;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-ghost{background-color:transparent;color:green;border:1px solid green;}:where(.css-dev-only-do-not-override-s8g2cg).ant-btn-ghost:hover{border-color:green;color:green;}</style><style data-token-hash="xhw1a7" data-css-hash="1talicu">:where(.css-dev-only-do-not-override-s8g2cg).ant-spin{width:20px;height:20px;background-color:green;animation-name:css-dev-only-do-not-override-s8g2cg-loadingCircle;animation-duration:1s;animation-timing-function:linear;animation-iteration-count:infinite;}</style><style data-token-hash="xhw1a7" data-css-hash="_effect-css-dev-only-do-not-override-s8g2cg-loadingCircle">@keyframes css-dev-only-do-not-override-s8g2cg-loadingCircle{to{transform:rotate(360deg);}}</style><style data-ant-cssinjs-cache-path="data-ant-cssinjs-cache-path">.data-ant-cssinjs-cache-path{content:"4ztxvs|ant-btn:5d348p;4ztxvs|ant-spin:3dk1gi;1hednoc|ant-btn:tqroew;1hednoc|ant-spin:5avnn1;xhw1a7|ant-btn:521jz7;xhw1a7|ant-spin:1talicu";}</style>
`.trim();

let injectedStyle = false;

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

    if (!injectedStyle) {
      document.head.innerHTML = STYLE;
      injectedStyle = true;
    }

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
      // document.head.innerHTML = '';
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
