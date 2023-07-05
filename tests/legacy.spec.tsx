import { render } from '@testing-library/react';
import * as React from 'react';
import { useLayoutEffect } from 'react';
import { expect } from 'vitest';
import type { CSSInterpolation } from '../src';
import { Theme, useCacheToken, useStyleRegister } from '../src';

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
});
