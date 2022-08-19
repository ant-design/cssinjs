import React from 'react';
import Button from './components/Button';
import './basic.less';

export default function App() {
  const [show, setShow] = React.useState(true);

  const [, forceUpdate] = React.useState({});
  React.useEffect(() => {
    forceUpdate({});
  }, []);

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

          <Button className="btn-override">Override By ClassName</Button>
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
