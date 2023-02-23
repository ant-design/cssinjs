import type { CSSObject } from '..';
import type { Transformer } from './interface';

interface Options {
  /**
   * The root font size.
   * @default 100
   */
  rootValue?: number;
}

const transform = (options: Options = {}): Transformer => {
  const { rootValue = 100 } = options;

  const visit = (cssObj: CSSObject): CSSObject => {
    const clone: CSSObject = {};

    console.log('debug', {
      rootValue,
    });

    Object.entries(cssObj).forEach(([key, value]) => {
      clone[key] = value;
    });

    return clone;
  };

  return { visit };
};

export default transform;
