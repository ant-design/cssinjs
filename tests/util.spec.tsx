import { parseStyle } from '../src/hooks/useStyleRegister';

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
  });
});
