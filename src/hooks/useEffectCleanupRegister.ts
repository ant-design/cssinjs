import { warning } from '@rc-component/util/lib/warning';
import type { DependencyList } from 'react';
import { useEffect } from 'react';

// DO NOT register functions in useEffect cleanup function, or functions that registered will never be called.
const useEffectCleanupRegister = (deps?: DependencyList) => {
  const effectCleanups: (() => void)[] = [];
  let cleanupFlag = false;
  function register(fn: () => void) {
    if (cleanupFlag) {
      if (process.env.NODE_ENV !== 'production') {
        warning(
          false,
          '[Ant Design CSS-in-JS] You are registering a cleanup function after unmount, which will not have any effect.',
        );
      }
      return;
    }
    effectCleanups.push(fn);
  }

  useEffect(() => {
    // Compatible with strict mode
    cleanupFlag = false;
    return () => {
      cleanupFlag = true;
      if (effectCleanups.length) {
        effectCleanups.forEach((fn) => fn());
      }
    };
  }, deps);

  return register;
};

export default useEffectCleanupRegister;
