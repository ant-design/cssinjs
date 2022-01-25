import React from 'react';
import classNames from 'classnames';
import { useToken } from './util/theme';
import type { DerivativeToken } from './util/theme';
import { CSSInterpolation, CSSObject, useStyleRegister } from '../../src/';

// ======================================= Button =======================================
// 通用框架
const genSharedButtonStyle = (
  prefixCls: string,
  token: DerivativeToken,
): CSSInterpolation => ({
  [`.${prefixCls}`]: {
    borderColor: token.borderColor,
    borderWidth: token.borderWidth,
    borderRadius: token.borderRadius,

    cursor: 'pointer',
  },
});

// 实心底色样式
const genSolidButtonStyle = (
  prefixCls: string,
  token: DerivativeToken,
  postFn: () => CSSObject,
): CSSInterpolation => [
  genSharedButtonStyle(prefixCls, token),
  {
    [`.${prefixCls}`]: {
      ...postFn(),
    },
  },
];

// 默认样式
const genDefaultButtonStyle = (
  prefixCls: string,
  token: DerivativeToken,
): CSSInterpolation =>
  genSolidButtonStyle(prefixCls, token, () => ({
    backgroundColor: token.componentBackgroundColor,
    color: token.textColor,
  }));

// 主色样式
const genPrimaryButtonStyle = (
  prefixCls: string,
  token: DerivativeToken,
): CSSInterpolation =>
  genSolidButtonStyle(prefixCls, token, () => ({
    backgroundColor: token.primaryColor,
    color: token.reverseTextColor,

    '&:hover': {
      backgroundColor: token.primaryColorDisabled,
    },
  }));

// 透明按钮
const genGhostButtonStyle = (
  prefixCls: string,
  token: DerivativeToken,
): CSSInterpolation => [
  genSharedButtonStyle(prefixCls, token),
  {
    [`.${prefixCls}`]: {
      backgroundColor: 'transparent',
      color: token.textColor,
    },
  },
];

interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  type?: 'primary' | 'ghost' | 'dashed' | 'link' | 'text' | 'default';
}

const Button = ({ className, type, ...restProps }: ButtonProps) => {
  const prefixCls = 'ant-btn';

  // 【自定义】制造样式
  const [theme, token] = useToken();

  // default 添加默认样式选择器后可以省很多冲突解决问题
  const defaultCls = `${prefixCls}-default`;
  const primaryCls = `${prefixCls}-primary`;
  const ghostCls = `${prefixCls}-ghost`;

  // 全局注册，内部会做缓存优化
  useStyleRegister({ theme, token, path: [prefixCls] }, () => [
    genDefaultButtonStyle(defaultCls, token),
    genPrimaryButtonStyle(primaryCls, token),
    genGhostButtonStyle(ghostCls, token),
  ]);

  const typeCls =
    (
      {
        primary: primaryCls,
        ghost: ghostCls,
      } as any
    )[type as any] || defaultCls;

  return (
    <button
      className={classNames(prefixCls, typeCls, className)}
      {...restProps}
    />
  );
};

// ======================================== Demo ========================================
export default function App() {
  const [show, setShow] = React.useState(true);

  // const [, forceUpdate] = React.useState({});
  // React.useEffect(() => {
  //   forceUpdate({});
  // }, []);

  return (
    <div style={{ background: 'rgba(0,0,0,0.1)', padding: 16 }}>
      <h3>默认情况下不会自动删除添加的样式</h3>

      <label>
        <input type="checkbox" checked={show} onChange={() => setShow(!show)} />
        Show Components
      </label>

      {show && (
        <>
          <Button>Default</Button>
          <Button type="primary">Primary</Button>
          <Button type="ghost">Ghost</Button>
        </>
      )}
    </div>
  );

  // console.time('render');
  // const btnList = new Array(1000).fill(0).map((_, index) => (
  //   <Button key={index} style={{ margin: 2 }} type="primary">
  //     Button ${index}
  //   </Button>
  // ));
  // console.timeEnd('render');
  // return <>{btnList}</>;
}
