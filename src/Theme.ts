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
  private readonly defaultDerivative: DefaultDerivativeFunc<
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
type ThemeCacheMap = Map<
  DerivativeFunc<any, any> | DefaultDerivativeFunc<any, any>,
  {
    map?: ThemeCacheMap;
    value?: [Theme<any, any>, number];
  }
>;

type DerivativeOptions = {
  defaultDerivative: DefaultDerivativeFunc<any, any>;
  derivatives?: DerivativeFunc<any, any>[];
};

export function sameDerivativeOption(
  left: DerivativeOptions,
  right: DerivativeOptions,
) {
  if (
    left.defaultDerivative !== right.defaultDerivative ||
    left.derivatives?.length !== right.derivatives?.length
  ) {
    return false;
  }
  for (let i = 0; i < (left.derivatives?.length ?? 0); i++) {
    if (left.derivatives?.[i] !== right.derivatives?.[i]) {
      return false;
    }
  }
  return true;
}

export class ThemeCache {
  public static MAX_CACHE_SIZE = 20;
  public static MAX_CACHE_OFFSET = 5;

  private readonly cache: ThemeCacheMap;
  private keys: DerivativeOptions[];
  private cacheCallTimes: number;

  constructor() {
    this.cache = new Map();
    this.keys = [];
    this.cacheCallTimes = 0;
  }

  public size(): number {
    return this.keys.length;
  }

  private internalGet(
    derivativeOption: DerivativeOptions,
    updateCallTimes: boolean = false,
  ): [Theme<any, any>, number] | undefined {
    const { defaultDerivative, derivatives } = derivativeOption;
    let cache = this.cache.get(defaultDerivative);
    if (!derivatives) {
      return cache?.value;
    }
    derivatives.forEach((derivative) => {
      if (!cache) {
        cache = undefined;
      } else {
        cache = cache?.map?.get(derivative);
      }
    });
    if (cache?.value && updateCallTimes) {
      cache.value[1] = this.cacheCallTimes++;
    }
    return cache?.value;
  }

  public get(derivativeOption: DerivativeOptions): Theme<any, any> | undefined {
    return this.internalGet(derivativeOption, true)?.[0];
  }

  public has(derivativeOption: DerivativeOptions): boolean {
    return !!this.internalGet(derivativeOption);
  }

  public set(
    derivativeOption: DerivativeOptions,
    value: Theme<any, any>,
  ): void {
    const { defaultDerivative, derivatives } = derivativeOption;
    const derivativesList = [defaultDerivative, ...(derivatives ?? [])];

    // New cache
    if (!this.has(derivativeOption)) {
      if (
        this.size() + 1 >
        ThemeCache.MAX_CACHE_SIZE + ThemeCache.MAX_CACHE_OFFSET
      ) {
        const [targetKey] = this.keys.reduce<[DerivativeOptions, number]>(
          (result, key) => {
            const [, callTimes] = result;
            if (this.internalGet(key)![1] < callTimes) {
              return [key, this.internalGet(key)![1]];
            }
            return result;
          },
          [this.keys[0], this.cacheCallTimes],
        );
        this.delete(targetKey);
      }

      this.keys.push(derivativeOption);
    }

    let cache = this.cache;
    derivativesList.forEach((derivative, index) => {
      if (index === derivativesList.length - 1) {
        cache.set(derivative, { value: [value, this.cacheCallTimes++] });
      } else {
        const cacheValue = cache.get(derivative);
        if (!cacheValue) {
          cache.set(derivative, { map: new Map() });
        } else if (!cacheValue.map) {
          cacheValue.map = new Map();
        }
        cache = cache.get(derivative)!.map!;
      }
    });
  }

  private deleteByPath(
    currentCache: ThemeCacheMap,
    derivatives: DerivativeFunc<any, any>[],
  ): Theme<any, any> | undefined {
    const cache = currentCache.get(derivatives[0])!;
    if (derivatives.length === 1) {
      if (!cache.map) {
        currentCache.delete(derivatives[0]);
      } else {
        currentCache.set(derivatives[0], { map: cache.map });
      }
      return cache.value?.[0];
    }
    const result = this.deleteByPath(cache.map!, derivatives.slice(1));
    if ((!cache.map || cache.map.size === 0) && !cache.value) {
      currentCache.delete(derivatives[0]);
    }
    return result;
  }

  public delete(
    derivativeOption: DerivativeOptions,
  ): Theme<any, any> | undefined {
    // If cache exists
    if (this.has(derivativeOption)) {
      this.keys = this.keys.filter(
        (item) => !sameDerivativeOption(item, derivativeOption),
      );
      const { defaultDerivative, derivatives } = derivativeOption;
      const derivativesList = [defaultDerivative, ...(derivatives ?? [])];
      return this.deleteByPath(this.cache, derivativesList);
    }
    return undefined;
  }
}

const cacheThemes = new ThemeCache();

/**
 * Same as new Theme, but will always return same one if `derivative` not changed.
 */
export function createTheme<
  DesignToken extends TokenType,
  DerivativeToken extends TokenType,
>(
  defaultDerivative: DefaultDerivativeFunc<DesignToken, DerivativeToken>,
  derivatives?: DerivativeFunc<DesignToken, DerivativeToken>[],
) {
  // Create new theme if not exist
  const derivativeOption = { defaultDerivative, derivatives };
  if (!cacheThemes.has(derivativeOption)) {
    cacheThemes.set(
      derivativeOption,
      new Theme(defaultDerivative, derivatives),
    );
  }

  // Get theme from cache and return
  return cacheThemes.get(derivativeOption)!;
}
