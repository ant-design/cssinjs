export type TokenType = object;

export type DerivativeFunc<
  DesignToken extends TokenType,
  DerivativeToken extends TokenType,
> = (designToken: DesignToken) => DerivativeToken;

let uuid = 0;

export default class Theme<
  DesignToken extends TokenType,
  DerivativeToken extends TokenType,
> {
  public id: number;
  private derivative: DerivativeFunc<DesignToken, DerivativeToken>;

  constructor(derivative: DerivativeFunc<DesignToken, DerivativeToken>) {
    uuid += 1;
    this.id = uuid;
    this.derivative = derivative;
  }

  getDerivativeToken(token: DesignToken): DerivativeToken {
    return this.derivative(token);
  }
}
