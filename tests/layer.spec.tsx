import { render } from '@testing-library/react';
import React from 'react';
import { createCache, createTheme, StyleProvider } from '../src';
import useStyleRegister from '../src/hooks/useStyleRegister';

vi.mock('../src/util', async () => {
  const origin: any = await vi.importActual('../src/util');
  return {
    ...origin,
    supportLayer: () => true,
  };
});

describe('layer', () => {
  beforeEach(() => {
    // Clear header
    document.head.innerHTML = '';
  });

  it('order', () => {
    const theme = createTheme(() => ({}));
    const Demo = () => {
      // Button
      useStyleRegister(
        {
          theme,
          token: { _tokenKey: 'test' },
          path: ['button'],
          layer: {
            name: 'button',
            dependencies: ['shared'],
          },
        },
        () => ({
          p: {
            color: 'red',
          },
        }),
      );

      // Shared
      useStyleRegister(
        {
          theme,
          token: { _tokenKey: 'test' },
          path: ['shared'],
          layer: {
            name: 'shared',
          },
        },
        () => ({
          p: {
            color: 'red',
          },
        }),
      );
      return null;
    };

    render(
      <StyleProvider layer cache={createCache()}>
        <Demo />
      </StyleProvider>,
    );

    const styles = Array.from(document.head.querySelectorAll('style'));
    expect(styles[0].innerHTML.trim()).toEqual('@layer shared,button;');
  });
});
