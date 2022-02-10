import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { mount } from 'enzyme';
import {
  Theme,
  useCacheToken,
  CSSInterpolation,
  useStyleRegister,
  StyleContext,
  Cache,
  extractStyle,
} from '../src';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import canUseDom from 'rc-util/lib/Dom/canUseDom';

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

jest.mock('rc-util/lib/Dom/canUseDom', () => () => false);

describe('SSR', () => {
  beforeEach(() => {
    const styles = Array.from(document.head.querySelectorAll('style'));
    styles.forEach((style) => {
      style.parentNode?.removeChild(style);
    });
  });

  const genStyle = (token: DerivativeToken): CSSInterpolation => ({
    '.box': {
      backgroundColor: token.primaryColor,
    },
  });

  const Box = () => {
    const [token] = useCacheToken(theme, [baseToken]);

    useStyleRegister({ theme, token, path: ['.box'] }, () => [genStyle(token)]);

    return <div className="box" />;
  };

  it('should not use cache', () => {
    mount(<Box />);

    expect(document.head.querySelectorAll('style')).toHaveLength(0);
  });

  it('ssr extract style', () => {
    const cache = new Cache();

    const html = renderToString(
      <StyleContext.Provider value={{ cache }}>
        <Box />
      </StyleContext.Provider>,
    );

    const style = extractStyle(cache);

    expect(html).toEqual('<div class="box"></div>');
    expect(style).toEqual('<style>.box{background-color:#1890ff;}</style>');
    expect(document.head.querySelectorAll('style')).toHaveLength(0);
  });
});
