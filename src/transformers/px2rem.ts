/**
 * respect https://github.com/cuth/postcss-pxtorem
 */
import type { CSSObject } from '..';
import type { Transformer } from './interface';

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
  unitPrecision?: number;
  /**
   * The minimum pixel value to replace.
   * @default 0
   */
  minPixelValue?: number;
}

const pxRegex = /url\([^)]+\)|var\([^)]+\)|(\d*\.?\d+)px/g;

function toFixed(number: number, precision: number) {
  const multiplier = Math.pow(10, precision + 1),
    wholeNumber = Math.floor(number * multiplier);
  return (Math.round(wholeNumber / 10) * 10) / multiplier;
}

const transform = (options: Options = {}): Transformer => {
  const { rootValue = 16, unitPrecision = 5, minPixelValue = 0 } = options;

  const pxReplace = (m: string, $1: any) => {
    if (!$1) return m;
    const pixels = parseFloat($1);
    if (pixels < minPixelValue) return m;
    const fixedVal = toFixed(pixels / rootValue, unitPrecision);
    return fixedVal === 0 ? '0' : fixedVal + 'rem';
  };

  const visit = (cssObj: CSSObject): CSSObject => {
    const clone: CSSObject = { ...cssObj };

    console.log(`debug,${'+'.repeat(10)}`, {
      rootValue,
    });

    Object.entries(cssObj).forEach(([key, value]) => {
      console.log(`debug,${'-'.repeat(20)}`, {
        key,
        value,
      });

      if (typeof value === 'string' && value.includes('px')) {
        const newValue = value.replace(pxRegex, pxReplace);

        console.log(`debug,${'-?'.repeat(20)}`, {
          key,
          value,
          newValue,
        });

        clone[key] = newValue;
      }
    });

    return clone;
  };

  return { visit };
};

export default transform;
