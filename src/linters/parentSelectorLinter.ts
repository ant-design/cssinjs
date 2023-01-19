import { Linter } from '..';
import { lintWarning } from './utils';

const linter: Linter = (key, value, info) => {
  const currentSelector = info.parentSelectors[info.parentSelectors.length - 1];
  if (currentSelector) {
    const selectors = currentSelector.split(',');
    if (selectors.some((selector) => selector.split('&').length > 2)) {
      lintWarning('Should not use more than one `&` in a selector.', info);
    }
  }
};

export default linter;
