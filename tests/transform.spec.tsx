import { render } from '@testing-library/react';
import * as React from 'react';
import type { CSSInterpolation } from '../src';
import {
  createCache,
  createTheme,
  legacyLogicalPropertiesTransformer,
  px2remTransformer,
  StyleProvider,
  useStyleRegister,
} from '../src';
// import { getStyleText } from './util';

describe('transform', () => {
  beforeEach(() => {
    const styles = Array.from(document.head.querySelectorAll('style'));
    styles.forEach((style) => {
      style.parentNode?.removeChild(style);
    });
  });

  describe('legacyLogicalProperties', () => {
    const Demo = ({ css }: { css: CSSInterpolation }) => {
      useStyleRegister(
        { theme: createTheme(() => ({})), token: {}, path: ['.box'] },
        () => css,
      );
      return <div className="box" />;
    };

    const Wrapper = ({ css }: { css: CSSInterpolation }) => (
      <StyleProvider
        cache={createCache()}
        transformers={[legacyLogicalPropertiesTransformer]}
      >
        <Demo css={css} />
      </StyleProvider>
    );

    it('inset', () => {
      const { container } = render(
        <Wrapper
          css={[
            {
              '.box': {
                inset: '1px 2px 3px',
              },
            },
          ]}
        />,
      );

      expect(container.querySelector('.box')).toHaveStyle({
        top: '1px',
        right: '2px',
        bottom: '3px',
        left: '2px',
      });
    });

    it('margin', () => {
      const { container } = render(
        <Wrapper
          css={{
            '.box': {
              marginBlock: 1,
              marginInline: '2px',
              marginInlineEnd: '3px',
            },
          }}
        />,
      );

      expect(container.querySelector('.box')).toHaveStyle({
        marginTop: '1px',
        marginBottom: '1px',
        marginLeft: '2px',
        marginRight: '3px',
      });
    });

    it('padding', () => {
      const { container } = render(
        <Wrapper
          css={{
            '.box': {
              paddingBlockStart: '1px',
              paddingBlockEnd: '2px',
              paddingInlineStart: '3px',
              paddingInlineEnd: '4px',
            },
          }}
        />,
      );

      expect(container.querySelector('.box')).toHaveStyle({
        paddingTop: '1px',
        paddingBottom: '2px',
        paddingLeft: '3px',
        paddingRight: '4px',
      });
    });

    it('border', () => {
      const { container } = render(
        <Wrapper
          css={{
            '.box': {
              borderBlock: '1px solid red',
              borderInline: '2px solid green',
              borderInlineStart: '3px solid yellow',
              borderStartStartRadius: '4px',
            },
          }}
        />,
      );

      // console.log(getStyleText());

      expect(container.querySelector('.box')).toHaveStyle({
        borderTop: '1px solid red',
        borderBottom: '1px solid red',
        borderLeft: '3px solid yellow',
        borderRight: '2px solid green',
        borderTopLeftRadius: '4px',
      });
    });

    it('should not split calc', () => {
      const { container } = render(
        <Wrapper
          css={{
            '.box': {
              marginBlock: 'calc(2px + 3px)',
              marginInline: 'calc(2px + 1px)',
              marginInlineEnd: '3px',
            },
          }}
        />,
      );

      expect(container.querySelector('.box')).toHaveStyle({
        marginTop: 'calc(2px + 3px)',
        marginBottom: 'calc(2px + 3px)',
        marginLeft: 'calc(2px + 1px)',
        marginRight: '3px',
      });
    });
  });

  describe.only('px2rem', () => {
    const Demo = ({ css }: { css: CSSInterpolation }) => {
      useStyleRegister(
        { theme: createTheme(() => ({})), token: {}, path: ['.box'] },
        () => css,
      );
      return <div className="box" />;
    };

    function testPx2rem(
      options: Parameters<typeof px2remTransformer>[0],
      css: CSSInterpolation,
      expected: string,
    ) {
      render(
        <StyleProvider
          cache={createCache()}
          transformers={[px2remTransformer(options)]}
        >
          <Demo css={css} />
        </StyleProvider>,
      );

      const styles = Array.from(document.head.querySelectorAll('style'));
      expect(styles).toHaveLength(1);

      expect(styles[0].innerHTML).toEqual(expected);
    }

    const basicCSS: CSSInterpolation = {
      '.rule': {
        fontSize: '15px',
      },
    };

    it('should work simple example', () => {
      const css: CSSInterpolation = {
        '.box': {
          margin: '0 0 20px',
          fontSize: '32px',
          lineHeight: 1.2,
          letterSpacing: '1px',
        },
      };

      const expected =
        '.box{margin:0 0 1.25rem;font-size:2rem;line-height:1.2;letter-spacing:0.0625rem;}';

      testPx2rem(undefined, css, expected);
    });

    it('should replace the px unit with rem', function () {
      const expected = '.rule{font-size:0.9375rem;}';

      testPx2rem(undefined, basicCSS, expected);
    });

    it('should ignore non px properties', () => {
      const css: CSSInterpolation = {
        '.rule': {
          fontSize: '2em',
        },
      };

      const expected = '.rule{font-size:2em;}';

      testPx2rem(undefined, css, expected);
    });

    it('should handle < 1 values and values without a leading 0', () => {
      const css: CSSInterpolation = {
        '.rule': {
          margin: '0.5rem .5px -0.2px -.2em',
        },
      };

      const expected = '.rule{margin:0.5rem 0.03125rem -0.0125rem -.2em;}';

      testPx2rem(undefined, css, expected);
    });

    it('should remain unitless if 0', () => {
      const css: CSSInterpolation = {
        '.rule': {
          fontSize: 0,
          borderWidth: '0px',
        },
      };

      const expected = '.rule{font-size:0;border-width:0;}';

      testPx2rem(undefined, css, expected);
    });

    it('should not replace values in `url()`', () => {
      const css: CSSInterpolation = {
        '.rule': {
          backgroundImage: 'url(16px.jpg)',
          fontSize: '16px',
        },
      };

      const expected = '.rule{background-image:url(16px.jpg);font-size:1rem;}';

      testPx2rem(undefined, css, expected);
    });

    it('should not replace values with an uppercase P or X', function () {
      const css: CSSInterpolation = {
        '.rule': {
          margin: '12px calc(100% - 14PX)',
          height: 'calc(100% - 20px)',
          fontSize: '12Px',
          lineHeight: '16px',
        },
      };

      const expected =
        '.rule{margin:0.75rem calc(100% - 14PX);height:calc(100% - 1.25rem);font-size:12Px;line-height:1rem;}';

      testPx2rem(undefined, css, expected);
    });

    describe('rootValue', () => {
      it('should replace using a root value of 10', function () {
        const options = {
          rootValue: 10,
        };

        const expected = '.rule{font-size:1.5rem;}';

        testPx2rem(options, basicCSS, expected);
      });
    });
  });
});