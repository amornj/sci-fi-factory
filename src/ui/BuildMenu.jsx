import React, { useState } from 'react';
import { useGameStore } from '../store';
import { buildingDefs, buildOrder, buildKeys } from '../constants';

const categories = [
  { key: 'all', label: 'ALL' },
  { key: 'core', label: 'CORE' },
  { key: 'production', label: 'PRODUCTION' },
  { key: 'logistics', label: 'LOGISTICS' },
  { key: 'colony', label: 'COLONY' },
  { key: 'defense', label: 'DEFENSE' },
  { key: 'research', label: 'RESEARCH' },
  { key: 'power', label: 'POWER' },
  { key: 'endgame', label: 'ENDGAME' },
];

// Reverse-map buildKeys: type → key digit
const keyForType = {};
Object.entries(buildKeys).forEach(([code, type]) => {
  keyForType[type] = code.replace('Digit', '');
});

export default function BuildMenu() {
  const buildMenuOpen = useGameStore(s => s.buildMenuOpen);
  const selectedBuild = useGameStore(s => s.selectedBuild);
  const selectBuild = useGameStore(s => s.selectBuild);
  const toggleBuildMenu = useGameStore(s => s.toggleBuildMenu);
  const inventory = useGameStore(s => s.inventory);
  const powerGenerated = useGameStore(s => s.powerGenerated);
  const powerConsumed = useGameStore(s => s.powerConsumed);
  const [filter, setFilter] = useState('all');
  const [hovered, setHovered] = useState(null);

  if (!buildMenuOpen) return null;

  const filtered = buildOrder.filter(type => {
    if (filter === 'all') return true;
    return buildingDefs[type].category === filter;
  });

  const detail = hovered || selectedBuild;
  const detailDef = detail ? buildingDefs[detail] : null;

  const handleSelect = (type) => {
    selectBuild(type);
    toggleBuildMenu();
  };

  return (
    <div id="build-menu" onClick={(e) => { if (e.target.id === 'build-menu') toggleBuildMenu(); }}>
      <div className="bm-panel">
        {/* Header */}
        <div className="bm-header">
          <span className="bm-title">BUILD MENU</span>
          <span className="bm-power-summary">
            POWER: <span className="bm-pw-gen">{powerGenerated}</span> / <span className="bm-pw-use">{powerConsumed}</span>
          </span>
          <span className="bm-close" onClick={toggleBuildMenu}>[ESC]</span>
        </div>

        {/* Detail bar — shows info for hovered or selected building */}
        <div className="bm-detail">
          {detailDef ? (
            <>
              <div className="bm-detail-left">
                <span
                  className="bm-detail-swatch"
                  style={{
                    background: '#' + detailDef.color.toString(16).padStart(6, '0'),
                    boxShadow: `0 0 10px ${'#' + detailDef.color.toString(16).padStart(6, '0')}60`,
                  }}
                />
                <div>
                  <div className="bm-detail-name">{detailDef.name}</div>
                  <div className="bm-detail-desc">{detailDef.desc}</div>
                </div>
              </div>
              <div className="bm-detail-right">
                <div className="bm-detail-costs">
                  {Object.entries(detailDef.cost).length === 0 ? (
                    <span className="bm-cost-item free">FREE</span>
                  ) : Object.entries(detailDef.cost).map(([item, amt]) => {
                    const have = inventory[item] || 0;
                    const enough = have >= amt;
                    return (
                      <span key={item} className={`bm-cost-item${enough ? '' : ' short'}`}>
                        {amt} {item} <span className="bm-cost-have">({have})</span>
                      </span>
                    );
                  })}
                </div>
                <div className={`bm-detail-power${detailDef.powerUse < 0 ? ' gen' : detailDef.powerUse > 0 ? ' use' : ''}`}>
                  {detailDef.powerUse < 0
                    ? `+${Math.abs(detailDef.powerUse)}`
                    : detailDef.powerUse > 0
                      ? `-${detailDef.powerUse}`
                      : '0'
                  } PW
                </div>
              </div>
            </>
          ) : (
            <div className="bm-detail-empty">Hover a building for details &middot; Click to select and place</div>
          )}
        </div>

        {/* Category tabs */}
        <div className="bm-tabs">
          {categories.map(cat => {
            const count = buildOrder.filter(t =>
              cat.key === 'all' ? true : buildingDefs[t].category === cat.key
            ).length;
            return (
              <button
                key={cat.key}
                className={`bm-tab${filter === cat.key ? ' active' : ''}`}
                onClick={() => setFilter(cat.key)}
              >
                {cat.label}
                <span className="bm-tab-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Building grid */}
        <div className="bm-grid">
          {filtered.map((type) => {
            const def = buildingDefs[type];
            const colorHex = '#' + def.color.toString(16).padStart(6, '0');
            const pw = def.powerUse;
            const keyHint = keyForType[type] || null;
            const canAfford = Object.entries(def.cost).every(
              ([item, amt]) => (inventory[item] || 0) >= amt
            );

            return (
              <div
                key={type}
                className={`bm-item${selectedBuild === type ? ' selected' : ''}${!canAfford ? ' unaffordable' : ''}`}
                onClick={() => handleSelect(type)}
                onMouseEnter={() => setHovered(type)}
                onMouseLeave={() => setHovered(null)}
              >
                <div
                  className="bm-item-icon"
                  style={{
                    background: `linear-gradient(135deg, ${colorHex}, ${colorHex}88)`,
                    boxShadow: `0 0 8px ${colorHex}60`,
                  }}
                />
                {keyHint && <span className="bm-item-key">{keyHint}</span>}
                {pw !== 0 && (
                  <span className={`bm-item-pw${pw < 0 ? ' gen' : ' use'}`}>
                    {pw < 0 ? `+${Math.abs(pw)}` : pw}
                  </span>
                )}
                <div className="bm-item-name">{def.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
