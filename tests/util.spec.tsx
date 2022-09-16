import { normalizeStyle, parseStyle } from '../src/hooks/useStyleRegister';

jest.mock('../src/util', () => {
  const origin = jest.requireActual('../src/util');
  return {
    ...origin,
    supportLayer: () => true,
    supportWhere: () => false, // jsdom support `where` so we change to disabled to test
  };
});

describe('util', () => {
  describe('parseStyle', () => {
    it('default', () => {
      const str = parseStyle(
        {
          '.btn': {
            color: 'red',
          },
        },
        { hashId: 'hashed' },
      );

      expect(str).toEqual('.btn.hashed{color:red;}');
    });

    it('media', () => {
      const str = parseStyle(
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
        '@media (max-width: 12450px){.btn.hashed{color:red;}}',
      );
    });

    describe('layer', () => {
      it('basic', () => {
        const str = parseStyle(
          [
            {
              p: {
                color: 'red',
              },
            },
          ],
          { hashId: 'hashed', layer: 'test-layer' },
        );

        expect(str).toEqual('@layer test-layer {p.hashed{color:red;}}');
      });

      it('order', () => {
        const str = normalizeStyle(
          parseStyle(
            [
              {
                p: {
                  color: 'red',
                },
              },
            ],
            { hashId: 'hashed', layer: 'shared, test-layer' },
          ),
        );

        expect(str).toEqual(
          '@layer shared,test-layer;@layer test-layer{p.hashed{color:red;}}',
        );
      });

      it('raw order', () => {
        const str = parseStyle('@layer a, b, c', { hashId: 'hashed' });
        expect(str).toEqual('@layer a, b, c\n');
      });
    });
  });
});
