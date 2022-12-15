import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { render } from '@testing-library/react';
import {
  Theme,
  useCacheToken,
  useStyleRegister,
  StyleProvider,
  extractStyle,
  createCache,
} from '../src';
import type { CSSInterpolation } from '../src';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import canUseDom from 'rc-util/lib/Dom/canUseDom';
import {
  CSS_IN_JS_INSTANCE,
  CSS_IN_JS_INSTANCE_ID,
  ATTR_MARK,
} from '../src/StyleContext';
import classNames from 'classnames';

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

  const Box = ({ children }: { children?: React.ReactNode }) => {
    const [token] = useCacheToken<DerivativeToken>(theme, [baseToken]);

    const wrapSSR = useStyleRegister({ theme, token, path: ['.box'] }, () => [
      genStyle(token),
    ]);

    return wrapSSR(<div className="box">{children}</div>);
  };

  const IdHolder = () => {
    const id = React.useId();
    return (
      <div id={id} className="id">
        {id}
      </div>
    );
  };

  it('should not use cache', () => {
    render(<Box />);

    expect(document.head.querySelectorAll('style')).toHaveLength(0);
  });

  it('ssr extract style', () => {
    // >>> SSR
    const cache = createCache();

    const html = renderToString(
      <StyleProvider cache={cache}>
        <IdHolder />
        <Box>
          <IdHolder />
        </Box>
        <IdHolder />
      </StyleProvider>,
    );

    const style = extractStyle(cache);

    expect(html).toEqual(
      '<div id=":R1:" class="id">:R1:</div><div class="box"><div id=":Ra:" class="id">:Ra:</div></div><div id=":R3:" class="id">:R3:</div>',
    );
    expect(style).toEqual(
      '<style data-token-hash="u4cay0" data-css-hash="gn1jfq">.box{background-color:#1890ff;}</style>',
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

    // >>> Hydrate
    prepareEnv();
    mockCanUseDom = true;
    render(
      <StyleProvider
        cache={cache}
        // Force insert style since we hack `canUseDom` to false
        mock="client"
      >
        <IdHolder />
        <Box>
          <IdHolder />
        </Box>
        <IdHolder />
      </StyleProvider>,
      {
        hydrate: true,
        container: root,
      },
    );
    // Not remove other style
    expect(document.head.querySelectorAll('#otherStyle')).toHaveLength(1);
    expect(document.head.querySelectorAll('style')).toHaveLength(2);

    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('default hashPriority', () => {
    // >>> SSR
    const cache = createCache();

    const MyBox = ({ children }: { children?: React.ReactNode }) => {
      const [token, hashId] = useCacheToken<DerivativeToken>(
        theme,
        [baseToken],
        {
          salt: 'hashPriority',
        },
      );

      const wrapSSR = useStyleRegister(
        { theme, token, hashId, path: ['.hashPriority'] },
        () => [genStyle(token)],
      );

      return wrapSSR(
        <div className={classNames(hashId, 'my-box')}>{children}</div>,
      );
    };

    renderToString(
      <StyleProvider cache={cache} hashPriority="high">
        <MyBox>
          <IdHolder />
        </MyBox>
      </StyleProvider>,
    );

    const style = extractStyle(cache);
    expect(style).toEqual(
      '<style data-token-hash="1gt9vg4" data-css-hash="1fyoi4y">.css-dev-only-do-not-override-1cs5t9t.box{background-color:#1890ff;}</style>',
    );
  });

  it('tricky ssr', () => {
    const html = renderToString(
      <StyleProvider ssrInline>
        <IdHolder />
        <Box>
          <IdHolder />
        </Box>
        <IdHolder />
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
    render(
      <StyleProvider
        cache={createCache()}
        // Force insert style since we hack `canUseDom` to false
        mock="client"
      >
        <IdHolder />
        <Box>
          <IdHolder />
        </Box>
        <IdHolder />
      </StyleProvider>,
      {
        hydrate: true,
        container: root,
      },
    );

    // Remove inline style
    expect(root.querySelectorAll('style')).toHaveLength(0);

    // Patch to header
    expect(document.head.querySelectorAll('style')).toHaveLength(1);
    expect(
      (document.head.querySelector(`style[${ATTR_MARK}]`) as any)[
        CSS_IN_JS_INSTANCE
      ],
    ).toBe(CSS_IN_JS_INSTANCE_ID);

    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('!ssrInline', () => {
    const html = renderToString(
      <StyleProvider>
        <Box />
      </StyleProvider>,
    );

    expect(html).toEqual('<div class="box"></div>');
  });

  describe('nest provider', () => {
    it('extract', () => {
      const cache = createCache();

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
        '<style data-token-hash="u4cay0" data-css-hash="gn1jfq">.box{background-color:#1890ff;}</style>',
      );
    });

    it('tricky', () => {
      const html = renderToString(
        <StyleProvider ssrInline>
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
        '<style data-token-hash="u4cay0" data-css-hash="gn1jfq">.box{background-color:#1890ff;}</style><div class="box"></div>',
      );
    });
  });
});
