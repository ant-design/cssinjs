import React from 'react';
import { useToken } from './util/theme';
import type { DerivativeToken } from './util/theme';
import { CSSObject, useStyleRegister } from '../../src/';

// ======================================= Button =======================================
// 实心底色样式
const genSolidButtonStyle = (
  prefixCls: string,
  token: DerivativeToken,
): CSSObject => ({
  [`.${prefixCls}`]: {
    backgroundColor: token.primaryColor,
    color: token.textColor,
    borderColor: token.borderColor,
    borderWidth: token.borderWidth,
    borderRadius: token.borderRadius,

    '&:hover': {
      backgroundColor: token.primaryColorDisabled,
    },
  },
});

interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  type?: 'primary' | 'ghost' | 'dashed' | 'link' | 'text' | 'default';
}

const Button = ({ className, ...restProps }: ButtonProps) => {
  const prefixCls = 'ant-btn';

  // 制造样式
  const token = useToken();

  useStyleRegister([prefixCls, token], () =>
    genSolidButtonStyle(prefixCls, token),
  );

  return <button className={prefixCls} {...restProps} />;
};

// ======================================== Demo ========================================
export default function App() {
  const [, forceUpdate] = React.useState({});
  React.useEffect(() => {
    forceUpdate({});
  }, []);

  // return <Button>Button</Button>;

  const btnList = new Array(200).fill(0).map((_, index) => (
    <Button key={index} style={{ margin: 2 }}>
      Button ${index}
    </Button>
  ));
  return <>{btnList}</>;
}
