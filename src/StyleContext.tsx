import * as React from 'react';
import canUseDom from 'rc-util/lib/Dom/canUseDom';
import CacheEntity from './Cache';
import { getTokenStyles } from './useStyleRegister';

export interface StyleContextProps {
  autoClear?: boolean;
  /** @private Test only. Not work in production. */
  mock?: 'server' | 'client';
  /**
   * Only set when you need ssr to extract style on you own.
   * If not provided, it will auto create <style /> on the end of Provider in server side.
   */
  cache: CacheEntity;
}

const StyleContext = React.createContext<StyleContextProps>({
  cache: new CacheEntity(),
});

export type StyleProviderProps = Partial<StyleContextProps>;

const InlineStyle = ({ cache }: { cache: CacheEntity }) => {
  const styles = getTokenStyles(cache);
  return (
    <>
      {styles.map(({ token, style }, index) => (
        <style
          data-token-key={token}
          key={index}
          dangerouslySetInnerHTML={{ __html: style }}
        />
      ))}
    </>
  );
};

export const StyleProvider: React.FC<StyleProviderProps> = ({
  autoClear,
  mock,
  cache,
  children,
}) => {
  const context = React.useMemo<StyleContextProps>(
    () => ({
      autoClear,
      mock,
      cache: cache || new CacheEntity(),
    }),
    [autoClear, mock, cache],
  );

  const shouldInsertSSRStyle = React.useMemo(() => {
    const isServerSide = mock !== undefined ? mock === 'server' : !canUseDom();
    return isServerSide && !cache;
  }, [mock, cache]);

  return (
    <StyleContext.Provider value={context}>
      {children}
      {shouldInsertSSRStyle && <InlineStyle cache={context.cache} />}
    </StyleContext.Provider>
  );
};

export default StyleContext;
