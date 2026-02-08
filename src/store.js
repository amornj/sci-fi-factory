import { create } from 'zustand';
import { buildingDefs, resourceTypes, craftingRecipes, weaponDefs, weaponOrder, enemyDefs, WORLD_SIZE, WAVE_INTERVAL, ENEMY_CAP, ROAM_COUNT, WATER_LEVEL, INPUT_BUFFER_MAX, OUTPUT_BUFFER_MAX, CONVEYOR_SPEED_MK1, CONVEYOR_SPEED_MK2, PIPE_SPEED, POND_COUNT, RIVER_COUNT, WATER_DETECT_RANGE } from './constants';
import { getTerrainHeight } from './noise';

// Pre-computed enemy lookup tables
const _enemyHitRadii = {};
const _enemyHitRadiiSq = {};
const _enemyHalfH = {};
for (const type in enemyDefs) {
  const s = enemyDefs[type].size;
  _enemyHitRadii[type] = Math.max(s[0], s[1], s[2]) * 0.6;
  _enemyHitRadiiSq[type] = _enemyHitRadii[type] * _enemyHitRadii[type];
  _enemyHalfH[type] = s[1] * 0.5;
}

const _solidResourceTypes = resourceTypes.filter(t => t.shape !== 'liquid');

function generateResourceNodes() {
  const nodes = [];
  for (let i = 0; i < 160; i++) {
    const type = _solidResourceTypes[Math.floor(Math.random() * _solidResourceTypes.length)];
    const x = (Math.random() - 0.5) * WORLD_SIZE * 0.8;
    const z = (Math.random() - 0.5) * WORLD_SIZE * 0.8;
    const y = getTerrainHeight(x, z);
    nodes.push({
      id: i,
      typeName: type.name,
      color: type.color,
      emissive: type.emissive,
      shape: type.shape,
      position: [x, y + 1.5, z],
      amount: 50 + Math.floor(Math.random() * 100),
      maxAmount: 150,
      crystalOffsets: type.shape === 'crystal' ? Array.from({ length: 3 }, () => ({
        px: (Math.random() - 0.5) * 2,
        pz: (Math.random() - 0.5) * 2,
        rx: (Math.random() - 0.5) * 0.5,
        ry: Math.random() * Math.PI,
        rz: (Math.random() - 0.5) * 0.5,
      })) : null,
      noiseSeed: Math.random() * 1000,
    });
  }
  return nodes;
}

function generateWaterBodies() {
  const bodies = [];
  const halfW = WORLD_SIZE * 0.4;

  // Ponds
  for (let i = 0; i < POND_COUNT; i++) {
    const cx = (Math.random() - 0.5) * WORLD_SIZE * 0.8;
    const cz = (Math.random() - 0.5) * WORLD_SIZE * 0.8;
    const radius = 8 + Math.random() * 20;
    const y = getTerrainHeight(cx, cz) - 0.3;
    bodies.push({ id: i, type: 'pond', cx, cz, y, radius });
  }

  // Rivers — chains of connected segments
  for (let r = 0; r < RIVER_COUNT; r++) {
    let rx = (Math.random() - 0.5) * WORLD_SIZE * 0.6;
    let rz = (Math.random() - 0.5) * WORLD_SIZE * 0.6;
    const angle = Math.random() * Math.PI * 2;
    const segCount = 8 + Math.floor(Math.random() * 10);
    for (let s = 0; s < segCount; s++) {
      const segLen = 12 + Math.random() * 10;
      const drift = angle + (Math.random() - 0.5) * 0.8;
      const nx = rx + Math.cos(drift) * segLen;
      const nz = rz + Math.sin(drift) * segLen;
      if (Math.abs(nx) > halfW || Math.abs(nz) > halfW) break;
      const y = getTerrainHeight((rx + nx) / 2, (rz + nz) / 2) - 0.3;
      bodies.push({
        id: bodies.length,
        type: 'river',
        x1: rx, z1: rz, x2: nx, z2: nz,
        y,
        width: 4 + Math.random() * 4,
      });
      rx = nx;
      rz = nz;
    }
  }

  return bodies;
}

function isNearWater(waterBodies, x, z, range) {
  const rangeSq = range * range;
  for (let i = 0; i < waterBodies.length; i++) {
    const wb = waterBodies[i];
    if (wb.type === 'pond') {
      const dx = x - wb.cx;
      const dz = z - wb.cz;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < wb.radius + range) return true;
    } else if (wb.type === 'river') {
      // Point-to-segment distance
      const ax = wb.x1, az = wb.z1, bx = wb.x2, bz = wb.z2;
      const abx = bx - ax, abz = bz - az;
      const apx = x - ax, apz = z - az;
      const t = Math.max(0, Math.min(1, (apx * abx + apz * abz) / (abx * abx + abz * abz)));
      const px = ax + t * abx, pz = az + t * abz;
      const dx = x - px, dz = z - pz;
      if (dx * dx + dz * dz < (wb.width / 2 + range) * (wb.width / 2 + range)) return true;
    }
  }
  return false;
}

function generateDecorations() {
  const decorations = [];
  for (let i = 0; i < 800; i++) {
    const x = (Math.random() - 0.5) * WORLD_SIZE * 0.9;
    const z = (Math.random() - 0.5) * WORLD_SIZE * 0.9;
    const y = getTerrainHeight(x, z);
    const typeRoll = Math.random();
    let type;
    if (typeRoll < 0.20) type = 'mushroom';
    else if (typeRoll < 0.35) type = 'spike';
    else if (typeRoll < 0.45) type = 'orb';
    else if (typeRoll < 0.65) type = 'grass';
    else if (typeRoll < 0.80) type = 'bush';
    else type = 'plant';

    const hue = type === 'mushroom' ? Math.random() * 0.3 + 0.4
      : (type === 'grass' || type === 'bush' || type === 'plant') ? Math.random() * 0.15 + 0.25
      : Math.random();
    const scale = 0.7 + Math.random() * 0.8;
    const rotY = Math.random() * Math.PI * 2;
    const stemHeight = type === 'mushroom' ? 1 + Math.random() : 0;
    const capSize = type === 'mushroom' ? 0.4 + Math.random() * 0.3 : 0;
    const spikeHeight = type === 'spike' ? 2 + Math.random() * 2 : 0;
    const orbYOffset = type === 'orb' ? 1 + Math.random() * 3 : 0;
    const floatOffset = Math.random() * Math.PI * 2;
    const bladeCount = type === 'grass' ? 5 + Math.floor(Math.random() * 6) : 0;
    const bushSize = type === 'bush' ? 0.5 + Math.random() * 0.5 : 0;
    const plantHeight = type === 'plant' ? 0.8 + Math.random() * 0.6 : 0;

    decorations.push({
      id: i, type, hue, scale, rotY,
      position: [x, y + 0.5, z],
      stemHeight, capSize, spikeHeight,
      orbYOffset, floatOffset,
      bladeCount, bushSize, plantHeight,
    });
  }
  return decorations;
}

// ── Initial lab compound inventory (some starter compounds) ──
function initialLabCompounds() {
  const compounds = {};
  compounds[0] = 3;  // Mycelium Extract
  compounds[1] = 3;  // Bio-Enzyme
  compounds[5] = 2;  // Ferro-Carbon
  compounds[8] = 2;  // Copper Sulfate
  compounds[15] = 2; // Crystal Dust
  compounds[20] = 2; // Nano Solvent
  return compounds;
}

