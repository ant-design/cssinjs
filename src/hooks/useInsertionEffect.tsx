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

// const isClientSide = canUseDom();

// // Render will before unmount effect trigger
// // https://codesandbox.io/s/proud-mountain-g7qy82?file=/src/index.js

// export type UseIsomorphicInsertionEffect = (
//   fullPathStr: string,
//   callback: VoidFunction,
//   cleanupCallback: VoidFunction,
// ) => void;

// // Server no need effect counter
// const useServerInsertion: UseIsomorphicInsertionEffect = (_, callback) => {
//   callback();
// };

// // Client need count
// const useClientInsertion: UseIsomorphicInsertionEffect = (
//   fullPathStr,
//   callback,
//   cleanupCallback,
// ) => {
//   useMergedInsertionEffect(() => {
//     callback();

//     return cleanupCallback;
//   }, [fullPathStr]);
// };

// /**
//  * This hook will check env:
//  */
// export default isClientSide ? useClientInsertion : useServerInsertion;
