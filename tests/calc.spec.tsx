import type { AbstractCalculator } from '../src';
import { genCalc } from '../src';

describe('calculator', () => {
  const cases: [
    (
      calc: (num: number | AbstractCalculator) => AbstractCalculator,
    ) => string | number,
    { js: number; css: string },
  ][] = [
    [
      // 1 + 1
      (calc) => calc(1).add(1).equal(),
      {
        js: 2,
        css: 'calc(1px + 1px)',
      },
    ],
    [
      // (1 + 1) * 4
      (calc) => calc(1).add(1).mul(4).equal(),
      {
        js: 8,
        css: 'calc((1px + 1px) * 4)',
      },
    ],
    [
      // (2 + 4) / 2 - 2
      (calc) => calc(2).add(4).div(2).sub(2).equal(),
      {
        js: 1,
        css: 'calc((2px + 4px) / 2 - 2px)',
      },
    ],
    [
      // Bad case
      // (2 + 4) / (3 - 2) - 2
      (calc) => calc(2).add(4).div(calc(3).sub(2)).sub(2).equal(),
      {
        js: 4,
        css: 'calc((2px + 4px) / (3px - 2px) - 2px)',
      },
    ],
    [
      // Bad case
      // 2 * (2 + 3)
      (calc) => calc(2).mul(calc(2).add(3)).equal(),
      {
        js: 10,
        css: 'calc(2px * (2px + 3px))',
      },
    ],
    [
      // (1 + 2) * 3
      (calc) => calc(calc(1).add(2)).mul(3).equal(),
      {
        js: 9,
        css: 'calc((1px + 2px) * 3)',
      },
    ],
    [
      // 1 + (2 - 1)
      (calc) => calc(1).add(calc(2).sub(1)).equal(),
      {
        js: 2,
        css: 'calc(1px + (2px - 1px))',
      },
    ],
    [
      // 1 + 2 * 2
      (calc) => calc(1).add(calc(2).mul(2)).equal(),
      {
        js: 5,
        css: 'calc(1px + 2px * 2)',
      },
    ],
    [
      // 5 - (2 - 1)
      (calc) => calc(5).sub(calc(2).sub(1)).equal(),
      {
        js: 4,
        css: 'calc(5px - (2px - 1px))',
      },
    ],
    [
      // 2 * 6 / 3
      (calc) => calc(2).mul(6).div(3).equal(),
      {
        js: 4,
        css: 'calc(2px * 6 / 3)',
      },
    ],
    [
      // 6 / 3 * 2
      (calc) => calc(6).div(3).mul(2).equal(),
      {
        js: 4,
        css: 'calc(6px / 3 * 2)',
      },
    ],
    [
      // Bad case
      // 6 / (3 * 2)
      (calc) => calc(6).div(calc(3).mul(2)).equal(),
      {
        js: 1,
        css: 'calc(6px / (3px * 2))',
      },
    ],
    [
      // 6
      (calc) => calc(6).equal(),
      {
        js: 6,
        css: '6px',
      },
    ],
    [
      // 1000 + 100 without unit
      (calc) => calc(1000).add(100).equal({ unit: false }),
      {
        js: 1100,
        css: 'calc(1000 + 100)',
      },
    ],
  ];

  cases.forEach(([exp, { js, css }], index) => {
    it(`js calc ${index + 1}`, () => {
      expect(exp(genCalc('js', new Set()))).toBe(js);
    });

    it(`css calc ${index + 1}`, () => {
      expect(exp(genCalc('css', new Set()))).toBe(css);
    });
  });

  it('css calc should work with string', () => {
    const calc = genCalc('css', new Set());
    expect(calc('var(--var1)').add('var(--var2)').equal()).toBe(
      'calc(var(--var1) + var(--var2))',
    );
  });

  it('css calc var should skip zIndex', () => {
    const calc = genCalc('css', new Set(['--ant-z-index']));
    expect(calc('var(--ant-z-index)').add(93).equal()).toBe(
      'calc(var(--ant-z-index) + 93)',
    );
  });
});
