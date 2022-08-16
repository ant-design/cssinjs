import { warning } from 'rc-util/lib/warning';

export type TokenType = object;

export type DerivativeFunc<
  DesignToken extends TokenType,
  DerivativeToken extends TokenType,
> = (
  designToken: DesignToken,
  derivativeToken?: DerivativeToken,
) => DerivativeToken;

let uuid = 0;

/**
 * Theme with algorithms to derive tokens from design tokens.
 * Use `createTheme` first which will help to manage the theme instance cache.
 */
export default class Theme<
  DesignToken extends TokenType,
  DerivativeToken extends TokenType,
> {
  private derivatives: DerivativeFunc<DesignToken, DerivativeToken>[];
  public readonly id: number;

  constructor(
    derivatives:
      | DerivativeFunc<DesignToken, DerivativeToken>
      | DerivativeFunc<DesignToken, DerivativeToken>[],
  ) {
    this.derivatives = Array.isArray(derivatives) ? derivatives : [derivatives];
    this.id = uuid;

    if (derivatives.length === 0) {
      warning(
        derivatives.length > 0,
        '[Ant Design CSS-in-JS] Theme should have at least one derivative function.',
      );
    }

    uuid += 1;
  }

  getDerivativeToken(token: DesignToken): DerivativeToken {
    return this.derivatives.reduce<DerivativeToken>(
      (result, derivative) => derivative(token, result),
      undefined as any,
    );
  }
}

// ================================== Cache ==================================
type ThemeCacheMap = Map<
  DerivativeFunc<any, any>,
  {
    map?: ThemeCacheMap;
    value?: [Theme<any, any>, number];
  }
>;

type DerivativeOptions = DerivativeFunc<any, any>[];

export function sameDerivativeOption(
  left: DerivativeOptions,
  right: DerivativeOptions,
) {
  if (left.length !== right.length) {
    return false;
  }
  for (let i = 0; i < left.length; i++) {
    if (left[i] !== right[i]) {
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
    let cache: ReturnType<ThemeCacheMap['get']> = { map: this.cache };
    derivativeOption.forEach((derivative) => {
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
    derivativeOption.forEach((derivative, index) => {
      if (index === derivativeOption.length - 1) {
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
      return this.deleteByPath(this.cache, derivativeOption);
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
  derivatives:
    | DerivativeFunc<DesignToken, DerivativeToken>[]
    | DerivativeFunc<DesignToken, DerivativeToken>,
) {
  const derivativeArr = Array.isArray(derivatives)
    ? derivatives
    : [derivatives];
  // Create new theme if not exist
  if (!cacheThemes.has(derivativeArr)) {
    cacheThemes.set(derivativeArr, new Theme(derivativeArr));
  }

  // Get theme from cache and return
  return cacheThemes.get(derivativeArr)!;
}
