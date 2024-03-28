import { normalizeStyle, parseStyle } from '../src/hooks/useStyleRegister';
import { flattenToken, memoResult } from '../src/util';

vi.mock('../src/util', async () => {
  const origin: any = await vi.importActual('../src/util');
  return {
    ...origin,
    supportLayer: () => true,
  };
});

describe('util', () => {
  describe('parseStyle', () => {
    it('default', () => {
      const [str] = parseStyle(
        {
          '.btn': {
            color: 'red',
          },
        },
        { hashId: 'hashed' },
      );

      expect(str).toEqual('.hashed.btn{color:red;}');
    });

    it('connect', () => {
      const str = normalizeStyle(
        parseStyle(
          {
            'p.btn': {
              '&-in': {
                color: 'red',
              },
            },

            'p#btn': {
              color: 'blue',
            },
          },
          { hashId: 'hashed' },
        )[0],
      );

      expect(str).toEqual(
        'p.hashed.btn-in{color:red;}p.hashed#btn{color:blue;}',
      );
    });

    it('media', () => {
      const [str] = parseStyle(
        {
          '@media (max-width: 12450px)': {
            '.btn': {
              color: 'red',
            },
          },
        },
        { hashId: 'hashed' },
      );

      expect(str).toEqual(
        '@media (max-width: 12450px){.hashed.btn{color:red;}}',
      );
    });

    describe('layer', () => {
      it('basic', () => {
        const [str] = parseStyle(
          [
            {
              p: {
                color: 'red',
              },
            },
          ],
          { hashId: 'hashed', layer: { name: 'test-layer' } },
        );

        expect(str).toEqual('@layer test-layer {p.hashed{color:red;}}');
      });

      it('order', () => {
        const parsedStyle = parseStyle(
          [
            {
              p: {
                color: 'red',
              },
            },
          ],
          {
            hashId: 'hashed',
            layer: { name: 'test-layer', dependencies: ['shared'] },
          },
        );

        const str = normalizeStyle(parsedStyle[0]);

        expect(str).toEqual('@layer test-layer{p.hashed{color:red;}}');
        expect(parsedStyle[1]).toEqual({
          '@layer test-layer': '@layer shared, test-layer;',
        });
      });

      it('raw order', () => {
        const [str] = parseStyle('@layer a, b, c', { hashId: 'hashed' });
        expect(str).toEqual('@layer a, b, c\n');
      });
    });
  });

  it('flattenToken should support cache', () => {
    const token = {};

    let checkTimes = 0;
    Object.defineProperty(token, 'a', {
      get() {
        checkTimes += 1;
        return 1;
      },
      enumerable: true,
    });

    // Repeat call flattenToken
    for (let i = 0; i < 10000; i += 1) {
      const tokenStr = flattenToken(token);
      expect(tokenStr).toEqual('a1');
    }

    expect(checkTimes).toEqual(1);
  });

  it('memoResult with same subpath', () => {
    const obj1 = {
      a: 1,
    };
    const obj2 = {
      b: 2,
    };

    const ret1 = memoResult(() => ({ ...obj1 }), [obj1]);
    expect(memoResult(() => ({ ...obj1 }), [obj1])).toBe(ret1);

    const ret2 = memoResult(() => ({ ...obj1, ...obj2 }), [obj1, obj2]);
    expect(memoResult(() => ({ ...obj1, ...obj2 }), [obj1, obj2])).toBe(ret2);
  });
});
