// more config: https://d.umijs.org/config
import { defineConfig } from 'dumi';

const basePath = process.env.GITHUB_ACTIONS ? '/cssinjs/' : '/';
const publicPath = process.env.GITHUB_ACTIONS ? '/cssinjs/' : '/';

export default defineConfig({
  favicons: ['https://avatars0.githubusercontent.com/u/9441414?s=200&v=4'],
  themeConfig: {
    name: 'cssinjs',
    logo: 'https://avatars0.githubusercontent.com/u/9441414?s=200&v=4',
  },
  outputPath: '.doc',
  exportStatic: {},
  base: basePath,
  publicPath: publicPath,
});
