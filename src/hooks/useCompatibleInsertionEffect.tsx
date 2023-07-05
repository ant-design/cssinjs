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

type UseCompatibleInsertionEffect = (
  renderEffect: EffectCallback,
  effect: EffectCallback,
  deps?: React.DependencyList,
) => void;

const useInsertionEffectPolyfill: UseCompatibleInsertionEffect = (
  renderEffect,
  effect,
  deps,
) => {
  React.useMemo(renderEffect, deps);
  useLayoutEffect(effect, deps);
};

const useCompatibleInsertionEffect: UseCompatibleInsertionEffect =
  useInsertionEffect
    ? (renderEffect, effect, deps) =>
        useInsertionEffect(() => {
          renderEffect();
          return effect();
        }, deps)
    : useInsertionEffectPolyfill;

export default useCompatibleInsertionEffect;
