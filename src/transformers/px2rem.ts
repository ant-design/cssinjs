/**
 * respect https://github.com/cuth/postcss-pxtorem
 */
// @ts-ignore
import unitless from '@emotion/unitless';
import { defuArrayFn } from 'defu';
import type { CSSObject } from '..';
import type { Transformer } from './interface';

interface ConvertUnit {
  source: string | RegExp;
  target: string;
}

interface Options {
  /**
   * The root font size.
   * @default 16
   */
  rootValue?: number;
  /**
   * The decimal numbers to allow the REM units to grow to.
   * @default 5
   */
  precision?: number;
  /**
   * Whether to allow px to be converted in media queries.
   * @default false
   */
  mediaQuery?: boolean;
  /**
   * The selector blackList.
   *
   */
  selectorBlackList?: {
    /**
     * The selector black list.
     */
    match?: (string | RegExp)[];
    /**
     * Whether to deep into the children.
     * @default true
     */
    deep?: boolean;
  };
  /**
   * The property list to convert.
   * @default ['*']
   * @example
   * ['font-size', 'margin']
   */
  propList?: string[];
  /**
   * The minimum pixel value to transform.
   * @default 1
   */
  minPixelValue?: number;
  /**
   * Convert unit on end.
   * @default null
   * @example
   * ```js
   * {
   *  source: /px$/i,
   *  target: 'px'
   * }
   * ```
   */
  convertUnit?: ConvertUnit | ConvertUnit[] | false | null;
}

const pxRegex = /"[^"]+"|'[^']+'|url\([^)]+\)|--[\w-]+|(\d*\.?\d+)px/g;

const filterPropList = {
  exact(list: string[]) {
    return list.filter((m) => m.match(/^[^!*]+$/));
  },
  contain(list: string[]) {
    return list.filter((m) => m.match(/^\*.+\*$/)).map((m) => m.slice(1, -1));
  },
  endWith(list: string[]) {
    return list.filter((m) => m.match(/^\*[^*]+$/)).map((m) => m.slice(1));
  },
  startWith(list: string[]) {
    return list
      .filter((m) => m.match(/^[^!*]+\*$/))
      .map((m) => m.slice(0, Math.max(0, m.length - 1)));
  },
  notExact(list: string[]) {
    return list.filter((m) => m.match(/^![^*].*$/)).map((m) => m.slice(1));
  },
  notContain(list: string[]) {
    return list.filter((m) => m.match(/^!\*.+\*$/)).map((m) => m.slice(2, -1));
  },
  notEndWith(list: string[]) {
    return list.filter((m) => m.match(/^!\*[^*]+$/)).map((m) => m.slice(2));
  },
  notStartWith(list: string[]) {
    return list.filter((m) => m.match(/^![^*]+\*$/)).map((m) => m.slice(1, -1));
  },
};

function createPropListMatcher(propList: string[]) {
  const hasWild = propList.includes('*');
  const matchAll = hasWild && propList.length === 1;
  const lists = {
    exact: filterPropList.exact(propList),
    contain: filterPropList.contain(propList),
    startWith: filterPropList.startWith(propList),
    endWith: filterPropList.endWith(propList),
    notExact: filterPropList.notExact(propList),
    notContain: filterPropList.notContain(propList),
    notStartWith: filterPropList.notStartWith(propList),
    notEndWith: filterPropList.notEndWith(propList),
  };
  return function (prop: string) {
    if (matchAll) return true;
    return (
      (hasWild ||
        lists.exact.includes(prop) ||
        lists.contain.some((m) => prop.includes(m)) ||
        lists.startWith.some((m) => prop.indexOf(m) === 0) ||
        lists.endWith.some(
          (m) => prop.indexOf(m) === prop.length - m.length,
        )) &&
      !(
        lists.notExact.includes(prop) ||
        lists.notContain.some((m) => prop.includes(m)) ||
        lists.notStartWith.some((m) => prop.indexOf(m) === 0) ||
        lists.notEndWith.some((m) => prop.indexOf(m) === prop.length - m.length)
      )
    );
  };
}

function createPxReplace(
  rootValue: number,
  precision: NonNullable<Options['precision']>,
  minPixelValue: NonNullable<Options['minPixelValue']>,
) {
  return (m: string, $1: string | null) => {
    if (!$1) return m;
    const pixels = Number.parseFloat($1);
    if (pixels <= minPixelValue) return m;
    const fixedVal = toFixed(pixels / rootValue, precision);
    return fixedVal === 0 ? '0' : `${fixedVal}rem`;
  };
}

