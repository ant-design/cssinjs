import * as React from 'react';
import { render, unmountComponentAtNode, hydrate } from 'react-dom';
import { renderToString } from 'react-dom/server';
import { mount } from 'enzyme';
import {
  Theme,
  useCacheToken,
  CSSInterpolation,
  useStyleRegister,
  StyleProvider,
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

let mockCanUseDom = false;

jest.mock('rc-util/lib/Dom/canUseDom', () => () => mockCanUseDom);

describe('SSR', () => {
  let errorSpy: jest.SpyInstance;

  beforeAll(() => {
    errorSpy = jest.spyOn(console, 'error');
  });

  beforeEach(() => {
    mockCanUseDom = false;

    errorSpy.mockReset();

    const styles = Array.from(document.head.querySelectorAll('style'));
    styles.forEach((style) => {
      style.parentNode?.removeChild(style);
    });

    document.body.innerHTML = '';
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
      <StyleProvider cache={cache}>
        <Box />
      </StyleProvider>,
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
      <StyleProvider cache={new Cache()}>
        <Box />
      </StyleProvider>,
      root,
    );
    // Not remove other style
    expect(document.head.querySelectorAll('#otherStyle')).toHaveLength(1);
    expect(document.head.querySelectorAll('style')).toHaveLength(1);
    unmountComponentAtNode(root);

    // >>> Hydrate
    prepareEnv();
    hydrate(
      <StyleProvider
        cache={cache}
        // Force insert style since we hack `canUseDom` to false
        mock="client"
      >
        <Box />
      </StyleProvider>,
      root,
    );
    // Not remove other style
    expect(document.head.querySelectorAll('#otherStyle')).toHaveLength(1);
    expect(document.head.querySelectorAll('style')).toHaveLength(2);

    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('tricky ssr', () => {
    const html = renderToString(
      <StyleProvider>
        <Box />
      </StyleProvider>,
    );

    // >>> Exist style
    const root = document.createElement('div');
    root.id = 'root';
    root.innerHTML = html;
    expect(root.querySelectorAll('style')).toHaveLength(1);

    // >>> Hydrate
    mockCanUseDom = true;
    document.body.appendChild(root);
    hydrate(
      <StyleProvider
        cache={new Cache()}
        // Force insert style since we hack `canUseDom` to false
        mock="client"
      >
        <Box />
      </StyleProvider>,
      root,
    );

    // Remove inline style
    expect(root.querySelectorAll('style')).toHaveLength(0);

    // Patch to header
    expect(document.head.querySelectorAll('style')).toHaveLength(1);

    expect(errorSpy).not.toHaveBeenCalled();
  });

  describe('nest provider', () => {
    it('extract', () => {
      const cache = new Cache();

      const html = renderToString(
        <StyleProvider cache={cache}>
          <StyleProvider>
            <StyleProvider>
              <StyleProvider>
                <StyleProvider>
                  <Box />
                </StyleProvider>
              </StyleProvider>
            </StyleProvider>
          </StyleProvider>
        </StyleProvider>,
      );

      const style = extractStyle(cache);

      expect(html).toEqual('<div class="box"></div>');
      expect(style).toEqual(
        '<style data-token-key="_primaryColor#1890ffprimaryColorDisabled#1890ff">.box{background-color:#1890ff;}</style>',
      );
    });

    it('tricky', () => {
      const html = renderToString(
        <StyleProvider>
          <StyleProvider>
            <StyleProvider>
              <StyleProvider>
                <StyleProvider>
                  <Box />
                </StyleProvider>
              </StyleProvider>
            </StyleProvider>
          </StyleProvider>
        </StyleProvider>,
      );

      expect(html).toEqual(
        '<div class="box"></div><style data-token-key="_primaryColor#1890ffprimaryColorDisabled#1890ff">.box{background-color:#1890ff;}</style>',
      );
    });
  });
});
