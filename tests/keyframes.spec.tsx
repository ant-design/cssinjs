import * as React from 'react';
import { render } from '@testing-library/react';
import { Theme, useCacheToken, useStyleRegister, Keyframes } from '../src';

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
    const Box = () => {
      const [token, hashId] = useCacheToken(theme, [baseToken]);

      useStyleRegister({ theme, token, hashId, path: ['.box'] }, () => ({
        '.box': {
          animationName: animation,
        },
      }));

      useStyleRegister({ theme, token, hashId, path: ['.test'] }, () => ({
        '.test': {
          animationName: animation,
        },
      }));

      useStyleRegister({ theme, token, hashId, path: ['.nest'] }, () => ({
        '.nest': {
          '.child': {
            animationName: animation,
          },
        },
      }));

      return <div className="hash">{hashId}</div>;
    };

    it('no conflict keyframes', () => {
      expect(document.head.querySelectorAll('style')).toHaveLength(0);

      // Multiple time only has one style instance
      const { container } = render(<Box />);
      const hashId = container.querySelector('.hash')?.textContent;

      let count = 0;
      const styles = Array.from(document.head.querySelectorAll('style'));
      styles.forEach((style) => {
        if (style.textContent?.includes(`@keyframes ${hashId}-anim`)) {
          count += 1;
        }
      });

      expect(count).toEqual(1);
    });
  });
});
