import { Theme, createTheme, useCacheToken } from '../src';
import { render } from '@testing-library/react';
import * as React from 'react';

interface DesignToken {
  primaryColor: string;
}

interface DerivativeToken extends DesignToken {
  primaryColorDisabled: string;
}

describe('Theme', () => {
  it('cache-able', () => {
    const createDerivativeFn = () => {
      const derivative = (designToken: DesignToken): DerivativeToken => ({
        ...designToken,
        primaryColorDisabled: designToken.primaryColor,
      });

      return { defaultDerivative: derivative };
    };

    // Same one
    const sameOne = {
      defaultDerivative: (designToken: DesignToken): DerivativeToken => {
        return {
          ...designToken,
          primaryColorDisabled: designToken.primaryColor,
        };
      },
    };

    const sameTheme = createTheme(sameOne);

    for (let i = 0; i < 100; i += 1) {
      const theme = createTheme(sameOne);
      expect(theme).toBe(sameTheme);
    }

    // Remove old one if too many new one
    for (let i = 0; i < 30; i += 1) {
      createTheme(createDerivativeFn());
    }

    expect(createTheme(sameOne)).not.toBe(sameTheme);
  });

  it('theme in cache', () => {
    const sameSeed = { primaryColor: 'red' };

    const Demo = ({ theme }: { theme: Theme<any, any> }) => {
      const [token] = useCacheToken<DerivativeToken, DesignToken>(theme, [
        sameSeed,
      ]);

      return <span>{JSON.stringify(token)}</span>;
    };

    let calledTimes = 0;

    const sameFn = {
      defaultDerivative: (origin: DesignToken) => {
        calledTimes += 1;
        return {
          ...origin,
          primaryColorDisabled: 'red',
        };
      },
    };

    const { container } = render(
      <div>
        <Demo theme={createTheme(sameFn)} />
        <Demo theme={createTheme(sameFn)} />
        <Demo
          theme={createTheme({
            defaultDerivative: (origin) => ({
              ...origin,
              primaryColorDisabled: 'blue',
            }),
          })}
        />
      </div>,
    );

    const tokenList = Array.from(container.querySelectorAll('span')).map(
      (span) => span.textContent,
    );

    expect(calledTimes).toBe(1);
    expect(tokenList.length).toBe(3);
    expect(tokenList[0]).toEqual(tokenList[1]);
    expect(tokenList[0]).not.toEqual(tokenList[2]);
  });

  it('support pipe derivatives', () => {
    const sameSeed = { primaryColor: 'red' };

    const Demo = ({ theme }: { theme: Theme<any, any> }) => {
      const [token] = useCacheToken<DerivativeToken, DesignToken>(theme, [
        sameSeed,
      ]);

      return <span>{JSON.stringify(token)}</span>;
    };

    const { container } = render(
      <Demo
        theme={createTheme<any, any>({
          defaultDerivative: (seed) => ({
            ...seed,
            primaryColorText: 'blue',
            primaryColorIcon: 'green',
          }),
          derivatives: [
            (seed) => ({ primaryColorText: seed.primaryColor }),
            (_, map) => ({ primaryColorIcon: map.primaryColorText }),
          ],
        })}
      />,
    );

    const tokenList = Array.from(container.querySelectorAll('span')).map(
      (span) => span.textContent,
    );

    expect(JSON.parse(tokenList[0]!)).toHaveProperty('primaryColor', 'red');
    expect(JSON.parse(tokenList[0]!)).toHaveProperty('primaryColorText', 'red');
    expect(JSON.parse(tokenList[0]!)).toHaveProperty('primaryColorIcon', 'red');
  });
});
