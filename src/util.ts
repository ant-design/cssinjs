/**
 * Convert derivative token to key string
 */
export function token2key(token: any) {
  let str = '';
  Object.keys(token).forEach((key) => {
    const value = token[key];
    str += key;
    if (value && typeof value === 'object') {
      str += token2key(value);
    } else {
      str += value;
    }
  });
  return str;
}
