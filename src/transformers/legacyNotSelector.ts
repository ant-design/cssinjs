import type { CSSObject } from '..';
import { splitSelector } from '../util';
import type { Transformer } from './interface';

function flattenList(key: string) {
  const cells = key.split(/(:not\([^)]*\))/);

  return cells
    .map((cell) => {
      if (cell.includes(':not')) {
        const notContent = cell.match(/:not\(([^)]*)\)/)?.[1];
        return splitSelector(notContent!)
          .map((c) => `:not(${c})`)
          .join('');
      } else {
        return cell;
      }
    })
    .join('');
}

/**
 * Convert :not() selectors list to separate selectors. e.g.
 * { ':not(.a.b.c)': { color: 'red' } }
 * to
 * { ':not(.a):not(.b):not(.c)': { color: 'red' } }
 */
const transform: Transformer = {
  visit: (cssObj) => {
    const clone: CSSObject = {};

    Object.keys(cssObj).forEach((key) => {
      const value = cssObj[key];

      if (key.includes(':not') && typeof value === 'object') {
        clone[flattenList(key)] = value;
      } else {
        clone[key] = value;
      }
    });

    return clone;
  },
};

export default transform;
