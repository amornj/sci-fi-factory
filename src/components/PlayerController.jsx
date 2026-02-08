import React, { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { PLAYER_DEFAULTS, WORLD_SIZE, buildingDefs, buildKeys, GRID_SNAP, weaponDefs, enemyDefs } from '../constants';
import { getTerrainHeight } from '../noise';
import { keys, setSprinting } from '../input';
import sfx from '../sfx/SFXEngine';

let sprinting = false;

const _raycaster = new THREE.Raycaster();
const _center = new THREE.Vector2(0, 0);
const _velocity = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _move = new THREE.Vector3();
let onGround = false;
let tooltipCounter = 0;

// Cached object lists — rebuilt rarely instead of every frame
let _cachedTerrain = null;
let _cachedInteractables = [];
let _cachedDecorations = [];
let _cachedEnemies = [];
let _cachedWater = [];
let _cacheFrame = 0;

function rebuildCache(scene) {
  _cachedTerrain = null;
  _cachedInteractables = [];
  _cachedDecorations = [];
  _cachedEnemies = [];
  _cachedWater = [];
  scene.traverse(child => {
    if (!child.userData) return;
    if (child.userData.isTerrain) _cachedTerrain = child;
    if (child.userData.isResource || child.userData.isBuilding) {
      _cachedInteractables.push(child);
    }
    if (child.userData.isDecoration) {
      _cachedDecorations.push(child);
    }
    if (child.userData.isEnemy) {
      _cachedEnemies.push(child);
    }
    if (child.userData.isWater) {
      _cachedWater.push(child);
    }
  });
}

// SFX helper — play the right sound for a resource shape
function playSfxForShape(shape) {
  if (shape === 'rock') sfx.playPickaxeHit();
  else if (shape === 'crystal') sfx.playChiselTap();
  else if (shape === 'blob') sfx.playLadleScoop();
}

// Check if any overlay menu is open
function isMenuOpen(gs) {
  return gs.craftingOpen || gs.dnaAnalyserOpen || gs.compoundLabOpen || gs.buildMenuOpen;
}

export default function PlayerController() {
  const controlsRef = useRef();
  const { camera, scene } = useThree();
  const store = useGameStore;

  const setLocked = useGameStore(s => s.setLocked);

  // Pointer lock / unlock for overlay menus
  useEffect(() => {
    const unsub = useGameStore.subscribe(
      (state, prevState) => {
        const wasOpen = prevState.craftingOpen || prevState.dnaAnalyserOpen || prevState.compoundLabOpen || prevState.buildMenuOpen;
        const isOpen = state.craftingOpen || state.dnaAnalyserOpen || state.compoundLabOpen || state.buildMenuOpen;

        if (isOpen && !wasOpen) {
          document.exitPointerLock();
        }
        if (!isOpen && wasOpen && state.locked) {
          document.querySelector('canvas')?.requestPointerLock();
        }
      }
    );
    return unsub;
  }, []);

  // Key handlers
  useEffect(() => {
    const onKeyDown = (e) => {
      keys[e.code] = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        sprinting = true;
        setSprinting(true);
      }

      const gs = store.getState();

      // Escape closes any open menu
      if (e.code === 'Escape') {
        if (gs.buildMenuOpen) { gs.toggleBuildMenu(); gs.cancelBuild(); return; }
        if (gs.selectedBuild) { gs.cancelBuild(); return; }
        if (gs.craftingOpen) { gs.closeCrafting(); return; }
        if (gs.dnaAnalyserOpen) { gs.closeDNAAnalyser(); return; }
        if (gs.compoundLabOpen) { gs.closeCompoundLab(); return; }
      }

      if (e.code === 'KeyB') gs.toggleBuildMenu();
      if (e.code === 'KeyR') gs.rotateBuild();
      if (e.code === 'KeyQ') gs.cancelBuild();
      if (e.code === 'KeyF') gs.toggleFlashlight();
      if (e.code === 'Tab') { e.preventDefault(); gs.toggleWeaponMode(); }

      if (e.code === 'KeyE') {
        if (isMenuOpen(gs)) {
          gs.closeCrafting();
          gs.closeDNAAnalyser();
          gs.closeCompoundLab();
        } else if (gs.locked) {
          _raycaster.setFromCamera(_center, camera);

          // Check buildings first
          const buildings = _cachedInteractables.filter(c => c.userData.isBuilding && c.visible);
          const bHits = _raycaster.intersectObjects(buildings, true);
          if (bHits.length > 0 && bHits[0].distance < 10) {
            let obj = bHits[0].object;
            while (obj.parent && !(obj.userData && obj.userData.isBuilding)) obj = obj.parent;
            if (obj.userData && obj.userData.isBuilding) {
              const bType = obj.userData.buildingType;
              sfx.playInteract();

              // Determine interaction type
              let interactType = 'building';
              if (bType === 'hub') interactType = 'hub';
              else if (bType === 'dna_analyser') interactType = 'dna_analyser';
              else if (bType === 'compound_lab') interactType = 'compound_lab';

              gs.interact({
                type: interactType,
                buildingId: obj.userData.buildingId,
                buildingType: bType,
              });
              return;
            }
          }

          // Check mushroom decorations
          const mushrooms = _cachedDecorations.filter(c => c.visible && c.userData.decorationType === 'mushroom');
          const mHits = _raycaster.intersectObjects(mushrooms, true);
          if (mHits.length > 0 && mHits[0].distance < 6) {
            let obj = mHits[0].object;
            while (obj.parent && !(obj.userData && obj.userData.isDecoration)) obj = obj.parent;
            if (obj.userData && obj.userData.isDecoration) {
              gs.triggerToolAction('pickup', 'mushroom');
              sfx.playMushroomPickup();
              gs.pickupDecoration(obj.userData.decorationId);
              gs.showStatus('+1 Bioluminescent Mushroom + random compound', '#88ff88');
              _cacheFrame = 0;
              return;
            }
          }

          gs.interact(null);
        }
      }

      if (buildKeys[e.code]) {
        if (!gs.buildMenuOpen) gs.toggleBuildMenu();
        gs.selectBuild(buildKeys[e.code]);
      }
    };

    const onKeyUp = (e) => {
      keys[e.code] = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        sprinting = false;
        setSprinting(false);
      }
    };

    const onMouseDown = (e) => {
      const gs = store.getState();
      if (!gs.locked || isMenuOpen(gs)) return;

      if (e.button === 0) {
        // Weapon mode attack
        if (gs.weaponMode && gs.currentWeapon) {
          const fireResult = gs.fireWeapon();
          if (fireResult === 'no_ammo') {
            sfx.playEmptyClick();
            gs.showStatus('No Energy Cells!', '#ff4444');
            return;
          }
          if (!fireResult) return;
          const def = weaponDefs[gs.currentWeapon];
          _raycaster.setFromCamera(_center, camera);

          if (def.type === 'melee') {
            // Melee — find enemies in range
            if (gs.currentWeapon === 'stun_baton') sfx.playBatonHit();
            else sfx.playSwordSwing();

            for (const enemy of gs.enemies) {
              const dx = enemy.position[0] - camera.position.x;
              const dy = enemy.position[1] - camera.position.y;
              const dz = enemy.position[2] - camera.position.z;
              const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
              if (dist < def.range) {
                // Compute knockback direction (player → enemy, XZ normalized)
                const kbLen = Math.sqrt(dx * dx + dz * dz);
                const knockbackDir = kbLen > 0.01 ? [dx / kbLen, dz / kbLen] : [0, 0];
                const result = gs.damageEnemy(enemy.id, def.damage, {
                  weaponId: gs.currentWeapon,
                  hitPosition: [...enemy.position],
                  knockbackDir,
                });
                if (result.dead) {
                  sfx.playEnemyDeath();
                } else {
                  sfx.playEnemyHit();
                }
                if (result.isCrit) sfx.playCritHit();
                if (result.statusProc) sfx.playStatusProc();
                break;
              }
            }
            return;
          }

          if (def.type === 'ranged') {
            sfx.playLaserFire();
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);
            gs.fireProjectile(
              [camera.position.x, camera.position.y, camera.position.z],
              [dir.x, dir.y, dir.z],
              def.damage,
              'player',
              def.projectileColor,
              def.projectileSpeed,
              gs.currentWeapon
            );
            return;
          }

          if (def.type === 'ranged_spread') {
            sfx.playScatterShot();
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);
            for (let i = 0; i < (def.pellets || 5); i++) {
              const spread = 0.08;
              const d = [
                dir.x + (Math.random() - 0.5) * spread,
                dir.y + (Math.random() - 0.5) * spread,
                dir.z + (Math.random() - 0.5) * spread,
              ];
              const len = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
              gs.fireProjectile(
                [camera.position.x, camera.position.y, camera.position.z],
                [d[0] / len, d[1] / len, d[2] / len],
                def.damage,
                'player',
                def.projectileColor,
                def.projectileSpeed,
                gs.currentWeapon
              );
            }
            return;
          }
        }

        if (gs.selectedBuild) {
          _raycaster.setFromCamera(_center, camera);
          if (_cachedTerrain) {
            const hits = _raycaster.intersectObject(_cachedTerrain);
            if (hits.length > 0) {
              const p = hits[0].point;
              const pos = new THREE.Vector3(
                Math.round(p.x / GRID_SNAP) * GRID_SNAP,
                p.y,
                Math.round(p.z / GRID_SNAP) * GRID_SNAP
              );
              gs.placeBuilding(gs.selectedBuild, pos, gs.buildRotation);
              _cacheFrame = 0;
            }
          }
        } else {
          _raycaster.setFromCamera(_center, camera);
          // Try mining resources first
          const visible = _cachedInteractables.filter(c => c.visible);
          const hits = _raycaster.intersectObjects(visible, true);
          let didMine = false;
          if (hits.length > 0 && hits[0].distance < 8) {
            let obj = hits[0].object;
            while (obj.parent && !(obj.userData && obj.userData.isResource)) obj = obj.parent;
            if (obj.userData && obj.userData.isResource) {
              const nodeId = obj.userData.nodeId;
              const node = gs.resourceNodes.find(n => n.id === nodeId);
              if (node && node.amount > 0) {
                const mineAmt = Math.min(3, node.amount);
                gs.mineResource(nodeId, mineAmt);
                const hasMineBoost = gs.playerEffects.some(eff => eff.type === 'mineFast');
                const actualAmt = hasMineBoost ? mineAmt * 3 : mineAmt;
                gs.showStatus(`+${actualAmt} ${node.typeName}${hasMineBoost ? ' (BOOSTED)' : ''}`, '#00ff88');
                gs.spawnParticles(hits[0].point, node.typeName);
                gs.triggerToolAction('mine', node.shape);
                playSfxForShape(node.shape);
                didMine = true;
              }
            }
          }
          // Bare-hand punch — if didn't mine a resource, check for enemies
          if (!didMine) {
            let didPunch = false;
            const PUNCH_RANGE = 2.5;
            const PUNCH_DAMAGE = 8;
            for (const enemy of gs.enemies) {
              const dx = enemy.position[0] - camera.position.x;
              const dy = enemy.position[1] - camera.position.y;
              const dz = enemy.position[2] - camera.position.z;
              const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
              if (dist < PUNCH_RANGE) {
                gs.triggerToolAction('punch', 'hand');
                const result = gs.damageEnemy(enemy.id, PUNCH_DAMAGE, {
                  hitPosition: [...enemy.position],
                });
                if (result.dead) {
                  sfx.playEnemyDeath();
                } else {
                  sfx.playEnemyHit();
                }
                didPunch = true;
                break;
              }
            }
            // Water scooping — if didn't punch, check water
            if (!didPunch) {
              const visibleWater = _cachedWater.filter(c => c.visible);
              const waterHits = _raycaster.intersectObjects(visibleWater, true);
              if (waterHits.length > 0 && waterHits[0].distance < 6) {
                gs.triggerToolAction('scoop', 'liquid');
                sfx.playLadleScoop();
                gs.addResource('Water', 1);
                gs.showStatus('+1 Water', '#2288ff');
              }
            }
          }
        }
      } else if (e.button === 2) {
        _raycaster.setFromCamera(_center, camera);
        const buildings = _cachedInteractables.filter(c => c.userData.isBuilding && c.visible);
        const hits = _raycaster.intersectObjects(buildings, true);
        if (hits.length > 0 && hits[0].distance < 15) {
          let obj = hits[0].object;
          while (obj.parent && !(obj.userData && obj.userData.isBuilding)) obj = obj.parent;
          if (obj.userData && obj.userData.isBuilding) {
            gs.removeBuilding(obj.userData.buildingId);
            _cacheFrame = 0;
          }
        }
      }
    };

    const onContextMenu = (e) => e.preventDefault();

    const onWheel = (e) => {
      const gs = store.getState();
      if (!gs.locked || !gs.weaponMode) return;
      gs.cycleWeapon(e.deltaY > 0 ? 1 : -1);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('wheel', onWheel);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('wheel', onWheel);
    };
  }, [camera, scene, store, setLocked]);

  // Movement loop
  useFrame((state, delta) => {
    const gs = store.getState();

    // Rebuild object cache every 60 frames (~1s)
    _cacheFrame++;
    if (_cacheFrame >= 60 || _cachedTerrain === null) {
      rebuildCache(scene);
      _cacheFrame = 0;
    }

    // Tick player effects (always, even when paused)
    gs.tickPlayerEffects(delta);

    if (!gs.locked || isMenuOpen(gs)) return;

    // Speed modifiers from effects
    let speedMult = sprinting ? PLAYER_DEFAULTS.sprintMult : 1;
    if (gs.hasEffect('speed')) speedMult *= 1.6;
    if (gs.hasEffect('slow')) speedMult *= 0.5;

    const speed = PLAYER_DEFAULTS.speed * speedMult;
    _dir.set(0, 0, 0);
    if (keys['KeyW']) _dir.z -= 1;
    if (keys['KeyS']) _dir.z += 1;
    if (keys['KeyA']) _dir.x -= 1;
    if (keys['KeyD']) _dir.x += 1;
    _dir.normalize();

    camera.getWorldDirection(_forward);
    _forward.y = 0;
    _forward.normalize();
    _right.crossVectors(_forward, _up);

    _move.set(0, 0, 0);
    _move.addScaledVector(_forward, -_dir.z);
    _move.addScaledVector(_right, _dir.x);
    _move.normalize().multiplyScalar(speed * delta);

    camera.position.x += _move.x;
    camera.position.z += _move.z;

    const terrainY = getTerrainHeight(camera.position.x, camera.position.z);
    const targetY = terrainY + PLAYER_DEFAULTS.height;

    _velocity.y -= PLAYER_DEFAULTS.gravity * delta;

    if (keys['Space'] && onGround) {
      _velocity.y = PLAYER_DEFAULTS.jumpForce;
      onGround = false;
    }

    camera.position.y += _velocity.y * delta;

    if (camera.position.y <= targetY) {
      camera.position.y = targetY;
      _velocity.y = 0;
      onGround = true;
    }

    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -WORLD_SIZE / 2, WORLD_SIZE / 2);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -WORLD_SIZE / 2, WORLD_SIZE / 2);

    gs.setPlayerPosition([camera.position.x, camera.position.y, camera.position.z]);

    // Screen shake
    if (gs.screenShake > 0) {
      camera.position.x += (Math.random() - 0.5) * gs.screenShake * 0.3;
      camera.position.y += (Math.random() - 0.5) * gs.screenShake * 0.3;
      gs.tickScreenShake(delta);
    }

    // Tooltip — only every 6 frames (~10hz) instead of every frame
    tooltipCounter++;
    if (tooltipCounter >= 6) {
      tooltipCounter = 0;
      _raycaster.setFromCamera(_center, camera);

      const visible = _cachedInteractables.filter(c => c.visible);
      const hits = _raycaster.intersectObjects(visible, true);

      const visibleDeco = _cachedDecorations.filter(c => c.visible);
      const decoHits = _raycaster.intersectObjects(visibleDeco, true);

      let closestDist = 15;
      let closestType = null;
      let closestObj = null;

      if (hits.length > 0 && hits[0].distance < closestDist) {
        closestDist = hits[0].distance;
        let obj = hits[0].object;
        while (obj.parent && !(obj.userData.isResource || obj.userData.isBuilding)) obj = obj.parent;
        if (obj.userData.isResource || obj.userData.isBuilding) {
          closestType = obj.userData.isResource ? 'resource' : 'building';
          closestObj = obj;
        }
      }

      if (decoHits.length > 0 && decoHits[0].distance < closestDist && decoHits[0].distance < 8) {
        let obj = decoHits[0].object;
        while (obj.parent && !(obj.userData && obj.userData.isDecoration)) obj = obj.parent;
        if (obj.userData && obj.userData.isDecoration) {
          closestType = 'decoration';
          closestObj = obj;
          closestDist = decoHits[0].distance;
        }
      }

      // Check enemies
      const visibleEnemies = _cachedEnemies.filter(c => c.visible);
      const enemyHits = _raycaster.intersectObjects(visibleEnemies, true);
      if (enemyHits.length > 0 && enemyHits[0].distance < closestDist && enemyHits[0].distance < 30) {
        let obj = enemyHits[0].object;
        while (obj.parent && !(obj.userData && obj.userData.isEnemy)) obj = obj.parent;
        if (obj.userData && obj.userData.isEnemy) {
          closestType = 'enemy';
          closestObj = obj;
          closestDist = enemyHits[0].distance;
        }
      }

      // Check water
      const visibleWater = _cachedWater.filter(c => c.visible);
      const waterHits = _raycaster.intersectObjects(visibleWater, true);
      if (waterHits.length > 0 && waterHits[0].distance < closestDist && waterHits[0].distance < 8) {
        closestType = 'water';
        closestObj = waterHits[0].object;
        closestDist = waterHits[0].distance;
      }

      if (closestType === 'resource') {
        const node = gs.resourceNodes.find(n => n.id === closestObj.userData.nodeId);
        if (node) {
          gs.setTooltip({ type: 'resource', name: node.typeName, amount: node.amount });
          gs.setTargetShape(node.shape);
        } else {
          gs.setTooltip(null);
          gs.setTargetShape(null);
        }
      } else if (closestType === 'building') {
        const bType = closestObj.userData.buildingType;
        const def = buildingDefs[bType];
        let hint = '[E] Info';
        if (bType === 'hub') hint = '[E] Craft';
        else if (bType === 'dna_analyser') hint = '[E] Analyse';
        else if (bType === 'compound_lab') hint = '[E] Mix Compounds';

        gs.setTooltip({
          type: 'building', name: def.name, desc: def.desc,
          color: def.color, hint,
        });
        gs.setTargetShape(null);
      } else if (closestType === 'decoration') {
        gs.setTooltip({ type: 'decoration', name: 'Bioluminescent Mushroom' });
        gs.setTargetShape('mushroom');
      } else if (closestType === 'enemy') {
        const eType = closestObj.userData.enemyType;
        const eId = closestObj.userData.enemyId;
        const eDef = enemyDefs[eType];
        const enemy = gs.enemies.find(en => en.id === eId);
        if (eDef && enemy) {
          gs.setTooltip({
            type: 'enemy', name: eDef.name, hp: enemy.hp, maxHp: eDef.hp,
            color: eDef.color,
          });
        }
        gs.setTargetShape(null);
      } else if (closestType === 'water') {
        gs.setTooltip({ type: 'water', name: 'Water' });
        gs.setTargetShape('liquid');
      } else {
        gs.setTooltip(null);
        gs.setTargetShape(null);
      }
    }
  });

  const onLock = useCallback(() => {
    const gs = store.getState();
    if (!isMenuOpen(gs)) setLocked(true);
  }, [setLocked, store]);
  const onUnlock = useCallback(() => {
    const gs = store.getState();
    if (!isMenuOpen(gs)) setLocked(false);
  }, [setLocked, store]);

  return (
    <PointerLockControls
      ref={controlsRef}
      onLock={onLock}
      onUnlock={onUnlock}
    />
  );
}
