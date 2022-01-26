import { Theme } from '../src';

interface DesignToken {
  primaryColor: string;
}

interface DerivativeToken extends DesignToken {
  primaryColorDisabled: string;
}

describe('csssinjs', () => {
  it('theme', () => {
    const derivative = jest.fn(
      (designToken: DesignToken): DerivativeToken => ({
        ...designToken,
        primaryColorDisabled: designToken.primaryColor,
      }),
    );

    const theme = new Theme(derivative);
    const baseToken: DesignToken = {
      primaryColor: '#1890ff',
    };

    expect(theme.getDerivativeToken(baseToken)).toEqual({
      ...baseToken,
      primaryColorDisabled: baseToken.primaryColor,
    });
    expect(derivative).toHaveBeenCalled();
  });
});
