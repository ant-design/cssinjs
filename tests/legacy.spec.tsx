import { render } from '@testing-library/react';
import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import * as React from 'react';
import { StrictMode, useLayoutEffect } from 'react';
import { expect } from 'vitest';
import type { CSSInterpolation } from '../src';
import {
  Theme,
  useCacheToken,
  useCSSVarRegister,
  useStyleRegister,
} from '../src';

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

vi.mock('react', async () => {
  const origin: any = await vi.importActual('react');

  return {
    ...origin,
    useInsertionEffect: undefined,
  };
});

// Same as `index.spec.tsx` but we hack to no to support `useInsertionEffect`
describe('legacy React version', () => {
  beforeEach(() => {
    const styles = Array.from(document.head.querySelectorAll('style'));
    styles.forEach((style) => {
      style.parentNode?.removeChild(style);
    });
  });

  const genStyle = (token: DerivativeToken): CSSInterpolation => ({
    '.box': {
      width: 93,
      lineHeight: 1,
      backgroundColor: token.primaryColor,
    },
  });

  interface BoxProps {
    propToken?: DesignToken;
    children?: React.ReactNode;
  }

  const Box = ({ propToken = baseToken, children }: BoxProps) => {
    const [token] = useCacheToken<DerivativeToken>(theme, [propToken]);

    useStyleRegister({ theme, token, path: ['.box'] }, () => [genStyle(token)]);

    return <div className="box">{children}</div>;
  };

  // We will not remove style immediately,
  // but remove when second style patched.
  describe('remove old style to ensure style set only exist one', () => {
    function test(
      name: string,
      wrapperFn?: (node: React.ReactElement) => React.ReactElement,
      beforeFn?: () => void,
    ) {
      it(name, () => {
        beforeFn?.();

        const getBox = (props?: BoxProps) => {
          const box: React.ReactElement = <Box {...props} />;

          return wrapperFn?.(box) || box;
        };

        const { rerender } = render(getBox());
        expect(document.head.querySelectorAll('style')).toHaveLength(1);

        // First change
        rerender(
          getBox({
            propToken: {
              primaryColor: 'red',
            },
          }),
        );
        expect(document.head.querySelectorAll('style')).toHaveLength(1);

        // Second change
        rerender(
          getBox({
            propToken: {
              primaryColor: 'green',
            },
          }),
        );
        expect(document.head.querySelectorAll('style')).toHaveLength(1);
      });
    }

    test('normal');

    test('StrictMode', (ele) => <React.StrictMode>{ele}</React.StrictMode>);
  });

  it('should not race with other useLayoutEffect', () => {
    let styleCount = 0;

    const Child = () => {
      useLayoutEffect(() => {
        styleCount = document.head.querySelectorAll('style').length;
      }, []);

      return null;
    };
    const Demo = () => {
      return (
        <Box>
          <Child />
        </Box>
      );
    };

    render(<Demo />);

    expect(styleCount).toBe(1);
  });

  it('should keep style when remounted', () => {
    const A = () => {
      return <Box />;
    };

    const B = () => {
      return <Box />;
    };

    const Demo = ({ show }: { show: boolean }) => {
      return (
        <>
          <Box propToken={{ primaryColor: 'red' }} />
          {show ? <A /> : <B />}
        </>
      );
    };

    const { rerender } = render(<Demo show={true} />);
    expect(document.head.querySelectorAll('style')).toHaveLength(2);

    rerender(<Demo show={false} />);
    expect(document.head.querySelectorAll('style')).toHaveLength(2);
  });

  describe('should not cleanup style when unmount and mount', () => {
    const test = (
      wrapper: (node: ReactElement) => ReactElement = (node) => node,
    ) => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const Demo = ({
        myToken,
        children,
      }: {
        myToken?: string;
        children?: ReactNode;
      }) => {
        const [token, hashId] = useCacheToken<DerivativeToken>(
          theme,
          [{ primaryColor: myToken }],
          {
            salt: 'test',
          },
        );

        useCSSVarRegister(
          {
            key: 'color',
            path: ['cssinjs-cleanup-style-when-remount'],
            token,
          },
          () => ({
            token: token.primaryColor,
          }),
        );

        return <div className={classNames('box', hashId)}>{children}</div>;
      };

      const { rerender } = render(wrapper(<Demo myToken="token1" />));
      const styles = Array.from(document.head.querySelectorAll('style'));
      expect(styles).toHaveLength(1);

      rerender(
        wrapper(
          <div>
            <Demo myToken="token1" />
          </div>,
        ),
      );
      const styles2 = Array.from(document.head.querySelectorAll('style'));
      expect(styles2).toHaveLength(1);

      spy.mockRestore();
    };

    it('normal', () => {
      test();
    });

    it('strict mode', () => {
      test((node) => {
        return <StrictMode>{node}</StrictMode>;
      });
    });
  });
});
