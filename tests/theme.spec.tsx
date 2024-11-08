import { render } from '@testing-library/react';
import * as React from 'react';
import { createTheme, Theme, useCacheToken } from '../src';
import { ThemeCache } from '../src/theme';

interface DesignToken {
  primaryColor: string;
}

interface DerivativeToken extends DesignToken {
  primaryColorDisabled: string;
}

describe('Theme', () => {
  describe('Cache', () => {
    it('should have size limit', () => {
      const cache = new ThemeCache();
      const derivatives = Array(
        ThemeCache.MAX_CACHE_OFFSET + ThemeCache.MAX_CACHE_SIZE + 5,
      )
        .fill(1)
        .map(
          (_, index) =>
            (designToken: DesignToken): DerivativeToken => ({
              ...designToken,
              primaryColorDisabled: `${index}`,
            }),
        );
      derivatives.forEach((item) => {
        cache.set([item], new Theme<any, any>([item]));
      });
      expect(cache.size()).toBe(
        ThemeCache.MAX_CACHE_OFFSET + ThemeCache.MAX_CACHE_SIZE,
      );
      Array(5)
        .fill(1)
        .forEach((_, index) => {
          expect(cache.get([derivatives[index]])).toBeUndefined();
        });
      Array(ThemeCache.MAX_CACHE_OFFSET + ThemeCache.MAX_CACHE_SIZE)
        .fill(1)
        .forEach((_, index) => {
          expect(cache.get([derivatives[index + 5]])).toBeTruthy();
        });
    });

    it('delete should delete all empty node', () => {
      const cache = new ThemeCache();
      const derivatives = Array(5)
        .fill(1)
        .map(
          (_, index) =>
            (designToken: DesignToken): DerivativeToken => ({
              ...designToken,
              primaryColorDisabled: `${index}`,
            }),
        );
      const option = derivatives;
      const option2 = derivatives.concat(derivatives);
      const option3 = derivatives.map((d) => d).reverse();
      cache.set(option, new Theme<any, any>(derivatives));
      cache.set(option, new Theme<any, any>(derivatives.concat(derivatives)));
      cache.set(option2, new Theme<any, any>(derivatives));
      cache.set(option3, new Theme<any, any>(derivatives));
      expect(cache.size()).toBe(3);
      expect(cache.get(derivatives.slice(0, 2))).toBeUndefined();
      expect(cache.delete(derivatives.slice(0, 2))).toBeUndefined();
      expect(cache.delete([derivatives[1]])).toBeUndefined();
      expect(cache.size()).toBe(3);
      expect(cache.delete(option2)).toBeTruthy();
      expect(cache.size()).toBe(2);
      expect(cache.get(option)).toBeTruthy();
      expect(cache.delete(option)).toBeTruthy();
      expect(cache.size()).toBe(1);
    });
  });

  it('cache-able', () => {
    const createDerivativeFn = () => {
      const derivative = (designToken: DesignToken): DerivativeToken => ({
        ...designToken,
        primaryColorDisabled: designToken.primaryColor,
      });

      return [derivative];
    };

    // Same one
    const sameOne = (designToken: DesignToken): DerivativeToken => {
      return {
        ...designToken,
        primaryColorDisabled: designToken.primaryColor,
      };
    };

    const sameTheme = createTheme([sameOne]);

    for (let i = 0; i < 100; i += 1) {
      const theme = createTheme([sameOne]);
      expect(theme).toBe(sameTheme);
    }

    // Remove old one if too many new one
    for (let i = 0; i < 30; i += 1) {
      createTheme(createDerivativeFn());
    }

    expect(createTheme([sameOne])).not.toBe(sameTheme);
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

    const sameFn = (origin: DesignToken) => {
      calledTimes += 1;
      return {
        ...origin,
        primaryColorDisabled: 'red',
      };
    };

    const { container } = render(
      <div>
        <Demo theme={createTheme(sameFn)} />
        <Demo theme={createTheme(sameFn)} />
        <Demo
          theme={createTheme([
            (origin) => ({
              ...origin,
              primaryColorDisabled: 'blue',
            }),
          ])}
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
        theme={createTheme<any, any>([
          (seed) => ({
            ...seed,
            primaryColorText: 'blue',
            primaryColorIcon: 'green',
          }),
          (seed, map) => ({ ...map, primaryColorText: seed.primaryColor }),
          (_, map) => ({ ...map, primaryColorIcon: map.primaryColorText }),
        ])}
      />,
    );

    const tokenList = Array.from(container.querySelectorAll('span')).map(
      (span) => span.textContent,
    );

    expect(JSON.parse(tokenList[0]!)).toHaveProperty('primaryColor', 'red');
    expect(JSON.parse(tokenList[0]!)).toHaveProperty('primaryColorText', 'red');
    expect(JSON.parse(tokenList[0]!)).toHaveProperty('primaryColorIcon', 'red');
  });

  it('should warn if empty array', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(errSpy).toHaveBeenCalledTimes(0);
    createTheme([]);
    expect(errSpy).toHaveBeenCalledTimes(1);
    expect(errSpy).toHaveBeenCalledWith(
      expect.stringContaining('Theme should have at least'),
    );
    errSpy.mockRestore();
    errSpy.mockReset();
  });
});
