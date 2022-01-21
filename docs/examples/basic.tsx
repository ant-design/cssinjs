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
  console.time('makeStyle');
  const token = useToken();
  const style = customizeGetButtonStyle(prefixCls, token);

  useStyleRegister(style);

  return <button className={prefixCls} {...restProps} />;
};

export default function App() {
  return <Button>Button</Button>;
}
