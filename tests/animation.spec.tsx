import * as React from 'react';
import { render } from '@testing-library/react';
import {
  Theme,
  useCacheToken,
  CSSInterpolation,
  useStyleRegister,
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

const theme = new Theme(derivative);
const animation = new Keyframes('anim', {
  to: {
    transform: `rotate(360deg)`,
  },
});

describe('animation', () => {
  beforeEach(() => {
    const styles = Array.from(document.head.querySelectorAll('style'));
    styles.forEach((style) => {
      style.parentNode?.removeChild(style);
    });
  });

  describe('without hashed', () => {
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
      render(<Box />);

      const styles = Array.from(document.head.querySelectorAll('style'));
      expect(styles).toHaveLength(1);

      const style = styles[0];
      expect(style.innerHTML).toEqual(
        '.box{animation:anim 1s;}@keyframes anim{to{transform:rotate(360deg);}}',
      );
    });
  });

  describe('hashed', () => {
    it('should accept Keyframes as animationName value', () => {
      let testHashId = '';

      const Demo = () => {
        const [token, hashId] = useCacheToken(theme, [baseToken]);
        testHashId = hashId;
        useStyleRegister(
          { theme, token, path: ['keyframes-hashed'], hashId },
          () => [animation, { '.demo': { animationName: animation } }],
        );
        return <div />;
      };
      render(<Demo />);

      const styles = Array.from(document.head.querySelectorAll('style'));
      expect(styles).toHaveLength(1);

      const style = styles[0];
      expect(style.innerHTML).toEqual(
        `@keyframes ${testHashId}-anim{to{transform:rotate(360deg);}}.${testHashId}.demo{animation-name:${testHashId}-anim;}`,
      );
    });

    it('could be declared in CSSObject', () => {
      let testHashId = '';

      const Demo = () => {
        const [token, hashId] = useCacheToken(theme, [baseToken]);
        testHashId = hashId;
        useStyleRegister(
          { theme, token, path: ['keyframes-hashed'], hashId },
          () => [{ '.demo': { animationName: animation, test: animation } }],
        );
        return <div />;
      };
      render(<Demo />);

      const styles = Array.from(document.head.querySelectorAll('style'));
      expect(styles).toHaveLength(1);

      const style = styles[0];
      expect(style.innerHTML).toEqual(
        `.${testHashId}.demo{animation-name:${testHashId}-anim;}@keyframes ${testHashId}-anim{to{transform:rotate(360deg);}}`,
      );
    });
  });
});
