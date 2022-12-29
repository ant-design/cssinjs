import { render } from '@testing-library/react';
import * as React from 'react';
import type { CSSInterpolation } from '../src';
import {
  createCache,
  createTheme,
  legacyLogicalPropertiesTransformer,
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
});
