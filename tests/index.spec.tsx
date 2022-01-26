import * as React from 'react';
import { mount } from 'enzyme';
import {
  Theme,
  useCacheToken,
  CSSInterpolation,
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

describe('csssinjs', () => {
  beforeEach(() => {
    const styles = Array.from(document.head.querySelectorAll('style'));
    styles.forEach((style) => {
      style.parentNode?.removeChild(style);
    });
  });

  it('theme', () => {
    const theme = new Theme(derivative);

    expect(theme.getDerivativeToken(baseToken)).toEqual({
      ...baseToken,
      primaryColorDisabled: baseToken.primaryColor,
    });
  });

  describe('Component', () => {
    const theme = new Theme(derivative);

    const genStyle = (token: DerivativeToken): CSSInterpolation => ({
      ['.box']: {
        backgroundColor: token.primaryColor,
      },
    });

    const Box = () => {
      const [token] = useCacheToken(theme, [baseToken]);

      useStyleRegister({ theme, token, path: ['.box'] }, () => [
        genStyle(token),
      ]);

      return <div className="box" />;
    };

    it('useToken', () => {
      // Multiple time only has one style instance
      mount(
        <>
          <Box />
          <Box />
          <Box />
        </>,
      );

      const styles = Array.from(document.head.querySelectorAll('style'));
      expect(styles).toHaveLength(1);

      const style = styles[0];
      expect(style.innerHTML).toEqual('.box{background-color:#1890ff;}');
    });
  });
});
