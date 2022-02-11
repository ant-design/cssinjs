import * as React from 'react';
import CacheEntity from './Cache';

export interface StyleContextProps {
  autoClear?: boolean;
  /** @private Test only. Not work in production. */
  insertStyle?: boolean;
  /** Only set when you need ssr to extract style on you own */
  cache: CacheEntity;
}

const StyleContext = React.createContext<StyleContextProps>({
  cache: new CacheEntity(),
});

export type StyleProviderProps = Partial<StyleContextProps>;

export const StyleProvider: React.FC<StyleProviderProps> = ({
  autoClear,
  insertStyle,
  cache,
  children,
}) => {
  const context = React.useMemo<StyleContextProps>(
    () => ({
      autoClear,
      insertStyle,
      cache: cache || new CacheEntity(),
    }),
    [autoClear, insertStyle, cache],
  );

  return (
    <StyleContext.Provider value={context}>{children}</StyleContext.Provider>
  );
};

export default StyleContext;
