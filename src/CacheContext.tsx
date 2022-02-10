import * as React from 'react';
import CacheEntity from './Cache';

const CacheContext = React.createContext<{
  autoClear?: boolean;
  cache: CacheEntity;
}>({
  cache: new CacheEntity(),
});

export default CacheContext;
