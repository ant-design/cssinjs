import * as React from 'react';
import { render } from '@testing-library/react';
import classNames from 'classnames';
import {
  Theme,
  useCacheToken,
  useStyleRegister,
  StyleProvider,
  createCache,
} from '../src';
import type { CSSInterpolation } from '../src';
import {
  ATTR_TOKEN,
  CSS_IN_JS_INSTANCE,
  CSS_IN_JS_INSTANCE_ID,
} from '../src/StyleContext';

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

    interface BoxProps {
      propToken?: DesignToken;
    }

    const Box = ({ propToken = baseToken }: BoxProps) => {
      const [token] = useCacheToken<DerivativeToken>(theme, [propToken]);

      useStyleRegister({ theme, token, path: ['.box'] }, () => [
        genStyle(token),
      ]);

      return <div className="box" />;
    };

    it('useToken', () => {
      // Multiple time only has one style instance
      const { unmount } = render(
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
      unmount();
      expect(document.head.querySelectorAll('style')).toHaveLength(1);
    });

    // We will not remove style immediately,
    // but remove when second style patched.
    it('remove old style to ensure style set only exist one', () => {
      const getBox = (props?: BoxProps) => <Box {...props} />;

      const { rerender } = render(getBox());
      expect(document.head.querySelectorAll('style')).toHaveLength(1);

      // First change
      rerender(
        getBox({
          propToken: {
            primaryColor: 'red',
          },
        }),
      );
      expect(document.head.querySelectorAll('style')).toHaveLength(1);

      // Second change
      rerender(
        getBox({
          propToken: {
            primaryColor: 'green',
          },
        }),
      );
      expect(document.head.querySelectorAll('style')).toHaveLength(1);
    });

    it('remove style when unmount', () => {
      const Demo = () => (
        <StyleProvider autoClear>
          <Box />
        </StyleProvider>
      );

      const { unmount } = render(<Demo />);
      expect(document.head.querySelectorAll('style')).toHaveLength(1);

      unmount();
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
      const [token] = useCacheToken<DerivativeToken>(theme, [baseToken]);

      useStyleRegister({ theme, token, path: ['.parent'] }, () => [
        genStyle(token),
      ]);

      return null;
    };

    render(<Nest />);

    const styles = Array.from(document.head.querySelectorAll('style'));
    expect(styles).toHaveLength(1);

    const style = styles[0];
    expect(style.innerHTML).toEqual(
      '.parent .child{background:#1890ff;}.parent .child:hover{border-color:#1890ff;}',
    );
  });

  it('serialize nest object token', () => {
    const TokenShower = (): any => {
      const [token] = useCacheToken(theme, [
        {
          nest: {
            nothing: 1,
          },
        },
      ]);

      return token._tokenKey;
    };

    const { container } = render(<TokenShower />);

    // src/util.tsx - token2key func
    expect(container.textContent).toEqual('rqtnqb');
  });

  it('hash', () => {
    const genStyle = (): CSSInterpolation => ({
      '.a,.b, .c .d': {
        background: 'red',
      },
    });

    const Holder = () => {
      const [token, hashId] = useCacheToken<DerivativeToken>(theme, [], {
        salt: 'test',
      });

      useStyleRegister({ theme, token, hashId, path: ['holder'] }, () => [
        genStyle(),
      ]);

      return <div className={classNames('box', hashId)} />;
    };

    const { unmount } = render(<Holder />);

    const styles = Array.from(document.head.querySelectorAll('style'));
    expect(styles).toHaveLength(1);

    const style = styles[0];
    expect(style.innerHTML).toContain(
      '.a:where(.css-dev-only-do-not-override-6dmvpu)',
    );
    expect(style.innerHTML).toContain(
      '.b:where(.css-dev-only-do-not-override-6dmvpu)',
    );
    expect(style.innerHTML).toContain(
      '.c:where(.css-dev-only-do-not-override-6dmvpu) .d',
    );

    unmount();
  });

  describe('override', () => {
    interface MyDerivativeToken extends DerivativeToken {
      color: string;
    }

    const genStyle = (token: MyDerivativeToken): CSSInterpolation => ({
      '.box': {
        width: 93,
        lineHeight: 1,
        backgroundColor: token.primaryColor,
        color: token.color,
      },
    });

    const Box = ({
      override,
    }: {
      propToken?: DesignToken;
      override: object;
    }) => {
      const [token] = useCacheToken<MyDerivativeToken>(theme, [baseToken], {
        override,
        formatToken: (origin: DerivativeToken) => ({
          ...origin,
          color: origin.primaryColor,
        }),
      });

      useStyleRegister({ theme, token, path: ['.box'] }, () => [
        genStyle(token),
      ]);

      return <div className="box" />;
    };

    it('work', () => {
      const Demo = () => (
        <StyleProvider cache={createCache()}>
          <Box
            override={{
              primaryColor: '#010203',
            }}
          />
        </StyleProvider>
      );

      const { unmount } = render(<Demo />);

      const styles = Array.from(document.head.querySelectorAll('style'));
      expect(styles).toHaveLength(1);

      const style = styles[0];
      expect(style.innerHTML).toContain('background-color:#010203;');
      expect(style.innerHTML).toContain('color:#010203;');

      unmount();
    });
  });

  it('style should contain instance id', () => {
    const genStyle = (token: DerivativeToken): CSSInterpolation => ({
      div: {
        color: token.primaryColor,
      },
    });

    const Demo = ({ colorPrimary = 'red' }) => {
      const [token, hashId] = useCacheToken<DerivativeToken>(
        theme,
        [{ primaryColor: colorPrimary }],
        {
          salt: 'test',
        },
      );

      useStyleRegister(
        { theme, token, hashId, path: ['cssinjs-instance'] },
        () => [genStyle(token)],
      );

      return <div className={classNames('box', hashId)} />;
    };

    const { rerender } = render(<Demo />);
    const styles = document.querySelectorAll(`style[${ATTR_TOKEN}]`);
    expect(styles.length).toBe(1);
    expect(
      Array.from(styles).some((style) => style.innerHTML.includes('color:red')),
    ).toBeTruthy();
    expect((styles[0] as any)[CSS_IN_JS_INSTANCE]).toBe(CSS_IN_JS_INSTANCE_ID);

    rerender(<Demo colorPrimary="blue" />);
    const stylesRe = document.querySelectorAll(`style[${ATTR_TOKEN}]`);
    expect(stylesRe.length).toBe(1);
    expect(
      Array.from(stylesRe).some((style) =>
        style.innerHTML.includes('color:blue'),
      ),
    ).toBeTruthy();
    expect((styles[0] as any)[CSS_IN_JS_INSTANCE]).toBe(CSS_IN_JS_INSTANCE_ID);
    (stylesRe[0] as any)[CSS_IN_JS_INSTANCE] = '123';

    rerender(<Demo colorPrimary="yellow" />);
    const stylesRe2 = document.querySelectorAll(`style[${ATTR_TOKEN}]`);
    expect(stylesRe2.length).toBe(2);
    expect(
      Array.from(stylesRe2).some((style) =>
        style.innerHTML.includes('color:blue'),
      ),
    ).toBeTruthy();
    expect(
      Array.from(stylesRe2).some((style) =>
        style.innerHTML.includes('color:yellow'),
      ),
    ).toBeTruthy();
  });

  it('style under hash should work without hash', () => {
    const genStyle = (token: DerivativeToken): CSSInterpolation => ({
      a: {
        color: token.primaryColor,
      },
    });
    const genStyle2 = (): CSSInterpolation => ({
      div: {
        color: 'blue',
      },
    });

    let hash = '';

    const Demo = ({ colorPrimary = 'red' }) => {
      const [token, hashId] = useCacheToken<DerivativeToken>(
        theme,
        [{ primaryColor: colorPrimary }],
        {
          salt: 'test',
        },
      );
      hash = hashId;

      useStyleRegister(
        { theme, token, path: ['cssinjs-style-directly-under-hash'] },
        () => [{ '&': genStyle(token) }, { '': genStyle2() }],
      );

      useStyleRegister(
        {
          theme,
          token,
          hashId,
          path: ['cssinjs-style-directly-under-hash-hashed'],
        },
        () => [{ '&': genStyle(token) }, { '': genStyle2() }],
      );

      return <div className={classNames('box')} />;
    };

    render(<Demo />);
    const styles = Array.from(document.head.querySelectorAll('style'));
    expect(styles).toHaveLength(2);

    expect(styles[0].innerHTML).toBe('a{color:red;}div{color:blue;}');
    expect(styles[1].innerHTML).toBe(
      `:where(.${hash}) a{color:red;}:where(.${hash}) div{color:blue;}`,
    );
  });
});
