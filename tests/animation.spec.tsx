import { render } from '@testing-library/react';
import * as React from 'react';
import type { CSSInterpolation } from '../src';
import {
  createCache,
  Keyframes,
  StyleProvider,
  Theme,
  useCacheToken,
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
      expect(styles).toHaveLength(2);

      expect(styles[0].innerHTML).toEqual('.box{animation:anim 1s;}');
      expect(styles[1].innerHTML).toEqual(
        '@keyframes anim{to{transform:rotate(360deg);}}',
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
      expect(styles).toHaveLength(2);

      expect(styles[0].innerHTML).toEqual(
        `:where(.${testHashId}).demo{animation-name:${testHashId}-anim;}`,
      );
      expect(styles[1].innerHTML).toEqual(
        `@keyframes ${testHashId}-anim{to{transform:rotate(360deg);}}`,
      );
    });

    it('could be declared in CSSObject', () => {
      let testHashId = '';

      const Demo = () => {
        const [token, hashId] = useCacheToken(theme, [baseToken]);
        testHashId = hashId;
        useStyleRegister(
          { theme, token, path: ['keyframes-in-CSSObject'], hashId },
          () => [{ '.demo': { animationName: animation, test: animation } }],
        );
        return <div />;
      };
      render(<Demo />);

      const styles = Array.from(document.head.querySelectorAll('style'));
      expect(styles).toHaveLength(2);

      expect(styles[0].innerHTML).toEqual(
        `:where(.${testHashId}).demo{animation-name:${testHashId}-anim;}`,
      );
      expect(styles[1].innerHTML).toEqual(
        `@keyframes ${testHashId}-anim{to{transform:rotate(360deg);}}`,
      );
    });

    it('could be used without declaring keyframes', () => {
      let testHashId = '';

      const Demo = () => {
        const [token, hashId] = useCacheToken(theme, [baseToken]);
        testHashId = hashId;
        useStyleRegister(
          { theme, token, path: ['keyframes-not-declared'], hashId },
          () => [{ '.demo': { animationName: animation } }],
        );
        return <div />;
      };
      render(<Demo />);

      const styles = Array.from(document.head.querySelectorAll('style'));
      expect(styles).toHaveLength(2);

      expect(styles[0].innerHTML).toEqual(
        `:where(.${testHashId}).demo{animation-name:${testHashId}-anim;}`,
      );
      expect(styles[1].innerHTML).toEqual(
        `@keyframes ${testHashId}-anim{to{transform:rotate(360deg);}}`,
      );
    });

    it('keyframes should be only declared once', () => {
      let testHashId = '';
      const anim = animation;

      const Demo = () => {
        const [token, hashId] = useCacheToken(theme, [baseToken]);
        testHashId = hashId;
        useStyleRegister(
          { theme, token, path: ['keyframes-declared-once'], hashId },
          () => [{ '.demo': { animationName: animation, anim } }],
        );
        return <div />;
      };
      render(<Demo />);

      const styles = Array.from(document.head.querySelectorAll('style'));
      expect(styles).toHaveLength(2);

      expect(styles[0].innerHTML).toEqual(
        `:where(.${testHashId}).demo{animation-name:${testHashId}-anim;}`,
      );
      expect(styles[1].innerHTML).toEqual(
        `@keyframes ${testHashId}-anim{to{transform:rotate(360deg);}}`,
      );
    });
  });

  it('re-mount should not missing animation style', () => {
    function genComp(cls: string) {
      return () => {
        const [token, hashId] = useCacheToken(theme, [baseToken], {
          salt: 're-mount',
        });

        useStyleRegister({ theme, token, path: [cls], hashId }, () => [
          animation,
        ]);

        return <div className="box" />;
      };
    }

    const Box1 = genComp('box1');
    const Box2 = genComp('box2');

    // Fist render
    render(
      <StyleProvider cache={createCache()}>
        <Box1 />
        <Box2 />
      </StyleProvider>,
    );

    expect(document.querySelectorAll('style')).toHaveLength(3);

    // Clean up
    document.head.innerHTML = '';

    // Render again
    render(
      <StyleProvider cache={createCache()}>
        <Box1 />
        <Box2 />
      </StyleProvider>,
    );
    expect(document.querySelectorAll('style')).toHaveLength(3);
  });
});
