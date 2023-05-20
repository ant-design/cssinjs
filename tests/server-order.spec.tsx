import { createCache } from '../src';
import { ATTR_MARK } from '../src/StyleContext';

describe('SSR-Order', () => {
  it('should move all order to the top', () => {
    document.head.innerHTML = `
<style id="baseline"></style>
    `;

    document.body.innerHTML = `
<style id="first" ${ATTR_MARK}="first"></style>
<style id="second" ${ATTR_MARK}="second"></style>
    `;

    createCache();

    const ids = Array.from(document.head.children).map((ele) => ele.id);
    expect(ids).toEqual(['first', 'second', 'baseline']);
  });

  it('when head is empty', () => {
    document.head.innerHTML = ``;

    document.body.innerHTML = `
<style id="first" ${ATTR_MARK}="first"></style>
<style id="second" ${ATTR_MARK}="second"></style>
    `;

    createCache();

    const ids = Array.from(document.head.children).map((ele) => ele.id);
    expect(ids).toEqual(['first', 'second']);
  });
});
