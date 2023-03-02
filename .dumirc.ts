// more config: https://d.umijs.org/config
import { defineConfig } from 'dumi';

const name = 'cssinjs';

const isDeploy = [process.env.PREVIEW, process.env.GITHUB_ACTIONS].includes(
  'true',
);

export default defineConfig({
  favicons: ['https://avatars0.githubusercontent.com/u/9441414?s=200&v=4'],
  themeConfig: {
    name,
    logo: 'https://avatars0.githubusercontent.com/u/9441414?s=200&v=4',
  },
  outputPath: '.doc',
  exportStatic: {},
  base: isDeploy ? `/${name}/` : '/',
  publicPath: isDeploy ? `/${name}/` : '/',
});
