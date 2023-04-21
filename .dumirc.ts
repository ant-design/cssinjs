// more config: https://d.umijs.org/config
import { defineConfig } from 'dumi';

const repo = process.env.PUBLIC_PATH || '';

export default defineConfig({
  favicons: ['https://avatars0.githubusercontent.com/u/9441414?s=200&v=4'],
  themeConfig: {
    name: 'cssinjs',
    logo: 'https://avatars0.githubusercontent.com/u/9441414?s=200&v=4',
  },
  base: `/${repo}`,
  publicPath: `/${repo}`,
  outputPath: '.doc',
  exportStatic: {},
});
