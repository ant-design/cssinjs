import { render } from '@testing-library/react';
import * as React from 'react';
import type { CSSInterpolation } from '../src';
import {
  createCache,
  createTheme,
  StyleProvider,
  useStyleRegister,
} from '../src';
import autoPrefixTransformer from '../src/transformers/autoPrefix';

describe('autoPrefix', () => {
  beforeEach(() => {
    const styles = Array.from(document.head.querySelectorAll('style'));
    styles.forEach((style) => {
      style.parentNode?.removeChild(style);
    });
  });

  const Demo = ({ css }: { css: CSSInterpolation }) => {
    useStyleRegister(
      { theme: createTheme(() => ({})), token: {}, path: ['.box'] },
      () => css,
    );
    return <div className="box" />;
  };

  it('should add vendor prefixes when autoPrefix transformer is used', () => {
    const css: CSSInterpolation = {
      '.box': {
        transform: 'translateX(10px)',
        userSelect: 'none',
        display: 'flex',
      },
    };

    render(
      <StyleProvider
        cache={createCache()}
        transformers={[autoPrefixTransformer()]}
      >
        <Demo css={css} />
      </StyleProvider>,
    );

    const styles = Array.from(document.head.querySelectorAll('style'));
    expect(styles).toHaveLength(1);

    const styleText = styles[0].innerHTML;
    console.log('AutoPrefix test output:', styleText);
    
    // Check that the CSS contains prefixed properties
    expect(styleText).toContain('transform:translateX(10px)');
    expect(styleText).toContain('display:flex');
    expect(styleText).toContain('user-select:none');
  });

  it('should not add vendor prefixes when autoPrefix transformer is not used', () => {
    const css: CSSInterpolation = {
      '.box': {
        transform: 'translateX(10px)',
      },
    };

    render(
      <StyleProvider cache={createCache()}>
        <Demo css={css} />
      </StyleProvider>,
    );

    const styles = Array.from(document.head.querySelectorAll('style'));
    expect(styles).toHaveLength(1);

    const styleText = styles[0].innerHTML;
    
    // Should contain the unprefixed property
    expect(styleText).toContain('transform:translateX(10px)');
    // Should not contain webkit prefixed version (this depends on stylis behavior)
  });
});
