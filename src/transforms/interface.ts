import type { CSSObject } from '..';

export interface Transform {
  visit?: (cssObj: CSSObject) => CSSObject;
}
