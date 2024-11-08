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
  effect: (polyfill?: boolean) => ReturnType<EffectCallback>,
  deps: React.DependencyList,
) => void;

/**
 * Polyfill `useInsertionEffect` for React < 18
 * @param renderEffect will be executed in `useMemo`, and do not have callback
 * @param effect will be executed in `useLayoutEffect`
 * @param deps
 */
const useInsertionEffectPolyfill: UseCompatibleInsertionEffect = (
  renderEffect,
  effect,
  deps,
) => {
  React.useMemo(renderEffect, deps);
  useLayoutEffect(() => effect(true), deps);
};

/**
 * Compatible `useInsertionEffect`
 * will use `useInsertionEffect` if React version >= 18,
 * otherwise use `useInsertionEffectPolyfill`.
 */
const useCompatibleInsertionEffect: UseCompatibleInsertionEffect =
  useInsertionEffect
    ? (renderEffect, effect, deps) =>
        useInsertionEffect(() => {
          renderEffect();
          return effect();
        }, deps)
    : useInsertionEffectPolyfill;

export default useCompatibleInsertionEffect;
