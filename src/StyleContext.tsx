import * as React from 'react';
import CacheEntity from './Cache';

const StyleContext = React.createContext<{
  autoClear?: boolean;
  /** @private Test only. Not work in production. */
  insertStyle?: boolean;
  cache: CacheEntity;
}>({
  cache: new CacheEntity(),
});

export default StyleContext;
