import { render } from '@testing-library/react';
import classNames from 'classnames';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import type { SpyInstance } from 'vitest';
import type { CSSInterpolation } from '../src';
import {
  createCache,
  extractStyle,
  StyleProvider,
  Theme,
  useCacheToken,
  useStyleRegister,
} from '../src';
import { ATTR_MARK } from '../src/StyleContext';
import * as cacheMapUtil from '../src/util/cacheMapUtil';
import { reset } from '../src/util/cacheMapUtil';

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

const canUseDom = vi.hoisted(() => vi.fn(() => false));
vi.mock('rc-util/lib/Dom/canUseDom', () => {
  return {
    default: canUseDom,
  };
});

describe('SSR', () => {
  let errorSpy: SpyInstance;

  beforeAll(() => {
    errorSpy = vi.spyOn(console, 'error');
  });

  beforeEach(() => {
    canUseDom.mockReturnValue(false);

    reset();
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
    const [token] = useCacheToken<DerivativeToken>(theme, [baseToken], {
      cssVar: { key: 'css-var-test' },
    });

    useStyleRegister({ theme, token, path: ['.box'] }, () => [genStyle(token)]);

    return <div className="box">{children}</div>;
  };

  const IdHolder = () => {
    const id = React.useId();
    return (
      <div id={id} className="id">
        {id}
      </div>
    );
  };

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
    const plainStyle = extractStyle(cache, true);

    expect(html).toMatchSnapshot();
    expect(style).toMatchSnapshot();
    expect(plainStyle).toMatchSnapshot();
    expect(document.head.querySelectorAll('style')).toHaveLength(0);

    // >>> Server Render
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);

    const prepareEnv = () => {
      document.head.innerHTML = `<style id="otherStyle">html { background: red; }</style>${style}`;
      root.innerHTML = html;

      expect(document.head.querySelectorAll('style')).toHaveLength(4);
      reset(
        {
          '|.box': '1bbkdf1',
        },
        false,
      );
    };

    // >>> Hydrate
    prepareEnv();
    canUseDom.mockReturnValue(true);

    const getStyleAndHash = vi.spyOn(cacheMapUtil, 'getStyleAndHash');

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

    expect(getStyleAndHash).toHaveBeenCalled();
    expect(getStyleAndHash).toHaveBeenCalledWith('|.box');
    expect(getStyleAndHash).toHaveReturnedWith([
      '.box{background-color:var(--primary-color);}',
      '1bbkdf1',
    ]);

    // Not remove other style
    expect(document.head.querySelectorAll('#otherStyle')).toHaveLength(1);
    expect(document.head.querySelectorAll('style')).toHaveLength(5);

    expect(errorSpy).not.toHaveBeenCalled();

    getStyleAndHash.mockRestore();
  });

  it('not extract clientOnly style', () => {
    const Client = ({ children }: { children?: React.ReactNode }) => {
      const [token] = useCacheToken<DerivativeToken>(theme, [baseToken], {
        cssVar: { key: 'css-var-test' },
      });

      useStyleRegister(
        { theme, token, path: ['.client'], clientOnly: true },
        () => ({
          '.client': {
            backgroundColor: token.primaryColor,
          },
        }),
      );

      return <div className="box">{children}</div>;
    };

    const cache = createCache();

    renderToString(
      <StyleProvider cache={cache}>
        <Client />
      </StyleProvider>,
    );

    const plainStyle = extractStyle(cache, true);
    expect(plainStyle).not.toContain('client');
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
          cssVar: { key: 'css-var-test' },
        },
      );

      useStyleRegister(
        { theme, token, hashId, path: ['.hashPriority'] },
        () => [genStyle(token)],
      );

      return <div className={classNames(hashId, 'my-box')}>{children}</div>;
    };

    renderToString(
      <StyleProvider cache={cache} hashPriority="high">
        <MyBox>
          <IdHolder />
        </MyBox>
      </StyleProvider>,
    );

    const style = extractStyle(cache);
    expect(style).toMatchSnapshot();
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
      expect(style).toMatchSnapshot();
    });
  });

  it('ssr hydrate should clean not exist style', () => {
    canUseDom.mockReturnValue(true);

    reset(
      {
        exist: 'exist',
        notExist: 'notExist',
      },
      false,
    );

    const getStyleAndHash = vi.spyOn(cacheMapUtil, 'getStyleAndHash');

    document.head.innerHTML = `<style ${ATTR_MARK}="exist">.test{}</style>`;

    // Exist check
    cacheMapUtil.getStyleAndHash('exist');
    expect(getStyleAndHash).toHaveReturnedWith(['.test{}', 'exist']);

    // Not Exist check
    getStyleAndHash.mockClear();
    cacheMapUtil.getStyleAndHash('notExist');
    expect(getStyleAndHash).toHaveReturnedWith([null, 'notExist']);

    // Call again will get undefined since cache cleaned
    getStyleAndHash.mockClear();
    cacheMapUtil.getStyleAndHash('notExist');
    expect(getStyleAndHash).toHaveReturnedWith([null, undefined]);

    getStyleAndHash.mockRestore();
  });

  it('ssr keep order', () => {
    const createComponent = (name: string, order?: number) => {
      const OrderDefault = ({ children }: { children?: React.ReactNode }) => {
        const [token] = useCacheToken<DerivativeToken>(theme, [baseToken], {
          cssVar: { key: 'css-var-test' },
        });

        useStyleRegister({ theme, token, path: [name], order }, () => ({
          [`.${name}`]: {
            backgroundColor: token.primaryColor,
          },
        }));

        return <div className={name}>{children}</div>;
      };

      return OrderDefault;
    };

    const Order0 = createComponent('order0', 0);
    const Order1 = createComponent('order1', 1);
    const Order2 = createComponent('order2', 2);

    const cache = createCache();

    renderToString(
      <StyleProvider cache={cache}>
        <Order1 />
        <Order0 />
        <Order2 />
      </StyleProvider>,
    );

    const style = extractStyle(cache);
    const holder = document.createElement('div');
    holder.innerHTML = style;
    const styles = Array.from(holder.querySelectorAll('style'));

    expect(styles[1].getAttribute('data-rc-priority')).toEqual('0');
    expect(styles[2].getAttribute('data-rc-priority')).toEqual('1');
    expect(styles[3].getAttribute('data-rc-priority')).toEqual('2');

    // Pure style
    const pureStyle = extractStyle(cache, true);
    expect(pureStyle).toMatchSnapshot();
  });
});
