import * as React from 'react';
import { mount } from 'enzyme';
import {
  Theme,
  Cache,
  useCacheToken,
  CSSInterpolation,
  useStyleRegister,
  StyleContext,
  Keyframes,
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

describe('animation', () => {
  beforeEach(() => {
    const styles = Array.from(document.head.querySelectorAll('style'));
    styles.forEach((style) => {
      style.parentNode?.removeChild(style);
    });
  });

  describe('without hashed', () => {
    const theme = new Theme(derivative);
    const animation = new Keyframes('anim', {
      to: {
        transform: `rotate(360deg)`,
      },
    });

    const genStyle = (): CSSInterpolation => [
      {
        ['.box']: {
          animation: `${animation.getName()} 1s`,
        },
      },
      animation,
    ];

    const Box = () => {
      const [token] = useCacheToken(theme, [baseToken]);

      useStyleRegister({ theme, token, path: ['.box'] }, () => [genStyle()]);

      return <div className="box" />;
    };

    it('work', () => {
      expect(document.head.querySelectorAll('style')).toHaveLength(0);

      // Multiple time only has one style instance
      mount(<Box />);

      const styles = Array.from(document.head.querySelectorAll('style'));
      expect(styles).toHaveLength(1);

      const style = styles[0];
      expect(style.innerHTML).toEqual(
        '.box{animation:anim 1s;}@keyframes anim{to{transform:rotate(360deg);}}',
      );
    });
  });
});
