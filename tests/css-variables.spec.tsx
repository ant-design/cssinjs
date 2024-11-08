import { TinyColor } from '@ctrl/tinycolor';
import { render } from '@testing-library/react';
import classNames from 'classnames';
import type { PropsWithChildren } from 'react';
import React from 'react';
import { expect } from 'vitest';
import {
  createCache,
  createTheme,
  extractStyle,
  StyleProvider,
  unit,
  useCacheToken,
  useCSSVarRegister,
  useStyleRegister,
} from '../src';

export interface DesignToken {
  primaryColor: string;
  textColor: string;

  borderRadius: number;
  borderColor: string;
  borderWidth: number;

  lineHeight: number;
  lineHeightBase: number;

  smallScreen: number;
}

export interface DerivativeToken extends DesignToken {
  primaryColorDisabled: string;
}

const defaultDesignToken: DesignToken = {
  primaryColor: '#1890ff',
  textColor: '#333333',

  borderRadius: 2,
  borderColor: 'black',
  borderWidth: 1,

  lineHeight: 1.5,
  lineHeightBase: 1.5,

  smallScreen: 800,
};

// 模拟推导过程
function derivative(designToken: DesignToken): DerivativeToken {
  return {
    ...designToken,
    primaryColorDisabled: new TinyColor(designToken.primaryColor)
      .setAlpha(0.5)
      .toString(),
  };
}

const theme = createTheme(derivative);

type DesignTokenProviderProps = {
  token?: Partial<DesignToken>;
  hashed?: string | boolean;
  cssVar?: {
    key: string;
    prefix?: string;
  };
};

const DesignTokenContext = React.createContext<DesignTokenProviderProps>({
  token: defaultDesignToken,
  hashed: true,
});

const DesignTokenProvider: React.FC<
  PropsWithChildren<{ theme: DesignTokenProviderProps }>
> = ({ theme: customTheme, children }) => {
  const parentContext = React.useContext(DesignTokenContext);

  const mergedCtx = React.useMemo(() => {
    return {
      token: {
        ...parentContext.token,
        ...customTheme.token,
      },
      hashed: customTheme.hashed ?? parentContext.hashed,
      cssVar: customTheme.cssVar,
    };
  }, [
    parentContext.token,
    parentContext.hashed,
    customTheme.token,
    customTheme.hashed,
    customTheme.cssVar,
  ]);

  return (
    <DesignTokenContext.Provider value={mergedCtx}>
      {children}
    </DesignTokenContext.Provider>
  );
};

function useToken(): [DerivativeToken, string, string, DerivativeToken] {
  const {
    token: rootDesignToken = {},
    hashed,
    cssVar,
  } = React.useContext(DesignTokenContext);

  const [token, hashId, realToken] = useCacheToken<
    DerivativeToken,
    DesignToken
  >(theme, [defaultDesignToken, rootDesignToken], {
    salt: typeof hashed === 'string' ? hashed : '',
    cssVar: cssVar && {
      prefix: cssVar.prefix ?? 'rc',
      key: cssVar.key,
      unitless: {
        lineHeight: true,
      },
      ignore: {
        lineHeightBase: true,
      },
      preserve: {
        smallScreen: true,
      },
    },
  });
  return [token, hashed ? hashId : '', cssVar?.key || '', realToken];
}

const useStyle = () => {
  const [token, hashId, cssVarKey, realToken] = useToken();

  const getComponentToken = () => ({ boxColor: '#5c21ff' });

  const [cssVarToken] = useCSSVarRegister(
    {
      path: ['Box'],
      key: cssVarKey,
      token: realToken,
      prefix: 'rc-box',
      unitless: {
        lineHeight: true,
      },
      ignore: {
        lineHeightBase: true,
      },
      scope: 'box',
    },
    cssVarKey ? getComponentToken : () => ({}),
  );

  useStyleRegister(
    {
      theme,
      token,
      hashId,
      path: ['Box'],
    },
    () => {
      // @ts-ignore
      const mergedToken: DerivativeToken & { boxColor: string } = {
        ...token,
        ...(cssVarKey ? cssVarToken : getComponentToken()),
      };

      return {
        '.box': {
          lineHeight: mergedToken.lineHeight,
          border: `${unit(mergedToken.borderWidth)} solid ${
            mergedToken.borderColor
          }`,
          color: mergedToken.boxColor,
          backgroundColor: mergedToken.primaryColor,
          content: `"${mergedToken.smallScreen}"`,
        },
      };
    },
  );

  return `${hashId}${cssVarKey ? ` ${cssVarKey}` : ''}`;
};

