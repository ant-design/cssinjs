import { TinyColor } from '@ctrl/tinycolor';
import { render } from '@testing-library/react';
import { clsx } from 'clsx';
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
  cssVar: {
    key: string;
    prefix?: string;
  };
};

const DesignTokenContext = React.createContext<DesignTokenProviderProps>({
  token: defaultDesignToken,
  hashed: false,
  cssVar: {
    key: 'css-var-root',
  },
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

  return <div className={clsx(cls, 'box', props.className)} />;
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
      <StyleProvider>
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
      <StyleProvider>
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
    // component style still remains
    expect(styles.length).toBe(1);
    expect(styles[0].textContent).toContain('.box{');
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
          hashed: true,
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
          hashed: true,
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

  it('support multiple scope', () => {
    const cache = createCache();
    const BoxWithMultipleScopes = (props: { className?: string }) => {
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
          scope: ['box', 'container'],
        },
        cssVarKey ? getComponentToken : () => ({}),
      ) as [{ boxColor?: string }, string, string, string];

      useStyleRegister(
        {
          theme,
          token,
          hashId,
          path: ['BoxMultipleScope'],
        },
        () => {
          const mergedToken = {
            ...token,
            ...cssVarToken,
            boxColor: cssVarToken?.boxColor || '#5c21ff',
          } as DerivativeToken & { boxColor: string };

          return {
            '.box': {
              lineHeight: mergedToken.lineHeight,
              color: mergedToken.boxColor,
              backgroundColor: mergedToken.primaryColor,
            },
          };
        },
      );

      return (
        <div
          className={clsx(
            hashId,
            cssVarKey ? cssVarKey : '',
            'box',
            props.className,
          )}
        />
      );
    };

    render(
      <StyleProvider cache={cache}>
        <DesignTokenProvider
          theme={{
            cssVar: {
              key: 'apple',
            },
          }}
        >
          <BoxWithMultipleScopes className="target" />
        </DesignTokenProvider>
      </StyleProvider>,
    );

    const styles = Array.from(document.head.querySelectorAll('style'));
    expect(styles.length).toBe(3);

    // Check that the CSS variable style includes both scopes
    const cssVarStyle = styles.find((style) =>
      style.textContent?.includes('--rc-box-box-color'),
    );
    expect(cssVarStyle).toBeDefined();
    expect(cssVarStyle?.textContent).toContain('--rc-box-box-color:#5c21ff');
    // Should generate: .apple.box, .apple.container { ... }
    expect(cssVarStyle?.textContent).toMatch(
      /\.apple\.box,\s*\.apple\.container\{/,
    );
  });

  it('should filter empty scopes', () => {
    const BoxWithEmptyScope = (props: { className?: string }) => {
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
          scope: ['box', '', 'container'],
        },
        cssVarKey ? getComponentToken : () => ({}),
      ) as [{ boxColor?: string }, string, string, string];

      useStyleRegister(
        {
          theme,
          token,
          hashId,
          path: ['BoxEmptyScope'],
        },
        () => {
          const mergedToken = {
            ...token,
            ...cssVarToken,
            boxColor: cssVarToken?.boxColor || '#5c21ff',
          } as DerivativeToken & { boxColor: string };

          return {
            '.box': {
              lineHeight: mergedToken.lineHeight,
              color: mergedToken.boxColor,
            },
          };
        },
      );

      return (
        <div
          className={clsx(
            hashId,
            cssVarKey ? cssVarKey : '',
            'box',
            props.className,
          )}
        />
      );
    };

    render(
      <StyleProvider cache={createCache()}>
        <DesignTokenProvider
          theme={{
            cssVar: {
              key: 'orange',
            },
          }}
        >
          <BoxWithEmptyScope className="target" />
        </DesignTokenProvider>
      </StyleProvider>,
    );

    const styles = Array.from(document.head.querySelectorAll('style'));
    const cssVarStyle = styles.find((style) =>
      style.textContent?.includes('--rc-box-box-color'),
    );
    expect(cssVarStyle).toBeDefined();
    // Should NOT contain empty scope selector like .orange.
    expect(cssVarStyle?.textContent).not.toMatch(/\.orange\.\{/);
    // Should only contain valid scopes: .orange.box and .orange.container
    expect(cssVarStyle?.textContent).toMatch(
      /\.orange\.box,\s*\.orange\.container\{/,
    );
  });
});
