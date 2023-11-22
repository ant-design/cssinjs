import { defineConfig } from 'father';

export default defineConfig({
  plugins: ['@rc-component/father-plugin'],
  umd: {
    name: 'antdCssinjs',
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
  },
});
