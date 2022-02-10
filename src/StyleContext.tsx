import * as React from 'react';
import CacheEntity from './Cache';

const StyleContext = React.createContext<{
  autoClear?: boolean;
  /** @private Test usage. Do not use in your production */
  insertStyle?: boolean;
  cache: CacheEntity;
}>({
  cache: new CacheEntity(),
});

export default StyleContext;
