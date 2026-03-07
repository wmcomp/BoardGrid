import { useState } from 'react';
import './App.css';
import { BoardGrid } from './BoardGrid';
import type { LayoutItem } from './BoardGrid/types';

const layouts: LayoutItem[] = [
  { h: 1, i: '0', payload: { children: '0' }, w: 1, x: 0, y: 0 },
  { h: 2, i: '1', payload: { children: '1' }, w: 2, x: 1, y: 0 },
  { h: 1, i: '2', payload: { children: '2' }, w: 2, x: 4, y: 3 },
  { h: 4, i: '3', payload: { children: '3' }, w: 1, x: 11, y: 0 },
  {
    children: [
      { h: 1, i: '30', payload: { children: '30' }, w: 1, x: 0, y: 0 },
      { h: 2, i: '31', payload: { children: '31' }, w: 2, x: 1, y: 0 },
      { h: 1, i: '32', payload: { children: '32' }, w: 2, x: 2, y: 2 },
    ],
    h: 3,
    i: '222',
    w: 4,
    x: 6,
    y: 1,
  },
  ...new Array(12).fill({}).map((_, index) => ({
    h: 1,
    i: `i${index} 1х1`,
    payload: { children: `i${index} 1х1` },
    w: 1,
    x: index,
    y: 5,
  })),
  { h: 1, i: '12', payload: { children: '12' }, w: 12, x: 0, y: 6 },
];

const layouts2: LayoutItem[] = [
  { h: 1, i: '20', payload: { children: '20' }, w: 1, x: 0, y: 0 },
  { h: 2, i: '21', payload: { children: '21' }, w: 2, x: 1, y: 0 },
  { h: 1, i: '22', payload: { children: '22' }, w: 2, x: 4, y: 3 },
  { h: 4, i: '23', payload: { children: '23' }, w: 1, x: 11, y: 0 },
];

const App = () => {
  const [l, setL] = useState<LayoutItem[] | undefined>(layouts);
  const [l2, setL2] = useState<LayoutItem[] | undefined>(layouts2);

  return (
    <div className="content">
      <div style={{ backgroundColor: '#99f', width: '80%' }}>
        <BoardGrid layouts={l} onChange={setL} />
      </div>
      <hr />
      <BoardGrid layouts={l2} onChange={setL2} />
    </div>
  );
};

export default App;
