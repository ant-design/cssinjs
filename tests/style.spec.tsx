import { CSSObject } from '../src/useStyleRegister';
import { Theme, useCacheToken, useStyleRegister } from '../src';
import { mount } from 'enzyme';
import * as React from 'react';

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
  const errorSpy = jest.spyOn(console, 'error');

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
          useStyleRegister({ theme, token, path: ['holder'] }, () => [
            genStyle(),
          ]);
          return <div />;
        };
        mount(<Demo />);
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            `You seem to be using non-logical property '${prop}'`,
          ),
        );
      });
    });
  });

  test('content value should contain quotes', () => {
    const genStyle = (): CSSObject => ({
      content: 'test',
    });
    const Demo = () => {
      const [token] = useCacheToken<DerivativeToken>(theme, []);
      useStyleRegister({ theme, token, path: ['holder'] }, () => [genStyle()]);
      return <div />;
    };
    mount(<Demo />);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        `You seem to be using a value for 'content' without quotes`,
      ),
    );
  });
});
