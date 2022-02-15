export type TokenType = object;

export type DerivativeFunc<
  DesignToken extends TokenType,
  DerivativeToken extends TokenType,
> = (designToken: DesignToken) => DerivativeToken;

export default class Theme<
  DesignToken extends TokenType,
  DerivativeToken extends TokenType,
> {
  private derivative: DerivativeFunc<DesignToken, DerivativeToken>;

  constructor(derivative: DerivativeFunc<DesignToken, DerivativeToken>) {
    this.derivative = derivative;
  }

  getDerivativeToken(token: DesignToken): DerivativeToken {
    return this.derivative(token);
  }
}
