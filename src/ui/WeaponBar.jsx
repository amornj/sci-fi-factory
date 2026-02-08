import React from 'react';
import { useGameStore } from '../store';
import { weaponDefs } from '../constants';

export default function WeaponBar() {
  const weaponsOwned = useGameStore(s => s.weaponsOwned);
  const currentWeapon = useGameStore(s => s.currentWeapon);
  const weaponMode = useGameStore(s => s.weaponMode);
  const locked = useGameStore(s => s.locked);
  const energyCells = useGameStore(s => s.inventory['Energy Cell']);

  if (!locked || weaponsOwned.length === 0) return null;

  return (
    <div id="weapon-bar">
      <div className="wb-slots">
        {weaponsOwned.map(wId => {
          const def = weaponDefs[wId];
          if (!def) return null;
          const active = weaponMode && currentWeapon === wId;
          const colorHex = '#' + def.color.toString(16).padStart(6, '0');
          const hasAmmo = def.ammoCost != null;
          const lowAmmo = hasAmmo && energyCells < def.ammoCost;
          return (
            <div key={wId} className={`wb-slot${active ? ' active' : ''}`}>
              <div className="wb-icon" style={{ background: colorHex, boxShadow: active ? `0 0 10px ${colorHex}` : 'none' }} />
              <div className="wb-name" style={{ color: active ? colorHex : '#556' }}>{def.name}</div>
              {hasAmmo && active && (
                <div className="wb-ammo" style={{ color: lowAmmo ? '#ff4444' : '#8cf' }}>
                  {energyCells} cells
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="wb-hint">
        <kbd>TAB</kbd> {weaponMode ? 'Mining' : 'Weapons'} &nbsp; <kbd>SCROLL</kbd> Switch
      </div>
    </div>
  );
}
