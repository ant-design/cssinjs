import { render } from '@testing-library/react';
import * as React from 'react';
import {
  createCache,
  StyleProvider,
  Theme,
  useCacheToken,
  useStyleRegister,
} from '../src';
import type { CSSObject } from '../src/hooks/useStyleRegister';
import Keyframes from '../src/Keyframes';
import {
  legacyNotSelectorLinter,
  logicalPropertiesLinter,
  parentSelectorLinter,
} from '../src/linters';

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

const theme = new Theme(derivative);

describe('style warning', () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    errorSpy.mockReset();
  });

  afterAll(() => {
    errorSpy.mockRestore();
  });

  describe('no non-logical properties and values', () => {
    [
      'marginLeft',
      'marginRight',
      'paddingLeft',
      'paddingRight',
      'left',
      'right',
      'borderLeft',
      'borderLeftWidth',
      'borderLeftStyle',
      'borderLeftColor',
      'borderRight',
      'borderRightWidth',
      'borderRightStyle',
      'borderRightColor',
      'borderTopLeftRadius',
      'borderTopRightRadius',
      'borderBottomLeftRadius',
      'borderBottomRightRadius',
    ].forEach((prop) => {
      it(`${prop}`, () => {
        const genStyle = (): CSSObject => ({
          [prop]: 1,
        });
        const Demo = () => {
          const [token] = useCacheToken<DerivativeToken>(theme, []);
          useStyleRegister({ theme, token, path: [`${prop}`] }, () => [
            genStyle(),
          ]);
          return <div />;
        };
        render(
          <StyleProvider linters={[logicalPropertiesLinter]}>
            <Demo />
          </StyleProvider>,
        );
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            `You seem to be using non-logical property '${prop}'`,
          ),
        );
      });
    });
  });

  it('content value should contain quotes', () => {
    const genStyle = (): CSSObject => ({
      content: 'test',
    });
    const Demo = () => {
      const [token] = useCacheToken<DerivativeToken>(theme, []);
      useStyleRegister({ theme, token, path: ['content'] }, () => [genStyle()]);
      return <div />;
    };
    render(<Demo />);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        `You seem to be using a value for 'content' without quotes`,
      ),
    );
  });

  ['margin', 'padding', 'borderWidth', 'borderStyle'].forEach((prop) =>
    it(`${prop} including four directions`, () => {
      const genStyle = (): CSSObject => ({
        [prop]: '0 1px 0 3px',
      });
      const Demo = () => {
        const [token] = useCacheToken<DerivativeToken>(theme, []);
        useStyleRegister({ theme, token, path: [prop] }, () => [genStyle()]);
        return <div />;
      };
      render(
        <StyleProvider linters={[logicalPropertiesLinter]}>
          <Demo />
        </StyleProvider>,
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `You seem to be using '${prop}' property with different left ${prop} and right ${prop},`,
        ),
      );
    }),
  );

  ['clear', 'textAlign'].forEach((prop) =>
    it(`${prop} with left or right`, () => {
      const genStyle = (): CSSObject => ({
        [prop]: 'left',
      });
      const Demo = () => {
        const [token] = useCacheToken<DerivativeToken>(theme, []);
        useStyleRegister({ theme, token, path: [prop] }, () => [genStyle()]);
        return <div />;
      };
      render(
        <StyleProvider linters={[logicalPropertiesLinter]}>
          <Demo />
        </StyleProvider>,
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `You seem to be using non-logical value 'left' of ${prop},`,
        ),
      );
    }),
  );

  [
    '2px 4px',
    '2px 2px 4px',
    '2px 2px 2px 4px',
    '2px / 2px 4px',
    '2px 4px / 2px 2px',
  ].forEach((value) => {
    it(`borderRadius with value '${value}'`, () => {
      const genStyle = (): CSSObject => ({
        borderRadius: value,
      });
      const Demo = () => {
        const [token] = useCacheToken<DerivativeToken>(theme, []);
        useStyleRegister(
          { theme, token, path: [`borderRadius: ${value}`] },
          () => [genStyle()],
        );
        return <div />;
      };
      render(
        <StyleProvider linters={[logicalPropertiesLinter]}>
          <Demo />
        </StyleProvider>,
      );
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `You seem to be using non-logical value '${value}' of borderRadius`,
        ),
      );
    });
  });

  it('skip check should work', () => {
    const genStyle = (): CSSObject => ({
      content: { _skip_check_: true, value: 'content' },
    });
    const Demo = () => {
      const [token] = useCacheToken<DerivativeToken>(theme, []);
      useStyleRegister({ theme, token, path: ['content_skip'] }, () => [
        genStyle(),
      ]);
      return <div />;
    };
    render(<Demo />);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('should contain component', () => {
    const genStyle = (): CSSObject => ({
      content: '',
    });
    const Demo = () => {
      const [token] = useCacheToken<DerivativeToken>(theme, []);
      useStyleRegister({ theme, token, path: ['component-msg'] }, () => [
        genStyle(),
      ]);
      return <div />;
    };
    render(<Demo />);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('component-msg'),
    );
  });

  it('should contain selector', () => {
    const genStyle = (): CSSObject => ({
      '.demo': {
        content: '',
      },
    });
    const Demo = () => {
      const [token] = useCacheToken<DerivativeToken>(theme, []);
      useStyleRegister({ theme, token, path: ['selector-in-warning'] }, () => [
        genStyle(),
      ]);
      return <div />;
    };
    render(<Demo />);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Selector: .demo'),
    );
  });

  it('should use animationName if hashed', () => {
    const anim = new Keyframes('antSlideUpIn', {
      '0%': {
        transform: 'scaleY(0.8)',
        transformOrigin: '0% 0%',
        opacity: 0,
      },

      '100%': {
        transform: 'scaleY(1)',
        transformOrigin: '0% 0%',
        opacity: 1,
      },
    });

    const genStyle = (): CSSObject => ({
      animation: anim.getName(),
    });
    const Demo = () => {
      const [token, hashId] = useCacheToken<DerivativeToken>(theme, []);
      useStyleRegister(
        { theme, token, path: ['anim-hashed-animation'], hashId },
        () => [genStyle(), anim],
      );
      return <div />;
    };
    render(<Demo />);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining(`You seem to be using hashed animation`),
    );
  });

  describe(':not selector check legacy browsers', () => {
    it('should work', () => {
      const genStyle = (): CSSObject => ({
        '.ant-btn': {
          '&&-primary': {
            ':not(&-default)': {
              color: 'red',
              background: 'blue',
            },
          },
        },
      });
      const Demo = () => {
        const [token] = useCacheToken<DerivativeToken>(theme, []);
        useStyleRegister({ theme, token, path: ['content'] }, () => [
          genStyle(),
        ]);
        return <div />;
      };
      render(
        <StyleProvider
          cache={createCache()}
          linters={[legacyNotSelectorLinter]}
        >
          <Demo />
        </StyleProvider>,
      );

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `Concat ':not' selector not support in legacy browsers`,
        ),
      );
    });

    it('should check attribute selector correctly', () => {
      const genStyle = (): CSSObject => ({
        '.ant-btn:not([class*=".ant-default"])': {
          color: 'red',
          background: 'blue',
        },
      });
      const Demo = () => {
        const [token] = useCacheToken<DerivativeToken>(theme, []);
        useStyleRegister(
          { theme, token, path: ['attribute selector in :not'] },
          () => [genStyle()],
        );
        return <div />;
      };
      render(
        <StyleProvider
          cache={createCache()}
          linters={[legacyNotSelectorLinter]}
        >
          <Demo />
        </StyleProvider>,
      );

      expect(errorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining(
          `Concat ':not' selector not support in legacy browsers`,
        ),
      );
    });
  });

  describe('parentSelectorLinter', () => {
    it('parent selector linter should work', () => {
      const genStyle = (): CSSObject => ({
        '.ant': {
          '&&-btn': {
            color: 'red',
          },
        },
      });
      const Demo = () => {
        const [token] = useCacheToken<DerivativeToken>(theme, []);
        useStyleRegister({ theme, token, path: ['parent selector'] }, () => [
          genStyle(),
        ]);
        return <div />;
      };
      render(
        <StyleProvider cache={createCache()} linters={[parentSelectorLinter]}>
          <Demo />
        </StyleProvider>,
      );

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `Should not use more than one \`&\` in a selector.`,
        ),
      );
    });

    it('should split by comma', () => {
      const genStyle = (): CSSObject => ({
        '.ant': {
          '&-test, &-btn': {
            color: 'red',
          },
        },
      });
      const Demo = () => {
        const [token] = useCacheToken<DerivativeToken>(theme, []);
        useStyleRegister({ theme, token, path: ['parent selector2'] }, () => [
          genStyle(),
        ]);
        return <div />;
      };
      render(
        <StyleProvider cache={createCache()} linters={[parentSelectorLinter]}>
          <Demo />
        </StyleProvider>,
      );

      expect(errorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining(
          `Should not use more than one \`&\` in a selector.`,
        ),
      );
    });

    it('should check selector which has no style', () => {
      const genStyle = (): CSSObject => ({
        '.ant': {
          '&&-test': {
            '&-btn': {
              color: 'red',
            },
          },
        },
      });
      const Demo = () => {
        const [token] = useCacheToken<DerivativeToken>(theme, []);
        useStyleRegister({ theme, token, path: ['parent selector3'] }, () => [
          genStyle(),
        ]);
        return <div />;
      };
      render(
        <StyleProvider cache={createCache()} linters={[parentSelectorLinter]}>
          <Demo />
        </StyleProvider>,
      );

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `Should not use more than one \`&\` in a selector.`,
        ),
      );
    });
  });
});
