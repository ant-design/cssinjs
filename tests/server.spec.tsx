import * as React from 'react';
import { render, unmountComponentAtNode, hydrate } from 'react-dom';
import { renderToString } from 'react-dom/server';
import { mount } from 'enzyme';
import {
  Theme,
  useCacheToken,
  CSSInterpolation,
  useStyleRegister,
  StyleContext,
  Cache,
  extractStyle,
} from '../src';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import canUseDom from 'rc-util/lib/Dom/canUseDom';

interface DesignToken {
  primaryColor: string;
}

interface DerivativeToken extends DesignToken {
  primaryColorDisabled: string;
}

const derivative = (designToken: DesignToken): DerivativeToken => ({
  ...designToken,
  primaryColorDisabled: designToken.primaryColor,
});

const baseToken: DesignToken = {
  primaryColor: '#1890ff',
};

const theme = new Theme(derivative);

jest.mock('rc-util/lib/Dom/canUseDom', () => () => false);

describe('SSR', () => {
  beforeEach(() => {
    const styles = Array.from(document.head.querySelectorAll('style'));
    styles.forEach((style) => {
      style.parentNode?.removeChild(style);
    });
  });

  const genStyle = (token: DerivativeToken): CSSInterpolation => ({
    '.box': {
      backgroundColor: token.primaryColor,
    },
  });

  const Box = () => {
    const [token] = useCacheToken(theme, [baseToken]);

    useStyleRegister({ theme, token, path: ['.box'] }, () => [genStyle(token)]);

    return <div className="box" />;
  };

  it('should not use cache', () => {
    mount(<Box />);

    expect(document.head.querySelectorAll('style')).toHaveLength(0);
  });

  it('ssr extract style', () => {
    // >>> SSR
    const cache = new Cache();

    const html = renderToString(
      <StyleContext.Provider value={{ cache }}>
        <Box />
      </StyleContext.Provider>,
    );

    const style = extractStyle(cache);

    expect(html).toEqual('<div class="box"></div>');
    expect(style).toEqual(
      '<style data-token-key="_primaryColor#1890ffprimaryColorDisabled#1890ff">.box{background-color:#1890ff;}</style>',
    );
    expect(document.head.querySelectorAll('style')).toHaveLength(0);

    // >>> Server Render
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);

    const prepareEnv = () => {
      document.head.innerHTML = `<style id="otherStyle">html { background: red; }</style>${style}`;
      root.innerHTML = html;

      expect(document.head.querySelectorAll('style')).toHaveLength(2);
    };

    // >>> Ensure render will remove style
    prepareEnv();
    render(
      // New cache here to avoid conflict with other test case cache
      <StyleContext.Provider value={{ cache: new Cache() }}>
        <Box />
      </StyleContext.Provider>,
      root,
    );
    // Not remove other style
    expect(document.head.querySelectorAll('#otherStyle')).toHaveLength(1);
    expect(document.head.querySelectorAll('style')).toHaveLength(1);
    unmountComponentAtNode(root);

    // >>> Hydrate
    prepareEnv();
    hydrate(
      <StyleContext.Provider
        value={{
          cache,
          // Force insert style since we hack `canUseDom` to false
          insertStyle: true,
        }}
      >
        <Box />
      </StyleContext.Provider>,
      root,
    );
    // Not remove other style
    expect(document.head.querySelectorAll('#otherStyle')).toHaveLength(1);
    expect(document.head.querySelectorAll('style')).toHaveLength(2);
  });
});
