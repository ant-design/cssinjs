// import canUseDom from 'rc-util/lib/Dom/canUseDom';
import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';
import type { EffectCallback } from 'react';
import * as React from 'react';

// We need fully clone React function here
// to avoid webpack warning React 17 do not export `useId`
const fullClone = {
  ...React,
};
const { useInsertionEffect } = fullClone;

type PolyfillEffectCallback = (
  polyfill?: boolean,
) => ReturnType<EffectCallback>;
type UseMergedInsertionEffect = (
  effect: PolyfillEffectCallback,
  deps?: React.DependencyList,
) => void;

const useInsertionEffectPolyfill: UseMergedInsertionEffect = (effect, deps) => {
  const callback = React.useMemo(() => effect(true), deps);
  useLayoutEffect(() => callback, deps);
};

const useMergedInsertionEffect: UseMergedInsertionEffect =
  useInsertionEffect || useInsertionEffectPolyfill;

export default useMergedInsertionEffect;
