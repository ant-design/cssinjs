import { ATTR_MARK } from '../../StyleContext';

export const ATTR_CACHE_MAP = 'data-ant-cssinjs-cache-path';

/**
 * This marks style from the css file.
 * Which means not exist in `<style />` tag.
 */
export const CSS_FILE_STYLE = '_FILE_STYLE__';

export function serialize(cachePathMap: Record<string, string>) {
  return Object.keys(cachePathMap)
    .map((path) => {
      const hash = cachePathMap[path];
      return `${path}:${hash}`;
    })
    .join(';');
}

let cachePathMap: Record<string, string>;
let fromCSSFile = true;

export function prepare() {
  if (!cachePathMap) {
    const div = document.createElement('div');
    div.className = ATTR_CACHE_MAP;
    document.body.appendChild(div);

    let content = getComputedStyle(div).content || '';
    content = content.replace(/^"/, '').replace(/"$/, '');

    // Fill data
    cachePathMap = {};
    content.split(';').forEach((item) => {
      const [path, hash] = item.split(':');
      cachePathMap[path] = hash;
    });

    // Remove inline record style
    const inlineMapStyle = document.querySelector(`style[${ATTR_CACHE_MAP}]`);
    if (inlineMapStyle) {
      fromCSSFile = false;
      inlineMapStyle.parentNode?.removeChild(inlineMapStyle);
    }

    document.body.removeChild(div);
  }
}

export function existPath(path: string) {
  prepare();

  return !!cachePathMap[path];
}

export function getStyleAndHash(
  path: string,
): [style: string | null, hash: string] {
  const hash = cachePathMap[path];
  let styleStr: string | null = CSS_FILE_STYLE;

  if (!fromCSSFile) {
    const style = document.querySelector(
      `style[${ATTR_MARK}="${cachePathMap[path]}"]`,
    );

    styleStr = style?.innerHTML || null;
  }

  return [styleStr, hash];
}
