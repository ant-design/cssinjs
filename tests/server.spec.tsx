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
vi.mock('@rc-component/util/lib/Dom/canUseDom', () => {
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

  const genCardStyle = (token: DerivativeToken): CSSInterpolation => ({
    '.card': {
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

  const Card = ({ children }: { children?: React.ReactNode }) => {
    const [token] = useCacheToken<DerivativeToken>(theme, [baseToken], {
      cssVar: { key: 'css-var-test' },
    });

    useStyleRegister({ theme, token, path: ['.card'] }, () => [
      genCardStyle(token),
    ]);

    return <div className="card">{children}</div>;
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

  it('extract with order', () => {
    // Create 3 components without specified order: A, C, B
    const A = () => {
      const [token] = useCacheToken<DerivativeToken>(theme, [baseToken], {
        cssVar: { key: 'css-var-test' },
      });
      useStyleRegister({ theme, token, path: ['a'] }, () => ({
        '.a': { backgroundColor: token.primaryColor },
      }));
      return <div className="a" />;
    };
    const C = () => {
      const [token] = useCacheToken<DerivativeToken>(theme, [baseToken], {
        cssVar: { key: 'css-var-test' },
      });
      useStyleRegister({ theme, token, path: ['c'] }, () => ({
        '.c': { backgroundColor: token.primaryColor },
      }));
      return <div className="c" />;
    };
    const B = () => {
      const [token] = useCacheToken<DerivativeToken>(theme, [baseToken], {
        cssVar: { key: 'css-var-test' },
      });
      useStyleRegister({ theme, token, path: ['b'] }, () => ({
        '.b': { backgroundColor: token.primaryColor },
      }));
      return <div className="b" />;
    };

    function testOrder(
      node1: React.ReactElement,
      node2: React.ReactElement,
      node3: React.ReactElement,
      componentMarks: string[],
    ) {
      const cache = createCache();

      renderToString(
        <StyleProvider cache={cache}>
          {node1}
          {node2}
          {node3}
        </StyleProvider>,
      );

      const plainStyle = extractStyle(cache, true);
      const index1 = plainStyle.indexOf(`.${componentMarks[0]}{`);
      const index2 = plainStyle.indexOf(`.${componentMarks[1]}{`);
      const index3 = plainStyle.indexOf(`.${componentMarks[2]}{`);

      expect(index1).toBeGreaterThanOrEqual(0);
      expect(index2).toBeGreaterThan(index1);
      expect(index3).toBeGreaterThan(index2);
    }

    // A B C
    testOrder(<A />, <B />, <C />, ['a', 'b', 'c']);
    // A C B
    testOrder(<A />, <C />, <B />, ['a', 'c', 'b']);
    // B A C
    testOrder(<B />, <A />, <C />, ['b', 'a', 'c']);
    // B C A
    testOrder(<B />, <C />, <A />, ['b', 'c', 'a']);
    // C A B
    testOrder(<C />, <A />, <B />, ['c', 'a', 'b']);
    // C B A
    testOrder(<C />, <B />, <A />, ['c', 'b', 'a']);
  });

  it('should extract once when once option is true', () => {
    const cache = createCache();

    renderToString(
      <StyleProvider cache={cache}>
        <IdHolder />
        <Box>
          <IdHolder />
        </Box>
        <IdHolder />
      </StyleProvider>,
    );

    const style = extractStyle(cache, { plain: true, once: true });

    renderToString(
      <StyleProvider cache={cache}>
        <Card />
      </StyleProvider>,
    );
    const style2 = extractStyle(cache, { plain: true, once: true });

    expect(style).toContain('.box');
    expect(style).not.toContain('.card');

    expect(style2).toContain('.card');
    expect(style2).not.toContain('.box');
  });
});