function toFixed(number: number, precision: number) {
  const multiplier = 10 ** (precision + 1);
  const wholeNumber = Math.floor(number * multiplier);
  return (Math.round(wholeNumber / 10) * 10) / multiplier;
}

function is(val: unknown, type: string) {
  return Object.prototype.toString.call(val) === `[object ${type}]`;
}

function isRegExp(data: unknown): data is RegExp {
  return is(data, 'RegExp');
}

function isString(data: unknown): data is string {
  return is(data, 'String');
}

function isObject(data: unknown): data is object {
  return is(data, 'Object');
}

function isNumber(data: unknown): data is number {
  return is(data, 'Number');
}

function blacklistedSelector(blacklist: (string | RegExp)[], selector: string) {
  if (!isString(selector)) return;
  return blacklist.some((t) => {
    if (isString(t)) {
      return selector.includes(t);
    }
    return selector.match(t);
  });
}

const SKIP_SYMBOL = Symbol('skip_transform');

function defineSkipSymbol(obj: object) {
  Reflect.defineProperty(obj, SKIP_SYMBOL, {
    value: true,
    enumerable: false,
    writable: false,
    configurable: false,
  });
}

function getSkipSymbol(obj: object) {
  return Reflect.get(obj, SKIP_SYMBOL);
}

const uppercasePattern = /([A-Z])/g;
function hyphenateStyleName(name: string): string {
  return name.replace(uppercasePattern, '-$1').toLowerCase();
}

function convertUnitFn(value: string, convert: ConvertUnit) {
  const { source, target } = convert;
  if (isString(source)) {
    return value.replace(new RegExp(`${source}$`), target);
  } else if (isRegExp(source)) {
    return value.replace(new RegExp(source), target);
  }
  return value;
}

const DEFAULT_OPTIONS: Required<Options> = {
  rootValue: 16,
  precision: 5,
  mediaQuery: false,
  minPixelValue: 1,
  propList: ['*'],
  selectorBlackList: { match: [], deep: true },
  convertUnit: null,
};

function resolveOptions(options: Options, defaults = DEFAULT_OPTIONS) {
  return defuArrayFn(options, defaults);
}

const transform = (options: Options = {}): Transformer => {
  const opts = resolveOptions(options);

  const {
    rootValue,
    precision,
    minPixelValue,
    propList,
    mediaQuery,
    convertUnit,
    selectorBlackList,
  } = opts;

  const pxReplace = createPxReplace(rootValue, precision, minPixelValue);
  const satisfyPropList = createPropListMatcher(propList);

  const visit = (cssObj: CSSObject): CSSObject => {
    const skip = getSkipSymbol(cssObj);

    const clone: CSSObject = { ...cssObj };

    if (skip) {
      if (selectorBlackList.deep) {
        Object.values(clone).forEach((value) => {
          if (value && isObject(value)) {
            defineSkipSymbol(value);
          }
        });
      }
      return clone;
    }

    Object.entries(cssObj).forEach(([key, value]) => {
      if (!isObject(value)) {
        if (!satisfyPropList(hyphenateStyleName(key))) {
          // Current style property is not in the propList
          // Skip
          return;
        }

        if (isString(value) && value.includes('px')) {
          const newValue = value.replace(pxRegex, pxReplace);
          clone[key] = newValue;
        }

        // no unit
        if (!unitless[key] && isNumber(value) && value !== 0) {
          clone[key] = `${value}px`.replace(pxRegex, pxReplace);
        }

        if (convertUnit && isString(clone[key])) {
          const newValue = clone[key] as string;
          if (Array.isArray(convertUnit)) {
            convertUnit.forEach((conv) => {
              clone[key] = convertUnitFn(newValue, conv);
            });
          } else {
            clone[key] = convertUnitFn(newValue, convertUnit);
          }
        }
      } else {
        if (blacklistedSelector(selectorBlackList.match || [], key)) {
          defineSkipSymbol(value);
          return;
        }

        // Media queries
        const mergedKey = key.trim();
        if (
          mergedKey.startsWith('@') &&
          mergedKey.includes('px') &&
          mediaQuery
        ) {
          const newKey = key.replace(pxRegex, pxReplace);

          clone[newKey] = clone[key];
          delete clone[key];
        }
      }
    });

    return clone;
  };

  return { visit };
};

export default transform;
