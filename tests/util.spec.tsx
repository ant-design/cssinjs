import { normalizeStyle, parseStyle } from '../src/hooks/useStyleRegister';

jest.mock('../src/util', () => {
  const origin = jest.requireActual('../src/util');
  return {
    ...origin,
    supportLayer: () => true,
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
        'hashed',
      );

      expect(str).toEqual('.hashed.btn{color:red;}');
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
        'hashed',
      );

      expect(str).toEqual(
        '@media (max-width: 12450px){.hashed.btn{color:red;}}',
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
          'hashed',
          'test-layer',
        );

        expect(str).toEqual('@layer test-layer {.hashedp{color:red;}}');
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
            'hashed',
            'shared, test-layer',
          ),
        );

        expect(str).toEqual(
          '@layer shared,test-layer;@layer test-layer{.hashedp{color:red;}}',
        );
      });

      it('raw order', () => {
        const str = parseStyle('@layer a, b, c', 'hashed');
        expect(str).toEqual('@layer a, b, c\n');
      });
    });
  });
});
