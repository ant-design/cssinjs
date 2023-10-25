import * as React from 'react';

// We need fully clone React function here
// to avoid webpack warning React 17 do not export `useId`
const fullClone = {
  ...React,
};
const { useId } = fullClone;

const useError = () => {
  throw new Error(
    '[Ant Design CSS-in-JS] Missing key in CSS variables configuration. Please provide key in `cssVar` or upgrade React version to 18.x.',
  );
};

const useThemeKey: () => string = useId !== undefined ? useId : useError;

export default useThemeKey;
