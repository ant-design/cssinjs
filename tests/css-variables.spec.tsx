import { TinyColor } from '@ctrl/tinycolor';
import { render } from '@testing-library/react';
import classNames from 'classnames';
import React from 'react';
import { createTheme, unit, useCacheToken, useStyleRegister } from '../src';

export interface DesignToken {
  primaryColor: string;
  textColor: string;

  borderRadius: number;
  borderColor: string;
  borderWidth: number;

  lineHeight: number;
  lineHeightBase: number;
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

const DesignTokenContext = React.createContext<{
  token?: Partial<DesignToken>;
  hashed?: string | boolean;
  cssVar?: {
    key: string;
  };
}>({
  token: defaultDesignToken,
  hashed: true,
});

function useToken(): [DerivativeToken, string, string | undefined] {
  const {
    token: rootDesignToken = {},
    hashed,
    cssVar,
  } = React.useContext(DesignTokenContext);

  const [token, hashId] = useCacheToken<DerivativeToken, DesignToken>(
    theme,
    [defaultDesignToken, rootDesignToken],
    {
      salt: typeof hashed === 'string' ? hashed : '',
      cssVar: cssVar && {
        prefix: 'rc',
        key: cssVar.key,
        unitless: {
          lineHeight: true,
        },
        ignore: {
          lineHeightBase: true,
        },
      },
    },
  );
  return [token, hashed ? hashId : '', cssVar?.key];
}

const useStyle = () => {
  const [token, hashId, cssVarKey] = useToken();

  useStyleRegister(
    {
      theme,
      token,
      hashId,
      path: ['Box'],
    },
    () => {
      return {
        '.box': {
          lineHeight: token.lineHeight,
          border: `${unit(token.borderWidth)} solid ${token.borderColor}`,
          color: '#fff',
          backgroundColor: token.primaryColor,
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
  it('should work with cssVar', () => {
    const { container } = render(
      <DesignTokenContext.Provider
        value={{
          cssVar: {
            key: 'apple',
          },
        }}
      >
        <Box className="target" />
      </DesignTokenContext.Provider>,
    );

    const styles = Array.from(document.head.querySelectorAll('style'));
    const box = container.querySelector('.target')!;

    expect(styles.length).toBe(2);
    expect(styles[0].textContent).toContain('.apple{');
    expect(styles[0].textContent).toContain('--rc-line-height:1.5;');
    expect(styles[1].textContent).toContain(
      'line-height:var(--rc-line-height);',
    );
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
        <DesignTokenContext.Provider
          value={{
            token: {
              primaryColor: '#1677ff',
            },
            cssVar: {
              key: 'apple',
            },
          }}
        >
          <Box className="css-var" />
        </DesignTokenContext.Provider>
      </>,
    );

    const styles = Array.from(document.head.querySelectorAll('style'));
    expect(styles).toHaveLength(3);

    const nonCssVarBox = container.querySelector('.non-css-var')!;
    expect(nonCssVarBox).toHaveStyle({
      lineHeight: '1.5',
      border: '1px solid black',
      backgroundColor: '#1890ff',
    });

    const cssVarBox = container.querySelector('.css-var')!;
    expect(cssVarBox).toHaveStyle({
      '--rc-line-height': '1.5',
      '--rc-border-width': '1px',
      '--rc-border-color': 'black',
      '--rc-primary-color': '#1677ff',
      lineHeight: 'var(--rc-line-height)',
      border: 'var(--rc-border-width) solid var(--rc-border-color)',
      backgroundColor: 'var(--rc-primary-color)',
    });
  });
});