export const useGameStore = create((set, get) => ({
  // Pointer lock
  locked: false,
  setLocked: (v) => set({ locked: v }),

  // Inventory
  inventory: {
    'Quantum Crystal': 0,
    'Titanium Ore': 0,
    'Plasma Gel': 0,
    'Iron Ore': 0,
    'Iron Plate': 0,
    'Nano Circuit': 0,
    'Copper Ore': 0,
    'Power Cell': 0,
    'Titanium Alloy': 0,
    'Data Core': 0,
    'Bioluminescent Mushroom': 0,
    'Energy Cell': 0,
    'Water': 0,
    'Coolant': 0,
    'Bio-Acid': 0,
  },

  // Power
  powerGenerated: 10,
  powerConsumed: 0,

  // Buildings
  buildings: [],
  nextBuildingId: 0,

  // Resources
  resourceNodes: generateResourceNodes(),

  // Water bodies
  waterBodies: generateWaterBodies(),

  // Decorations
  decorations: generateDecorations(),

  // Transport system
  connectionGraph: {},
  connectionGraphDirty: true,
  conveyorItems: [],
  nextConveyorItemId: 0,

  // Build mode
  selectedBuild: null,
  buildRotation: 0,
  buildMenuOpen: false,

  // Player
  playerPosition: [0, 20, 0],

  // ═══════════════════════════════════════════════════════
  // PLAYER HEALTH & EFFECTS
  // ═══════════════════════════════════════════════════════
  playerHealth: 100,
  playerMaxHealth: 100,
  damageFlash: 0,
  playerEffects: [],
  lastDamageTime: 0,

  // Combat feedback
  screenShake: 0,
  damageNumbers: [],
  nextDamageNumberId: 0,
  hitMarker: 0,
  killFeed: [],
  nextKillFeedId: 0,

  addScreenShake: (intensity) => set(s => ({
    screenShake: Math.min(1, s.screenShake + intensity),
  })),
  tickScreenShake: (delta) => {
    const s = get();
    if (s.screenShake > 0) {
      set({ screenShake: Math.max(0, s.screenShake - delta * 4) });
    }
  },
  spawnDamageNumber: (position, amount, color, isCrit) => set(s => ({
    damageNumbers: [...s.damageNumbers.slice(-14), {
      id: s.nextDamageNumberId,
      position: [...position],
      amount: Math.round(amount),
      color,
      isCrit,
      life: 1.2,
    }],
    nextDamageNumberId: s.nextDamageNumberId + 1,
  })),
  tickDamageNumbers: (delta) => {
    const s = get();
    if (s.damageNumbers.length === 0) return;
    const updated = s.damageNumbers
      .map(dn => ({ ...dn, life: dn.life - delta }))
      .filter(dn => dn.life > 0);
    set({ damageNumbers: updated });
  },
  showHitMarker: () => set({ hitMarker: 0.3 }),
  tickHitMarker: (delta) => {
    const s = get();
    if (s.hitMarker > 0) {
      set({ hitMarker: Math.max(0, s.hitMarker - delta) });
    }
  },
  addKillFeedMessage: (text, color) => set(s => ({
    killFeed: [...s.killFeed.slice(-4), {
      id: s.nextKillFeedId,
      text,
      color,
      life: 3.0,
    }],
    nextKillFeedId: s.nextKillFeedId + 1,
  })),
  tickKillFeed: (delta) => {
    const s = get();
    if (s.killFeed.length === 0) return;
    const updated = s.killFeed
      .map(kf => ({ ...kf, life: kf.life - delta }))
      .filter(kf => kf.life > 0);
    set({ killFeed: updated });
  },

  damagePlayer: (amount) => {
    const s = get();
    const hasResist = s.playerEffects.some(e => e.type === 'resist');
    const actualDamage = hasResist ? amount * 0.5 : amount;
    const newHP = Math.max(0, s.playerHealth - actualDamage);
    set({ playerHealth: newHP, damageFlash: 1, lastDamageTime: performance.now() / 1000 });
    if (newHP <= 0) {
      get().respawnPlayer();
    }
  },

  takeDamage: (amount) => get().damagePlayer(amount),

  healPlayer: (amount) => set(s => ({
    playerHealth: Math.min(s.playerMaxHealth, s.playerHealth + amount),
  })),

  respawnPlayer: () => {
    const s = get();
    setTimeout(() => {
      set({
        playerHealth: s.playerMaxHealth,
        playerPosition: [0, 20, 0],
        playerEffects: [],
        weaponMode: false,
      });
      get().showStatus('You were knocked out! Respawned at base.', '#ff4444');
    }, 1500);
  },

  applyMushroomEffect: (effect) => set(s => {
    const newEffect = { type: effect.type, duration: effect.duration, strength: 1 };
    return { playerEffects: [...s.playerEffects, newEffect] };
  }),

  tickPlayerEffects: (delta) => {
    const s = get();
    if (s.playerEffects.length === 0 && s.damageFlash <= 0) return;

    const update = {};

    if (s.damageFlash > 0) {
      update.damageFlash = Math.max(0, s.damageFlash - delta * 3);
    }

    let hp = s.playerHealth;
    const newEffects = s.playerEffects
      .map(e => {
        const remaining = e.duration - delta;
        if (e.type === 'heal') hp = Math.min(s.playerMaxHealth, hp + 5 * delta);
        if (e.type === 'poison') hp = Math.max(1, hp - 4 * delta);
        return { ...e, duration: remaining };
      })
      .filter(e => e.duration > 0);

    update.playerEffects = newEffects;
    if (hp !== s.playerHealth) update.playerHealth = hp;

    set(update);
  },

  tickPlayerRegen: (delta) => {
    const s = get();
    const now = performance.now() / 1000;
    if (now - s.lastDamageTime > 4 && s.playerHealth < s.playerMaxHealth && s.playerHealth > 0) {
      set({ playerHealth: Math.min(s.playerMaxHealth, s.playerHealth + 2 * delta) });
    }
  },

  hasEffect: (type) => get().playerEffects.some(e => e.type === type),

  // ═══════════════════════════════════════════════════════
  // WEAPON SYSTEM
  // ═══════════════════════════════════════════════════════
  weaponMode: false,
  currentWeapon: null,
  weaponsOwned: [],
  weaponCooldown: 0,

  toggleWeaponMode: () => {
    const s = get();
    if (s.weaponsOwned.length === 0) {
      s.showStatus('No weapons crafted!', '#ff4444');
      return;
    }
    const newMode = !s.weaponMode;
    const weapon = newMode ? (s.currentWeapon || s.weaponsOwned[0]) : s.currentWeapon;
    set({ weaponMode: newMode, currentWeapon: weapon });
    s.showStatus(newMode ? `Weapon Mode: ${weaponDefs[weapon].name}` : 'Mining Mode', newMode ? '#ff8844' : '#00ffaa');
  },

  cycleWeapon: (dir) => {
    const s = get();
    if (!s.weaponMode || s.weaponsOwned.length === 0) return;
    const owned = s.weaponsOwned;
    const idx = owned.indexOf(s.currentWeapon);
    const newIdx = ((idx + dir) % owned.length + owned.length) % owned.length;
    const weapon = owned[newIdx];
    set({ currentWeapon: weapon });
    s.showStatus(`${weaponDefs[weapon].name}`, '#ff8844');
  },

  equipWeapon: (id) => set({ currentWeapon: id }),

  fireWeapon: () => {
    const s = get();
    if (!s.weaponMode || !s.currentWeapon || s.weaponCooldown > 0) return false;
    const def = weaponDefs[s.currentWeapon];
    // Ammo check for ranged weapons
    if (def.ammoCost) {
      if ((s.inventory['Energy Cell'] || 0) < def.ammoCost) return 'no_ammo';
      set(st => ({
        weaponCooldown: def.cooldown,
        inventory: { ...st.inventory, 'Energy Cell': st.inventory['Energy Cell'] - def.ammoCost },
      }));
      return true;
    }
    set({ weaponCooldown: def.cooldown });
    return true;
  },

  tickWeaponCooldown: (delta) => {
    const s = get();
    if (s.weaponCooldown > 0) {
      set({ weaponCooldown: Math.max(0, s.weaponCooldown - delta) });
    }
  },

  // ═══════════════════════════════════════════════════════
  // ENEMY SYSTEM
  // ═══════════════════════════════════════════════════════
  enemies: [],
  nextEnemyId: 0,
  waveNumber: 0,
  waveTimer: 0,
  roamTimer: 0,

  spawnEnemy: (type, position) => {
    const def = enemyDefs[type];
    if (!def) return;
    const s = get();
    if (s.enemies.length >= ENEMY_CAP) return;
    set(st => ({
      enemies: [...st.enemies, {
        id: st.nextEnemyId,
        type,
        hp: def.hp,
        maxHp: def.hp,
        damage: def.damage,
        speed: def.speed,
        attackRange: def.attackRange,
        detectRange: def.detectRange,
        attackCooldown: 0,
        state: 'idle',
        position: [...position],
        wanderTarget: null,
        wanderTimer: 0,
        statusEffects: [],
        hitFlash: 0,
        hitstop: 0,
      }],
      nextEnemyId: st.nextEnemyId + 1,
    }));
  },

  damageEnemy: (enemyId, amount, options = {}) => {
    const s = get();
    const enemy = s.enemies.find(e => e.id === enemyId);
    if (!enemy) return { hit: false, dead: false, isCrit: false, damage: 0, statusProc: false };

    const { weaponId, isCrit: forceCrit, isHeadshot, hitPosition, knockbackDir } = options;
    const wDef = weaponId ? weaponDefs[weaponId] : null;

    // Check shred debuff on target (increases damage taken)
    const shredEff = enemy.statusEffects ? enemy.statusEffects.find(se => se.type === 'shred') : null;
    let dmg = shredEff ? amount * shredEff.damageMult : amount;

    // Crit check
    let isCrit = forceCrit || isHeadshot || false;
    if (!isCrit && wDef && Math.random() < (wDef.critChance || 0)) {
      isCrit = true;
    }
    if (isCrit && wDef) {
      dmg *= (wDef.critMultiplier || 2.0);
    }

    const newHp = enemy.hp - dmg;
    const dead = newHp <= 0;

    // Spawn damage number
    const numPos = hitPosition || enemy.position;
    const numColor = isCrit ? '#ffcc00' : '#ffffff';
    get().spawnDamageNumber(numPos, dmg, numColor, isCrit);

    // Hit marker + screen shake
    get().showHitMarker();
    get().addScreenShake(isCrit ? 0.4 : 0.15);

    // Hit particles
    get().spawnParticlesAt(hitPosition || enemy.position, enemyDefs[enemy.type]?.color || 0xff0000);

    // Status effect proc
    let statusProc = false;
    let newStatusEffects = enemy.statusEffects ? [...enemy.statusEffects] : [];
    if (wDef && wDef.statusEffect && Math.random() < wDef.statusEffect.chance) {
      statusProc = true;
      const se = wDef.statusEffect;
      // Remove existing effect of same type before adding new one
      newStatusEffects = newStatusEffects.filter(e => e.type !== se.type);
      newStatusEffects.push({ ...se, remaining: se.duration });
    }

    if (dead) {
      // Kill feed
      const eDef = enemyDefs[enemy.type];
      const killText = isHeadshot
        ? `HEADSHOT! ${eDef?.name || enemy.type}`
        : `Killed ${eDef?.name || enemy.type}`;
      const killColor = isCrit ? '#ffcc00' : '#ff4444';
      get().addKillFeedMessage(killText, killColor);

      set(st => ({
        enemies: st.enemies.filter(e => e.id !== enemyId),
      }));
      return { hit: true, dead: true, isCrit, damage: dmg, statusProc };
    }

    // Apply knockback
    let newPos = [...enemy.position];
    if (knockbackDir) {
      const kbStrength = isCrit ? 3 : 1.5;
      newPos[0] += knockbackDir[0] * kbStrength;
      newPos[2] += knockbackDir[1] * kbStrength;
    }

    set(st => ({
      enemies: st.enemies.map(e =>
        e.id === enemyId ? {
          ...e,
          hp: newHp,
          state: 'chase',
          position: newPos,
          hitFlash: 0.15,
          hitstop: isCrit ? 0.12 : 0.05,
          statusEffects: newStatusEffects,
        } : e
      ),
    }));
    return { hit: true, dead: false, isCrit, damage: dmg, statusProc };
  },

  removeEnemy: (enemyId) => set(s => ({
    enemies: s.enemies.filter(e => e.id !== enemyId),
  })),

  tickEnemies: (delta) => {
    const s = get();
    if (s.enemies.length === 0) return;
    const pp = s.playerPosition;

    // Pre-filter turrets (3.1)
    const turrets = [];
    for (let i = 0; i < s.buildings.length; i++) {
      const b = s.buildings[i];
      if (b.type === 'turret' || b.type === 'missile_turret') turrets.push(b);
    }

    const survivors = [];
    for (let i = 0; i < s.enemies.length; i++) {
      const e = s.enemies[i];
      const dx = pp[0] - e.position[0];
      const dz = pp[2] - e.position[2];
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Mutate in-place (3.3)
      const pos = e.position;
      e.attackCooldown = Math.max(0, e.attackCooldown - delta);
      e.wanderTimer -= delta;

      // Tick hitFlash & hitstop timers
      if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - delta);
      if (e.hitstop > 0) e.hitstop = Math.max(0, e.hitstop - delta);

      // Tick status effects
      if (e.statusEffects && e.statusEffects.length > 0) {
        let stunned = false;
        const newEffects = [];
        for (let si = 0; si < e.statusEffects.length; si++) {
          const se = e.statusEffects[si];
          se.remaining -= delta;
          if (se.remaining <= 0) continue;
          if (se.type === 'stun') stunned = true;
          if (se.type === 'bleed' || se.type === 'burn') {
            e.hp -= se.dps * delta;
          }
          newEffects.push(se);
        }
        e.statusEffects = newEffects;
        if (stunned || e.hitstop > 0) {
          // Frozen — skip movement/AI but still snap to terrain and check death
          const halfH = _enemyHalfH[e.type] || 0.5;
          pos[1] = getTerrainHeight(pos[0], pos[2]) + halfH;
          if (e.hp <= 0) {
            // DoT kill
            const eDef = enemyDefs[e.type];
            get().addKillFeedMessage(`${eDef?.name || e.type} succumbed`, '#ff8844');
            get().spawnParticlesAt(e.position, eDef?.color || 0xff0000);
            continue;
          }
          survivors.push(e);
          continue;
        }
      } else if (e.hitstop > 0) {
        const halfH = _enemyHalfH[e.type] || 0.5;
        pos[1] = getTerrainHeight(pos[0], pos[2]) + halfH;
        survivors.push(e);
        continue;
      }

      // Compute effective move speed (slow debuff)
      const slowEff = e.statusEffects ? e.statusEffects.find(se => se.type === 'slow') : null;
      const moveSpeed = e.speed * (slowEff ? slowEff.speedMult : 1);

      // State transitions
      if (e.state === 'idle') {
        if (dist < e.detectRange) {
          e.state = 'chase';
        } else {
          if (!e.wanderTarget || e.wanderTimer <= 0) {
            const angle = Math.random() * Math.PI * 2;
            const d = 5 + Math.random() * 10;
            e.wanderTarget = [pos[0] + Math.cos(angle) * d, pos[2] + Math.sin(angle) * d];
            e.wanderTimer = 3 + Math.random() * 3;
          }
          const wdx = e.wanderTarget[0] - pos[0];
          const wdz = e.wanderTarget[1] - pos[2];
          const wdist = Math.sqrt(wdx * wdx + wdz * wdz);
          if (wdist > 1) {
            const spd = moveSpeed * 0.3 * delta;
            pos[0] += (wdx / wdist) * spd;
            pos[2] += (wdz / wdist) * spd;
          } else {
            e.wanderTarget = null;
          }
        }
      } else if (e.state === 'chase') {
        if (dist > e.detectRange * 1.5) {
          e.state = 'idle';
        } else if (dist <= e.attackRange) {
          e.state = 'attack';
        } else {
          const spd = moveSpeed * delta;
          if (dist > 0.1) {
            pos[0] += (dx / dist) * spd;
            pos[2] += (dz / dist) * spd;
          }
        }
      } else if (e.state === 'attack') {
        if (dist > e.attackRange * 1.5) {
          e.state = 'chase';
        } else if (e.attackCooldown <= 0) {
          if (e.type === 'spitter') {
            const dy = pp[1] - pos[1];
            const d3 = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (d3 > 0) {
              get().fireProjectile(
                pos,
                [dx / d3, dy / d3, dz / d3],
                e.damage,
                'enemy',
                0xaaff00,
                30
              );
            }
          } else {
            get().damagePlayer(e.damage);
          }
          const def = enemyDefs[e.type];
          e.attackCooldown = def ? def.attackCooldown : 1.5;
          e.state = 'cooldown';
        }
      } else if (e.state === 'cooldown') {
        if (e.attackCooldown <= 0) {
          e.state = dist <= e.attackRange ? 'attack' : 'chase';
        }
      }

      // Snap to terrain (3.5 — pre-computed halfH)
      const halfH = _enemyHalfH[e.type] || 0.5;
      pos[1] = getTerrainHeight(pos[0], pos[2]) + halfH;

      // Turret damage — use pre-filtered list + distSq (3.1)
      for (let t = 0; t < turrets.length; t++) {
        const b = turrets[t];
        const bdx = b.position[0] - pos[0];
        const bdz = b.position[2] - pos[2];
        const bDistSq = bdx * bdx + bdz * bdz;
        const range = b.type === 'missile_turret' ? 25 : 15;
        const dmg = b.type === 'missile_turret' ? 8 : 4;
        if (bDistSq < range * range) e.hp -= dmg * delta;
      }

      if (e.hp <= 0) continue;

      // Despawn enemies too far
      const ddx = pp[0] - pos[0];
      const ddz = pp[2] - pos[2];
      if (ddx * ddx + ddz * ddz >= 250 * 250) continue;

      survivors.push(e);
    }

    set({ enemies: survivors });
  },

  // Roaming spawns — NIGHT ONLY
  tickRoaming: (delta) => {
    const s = get();
    const night = s.isNight();

    // Despawn all enemies when day breaks
    if (!night && s.enemies.length > 0) {
      set({ enemies: [], roamTimer: 0 });
      return;
    }

    // No spawning during day
    if (!night) return;

    const newTimer = s.roamTimer + delta;
    if (newTimer < 5) { // check every 5 seconds
      set({ roamTimer: newTimer });
      return;
    }
    set({ roamTimer: 0 });
    if (s.enemies.length >= ROAM_COUNT) return;

    const pp = s.playerPosition;
    const halfW = WORLD_SIZE / 2;
    const types = Object.keys(enemyDefs);
    const type = types[Math.floor(Math.random() * types.length)];
    const angle = Math.random() * Math.PI * 2;
    const dist = 80 + Math.random() * 80;
    const ex = pp[0] + Math.cos(angle) * dist;
    const ez = pp[2] + Math.sin(angle) * dist;
    if (Math.abs(ex) < halfW && Math.abs(ez) < halfW) {
      const ey = getTerrainHeight(ex, ez);
      get().spawnEnemy(type, [ex, ey, ez]);
    }
  },

  // Wave system — NIGHT ONLY
  tickWaves: (delta) => {
    const s = get();

    // No waves during day — pause timer
    if (!s.isNight()) {
      return false;
    }

    const newTimer = s.waveTimer + delta;
    if (newTimer >= WAVE_INTERVAL) {
      const wave = s.waveNumber + 1;
      const count = 5 + wave * 3;
      const halfW = WORLD_SIZE / 2;
      const pp = s.playerPosition;
      for (let i = 0; i < count && s.enemies.length + i < ENEMY_CAP; i++) {
        const types = Object.keys(enemyDefs);
        const type = types[Math.floor(Math.random() * types.length)];
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const edgeDist = 80 + Math.random() * 20;
        const ex = pp[0] + Math.cos(angle) * edgeDist;
        const ez = pp[2] + Math.sin(angle) * edgeDist;
        if (Math.abs(ex) < halfW && Math.abs(ez) < halfW) {
          const ey = getTerrainHeight(ex, ez);
          get().spawnEnemy(type, [ex, ey, ez]);
        }
      }
      set({ waveNumber: wave, waveTimer: 0 });
      get().showStatus(`WAVE ${wave} INCOMING!`, '#ff4444');
      return true;
    }
    set({ waveTimer: newTimer });
    return false;
  },

  // ═══════════════════════════════════════════════════════
  // PROJECTILE SYSTEM
  // ═══════════════════════════════════════════════════════
  projectiles: [],
  nextProjectileId: 0,

  fireProjectile: (origin, direction, damage, owner, color, speed, weaponId) => set(s => ({
    projectiles: [...s.projectiles, {
      id: s.nextProjectileId,
      position: [...origin],
      direction: [...direction],
      speed: speed || 60,
      damage,
      owner,
      color: color || 0xff4488,
      life: 3.0,
      weaponId: weaponId || null,
    }],
    nextProjectileId: s.nextProjectileId + 1,
  })),

  tickProjectiles: (delta) => {
    const s = get();
    if (s.projectiles.length === 0) return;

    const pp = s.playerPosition;
    const survivors = [];
    const playerHitRadiusSq = 1.5 * 1.5;

    for (let i = 0; i < s.projectiles.length; i++) {
      const p = s.projectiles[i];
      p.life -= delta;
      if (p.life <= 0) continue;

      // Mutate position in-place (3.4)
      p.position[0] += p.direction[0] * p.speed * delta;
      p.position[1] += p.direction[1] * p.speed * delta;
      p.position[2] += p.direction[2] * p.speed * delta;

      // Terrain collision
      const terrainY = getTerrainHeight(p.position[0], p.position[2]);
      if (p.position[1] <= terrainY) continue;

      if (p.owner === 'player') {
        let hit = false;
        for (let j = 0; j < s.enemies.length; j++) {
          const e = s.enemies[j];
          const edx = p.position[0] - e.position[0];
          const edy = p.position[1] - e.position[1];
          const edz = p.position[2] - e.position[2];
          const eDistSq = edx * edx + edy * edy + edz * edz;
          const hitRadiusSq = _enemyHitRadiiSq[e.type] || 2.25;
          if (eDistSq < hitRadiusSq) {
            // Headshot detection — hit above 60% of enemy height
            const halfH = _enemyHalfH[e.type] || 0.5;
            const isHeadshot = p.position[1] > e.position[1] + halfH * 0.6;
            get().damageEnemy(e.id, p.damage, {
              weaponId: p.weaponId,
              isHeadshot,
              hitPosition: [...p.position],
            });
            hit = true;
            break;
          }
        }
        if (hit) continue;
      } else if (p.owner === 'enemy') {
        const pdx = p.position[0] - pp[0];
        const pdy = p.position[1] - pp[1];
        const pdz = p.position[2] - pp[2];
        const pDistSq = pdx * pdx + pdy * pdy + pdz * pdz;
        if (pDistSq < playerHitRadiusSq) {
          get().damagePlayer(p.damage);
          continue;
        }
      }

      survivors.push(p);
    }

    set({ projectiles: survivors });
  },

  // ═══════════════════════════════════════════════════════
  // DNA ANALYSER
  // ═══════════════════════════════════════════════════════
  dnaAnalyserOpen: false,
  openDNAAnalyser: () => set({ dnaAnalyserOpen: true }),
  closeDNAAnalyser: () => set({ dnaAnalyserOpen: false }),

  // ═══════════════════════════════════════════════════════
  // COMPOUND LAB
  // ═══════════════════════════════════════════════════════
  compoundLabOpen: false,
  labCompounds: initialLabCompounds(),

  openCompoundLab: () => set({ compoundLabOpen: true }),
  closeCompoundLab: () => set({ compoundLabOpen: false }),

  addLabCompound: (compoundId, amount) => set(s => ({
    labCompounds: {
      ...s.labCompounds,
      [compoundId]: (s.labCompounds[compoundId] || 0) + amount,
    },
  })),

  removeLabCompound: (compoundId, amount) => set(s => ({
    labCompounds: {
      ...s.labCompounds,
      [compoundId]: Math.max(0, (s.labCompounds[compoundId] || 0) - amount),
    },
  })),

  // ═══════════════════════════════════════════════════════
  // Status messages
  // ═══════════════════════════════════════════════════════
  statusMessage: null,
  statusColor: '#0ff',
  _statusTimeout: null,

  // Tooltip
  tooltipText: null,

  // Hand tool state
  toolAction: null,
  targetShape: null,

  triggerToolAction: (type, shape) => set({ toolAction: { type, shape, t: Date.now() } }),
  clearToolAction: () => set({ toolAction: null }),
  setTargetShape: (shape) => {
    if (get().targetShape !== shape) set({ targetShape: shape });
  },

  pickupDecoration: (decorationId) => set(s => ({
    decorations: s.decorations.filter(d => d.id !== decorationId),
    inventory: {
      ...s.inventory,
      'Bioluminescent Mushroom': (s.inventory['Bioluminescent Mushroom'] || 0) + 1,
    },
    labCompounds: (() => {
      const randomCompoundId = Math.floor(Math.random() * 25);
      return {
        ...s.labCompounds,
        [randomCompoundId]: (s.labCompounds[randomCompoundId] || 0) + 1,
      };
    })(),
  })),

  // Flashlight
  flashlightOn: false,
  toggleFlashlight: () => set(s => {
    const on = !s.flashlightOn;
    get().showStatus(on ? 'Flashlight ON' : 'Flashlight OFF', '#ffcc00');
    return { flashlightOn: on };
  }),

  // Crafting (Hub interaction)
  craftingOpen: false,
  interactTarget: null,

  openCrafting: () => set({ craftingOpen: true }),
  closeCrafting: () => set({ craftingOpen: false, interactTarget: null }),

  interact: (target) => {
    const s = get();
    if (target && target.type === 'hub') {
      set({ craftingOpen: true, interactTarget: target });
      s.showStatus('Colony Hub — Crafting Station', '#00ffaa');
    } else if (target && target.type === 'dna_analyser') {
      set({ dnaAnalyserOpen: true });
      s.showStatus('DNA Analyser — Insert a mushroom to scan', '#44ff88');
    } else if (target && target.type === 'compound_lab') {
      set({ compoundLabOpen: true });
      s.showStatus('Compound Laboratory — Mix and discover', '#8888ff');
    } else if (target && target.type === 'building') {
      const def = buildingDefs[target.buildingType];
      if (def) {
        s.showStatus(`${def.name} — ${def.desc}`, '#0af');
      }
    } else {
      s.showStatus('Nothing to interact with', '#888');
    }
  },

  craft: (recipeId) => {
    const s = get();
    const recipe = craftingRecipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const hasHub = s.buildings.some(b => b.type === 'hub');
    if (!hasHub) {
      s.showStatus('Need a Colony Hub to craft!', '#ff4444');
      return;
    }

    // Check if weapon already owned
    if (recipe.weapon) {
      if (s.weaponsOwned.includes(recipe.weapon)) {
        s.showStatus('Weapon already crafted!', '#ff8844');
        return;
      }
    }

    const inv = { ...s.inventory };
    for (const [item, amount] of Object.entries(recipe.inputs)) {
      if ((inv[item] || 0) < amount) {
        s.showStatus('Insufficient materials!', '#ff4444');
        return;
      }
    }

    for (const [item, amount] of Object.entries(recipe.inputs)) {
      inv[item] -= amount;
    }

    // Weapon craft
    if (recipe.weapon) {
      const wDef = weaponDefs[recipe.weapon];
      const newOwned = [...s.weaponsOwned, recipe.weapon];
      set({
        inventory: inv,
        weaponsOwned: newOwned,
        currentWeapon: s.currentWeapon || recipe.weapon,
      });
      s.showStatus(`Crafted: ${wDef.name}!`, '#ff8844');
      return;
    }

    // Normal craft
    for (const [item, amount] of Object.entries(recipe.output)) {
      inv[item] = (inv[item] || 0) + amount;
    }

    const outputStr = Object.entries(recipe.output).map(([k, v]) => `+${v} ${k}`).join(', ');
    set({ inventory: inv });
    s.showStatus(`Crafted: ${outputStr}`, '#00ffaa');
  },

  // Day/night — sinT > 0 = day, sinT <= 0 = night
  timeOfDay: Math.PI * 0.25,
  isNight: () => Math.sin(get().timeOfDay) <= 0,
  getDayFactor: () => {
    const sinT = Math.sin(get().timeOfDay);
    return Math.max(0, Math.min(1, (sinT + 0.15) / 0.45));
  },

  // Particles
  particles: [],
  nextParticleId: 0,

  // --- Actions ---
  addResource: (name, amount) => set(s => ({
    inventory: { ...s.inventory, [name]: (s.inventory[name] || 0) + amount },
  })),

  spendResources: (cost) => set(s => {
    const inv = { ...s.inventory };
    for (const [item, amount] of Object.entries(cost)) {
      inv[item] -= amount;
    }
    return { inventory: inv };
  }),

  canAfford: (type) => {
    const cost = buildingDefs[type].cost;
    const inv = get().inventory;
    for (const [item, amount] of Object.entries(cost)) {
      if ((inv[item] || 0) < amount) return false;
    }
    return true;
  },

  hasPower: (type) => {
    const use = buildingDefs[type].powerUse;
    if (use <= 0) return true;
    const s = get();
    return s.powerGenerated - s.powerConsumed >= use;
  },

  placeBuilding: (type, position, rotation) => {
    const s = get();
    // Water pump placement validation — must be near a water body
    if (type === 'water_pump') {
      if (!isNearWater(s.waterBodies, position.x, position.z, WATER_DETECT_RANGE)) {
        s.showStatus('Must be placed near water!', '#ff4444');
        return false;
      }
    }
    if (!s.canAfford(type)) {
      s.showStatus('Insufficient resources!', '#ff4444');
      return false;
    }
    if (!s.hasPower(type)) {
      s.showStatus('Insufficient power!', '#ff8800');
      return false;
    }
    const cost = buildingDefs[type].cost;
    const inv = { ...s.inventory };
    for (const [item, amount] of Object.entries(cost)) {
      inv[item] -= amount;
    }
    const pw = buildingDefs[type].powerUse;
    const id = s.nextBuildingId;
    set({
      inventory: inv,
      buildings: [...s.buildings, {
        id, type,
        position: [position.x, position.y, position.z],
        rotation,
        processTimer: 0,
        placedAt: performance.now() / 1000,
        lastProducedAt: 0,
        inputBuffer: {},
        outputBuffer: {},
      }],
      nextBuildingId: id + 1,
      powerGenerated: pw < 0 ? s.powerGenerated + Math.abs(pw) : s.powerGenerated,
      powerConsumed: pw > 0 ? s.powerConsumed + pw : s.powerConsumed,
      connectionGraphDirty: true,
    });
    s.showStatus(`${buildingDefs[type].name} placed!`, '#00ff88');
    return true;
  },

  removeBuilding: (buildingId) => {
    const s = get();
    const building = s.buildings.find(b => b.id === buildingId);
    if (!building) return;
    const type = building.type;
    const cost = buildingDefs[type].cost;
    const inv = { ...s.inventory };
    for (const [item, amount] of Object.entries(cost)) {
      inv[item] = (inv[item] || 0) + Math.floor(amount / 2);
    }
    const pw = buildingDefs[type].powerUse;
    set({
      inventory: inv,
      buildings: s.buildings.filter(b => b.id !== buildingId),
      conveyorItems: s.conveyorItems.filter(ci => ci.conveyorId !== buildingId && ci.destId !== buildingId),
      powerGenerated: pw < 0 ? s.powerGenerated - Math.abs(pw) : s.powerGenerated,
      powerConsumed: pw > 0 ? s.powerConsumed - pw : s.powerConsumed,
      connectionGraphDirty: true,
    });
    s.showStatus(`${buildingDefs[type].name} removed (50% refund)`, '#ffaa00');
  },

  mineResource: (nodeId, amount) => set(s => {
    const nodes = s.resourceNodes.map(n => {
      if (n.id !== nodeId) return n;
      return { ...n, amount: n.amount - amount };
    }).filter(n => n.amount > 0);
    const node = s.resourceNodes.find(n => n.id === nodeId);
    if (!node) return {};

    const hasMineBoost = s.playerEffects.some(e => e.type === 'mineFast');
    const actualAmount = hasMineBoost ? amount * 3 : amount;

    return {
      resourceNodes: nodes,
      inventory: {
        ...s.inventory,
        [node.typeName]: (s.inventory[node.typeName] || 0) + actualAmount,
      },
    };
  }),

  depleteResource: (nodeId) => set(s => ({
    resourceNodes: s.resourceNodes.filter(n => n.id !== nodeId),
  })),

  selectBuild: (type) => set({ selectedBuild: type, buildMenuOpen: true }),
  cancelBuild: () => set({ selectedBuild: null }),
  toggleBuildMenu: () => set(s => ({ buildMenuOpen: !s.buildMenuOpen })),
  rotateBuild: () => set(s => {
    let r = s.buildRotation + Math.PI / 4;
    if (r >= Math.PI * 2) r = 0;
    return { buildRotation: r };
  }),

  setPlayerPosition: (pos) => set({ playerPosition: pos }),

  showStatus: (msg, color = '#0ff') => {
    const s = get();
    if (s._statusTimeout) clearTimeout(s._statusTimeout);
    const timeout = setTimeout(() => {
      set({ statusMessage: null, _statusTimeout: null });
    }, 2000);
    set({ statusMessage: msg, statusColor: color, _statusTimeout: timeout });
  },

  setTooltip: (text) => set({ tooltipText: text }),

  // ═══════════════════════════════════════════════════════
  // CONNECTION GRAPH & TRANSPORT
  // ═══════════════════════════════════════════════════════
  rebuildConnectionGraph: () => {
    const s = get();
    const graph = {};
    const bs = s.buildings;
    const THRESHOLD = 2.5; // max distance between endpoints for a connection

    // Helper: compute input/output endpoints based on building type and rotation
    const getEndpoints = (b) => {
      const def = buildingDefs[b.type];
      if (!def) return null;
      const cosR = Math.cos(b.rotation);
      const sinR = Math.sin(b.rotation);
      const halfZ = def.size[2] / 2;

      if (b.type === 'conveyor' || b.type === 'conveyor_mk2' || b.type === 'pipe') {
        // Input at -Z end (local), output at +Z end (local)
        return {
          inputs: [{ x: b.position[0] - sinR * halfZ, z: b.position[2] - cosR * halfZ }],
          outputs: [{ x: b.position[0] + sinR * halfZ, z: b.position[2] + cosR * halfZ }],
        };
      }
      if (b.type === 'splitter') {
        const halfX = def.size[0] / 2;
        return {
          inputs: [{ x: b.position[0] - sinR * halfZ, z: b.position[2] - cosR * halfZ }],
          outputs: [
            { x: b.position[0] + sinR * halfZ, z: b.position[2] + cosR * halfZ },
            { x: b.position[0] + cosR * halfX, z: b.position[2] - sinR * halfX },
            { x: b.position[0] - cosR * halfX, z: b.position[2] + sinR * halfX },
          ],
        };
      }
      if (b.type === 'merger') {
        const halfX = def.size[0] / 2;
        return {
          inputs: [
            { x: b.position[0] - sinR * halfZ, z: b.position[2] - cosR * halfZ },
            { x: b.position[0] + cosR * halfX, z: b.position[2] - sinR * halfX },
            { x: b.position[0] - cosR * halfX, z: b.position[2] + sinR * halfX },
          ],
          outputs: [{ x: b.position[0] + sinR * halfZ, z: b.position[2] + cosR * halfZ }],
        };
      }
      // Production/storage buildings: all faces are both input and output
      const halfX = def.size[0] / 2;
      const pts = [
        { x: b.position[0] + halfX, z: b.position[2] },
        { x: b.position[0] - halfX, z: b.position[2] },
        { x: b.position[0], z: b.position[2] + halfZ },
        { x: b.position[0], z: b.position[2] - halfZ },
      ];
      return { inputs: pts, outputs: pts };
    };

    for (let i = 0; i < bs.length; i++) {
      const a = bs[i];
      const aEps = getEndpoints(a);
      if (!aEps) continue;

      const entry = { inputs: [], outputs: [], splitterIdx: 0 };

      for (let j = 0; j < bs.length; j++) {
        if (i === j) continue;
        const b = bs[j];
        const bEps = getEndpoints(b);
        if (!bEps) continue;

        // Pipe-only connection check
        const aIsPipe = a.type === 'pipe';
        const bIsPipe = b.type === 'pipe';
        const aIsLiquid = buildingDefs[a.type]?.liquid;
        const bIsLiquid = buildingDefs[b.type]?.liquid;
        if (aIsPipe && !bIsPipe && !bIsLiquid) continue;
        if (!aIsPipe && aIsLiquid && bIsPipe) { /* ok */ }

        // Check if any of a's outputs match any of b's inputs
        for (const aOut of aEps.outputs) {
          for (const bIn of bEps.inputs) {
            const dx = aOut.x - bIn.x;
            const dz = aOut.z - bIn.z;
            if (dx * dx + dz * dz < THRESHOLD * THRESHOLD) {
              if (!entry.outputs.some(o => o.id === b.id)) {
                entry.outputs.push({ id: b.id, type: b.type });
              }
            }
          }
        }

        // Check if any of a's inputs match any of b's outputs
        for (const aIn of aEps.inputs) {
          for (const bOut of bEps.outputs) {
            const dx = aIn.x - bOut.x;
            const dz = aIn.z - bOut.z;
            if (dx * dx + dz * dz < THRESHOLD * THRESHOLD) {
              if (!entry.inputs.some(o => o.id === b.id)) {
                entry.inputs.push({ id: b.id, type: b.type });
              }
            }
          }
        }
      }

      graph[a.id] = entry;
    }

    set({ connectionGraph: graph, connectionGraphDirty: false });
  },

  tickTransport: (delta) => {
    const s = get();
    if (s.connectionGraphDirty) {
      get().rebuildConnectionGraph();
    }

    const graph = get().connectionGraph;
    const buildings = get().buildings;
    const bMap = {};
    for (const b of buildings) bMap[b.id] = b;

    let items = [...s.conveyorItems];
    const arrivedItems = []; // items that reached destination
    let nextId = s.nextConveyorItemId;

    // Move existing items
    for (let i = items.length - 1; i >= 0; i--) {
      const ci = items[i];
      const convDef = buildingDefs[ci.conveyorType];
      const speed = ci.conveyorType === 'conveyor_mk2' ? CONVEYOR_SPEED_MK2
        : ci.conveyorType === 'pipe' ? PIPE_SPEED
        : CONVEYOR_SPEED_MK1;

      ci.progress += speed * delta;

      if (ci.progress >= 1) {
        items.splice(i, 1);
        const destB = bMap[ci.destId];
        if (destB) {
          // Check if destination is another conveyor/pipe — chain through
          const destType = destB.type;
          if (destType === 'conveyor' || destType === 'conveyor_mk2' || destType === 'pipe' || destType === 'splitter' || destType === 'merger') {
            const destGraph = graph[destB.id];
            if (destGraph && destGraph.outputs.length > 0) {
              let target;
              if (destType === 'splitter') {
                // Round-robin distribution
                const idx = destGraph.splitterIdx % destGraph.outputs.length;
                target = destGraph.outputs[idx];
                destGraph.splitterIdx = idx + 1;
              } else {
                target = destGraph.outputs[0];
              }
              if (items.length < 500) {
                items.push({
                  id: nextId++,
                  resource: ci.resource,
                  color: ci.color,
                  conveyorId: destB.id,
                  conveyorType: destB.type,
                  destId: target.id,
                  progress: 0,
                  position: [...destB.position],
                  rotation: destB.rotation,
                });
              }
            } else {
              // Dead end conveyor — deliver to dest building buffer or global
              const buf = destB.inputBuffer || {};
              const total = Object.values(buf).reduce((a, b) => a + b, 0);
              if (total < INPUT_BUFFER_MAX) {
                buf[ci.resource] = (buf[ci.resource] || 0) + 1;
              } else {
                // Overflow to global inventory
                arrivedItems.push(ci.resource);
              }
            }
          } else {
            // Destination is a production building — add to its input buffer
            const buf = destB.inputBuffer || {};
            const total = Object.values(buf).reduce((a, b) => a + b, 0);
            if (total < INPUT_BUFFER_MAX) {
              buf[ci.resource] = (buf[ci.resource] || 0) + 1;
            } else {
              arrivedItems.push(ci.resource);
            }
          }
        } else {
          // Building gone — deliver to global
          arrivedItems.push(ci.resource);
        }
      }
    }

    // Pull items from output buffers onto empty conveyors
    for (const b of buildings) {
      const bt = b.type;
      if (bt !== 'conveyor' && bt !== 'conveyor_mk2' && bt !== 'pipe' && bt !== 'splitter' && bt !== 'merger') continue;
      if (items.length >= 500) break;

      const gEntry = graph[b.id];
      if (!gEntry || gEntry.inputs.length === 0 || gEntry.outputs.length === 0) continue;

      // Check if belt already has an item starting on it
      if (items.some(ci => ci.conveyorId === b.id && ci.progress < 0.3)) continue;

      // Find an input building with output buffer items
      for (const inp of gEntry.inputs) {
        const srcB = bMap[inp.id];
        if (!srcB || !srcB.outputBuffer) continue;
        const outBuf = srcB.outputBuffer;
        const keys = Object.keys(outBuf);
        if (keys.length === 0) continue;

        // Take first available resource
        const res = keys.find(k => outBuf[k] > 0);
        if (!res) continue;

        // For pipes, only transport liquid resources
        if (bt === 'pipe') {
          const resType = resourceTypes.find(r => r.name === res);
          if (!resType || resType.shape !== 'liquid') continue;
        }

        outBuf[res]--;
        if (outBuf[res] <= 0) delete outBuf[res];

        const target = gEntry.outputs[0];
        const resColor = resourceTypes.find(r => r.name === res)?.color || 0xffffff;

        items.push({
          id: nextId++,
          resource: res,
          color: resColor,
          conveyorId: b.id,
          conveyorType: b.type,
          destId: target.id,
          progress: 0,
          position: [...b.position],
          rotation: b.rotation,
        });
        break;
      }
    }

    // Apply arrived items to global inventory
    const update = { conveyorItems: items, nextConveyorItemId: nextId };
    if (arrivedItems.length > 0) {
      const inv = { ...get().inventory };
      for (const res of arrivedItems) {
        inv[res] = (inv[res] || 0) + 1;
      }
      update.inventory = inv;
    }
    set(update);
  },

  // Building automation
  tickBuildings: (delta) => {
    const s = get();
    if (s.buildings.length === 0) return;

    let inventoryChanged = false;
    const inv = { ...s.inventory };
    const newBuildings = s.buildings.map(b => {
      const timer = b.processTimer + delta;

      if (b.type === 'miner') {
        if (timer >= 2) {
          let nearest = null;
          let nearestDist = 6;
          for (const r of s.resourceNodes) {
            const dx = b.position[0] - r.position[0];
            const dz = b.position[2] - r.position[2];
            const d = Math.sqrt(dx * dx + dz * dz);
            if (d < nearestDist && r.amount > 0) {
              nearest = r;
              nearestDist = d;
            }
          }
          if (nearest) {
            inv[nearest.typeName] = (inv[nearest.typeName] || 0) + 1;
            inventoryChanged = true;
            set(st => ({
              resourceNodes: st.resourceNodes.map(n =>
                n.id === nearest.id ? { ...n, amount: n.amount - 1 } : n
              ).filter(n => n.amount > 0),
            }));
          }
          return { ...b, processTimer: 0, lastProducedAt: performance.now() / 1000 };
        }
      } else if (b.type === 'smelter') {
        if (timer >= 3) {
          if (inv['Iron Ore'] >= 2) {
            inv['Iron Ore'] -= 2;
            inv['Iron Plate'] = (inv['Iron Plate'] || 0) + 1;
            inventoryChanged = true;
          } else if (inv['Copper Ore'] >= 2) {
            inv['Copper Ore'] -= 2;
            inv['Nano Circuit'] = (inv['Nano Circuit'] || 0) + 1;
            inventoryChanged = true;
          } else if (inv['Titanium Ore'] >= 2) {
            inv['Titanium Ore'] -= 2;
            inv['Iron Plate'] = (inv['Iron Plate'] || 0) + 2;
            inventoryChanged = true;
          }
          return { ...b, processTimer: 0, lastProducedAt: performance.now() / 1000 };
        }
      } else if (b.type === 'assembler') {
        if (timer >= 5) {
          if (inv['Iron Plate'] >= 3 && inv['Quantum Crystal'] >= 1) {
            inv['Iron Plate'] -= 3;
            inv['Quantum Crystal'] -= 1;
            inv['Nano Circuit'] = (inv['Nano Circuit'] || 0) + 2;
            inventoryChanged = true;
          }
          if (inv['Nano Circuit'] >= 2 && inv['Plasma Gel'] >= 1) {
            inv['Nano Circuit'] -= 2;
            inv['Plasma Gel'] -= 1;
            inv['Power Cell'] = (inv['Power Cell'] || 0) + 1;
            inventoryChanged = true;
          }
          return { ...b, processTimer: 0, lastProducedAt: performance.now() / 1000 };
        }
      } else if (b.type === 'refinery') {
        if (timer >= 4) {
          if (inv['Titanium Ore'] >= 2 && inv['Plasma Gel'] >= 1) {
            inv['Titanium Ore'] -= 2;
            inv['Plasma Gel'] -= 1;
            inv['Titanium Alloy'] = (inv['Titanium Alloy'] || 0) + 1;
            inventoryChanged = true;
          } else if (inv['Plasma Gel'] >= 3) {
            inv['Plasma Gel'] -= 3;
            inv['Power Cell'] = (inv['Power Cell'] || 0) + 2;
            inventoryChanged = true;
          }
          return { ...b, processTimer: 0, lastProducedAt: performance.now() / 1000 };
        }
      } else if (b.type === 'lab') {
        if (timer >= 8) {
          if (inv['Quantum Crystal'] >= 3 && inv['Nano Circuit'] >= 2) {
            inv['Quantum Crystal'] -= 3;
            inv['Nano Circuit'] -= 2;
            inv['Data Core'] = (inv['Data Core'] || 0) + 1;
            inventoryChanged = true;
          }
          return { ...b, processTimer: 0, lastProducedAt: performance.now() / 1000 };
        }
      } else if (b.type === 'water_pump') {
        if (timer >= 3) {
          if (isNearWater(s.waterBodies, b.position[0], b.position[2], WATER_DETECT_RANGE)) {
            // Check if connected — write to output buffer, else global
            const graph = s.connectionGraph[b.id];
            if (graph && graph.outputs.length > 0) {
              const buf = b.outputBuffer || {};
              const total = Object.values(buf).reduce((a, c) => a + c, 0);
              if (total < OUTPUT_BUFFER_MAX) {
                buf['Water'] = (buf['Water'] || 0) + 1;
                return { ...b, processTimer: 0, lastProducedAt: performance.now() / 1000, outputBuffer: buf };
              }
            } else {
              inv['Water'] = (inv['Water'] || 0) + 1;
              inventoryChanged = true;
            }
          }
          return { ...b, processTimer: 0, lastProducedAt: performance.now() / 1000 };
        }
      } else if (b.type === 'coolant_mixer') {
        if (timer >= 4) {
          if (inv['Water'] >= 3 && inv['Copper Ore'] >= 1) {
            inv['Water'] -= 3;
            inv['Copper Ore'] -= 1;
            inv['Coolant'] = (inv['Coolant'] || 0) + 2;
            inventoryChanged = true;
          }
          return { ...b, processTimer: 0, lastProducedAt: performance.now() / 1000 };
        }
      } else if (b.type === 'acid_refiner') {
        if (timer >= 5) {
          if (inv['Water'] >= 2 && (inv['Bioluminescent Mushroom'] || 0) >= 1) {
            inv['Water'] -= 2;
            inv['Bioluminescent Mushroom'] -= 1;
            inv['Bio-Acid'] = (inv['Bio-Acid'] || 0) + 1;
            inventoryChanged = true;
          }
          return { ...b, processTimer: 0, lastProducedAt: performance.now() / 1000 };
        }
      }

      return { ...b, processTimer: timer };
    });

    const update = { buildings: newBuildings };
    if (inventoryChanged) update.inventory = inv;
    set(update);
  },

  spawnParticles: (position, resourceName) => set(s => {
    const type = resourceTypes.find(t => t.name === resourceName);
    const color = type ? type.color : 0xffffff;
    const id = s.nextParticleId;
    const velocities = Array.from({ length: 12 }, () => [
      (Math.random() - 0.5) * 4,
      Math.random() * 4 + 2,
      (Math.random() - 0.5) * 4,
    ]);
    return {
      particles: [...s.particles, {
        id, color, life: 1.0,
        origin: [position.x, position.y, position.z],
        velocities,
      }],
      nextParticleId: id + 1,
    };
  }),

  spawnParticlesAt: (position, color) => set(s => {
    const id = s.nextParticleId;
    const velocities = Array.from({ length: 8 }, () => [
      (Math.random() - 0.5) * 6,
      Math.random() * 5 + 1,
      (Math.random() - 0.5) * 6,
    ]);
    return {
      particles: [...s.particles, {
        id, color, life: 0.8,
        origin: [...position],
        velocities,
      }],
      nextParticleId: id + 1,
    };
  }),

  tickParticles: (delta) => set(s => {
    if (s.particles.length === 0) return {};
    return {
      particles: s.particles
        .map(p => ({ ...p, life: p.life - delta }))
        .filter(p => p.life > 0),
    };
  }),
}));
