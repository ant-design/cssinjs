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

    it('!important', () => {
      render(
        <Wrapper
          css={{
            '.box': {
              paddingInline: '33px !important',
              marginBlockStart: '33px !important',
              marginBlockEnd: 'calc(2px + 3px) !important',
            },
          }}
        />,
      );

      const styleText = document.head.querySelector('style')?.innerHTML;
      expect(styleText).toContain('padding-left:33px!important;padding-right:33px!important');
      expect(styleText).toContain('margin-top:33px!important;margin-bottom:calc(2px + 3px)!important;}');
    });

    it('split with calc() and var()', () => {
      const str47652 = 'calc(8px - var(--c))';
      const str47707 = 'calc(50% - calc(var(--c) / 2) - var(-c))';

      const { container } = render(
        <Wrapper
          css={{
            '.box': {
              marginBlock: 'calc(var(--a) + var(--b)) calc(2px + var(--c))',
              marginInline: 'calc(2px + 1px)',
              marginInlineEnd: '3px',
            },
            // https://github.com/ant-design/ant-design/issues/47652
            '.antd-issue-47652': {
              paddingInline: str47652,
            },
            '.antd-issue-47707': {
              paddingInline: str47707,
            }
          }}
        />,
      );

      expect(container.querySelector('.box')).toHaveStyle({
        marginTop: 'calc(var(--a) + var(--b))',
        marginBottom: 'calc(2px + var(--c))',
        marginLeft: 'calc(2px + 1px)',
        marginRight: '3px',
      });

      const styleText = document.head.querySelector('style')?.innerHTML;
      expect(styleText).toMatchSnapshot();

      expect(styleText).toContain(`padding-left:${str47652}`);
      expect(styleText).toContain(`padding-right:${str47652}`);

      expect(styleText).toContain(`padding-left:${str47707}`);
      expect(styleText).toContain(`padding-right:${str47707}`);
    });
  });

  describe('px2rem', () => {
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
        '.box{margin:0 0 1.25rem;font-size:2rem;line-height:1.2;letter-spacing:1px;}';

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

    it('should handle values without a leading 0', () => {
      const css: CSSInterpolation = {
        '.rule': {
          margin: '0.5rem -0.2px -.2em .2px',
        },
      };

      const expected = '.rule{margin:0.5rem -0.2px -.2em .2px;}';

      testPx2rem(undefined, css, expected);
    });

    it('should be converted when it is a number', () => {
      const css: CSSInterpolation = {
        '.rule': {
          height: 160,
          flex: 1,
        },
      };

      const expected = '.rule{height:10rem;flex:1;}';

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

    it('should not transform when the value <= 0', () => {
      const css: CSSInterpolation = {
        '.rule': {
          top: '-1px',
          left: '0px',
          right: '1px',
          bottom: 2,
          width: 'calc(.1px + 2px)',
        },
      };

      const expected =
        '.rule{top:-1px;left:0px;right:1px;bottom:0.125rem;width:calc(.1px + 0.125rem);}';

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

    describe('precision', () => {
      it('should replace using a decimal of 2 places', function () {
        const options = {
          precision: 2,
        };
        const expected = '.rule{font-size:0.94rem;}';

        testPx2rem(options, basicCSS, expected);
      });
    });

    describe('mediaQuery', () => {
      it('should replace px in media queries', () => {
        const options = {
          mediaQuery: true,
        };

        const css: CSSInterpolation = {
          '@media only screen and (max-width: 600px)': {
            '.rule': {
              fontSize: '16px',
            },
          },
        };

        const expected =
          '@media only screen and (max-width: 37.5rem){.rule{font-size:1rem;}}';

        testPx2rem(options, css, expected);
      });
    });
  });
});
