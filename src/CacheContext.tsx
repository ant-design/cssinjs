import * as React from 'react';
import CacheEntity from './Cache';

const CacheContext = React.createContext({
  autoClear: false,
  cache: new CacheEntity<[number, any]>(),
});

export default CacheContext;
