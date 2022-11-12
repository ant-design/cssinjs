import * as React from 'react';
import CacheEntity from './Cache';

export const ATTR_TOKEN = 'data-token-hash';
export const ATTR_MARK = 'data-css-hash';
export const ATTR_DEV_CACHE_PATH = 'data-dev-cache-path';

// Mark css-in-js instance in style element
export const CSS_IN_JS_INSTANCE = '__cssinjs_instance__';
export const CSS_IN_JS_INSTANCE_ID = Math.random().toString(12).slice(2);

export function createCache() {
  if (typeof document !== 'undefined') {
    const styles = document.body.querySelectorAll(`style[${ATTR_MARK}]`);
    const { firstChild } = document.head;

    Array.from(styles).forEach((style) => {
      (style as any)[CSS_IN_JS_INSTANCE] =
        (style as any)[CSS_IN_JS_INSTANCE] || CSS_IN_JS_INSTANCE_ID;

      document.head.insertBefore(style, firstChild);
    });

    // Deduplicate of moved styles
    const styleHash: Record<string, boolean> = {};
    Array.from(document.querySelectorAll(`style[${ATTR_MARK}]`)).forEach(
      (style) => {
        const hash = style.getAttribute(ATTR_MARK)!;
        if (styleHash[hash]) {
          if ((style as any)[CSS_IN_JS_INSTANCE] === CSS_IN_JS_INSTANCE_ID) {
            style.parentNode?.removeChild(style);
          }
        } else {
          styleHash[hash] = true;
        }
      },
    );
  }

  return new CacheEntity();
}

export type HashPriority = 'low' | 'high';

export interface StyleContextProps {
  autoClear?: boolean;
  /** @private Test only. Not work in production. */
  mock?: 'server' | 'client';
  /**
   * Only set when you need ssr to extract style on you own.
   * If not provided, it will auto create <style /> on the end of Provider in server side.
   */
  cache: CacheEntity;
  /** Tell children that this context is default generated context */
  defaultCache: boolean;
  /** Use `:where` selector to reduce hashId css selector priority */
  hashPriority?: HashPriority;
}

const StyleContext = React.createContext<StyleContextProps>({
  hashPriority: 'low',
  cache: createCache(),
  defaultCache: true,
});

export type StyleProviderProps = Partial<StyleContextProps> & {
  children?: React.ReactNode;
};

export const StyleProvider: React.FC<StyleProviderProps> = (props) => {
  const { autoClear, mock, cache, hashPriority, children } = props;
  const {
    cache: parentCache,
    autoClear: parentAutoClear,
    mock: parentMock,
    defaultCache: parentDefaultCache,
    hashPriority: parentHashPriority,
  } = React.useContext(StyleContext);

  const context = React.useMemo<StyleContextProps>(
    () => ({
      autoClear: autoClear ?? parentAutoClear,
      mock: mock ?? parentMock,
      cache: cache || parentCache || createCache(),
      defaultCache: !cache && parentDefaultCache,
      hashPriority: hashPriority ?? parentHashPriority,
    }),
    [
      autoClear,
      parentAutoClear,
      parentMock,
      parentCache,
      mock,
      cache,
      parentDefaultCache,
      hashPriority,
      parentHashPriority,
    ],
  );

  return (
    <StyleContext.Provider value={context}>{children}</StyleContext.Provider>
  );
};

export default StyleContext;
