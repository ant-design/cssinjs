import React from 'react';
import './basic.less';
import Button from './components/Button';

const Demo = () => {
  const renderStart = React.useRef(Date.now());
  const [renderTime, setRenderTime] = React.useState(0);

  React.useEffect(() => {
    setRenderTime(Date.now() - renderStart.current);
  }, []);

  return (
    <>
      <p>Render Time: {renderTime}ms</p>
      {Array(10000)
        .fill(1)
        .map((_, key) => (
          <div key={key}>
            <Button>Default</Button>
            <Button type="primary">Primary</Button>
            <Button type="ghost">Ghost</Button>
            <Button className="btn-override">Override By ClassName</Button>
          </div>
        ))}
    </>
  );
};

export default function App() {
  const [show, setShow] = React.useState(false);

  return (
    <div style={{ background: 'rgba(0,0,0,0.1)', padding: 16 }}>
      <h3>默认情况下不会自动删除添加的样式</h3>

      <label>
        <input type="checkbox" checked={show} onChange={() => setShow(!show)} />
        Show Components
      </label>

      {show && (
        <div>
          <Demo />
        </div>
      )}
    </div>
  );
}
