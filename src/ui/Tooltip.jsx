import React from 'react';
import { useGameStore } from '../store';

export default function Tooltip() {
  const tooltip = useGameStore(s => s.tooltipText);

  if (!tooltip) return <div id="tooltip" style={{ display: 'none' }} />;

  if (tooltip.type === 'resource') {
    return (
      <div id="tooltip" style={{ display: 'block' }}>
        <span style={{ color: '#0ff' }}>{tooltip.name}</span><br />
        <span style={{ color: '#888' }}>Amount: {tooltip.amount} — [Click to mine]</span>
      </div>
    );
  }

  if (tooltip.type === 'decoration') {
    return (
      <div id="tooltip" style={{ display: 'block' }}>
        <span style={{ color: '#88ff88' }}>{tooltip.name}</span><br />
        <span style={{ color: '#888' }}>[E] Pick up</span>
      </div>
    );
  }

  if (tooltip.type === 'building') {
    const colorHex = '#' + tooltip.color.toString(16).padStart(6, '0');
    return (
      <div id="tooltip" style={{ display: 'block' }}>
        <span style={{ color: colorHex }}>{tooltip.name}</span><br />
        <span style={{ color: '#888' }}>{tooltip.desc} — [Right-click to remove]</span>
      </div>
    );
  }

  if (tooltip.type === 'water') {
    return (
      <div id="tooltip" style={{ display: 'block' }}>
        <span style={{ color: '#2288ff' }}>Water</span><br />
        <span style={{ color: '#888' }}>[Click to scoop]</span>
      </div>
    );
  }

  if (tooltip.type === 'enemy') {
    const colorHex = '#' + (tooltip.color || 0xff0000).toString(16).padStart(6, '0');
    const hpPct = Math.max(0, Math.min(100, (tooltip.hp / tooltip.maxHp) * 100));
    return (
      <div id="tooltip" style={{ display: 'block' }}>
        <span style={{ color: colorHex, fontWeight: 'bold' }}>{tooltip.name}</span><br />
        <div style={{ width: 120, height: 6, background: 'rgba(255,0,0,0.2)', borderRadius: 3, margin: '4px auto', overflow: 'hidden' }}>
          <div style={{ width: `${hpPct}%`, height: '100%', background: hpPct > 50 ? '#44ff66' : hpPct > 25 ? '#ffaa44' : '#ff4444', borderRadius: 3 }} />
        </div>
        <span style={{ color: '#888', fontSize: '0.85em' }}>HP {Math.ceil(tooltip.hp)}/{tooltip.maxHp} — [Click to attack]</span>
      </div>
    );
  }

  return <div id="tooltip" style={{ display: 'none' }} />;
}
