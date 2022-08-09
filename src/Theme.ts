export type TokenType = object;

export type DerivativeFunc<
  DesignToken extends TokenType,
  DerivativeToken extends TokenType,
> = (
  designToken: DesignToken,
  derivativeToken: DerivativeToken,
) => Partial<DerivativeToken>;

export type DefaultDerivativeFunc<
  DesignToken extends TokenType,
  DerivativeToken extends TokenType,
> = (designToken: DesignToken) => DerivativeToken;

let uuid = 0;

/**
 * Theme with algorithms to derive tokens from design tokens.
 * Use `createTheme` first which will help to manage the theme instance cache.
 */
export default class Theme<
  DesignToken extends TokenType,
  DerivativeToken extends TokenType,
> {
  private defaultDerivative: DefaultDerivativeFunc<
    DesignToken,
    DerivativeToken
  >;
  private derivatives?: DerivativeFunc<DesignToken, DerivativeToken>[];
  public readonly id: number;

  constructor(
    defaultDerivative: DefaultDerivativeFunc<DesignToken, DerivativeToken>,
    derivatives?: DerivativeFunc<DesignToken, DerivativeToken>[],
  ) {
    this.defaultDerivative = defaultDerivative;
    this.derivatives = derivatives;
    this.id = uuid;

    uuid += 1;
  }

  getDerivativeToken(token: DesignToken): DerivativeToken {
    const defaultDerivativeToken = this.defaultDerivative(token);
    return (
      this.derivatives?.reduce<DerivativeToken>(
        (result, derivative) => ({ ...result, ...derivative(token, result) }),
        defaultDerivativeToken,
      ) ?? defaultDerivativeToken
    );
  }
}

// ================================== Cache ==================================
export type DerivativeOptions<
  DesignToken extends TokenType,
  DerivativeToken extends TokenType,
> = {
  defaultDerivative: DefaultDerivativeFunc<DesignToken, DerivativeToken>;
  derivatives?: DerivativeFunc<DesignToken, DerivativeToken>[];
};

const cacheThemes = new Map<
  DerivativeOptions<any, any>,
  [Theme<any, any>, number]
>();

const MAX_CACHE_SIZE = 20;
const MAX_CACHE_OFFSET = 5;

let createTimes = 0;

/**
 * Same as new Theme, but will always return same one if `derivative` not changed.
 */
export function createTheme<
  DesignToken extends TokenType,
  DerivativeToken extends TokenType,
>(derivative: DerivativeOptions<DesignToken, DerivativeToken>) {
  // Create new theme if not exist
  if (!cacheThemes.has(derivative)) {
    const { defaultDerivative, derivatives } = derivative;
    cacheThemes.set(derivative, [new Theme(defaultDerivative, derivatives), 0]);
  }

  // Get theme from cache
  const cached = cacheThemes.get(derivative)!;

  // Refresh Call Time
  createTimes += 1;
  cached[1] = createTimes;

  // Clean up if cache is too large
  if (cacheThemes.size >= MAX_CACHE_SIZE + MAX_CACHE_OFFSET) {
    const latestThemes = Array.from(cacheThemes.keys()).sort((a, b) => {
      const cacheA = cacheThemes.get(a)!;
      const cacheB = cacheThemes.get(b)!;

      return cacheB[1] - cacheA[1];
    });

    // Remove earliest themes back count to MAX_CACHE_SIZE
    latestThemes.slice(MAX_CACHE_SIZE).forEach((key) => {
      cacheThemes.delete(key);
    });
  }

  return cached[0];
}
