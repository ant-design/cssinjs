import { createCache } from '../src';

describe('cache', () => {
  it('not crash', () => {
    document.body.parentElement?.removeChild(document.body);

    createCache();
  });
});
