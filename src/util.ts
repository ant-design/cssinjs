import hash from '@emotion/hash';

export function flattenToken(token: any) {
  let str = '';
  Object.keys(token).forEach((key) => {
    const value = token[key];
    str += key;
    if (value && typeof value === 'object') {
      str += flattenToken(value);
    } else {
      str += value;
    }
  });
  return str;
}

/**
 * Convert derivative token to key string
 */
export function token2key(token: any, slat: string): string {
  return hash(`${slat}_${flattenToken(token)}`);
}
