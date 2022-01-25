import React from 'react';
// import Button from './components/Button';
import Spin from './components/Spin';

export default function App() {
  const [, forceUpdate] = React.useState({});
  React.useEffect(() => {
    forceUpdate({});
  }, []);

  return (
    <div style={{ background: 'rgba(0,0,0,0.1)', padding: 16 }}>
      <h3>默认情况下不会自动删除添加的样式</h3>
      <Spin />
    </div>
  );
}
