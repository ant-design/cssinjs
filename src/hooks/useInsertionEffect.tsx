// import canUseDom from 'rc-util/lib/Dom/canUseDom';
import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';
import * as React from 'react';

// We need fully clone React function here
// to avoid webpack warning React 17 do not export `useId`
const fullClone = {
  ...React,
};
const { useInsertionEffect } = fullClone;
const useMergedInsertionEffect = useInsertionEffect || useLayoutEffect;

export default useMergedInsertionEffect;
