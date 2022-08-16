import Theme from './theme/Theme';
import useStyleRegister, { extractStyle } from './useStyleRegister';
import type { CSSObject, CSSInterpolation } from './useStyleRegister';
import useCacheToken from './useCacheToken';
import { StyleProvider, createCache } from './StyleContext';
import Keyframes from './Keyframes';
import type { TokenType } from './theme';
import { createTheme } from './theme';

export {
  Theme,
  createTheme,
  useStyleRegister,
  useCacheToken,
  createCache,
  StyleProvider,
  Keyframes,
  extractStyle,
};

export type { TokenType, CSSObject, CSSInterpolation };