const Box = (props: { className?: string }) => {
  const cls = useStyle();

  return <div className={classNames(cls, 'box', props.className)} />;
};

describe('CSS Variables', () => {
  beforeEach(() => {
    const styles = Array.from(document.head.querySelectorAll('style'));
    styles.forEach((style) => {
      style.parentNode?.removeChild(style);
    });
  });

  it('should work with cssVar', () => {
    const { container } = render(
      <DesignTokenProvider
        theme={{
          cssVar: {
            key: 'apple',
          },
        }}
      >
        <Box className="target" />
      </DesignTokenProvider>,
    );

    const styles = Array.from(document.head.querySelectorAll('style'));
    const box = container.querySelector('.target')!;

    expect(styles.length).toBe(3);
    expect(styles[0].textContent).toContain('.apple{');
    expect(styles[0].textContent).toContain('--rc-line-height:1.5;');
    expect(styles[0].textContent).not.toContain('--rc-line-height-base:1.5;');
    expect(styles[0].textContent).not.toContain('--rc-small-screen:800;');
    expect(styles[1].textContent).toContain('--rc-box-box-color:#5c21ff');
    expect(styles[1].textContent).toContain('.apple.box{');
    expect(styles[2].textContent).toContain(
      'line-height:var(--rc-line-height);',
    );
    expect(styles[2].textContent).toContain('content:"800"');
    expect(box).toHaveClass('apple');
    expect(box).toHaveStyle({
      '--rc-line-height': '1.5',
      lineHeight: 'var(--rc-line-height)',
    });
  });

  it('could mix with non-css-var', () => {
    const { container } = render(
      <>
        <Box className="non-css-var" />
        <DesignTokenProvider
          theme={{
            token: {
              primaryColor: '#1677ff',
            },
            cssVar: {
              key: 'apple',
            },
          }}
        >
          <Box className="css-var" />
          <DesignTokenProvider
            theme={{
              token: {
                borderWidth: 2,
              },
              cssVar: {
                key: 'banana',
              },
            }}
          >
            <Box className="css-var-2" />
          </DesignTokenProvider>
          <DesignTokenProvider
            theme={{
              token: {
                borderWidth: 3,
              },
            }}
          >
            <Box className="non-css-var-2" />
          </DesignTokenProvider>
        </DesignTokenProvider>
      </>,
    );

    const styles = Array.from(document.head.querySelectorAll('style'));
    expect(styles).toHaveLength(7);

    const nonCssVarBox = container.querySelector('.non-css-var')!;
    expect(nonCssVarBox).toHaveStyle({
      lineHeight: '1.5',
      border: '1px solid black',
      backgroundColor: '#1890ff',
      color: '#5c21ff',
    });

    const cssVarBox = container.querySelector('.css-var')!;
    expect(cssVarBox).toHaveStyle({
      '--rc-line-height': '1.5',
      '--rc-border-width': '1px',
      '--rc-border-color': 'black',
      '--rc-primary-color': '#1677ff',
      '--rc-box-box-color': '#5c21ff',
      lineHeight: 'var(--rc-line-height)',
      border: 'var(--rc-border-width) solid var(--rc-border-color)',
      backgroundColor: 'var(--rc-primary-color)',
      color: 'var(--rc-box-box-color)',
    });

    const cssVarBox2 = container.querySelector('.css-var-2')!;
    expect(cssVarBox2).toHaveClass('banana');
    expect(cssVarBox2).not.toHaveClass('apple');
    expect(cssVarBox2).toHaveStyle({
      '--rc-line-height': '1.5',
      '--rc-border-width': '2px',
      '--rc-border-color': 'black',
      '--rc-primary-color': '#1677ff',
      '--rc-box-box-color': '#5c21ff',
      lineHeight: 'var(--rc-line-height)',
      border: 'var(--rc-border-width) solid var(--rc-border-color)',
      backgroundColor: 'var(--rc-primary-color)',
      color: 'var(--rc-box-box-color)',
    });

    const nonCssVarBox2 = container.querySelector('.non-css-var-2')!;
    expect(nonCssVarBox2).not.toHaveClass('banana');
    expect(nonCssVarBox2).not.toHaveClass('apple');
    expect(nonCssVarBox2).toHaveStyle({
      lineHeight: '1.5',
      border: '3px solid black',
      backgroundColor: '#1677ff',
      color: '#5c21ff',
    });
  });

  it('dynamic', () => {
    const Demo = (props: { token?: Partial<DerivativeToken> }) => (
      <DesignTokenProvider
        theme={{
          token: props.token,
          cssVar: {
            key: 'apple',
          },
        }}
      >
        <Box className="target" />
      </DesignTokenProvider>
    );

    const { container, rerender } = render(<Demo />);

    let styles = Array.from(document.head.querySelectorAll('style'));
    const box = container.querySelector('.target')!;

    expect(styles.length).toBe(3);
    expect(box).toHaveClass('apple');
    expect(box).toHaveStyle({
      '--rc-line-height': '1.5',
      lineHeight: 'var(--rc-line-height)',
    });

    rerender(<Demo token={{ lineHeight: 2 }} />);

    styles = Array.from(document.head.querySelectorAll('style'));

    expect(styles.length).toBe(3);
    expect(box).toHaveClass('apple');
    expect(box).toHaveStyle({
      '--rc-line-height': '2',
      lineHeight: 'var(--rc-line-height)',
    });
  });

  it('could autoClear', () => {
    const { rerender } = render(
      <StyleProvider autoClear>
        <DesignTokenProvider
          theme={{
            cssVar: {
              key: 'apple',
            },
          }}
        >
          <Box className="target" />
        </DesignTokenProvider>
      </StyleProvider>,
    );

    let styles = Array.from(document.head.querySelectorAll('style'));
    expect(styles.length).toBe(3);

    rerender(
      <StyleProvider autoClear>
        <DesignTokenProvider
          theme={{
            cssVar: {
              key: 'apple',
            },
          }}
        >
          <div />
        </DesignTokenProvider>
      </StyleProvider>,
    );

    styles = Array.from(document.head.querySelectorAll('style'));
    expect(styles.length).toBe(1);
  });

  it('support ssr', () => {
    const cache = createCache();
    render(
      <StyleProvider cache={cache}>
        <DesignTokenProvider
          theme={{
            cssVar: {
              key: 'apple',
            },
          }}
        >
          <Box className="target" />
        </DesignTokenProvider>
      </StyleProvider>,
    );

    expect(extractStyle(cache)).toMatchSnapshot();
  });

  it('css var prefix should regenerate component style', () => {
    const { rerender } = render(
      <DesignTokenProvider
        theme={{
          cssVar: {
            key: 'apple',
            prefix: 'app',
          },
        }}
      >
        <Box className="target" />
      </DesignTokenProvider>,
    );

    let styles = Array.from(document.head.querySelectorAll('style'));
    expect(styles.length).toBe(3);
    expect(
      styles.some((style) => style.textContent?.includes('var(--app-')),
    ).toBe(true);
    expect(
      styles.some((style) => style.textContent?.includes('var(--bank-')),
    ).toBe(false);

    rerender(
      <DesignTokenProvider
        theme={{
          cssVar: {
            key: 'apple',
            prefix: 'bank',
          },
        }}
      >
        <Box className="target" />
      </DesignTokenProvider>,
    );

    styles = Array.from(document.head.querySelectorAll('style'));
    expect(styles.length).toBe(4);
    expect(
      styles.some((style) => style.textContent?.includes('var(--app-')),
    ).toBe(true);
    expect(
      styles.some((style) => style.textContent?.includes('var(--bank-')),
    ).toBe(true);
  });

  it('could extract cssVar only', () => {
    const cache = createCache();
    render(
      <StyleProvider cache={cache}>
        <DesignTokenProvider
          theme={{
            cssVar: {
              key: 'apple',
            },
          }}
        >
          <Box className="target" />
        </DesignTokenProvider>
      </StyleProvider>,
    );

    const cssVarStyle = extractStyle(cache, {
      types: ['cssVar', 'token'],
      plain: true,
    });
    const styleStyle = extractStyle(cache, { types: 'style', plain: true });

    expect(cssVarStyle).toContain('--rc-line-height:1.5;');
    expect(cssVarStyle).not.toContain('line-height:var(--rc-line-height)');
    expect(styleStyle).toContain('line-height:var(--rc-line-height)');
    expect(styleStyle).not.toContain('--rc-line-height:1.5;');
  });
});
