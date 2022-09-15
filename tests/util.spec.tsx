import { parseStyle } from '../src/hooks/useStyleRegister';

// import { styleValidate, supportLayer } from '../util';
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

    it('layer', () => {
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

      expect(str).toEqual('@layer test-layer {p.hashed{color:red;}}');
    });
  });
});
