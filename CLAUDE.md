# NEXUS FORGE — Sci-Fi Factory Builder

## Overview
First-person 3D factory building/survival game set on an alien planet. Player is an AI colony ship that crashed and must build an industrial colony to signal home. Built with React Three Fiber + Zustand.

## Commands
```bash
npm run dev       # Start dev server (Vite, localhost:5173, HMR)
npm run build     # Production build to dist/ (must pass with zero errors)
npm run preview   # Preview production build locally
```

Always verify with `npm run build` before committing.

## Tech Stack
- **React 18** + **React Three Fiber** (`@react-three/fiber` 8.17) — 3D rendering in React
- **Three.js** 0.162 — 3D graphics, procedural geometry, raycasting
- **@react-three/drei** 9.115 — PointerLockControls, helpers
- **Zustand** 4.5 — Single centralized store for all game state
- **Vite** 5.4 — Build tool, dev server, HMR
- **Web Audio API** — All SFX procedurally generated (no audio files)

No ESLint/Prettier configured. Code uses 2-space indent, single quotes, semicolons.

## Project Structure
```
src/
├── main.jsx              # Entry point
├── App.jsx               # Root: <Canvas> (3D) + UI overlays
├── store.js              # ALL game state & logic (Zustand, ~980 lines)
├── constants.js          # Game definitions (buildings, enemies, weapons, recipes)
├── noise.js              # Simplex noise terrain generation (getTerrainHeight)
├── input.js              # Shared keyboard state object
├── compounds.js          # 25 base compounds + 300+ reaction system
├── index.css             # All styles (single file, no CSS modules)
│
├── components/           # Three.js scene components (inside <Canvas>)
│   ├── PlayerController  # Movement, input handlers, raycasting, tooltips
│   ├── Enemies           # Enemy rendering + AI tick loop (also ticks waves/regen/cooldowns)
│   ├── Projectiles       # Weapon/enemy projectile rendering
│   ├── HandTool          # First-person tool/weapon viewmodel
│   ├── Buildings         # Building instances + automation ticks
│   ├── BuildingMesh      # Procedural building geometry per type
│   ├── Terrain           # Procedural terrain mesh from noise
│   ├── ResourceNodes     # Mineable ore/crystal nodes
│   ├── Decorations       # Mushrooms, spikes, orbs
│   ├── Scene             # Lighting, GLSL sky shader, day/night cycle
│   ├── Particles         # Mining/death/damage particle effects
│   ├── Flashlight        # Player headlight
│   └── GhostBuilding     # Placement preview ghost
│
├── ui/                   # React DOM overlays (outside <Canvas>)
│   ├── Blocker           # Title screen, lore, pause, controls hint
│   ├── HUD / Inventory   # Resource counts
│   ├── BuildMenu         # Building selection grid (bottom bar)
│   ├── CraftingMenu      # Recipe crafting at Colony Hub
│   ├── HealthBar         # Player HP + weapon info + active effects
│   ├── WeaponBar         # Weapon slots display (bottom center)
│   ├── Tooltip           # Context-sensitive hover info (resource/building/enemy/decoration)
│   ├── StatusMessage     # Floating action feedback text
│   ├── Minimap           # Top-down canvas minimap
│   ├── PowerBar          # Power generation/consumption bar
│   ├── DNAAnalyser       # Mushroom scanning interface
│   ├── CompoundLab       # Compound mixing laboratory
│   └── Crosshair         # Center reticle
│
└── sfx/
    └── SFXEngine.js      # Procedural Web Audio sounds (lazy-init on first interaction)
```

## Architecture Patterns

### State: Single Zustand Store (store.js)
- **All** game state lives in one Zustand store (`useGameStore`)
- Actions mutate via `set()` / `get()` — no Redux boilerplate
- Sections: player health/effects, weapons, enemies/waves, buildings, resources, compounds, UI
- Game loop ticks (enemies, projectiles, waves, regen, cooldowns) run from `Enemies.jsx` useFrame
- `PlayerController.jsx` ticks player effects separately

### Constants: Definitions Only (constants.js)
- `buildingDefs` — 40+ building types with cost, power, category, color
- `weaponDefs` — 5 weapons (melee/ranged/spread) with damage, range, cooldown, cost
- `enemyDefs` — 7 enemy types (crawler, spitter, brute, sporeBeast, voidStalker, plasmaWraith, crystalGolem)
- `craftingRecipes` — Recipes for items + weapons, crafted at Colony Hub
- `weaponOrder` — Array defining weapon cycle order
- `ENEMY_TYPES` — Legacy array with spawn weights for overworld spawns
- Constants: `WORLD_SIZE`, `WAVE_INTERVAL`, `ENEMY_CAP`, `ROAM_COUNT`, etc.

