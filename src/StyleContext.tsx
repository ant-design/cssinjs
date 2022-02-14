import * as React from 'react';
import CacheEntity from './Cache';

export const ATTR_TOKEN = 'data-token-key';
export const ATTR_MARK = 'token-hash';

export function createCache() {
  const styles = document.body.querySelectorAll(`style[${ATTR_TOKEN}]`);

  Array.from(styles).forEach((style) => {
    document.head.appendChild(style);
  });

  return new CacheEntity();
}

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
}

const StyleContext = React.createContext<StyleContextProps>({
  cache: createCache(),
  defaultCache: true,
});

export type StyleProviderProps = Partial<StyleContextProps>;

export const StyleProvider: React.FC<StyleProviderProps> = ({
  autoClear,
  mock,
  cache,
  children,
}) => {
  const { cache: parentCache, defaultCache: parentDefaultCache } =
    React.useContext(StyleContext);

  const context = React.useMemo<StyleContextProps>(
    () => ({
      autoClear,
      mock,
      cache: cache || parentCache || createCache(),
      defaultCache: !cache && parentDefaultCache,
    }),
    [autoClear, parentCache, mock, cache, parentDefaultCache],
  );

  return (
    <StyleContext.Provider value={context}>{children}</StyleContext.Provider>
  );
};

export default StyleContext;
