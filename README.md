# @ant-design/cssinjs

[![NPM version][npm-image]][npm-url] [![npm download][download-image]][download-url] [![dumi](https://img.shields.io/badge/docs%20by-dumi-blue?style=flat-square)](https://github.com/umijs/dumi) [![build status][github-actions-image]][github-actions-url] [![Codecov][codecov-image]][codecov-url] [![Dependencies][david-image]](david-url) [![DevDependencies][david-dev-image]][david-dev-url] [![bundle size][bundlephobia-image]][bundlephobia-url]

[npm-image]: http://img.shields.io/npm/v/@ant-design/cssinjs.svg?style=flat-square
[npm-url]: http://npmjs.org/package/@ant-design/cssinjs
[github-actions-image]: https://github.com/react-component/footer/workflows/CI/badge.svg
[github-actions-url]: https://github.com/react-component/footer/actions
[codecov-image]: https://img.shields.io/codecov/c/github/react-component/footer/master.svg?style=flat-square
[codecov-url]: https://codecov.io/gh/react-component/footer/branch/master
[david-url]: https://david-dm.org/react-component/footer
[david-image]: https://david-dm.org/react-component/footer/status.svg?style=flat-square
[david-dev-url]: https://david-dm.org/react-component/footer?type=dev
[david-dev-image]: https://david-dm.org/react-component/footer/dev-status.svg?style=flat-square
[download-image]: https://img.shields.io/npm/dm/@ant-design/cssinjs.svg?style=flat-square
[download-url]: https://npmjs.org/package/@ant-design/cssinjs
[bundlephobia-url]: https://bundlephobia.com/result?p=@ant-design/cssinjs
[bundlephobia-image]: https://badgen.net/bundlephobia/minzip/@ant-design/cssinjs

Pretty Footer react component used in [ant.design](https://ant.design) and [antv.vision](https://antv.vision).

![](https://gw.alipayobjects.com/zos/antfincdn/z4ie3X8x6u/1cb23945-ec67-45a3-b521-f8da62e12255.png)

## Live Demo

https://react-component.github.io/footer/

## Install

[![@ant-design/cssinjs](https://nodei.co/npm/@ant-design/cssinjs.png)](https://npmjs.org/package/@ant-design/cssinjs)

## Usage

```js
import Footer from 'rc-footer';
import 'rc-footer/assets/index.css'; // import 'rc-footer/asssets/index.less';
import { render } from 'react-dom';

render(
  <Footer
    columns={[
      {
        icon: (
          <img src="https://gw.alipayobjects.com/zos/rmsportal/XuVpGqBFxXplzvLjJBZB.svg" />
        ),
        title: '语雀',
        url: 'https://yuque.com',
        description: '知识创作与分享工具',
        openExternal: true,
      },
    ]}
    bottom="Made with ❤️ by AFX"
  />,
  mountNode,
);
```

## API

| Property         | Type                              | Default        | Description                              |
| ---------------- | --------------------------------- | -------------- | ---------------------------------------- |
| prefixCls        | string                            | rc-footer      |                                          |

## Development

```
npm install
npm start
```

## License

@ant-design/cssinjs is released under the MIT license.