### Rendering
- All 3D content inside single `<Canvas>` in App.jsx
- `useFrame()` for per-frame logic (movement, AI, animation)
- Procedural geometry everywhere — no .glb/.gltf model files
- Raycasting for all interactions (mine, build, attack, tooltip)
- Declarative JSX for all Three.js objects

### Input (PlayerController.jsx)
- `input.js` exports shared `keys` object for WASD movement
- Document-level event listeners for keydown/keyup/mousedown/wheel
- PointerLockControls for FPS camera
- Tab = toggle weapon mode, Scroll = cycle weapons, E = interact, B = build menu

### Performance
- Object cache in PlayerController: rebuilt every 60 frames (not every frame)
- Tooltip raycasting at ~10Hz (every 6 frames)
- Buildings rendered only within RENDER_DISTANCE (120 units)
- Particles filtered when lifetime expires

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| React components | PascalCase | `PlayerController`, `BuildingMesh` |
| Store actions | camelCase, imperative | `damageEnemy()`, `fireProjectile()` |
| Constants | SCREAMING_SNAKE_CASE | `WORLD_SIZE`, `ENEMY_CAP` |
| Building/weapon IDs | snake_case | `dna_analyser`, `stun_baton` |
| Internal/cached vars | `_` prefix | `_raycaster`, `_cachedEnemies` |
| CSS | kebab-case IDs/classes | `#health-bar`, `.wb-slot` |

## Key Game Systems

- **Resources**: 5 ore types, 80 nodes randomly placed, left-click to mine
- **Buildings**: 40+ types across 8 categories, grid-placed, automated production chains
- **Weapons**: 5 craftable at hub (Stun Baton, Energy Sword, Plasma Pistol, Pulse Rifle, Scatter Gun)
- **Enemies**: 7 types with AI state machine (idle→chase→attack→cooldown); waves every 4 min; roaming spawns every 5s
- **Compounds**: 25 base + 300+ reactions via Compound Lab; mushrooms scanned at DNA Analyser
- **Day/Night**: Continuous cycle affecting lighting, sky shader, star visibility
- **Player**: 100 HP, regen 2 HP/s after 4s out of combat, respawn at hub on death

## HandTool.jsx Notes
- Hand model viewed from behind (+Z = toward camera)
- Palm must be thick enough (Z-scale ~0.9) to enclose tool handles at Z≈0
- Tool handles should start above Y≈0.10 to avoid phasing through palm
- Finger proximal segments sit on the back side (Z positive), curl over toward -Z
- 4 animation phases: IDLE → WINDUP (easeOut) → STRIKE (easeIn) → RECOVERY (smoothstep)
- Weapon models add FIRE phase for ranged recoil
- All tool/weapon groups share a single HandModel and toggle visibility

## Adding New Content

### New Enemy Type
1. Add entry to `enemyDefs` in `constants.js` (hp, damage, speed, attackRange, detectRange, color, size, attackCooldown)
2. Create a `<TypeNameMesh>` component in `Enemies.jsx`
3. Add `{enemy.type === 'typeName' && <TypeNameMesh />}` to `EnemyInstance`

### New Building Type
1. Add entry to `buildingDefs` in `constants.js` (name, size, color, cost, powerUse, desc, category)
2. Add key to `buildOrder` array in `constants.js`
3. Add mesh case to `BuildingMesh.jsx`
4. If interactive (like hub/dna_analyser/compound_lab), add interaction handling in `PlayerController.jsx` and `store.js`

### New Weapon
1. Add entry to `weaponDefs` in `constants.js`
2. Add to `weaponOrder` array
3. Add crafting recipe to `craftingRecipes` with `weapon: 'weapon_id'`
4. Add firing logic case in `PlayerController.jsx` mousedown handler if new type

### New Compound Reactions
- Add to `REACTIONS` array in `compounds.js` as `[id1, id2, name, color, effect, description]` tuples
- For tier-2 chains, add to `TIER2_REACTIONS` array

## Important Notes
- No test suite — verify changes with `npm run build`
- SFXEngine must be initialized on user interaction (browser autoplay policy)
- store.js is the single source of truth — read it first when debugging game logic
- Linter hooks may auto-modify files on save; re-read after edits if content changes
- `userData` tags on meshes enable raycasting: `isResource`, `isBuilding`, `isEnemy`, `isDecoration`, `isTerrain`
