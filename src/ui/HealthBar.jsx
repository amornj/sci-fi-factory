import React from 'react';
import { useGameStore } from '../store';
import { weaponDefs } from '../constants';

const EFFECT_ICONS = {
  heal: { label: 'REGEN', color: '#44ff66' },
  speed: { label: 'SPEED', color: '#44ccff' },
  flash: { label: 'FLASH', color: '#ffffff' },
  mineFast: { label: 'MINE+', color: '#ffaa44' },
  resist: { label: 'ARMOR', color: '#8888ff' },
  poison: { label: 'TOXIN', color: '#88ff44' },
  weaken: { label: 'WEAK', color: '#ff8844' },
  fadeSight: { label: 'BLIND', color: '#666666' },
  slow: { label: 'SLOW', color: '#aa44ff' },
};

export default function HealthBar() {
  const health = useGameStore(s => s.playerHealth);
  const maxHealth = useGameStore(s => s.playerMaxHealth);
  const effects = useGameStore(s => s.playerEffects);
  const damageFlash = useGameStore(s => s.damageFlash);
  const weaponMode = useGameStore(s => s.weaponMode);
  const currentWeapon = useGameStore(s => s.currentWeapon);
  const weaponCooldown = useGameStore(s => s.weaponCooldown);

  const pct = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  const barColor = pct > 60 ? '#44ff66' : pct > 30 ? '#ffaa44' : '#ff4444';

  const wDef = currentWeapon ? weaponDefs[currentWeapon] : null;
  const cooldownPct = wDef ? Math.min(100, (weaponCooldown / wDef.cooldown) * 100) : 0;

  return (
    <>
      {/* Damage flash overlay */}
      {damageFlash > 0 && (
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 90,
          background: `radial-gradient(ellipse at center, transparent 40%, rgba(255,0,0,${damageFlash * 0.4}) 100%)`,
        }} />
      )}

      {/* Screen flash effect (from mushroom) */}
      {effects.some(e => e.type === 'flash') && (
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 89,
          background: `rgba(255,255,255,${0.6})`,
          animation: 'flashFade 0.5s ease-out forwards',
        }} />
      )}

      {/* Vision fade effect */}
      {effects.some(e => e.type === 'fadeSight') && (
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 88,
          background: `radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.7) 80%)`,
        }} />
      )}

      {/* Health bar */}
      <div id="health-bar">
        <div className="health-label">HP {Math.ceil(health)}/{maxHealth}</div>
        <div className="health-bg">
          <div className="health-fill" style={{ width: `${pct}%`, background: barColor }} />
        </div>

        {/* Weapon info */}
        {weaponMode && wDef && (
          <div className="weapon-info">
            <div className="weapon-name" style={{ color: '#' + wDef.color.toString(16).padStart(6, '0') }}>
              {wDef.name}
            </div>
            {cooldownPct > 0 && (
              <div className="cooldown-bar-bg">
                <div className="cooldown-bar-fill" style={{ width: `${100 - cooldownPct}%` }} />
              </div>
            )}
          </div>
        )}

        {/* Weapon mode indicator */}
        {weaponMode && (
          <div className="weapon-mode-indicator">WEAPON MODE</div>
        )}

        {/* Active effects */}
        {effects.length > 0 && (
          <div className="effects-row">
            {effects.map((eff, i) => {
              const info = EFFECT_ICONS[eff.type];
              if (!info) return null;
              const remaining = Math.ceil(eff.duration);
              return (
                <div key={i} className="effect-badge" style={{ borderColor: info.color, color: info.color }}>
                  {info.label} {remaining}s
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
