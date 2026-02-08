import React from 'react';
import { useGameStore } from '../store';

export default function Inventory() {
  const inventory = useGameStore(s => s.inventory);

  const items = Object.entries(inventory).filter(([, count]) => count > 0);

  return (
    <div id="inventory-panel" className="hud-panel">
      <h3>// INVENTORY</h3>
      <div id="inv-list">
        {items.map(([item, count]) => (
          <div key={item} className="inv-item">
            <span>{item}</span>
            <span className="count">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
