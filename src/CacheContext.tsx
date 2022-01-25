import * as React from 'react';
import CacheEntity from './Cache';

const CacheContext = React.createContext({
  autoClean: true,
  cache: new CacheEntity<any, [number, any]>(),
});

export default CacheContext;
