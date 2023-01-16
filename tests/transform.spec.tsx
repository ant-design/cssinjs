import { render } from '@testing-library/react';
import * as React from 'react';
import type { CSSInterpolation } from '../src';
import {
  createCache,
  createTheme,
  legacyLogicalPropertiesTransformer,
  legacyNotSelectorTransformer,
  StyleProvider,
  useStyleRegister,
} from '../src';
import { getStyleText } from './util';

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
        transformers={[legacyNotSelectorTransformer]}
      >
        <Demo css={css} />
      </StyleProvider>
    );

    it('concat', () => {
      render(
        <Wrapper
          css={{
            '.box:not(h1#id-start.cls-1.cls_2#id_end)': {
              color: 'red',
            },

            '.not-change': {
              color: 'blue',
            },
          }}
        />,
      );

      const text = getStyleText(0);
      expect(text).toEqual(
        [
          `.box:not(h1):not(#id-start):not(.cls-1):not(.cls_2):not(#id_end){color:red;}`,
          `.not-change{color:blue;}`,
        ].join(''),
      );
    });
  });
});
