import React from 'react';
import { useToken } from './util/theme';
import type { GetStyle } from './util/theme';
import { useStyleRegister } from '../../src/';

const customizeGetButtonStyle: GetStyle = (prefixCls, token) => ({
  [`.${prefixCls}`]: {
    backgroundColor: token.primaryColor,
    color: token.textColor,

    '&:hover': {
      backgroundColor: token.primaryColorDisabled,
    },

    '.antd-test': {
      color: 'red',
    },
  },
});

const Button = ({
  className,
  ...restProps
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const prefixCls = 'ant-btn';

  // 制造样式
  const token = useToken();

  useStyleRegister([prefixCls, token], () =>
    customizeGetButtonStyle(prefixCls, token),
  );

  return <button className={prefixCls} {...restProps} />;
};

export default function App() {
  console.log('========================= Render =========================');

  const [, forceUpdate] = React.useState({});
  React.useEffect(() => {
    forceUpdate({});
  }, []);

  // return <Button>Button</Button>;

  const btnList = new Array(100)
    .fill(0)
    .map((_, index) => <Button key={index}>Button ${index}</Button>);
  return <>{btnList}</>;
}
