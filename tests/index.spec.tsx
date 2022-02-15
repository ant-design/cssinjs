import * as React from 'react';
import { mount } from 'enzyme';
import {
  Theme,
  Cache,
  useCacheToken,
  CSSInterpolation,
  useStyleRegister,
  StyleProvider,
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

describe('csssinjs', () => {
  beforeEach(() => {
    const styles = Array.from(document.head.querySelectorAll('style'));
    styles.forEach((style) => {
      style.parentNode?.removeChild(style);
    });
  });

  it('theme', () => {
    expect(theme.getDerivativeToken(baseToken)).toEqual({
      ...baseToken,
      primaryColorDisabled: baseToken.primaryColor,
    });
  });

  describe('Component', () => {
    const genStyle = (token: DerivativeToken): CSSInterpolation => ({
      '.box': {
        width: 93,
        lineHeight: 1,
        backgroundColor: token.primaryColor,
      },
    });

    const Box = ({ propToken = baseToken }: { propToken?: DesignToken }) => {
      const [token] = useCacheToken(theme, [propToken]);

      useStyleRegister({ theme, token, path: ['.box'] }, () => [
        genStyle(token),
      ]);

      return <div className="box" />;
    };

    it('useToken', () => {
      // Multiple time only has one style instance
      const wrapper = mount(
        <div>
          <Box />
          <Box />
          <Box />
        </div>,
      );

      const styles = Array.from(document.head.querySelectorAll('style'));
      expect(styles).toHaveLength(1);

      const style = styles[0];
      expect(style.innerHTML).toEqual(
        '.box{width:93px;line-height:1;background-color:#1890ff;}',
      );

      // Default not remove style
      wrapper.unmount();
      expect(document.head.querySelectorAll('style')).toHaveLength(1);
    });

    // We will not remove style immediately,
    // but remove when second style patched.
    it('remove old style to ensure style set only exist one', () => {
      const wrapper = mount(<Box />);
      expect(document.head.querySelectorAll('style')).toHaveLength(1);

      // First change
      wrapper.setProps({
        propToken: {
          primaryColor: 'red',
        },
      });
      expect(document.head.querySelectorAll('style')).toHaveLength(1);

      // Second change
      wrapper.setProps({
        propToken: {
          primaryColor: 'green',
        },
      });
      expect(document.head.querySelectorAll('style')).toHaveLength(1);
    });

    it('remove style when unmount', () => {
      const Demo = () => (
        <StyleProvider autoClear>
          <Box />
        </StyleProvider>
      );

      const wrapper = mount(<Demo />);
      expect(document.head.querySelectorAll('style')).toHaveLength(1);

      wrapper.unmount();
      expect(document.head.querySelectorAll('style')).toHaveLength(0);
    });
  });

  it('nest style', () => {
    const genStyle = (token: DerivativeToken): CSSInterpolation => ({
      '.parent': {
        '.child': {
          background: token.primaryColor,

          '&:hover': {
            borderColor: token.primaryColor,
          },
        },
      },
    });

    const Nest = () => {
      const [token] = useCacheToken(theme, [baseToken]);

      useStyleRegister({ theme, token, path: ['.parent'] }, () => [
        genStyle(token),
      ]);

      return null;
    };

    mount(<Nest />);

    const styles = Array.from(document.head.querySelectorAll('style'));
    expect(styles).toHaveLength(1);

    const style = styles[0];
    expect(style.innerHTML).toEqual(
      '.parent .child{background:#1890ff;}.parent .child:hover{border-color:#1890ff;}',
    );
  });

  it('serialize nest object token', () => {
    const TokenShower = () => {
      const [token] = useCacheToken(theme, [
        {
          nest: {
            nothing: 1,
          },
        },
      ]);

      return token._tokenKey;
    };

    const wrapper = mount(<TokenShower />);

    // src/util.tsx - token2key func
    expect(wrapper.text()).toEqual('rqtnqb');
  });
});
