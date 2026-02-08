export const WORLD_SIZE = 1024;
export const TERRAIN_SEGMENTS = 192;
export const RENDER_DISTANCE = 180;
export const GRID_SNAP = 2;

// Water bodies
export const POND_COUNT = 25;
export const RIVER_COUNT = 4;
export const WATER_DETECT_RANGE = 6;
export const WATER_LEVEL = -8; // legacy, kept for compat
export const INPUT_BUFFER_MAX = 10;
export const OUTPUT_BUFFER_MAX = 10;
export const CONVEYOR_SPEED_MK1 = 0.5;
export const CONVEYOR_SPEED_MK2 = 1.0;
export const PIPE_SPEED = 0.5;

export const PLAYER_DEFAULTS = {
  height: 2.0,
  speed: 12,
  sprintMult: 2.0,
  jumpForce: 10,
  gravity: 25,
};

export const buildingDefs = {
  hub: {
    name: 'Colony Hub', size: [6, 5, 6], color: 0x00ffaa,
    cost: { 'Iron Ore': 10 }, powerUse: 3,
    desc: 'Central crafting station — required for advanced recipes',
    category: 'core',
  },
  miner: {
    name: 'Quantum Miner', size: [3, 5, 3], color: 0x00aaff,
    cost: {}, powerUse: 2,
    desc: 'Extracts resources from nearby deposits',
    category: 'production',
  },
  smelter: {
    name: 'Nano Smelter', size: [3, 4, 3], color: 0xff6600,
    cost: { 'Iron Ore': 5 }, powerUse: 4,
    desc: 'Smelts ore into plates',
    category: 'production',
  },
  assembler: {
    name: 'Assembler', size: [4, 4, 4], color: 0xaa00ff,
    cost: { 'Iron Plate': 10 }, powerUse: 6,
    desc: 'Assembles components into circuits',
    category: 'production',
  },
  refinery: {
    name: 'Plasma Refinery', size: [5, 6, 5], color: 0xff3388,
    cost: { 'Iron Plate': 12, 'Plasma Gel': 3 }, powerUse: 8,
    desc: 'Refines plasma gel into power cells & alloys',
    category: 'production',
  },
  lab: {
    name: 'Research Lab', size: [5, 4.5, 5], color: 0x33ccff,
    cost: { 'Nano Circuit': 8, 'Iron Plate': 15 }, powerUse: 10,
    desc: 'Produces data cores from crystals & circuits',
    category: 'production',
  },
  conveyor: {
    name: 'Conveyor Belt', size: [2, 0.3, 2], color: 0x444444,
    cost: { 'Iron Plate': 2 }, powerUse: 0,
    desc: 'Transports items between machines',
    category: 'logistics',
  },
  storage: {
    name: 'Storage Container', size: [3, 3, 3], color: 0x336633,
    cost: { 'Iron Plate': 8 }, powerUse: 0,
    desc: 'Stores excess items',
    category: 'logistics',
  },
  habitat: {
    name: 'Habitat Pod', size: [4, 3.5, 4], color: 0x88cc44,
    cost: { 'Iron Plate': 10, 'Copper Ore': 5 }, powerUse: 3,
    desc: 'Living quarters for colonists',
    category: 'colony',
  },
  oxygenator: {
    name: 'O2 Generator', size: [3, 4, 3], color: 0x44ddff,
    cost: { 'Iron Plate': 6, 'Plasma Gel': 2 }, powerUse: 5,
    desc: 'Generates breathable atmosphere',
    category: 'colony',
  },
  turret: {
    name: 'Defense Turret', size: [2, 3.5, 2], color: 0xff4444,
    cost: { 'Iron Plate': 8, 'Nano Circuit': 3 }, powerUse: 4,
    desc: 'Perimeter defense against alien fauna',
    category: 'defense',
  },
  solar: {
    name: 'Solar Array', size: [4, 3.5, 4], color: 0x00ffcc,
    cost: { 'Nano Circuit': 5 }, powerUse: -8,
    desc: 'Generates +8 power',
    category: 'power',
  },
  reactor: {
    name: 'Plasma Reactor', size: [5, 7, 5], color: 0xff00ff,
    cost: { 'Iron Plate': 20, 'Nano Circuit': 10 }, powerUse: -50,
    desc: 'Generates +50 power',
    category: 'power',
  },
  beacon: {
    name: 'Comm Beacon', size: [3, 12, 3], color: 0xffcc00,
    cost: { 'Nano Circuit': 20, 'Power Cell': 10, 'Data Core': 5 }, powerUse: 25,
    desc: 'Transmits signal to remaining human fleets',
    category: 'endgame',
  },
  launchpad: {
    name: 'Launch Pad', size: [8, 1, 8], color: 0xcccccc,
    cost: { 'Iron Plate': 30, 'Titanium Alloy': 10, 'Power Cell': 5 }, powerUse: 0,
    desc: 'Orbital launch platform — the final step home',
    category: 'endgame',
  },

  // ── PRODUCTION (new) ──
  constructor: {
    name: 'Constructor', size: [3, 2.5, 3], color: 0x4488ff,
    cost: { 'Iron Plate': 4 }, powerUse: 2,
    desc: 'Basic single-input fabrication unit',
    category: 'production',
  },
  foundry: {
    name: 'Alloy Foundry', size: [5, 4.5, 5], color: 0xff8844,
    cost: { 'Iron Plate': 8, 'Copper Ore': 5 }, powerUse: 6,
    desc: 'High-temp forge for advanced alloy production',
    category: 'production',
  },
  manufacturer: {
    name: 'Manufacturer', size: [6, 5, 6], color: 0x8844ff,
    cost: { 'Iron Plate': 15, 'Nano Circuit': 5 }, powerUse: 10,
    desc: 'Multi-input assembler for complex components',
    category: 'production',
  },
  centrifuge: {
    name: 'Centrifuge', size: [3, 3.5, 3], color: 0x44ddaa,
    cost: { 'Iron Plate': 6, 'Nano Circuit': 3 }, powerUse: 5,
    desc: 'Separates mixed compounds by density',
    category: 'production',
  },
  crystallizer: {
    name: 'Crystallizer', size: [3, 6, 3], color: 0x00ccff,
    cost: { 'Quantum Crystal': 2, 'Iron Plate': 5 }, powerUse: 7,
    desc: 'Grows synthetic crystals from quantum seeds',
    category: 'production',
  },
  compressor: {
    name: 'Plasma Compressor', size: [3, 4.5, 3], color: 0xdd44ff,
    cost: { 'Iron Plate': 8, 'Plasma Gel': 2 }, powerUse: 6,
    desc: 'Compresses raw plasma into dense fuel blocks',
    category: 'production',
  },

  // ── LOGISTICS (new) ──
  splitter: {
    name: 'Splitter', size: [2, 1.2, 2], color: 0xaaaa44,
    cost: { 'Iron Plate': 3 }, powerUse: 0,
    desc: 'Splits one conveyor line into three outputs',
    category: 'logistics',
  },
  merger: {
    name: 'Merger', size: [2, 1.2, 2], color: 0x44aaaa,
    cost: { 'Iron Plate': 3 }, powerUse: 0,
    desc: 'Merges three conveyor inputs into one output',
    category: 'logistics',
  },
  conveyor_mk2: {
    name: 'Conveyor Mk.II', size: [2, 0.4, 2], color: 0x6677aa,
    cost: { 'Iron Plate': 4, 'Nano Circuit': 1 }, powerUse: 1,
    desc: 'High-speed magnetic conveyor belt',
    category: 'logistics',
  },
  pipe: {
    name: 'Fluid Pipe', size: [1.5, 0.8, 1.5], color: 0x446688,
    cost: { 'Iron Plate': 2 }, powerUse: 0,
    desc: 'Transports liquid and gel resources',
    category: 'logistics',
  },
  pump: {
    name: 'Pump Station', size: [2, 2.5, 2], color: 0x4466aa,
    cost: { 'Iron Plate': 4, 'Nano Circuit': 1 }, powerUse: 2,
    desc: 'Pressurizes fluid pipe networks',
    category: 'logistics',
  },
  smart_storage: {
    name: 'Smart Storage', size: [3, 4.5, 3], color: 0x448844,
    cost: { 'Iron Plate': 10, 'Nano Circuit': 3 }, powerUse: 1,
    desc: 'Filtered storage with auto-sorting capability',
    category: 'logistics',
  },
  logistics_hub: {
    name: 'Logistics Hub', size: [5, 3, 5], color: 0xaaaa44,
    cost: { 'Iron Plate': 12, 'Nano Circuit': 4 }, powerUse: 3,
    desc: 'Central distribution node for item routing',
    category: 'logistics',
  },

  // ── COLONY (new) ──
  greenhouse: {
    name: 'Bio-Dome', size: [5, 4, 5], color: 0x44cc44,
    cost: { 'Iron Plate': 6, 'Plasma Gel': 1 }, powerUse: 2,
    desc: 'Hydroponic food production facility',
    category: 'colony',
  },
  med_bay: {
    name: 'Med Bay', size: [3, 3, 3], color: 0xff4488,
    cost: { 'Iron Plate': 8, 'Nano Circuit': 2 }, powerUse: 3,
    desc: 'Medical facility for colonist health',
    category: 'colony',
  },
  command: {
    name: 'Command Center', size: [6, 5, 6], color: 0x4488cc,
    cost: { 'Iron Plate': 15, 'Nano Circuit': 8, 'Data Core': 2 }, powerUse: 8,
    desc: 'Colony operations & coordination hub',
    category: 'colony',
  },
  barracks: {
    name: 'Barracks', size: [6, 3.5, 5], color: 0x667744,
    cost: { 'Iron Plate': 12, 'Copper Ore': 3 }, powerUse: 2,
    desc: 'Housing for security personnel',
    category: 'colony',
  },
  rec_center: {
    name: 'Recreation Hall', size: [6, 4, 6], color: 0xcc88ff,
    cost: { 'Iron Plate': 10, 'Nano Circuit': 2 }, powerUse: 3,
    desc: 'Morale boost facility for colonists',
    category: 'colony',
  },

  // ── DEFENSE (new) ──
  missile_turret: {
    name: 'Missile Battery', size: [3, 5, 3], color: 0xff6644,
    cost: { 'Iron Plate': 12, 'Nano Circuit': 5, 'Power Cell': 2 }, powerUse: 6,
    desc: 'Long-range anti-air defense system',
    category: 'defense',
  },
  laser_fence: {
    name: 'Laser Fence', size: [2, 3, 0.5], color: 0xff2222,
    cost: { 'Iron Plate': 4, 'Nano Circuit': 1 }, powerUse: 1,
    desc: 'Perimeter energy fence section',
    category: 'defense',
  },
  wall: {
    name: 'Defense Wall', size: [4, 4, 1], color: 0x666666,
    cost: { 'Iron Plate': 6 }, powerUse: 0,
    desc: 'Reinforced wall segment for perimeter',
    category: 'defense',
  },
  radar: {
    name: 'Radar Array', size: [3, 7, 3], color: 0x44ff44,
    cost: { 'Nano Circuit': 6, 'Iron Plate': 5 }, powerUse: 4,
    desc: 'Long-range threat detection system',
    category: 'defense',
  },
  shield_gen: {
    name: 'Shield Generator', size: [4, 4, 4], color: 0x4488ff,
    cost: { 'Power Cell': 5, 'Nano Circuit': 8, 'Titanium Alloy': 3 }, powerUse: 15,
    desc: 'Projects protective energy dome over area',
    category: 'defense',
  },

  // ── RESEARCH (new) ──
  telescope: {
    name: 'Deep Space Scope', size: [4, 8, 4], color: 0x6688cc,
    cost: { 'Nano Circuit': 10, 'Quantum Crystal': 5 }, powerUse: 8,
    desc: 'Scans deep space for fleet signals',
    category: 'research',
  },
  bio_lab: {
    name: 'Xeno-Biology Lab', size: [4, 3.5, 4], color: 0x44cc88,
    cost: { 'Iron Plate': 8, 'Nano Circuit': 5, 'Plasma Gel': 2 }, powerUse: 6,
    desc: 'Studies alien lifeforms and biomaterials',
    category: 'research',
  },
  quantum_comp: {
    name: 'Quantum Computer', size: [3, 4.5, 3], color: 0x8888ff,
    cost: { 'Quantum Crystal': 8, 'Nano Circuit': 12, 'Data Core': 2 }, powerUse: 12,
    desc: 'Processes complex quantum calculations',
    category: 'research',
  },

  // ── POWER (new) ──
  wind_turbine: {
    name: 'Wind Turbine', size: [3, 9, 3], color: 0xccddcc,
    cost: { 'Iron Plate': 6 }, powerUse: -4,
    desc: 'Generates +4 power from alien winds',
    category: 'power',
  },
  geothermal: {
    name: 'Geothermal Tap', size: [4, 3.5, 4], color: 0xff6644,
    cost: { 'Iron Plate': 10, 'Titanium Alloy': 2 }, powerUse: -12,
    desc: 'Generates +12 power from planetary heat',
    category: 'power',
  },
  battery: {
    name: 'Power Bank', size: [2, 2, 2], color: 0x44ff88,
    cost: { 'Power Cell': 3, 'Iron Plate': 5 }, powerUse: 0,
    desc: 'Stores excess energy for peak demand',
    category: 'power',
  },
  fuel_gen: {
    name: 'Fuel Generator', size: [4, 4, 4], color: 0xcc8844,
    cost: { 'Iron Plate': 8, 'Power Cell': 2 }, powerUse: -20,
    desc: 'Burns fuel cells for +20 power',
    category: 'power',
  },
  fusion: {
    name: 'Fusion Reactor', size: [7, 8, 7], color: 0xffaaff,
    cost: { 'Titanium Alloy': 15, 'Data Core': 3, 'Nano Circuit': 20 }, powerUse: -100,
    desc: 'Generates +100 power via plasma fusion',
    category: 'power',
  },

  // ── ENDGAME (new) ──
  warp_core: {
    name: 'Warp Core', size: [6, 7, 6], color: 0xff44ff,
    cost: { 'Data Core': 10, 'Power Cell': 15, 'Titanium Alloy': 8 }, powerUse: 30,
    desc: 'Experimental FTL drive component',
    category: 'endgame',
  },
  colony_ship: {
    name: 'Colony Ship Frame', size: [10, 5, 10], color: 0xddddee,
    cost: { 'Titanium Alloy': 25, 'Nano Circuit': 20, 'Data Core': 10, 'Power Cell': 15 }, powerUse: 0,
    desc: 'Ship hull framework — the way home',
    category: 'endgame',
  },

  // ── SCIENCE ──
  dna_analyser: {
    name: 'DNA Analyser', size: [3, 3.5, 3], color: 0x44ffaa,
    cost: { 'Nano Circuit': 4, 'Iron Plate': 6, 'Quantum Crystal': 2 }, powerUse: 4,
    desc: 'Scans bioluminescent mushrooms to determine edibility and effects',
    category: 'research',
  },
  compound_lab: {
    name: 'Compound Lab', size: [4, 3, 4], color: 0x8866ff,
    cost: { 'Nano Circuit': 6, 'Iron Plate': 10, 'Plasma Gel': 3 }, powerUse: 6,
    desc: 'Mix compounds in beakers and test tubes — discover 300+ reactions',
    category: 'research',
  },

  // ── LIQUID PROCESSING ──
  water_pump: {
    name: 'Water Pump', size: [3, 2.5, 3], color: 0x2288cc,
    cost: { 'Iron Plate': 6, 'Nano Circuit': 2 }, powerUse: 3,
    desc: 'Extracts water from submerged terrain — must be placed in water',
    category: 'production', liquid: true,
  },
  coolant_mixer: {
    name: 'Coolant Mixer', size: [3, 3, 3], color: 0x22cccc,
    cost: { 'Iron Plate': 8, 'Nano Circuit': 4, 'Copper Ore': 3 }, powerUse: 5,
    desc: 'Mixes water and copper ore into industrial coolant',
    category: 'production', liquid: true,
  },
  acid_refiner: {
    name: 'Acid Refiner', size: [3, 3.5, 3], color: 0x44cc44,
    cost: { 'Iron Plate': 10, 'Nano Circuit': 5, 'Plasma Gel': 2 }, powerUse: 6,
    desc: 'Distills water and bio-matter into corrosive bio-acid',
    category: 'production', liquid: true,
  },
};

// Ordered for build menu display
export const buildOrder = [
  // Core
  'hub',
  // Production
  'miner', 'constructor', 'smelter', 'foundry', 'assembler', 'manufacturer',
  'refinery', 'centrifuge', 'crystallizer', 'compressor', 'lab',
  'water_pump', 'coolant_mixer', 'acid_refiner',
  // Logistics
  'conveyor', 'conveyor_mk2', 'splitter', 'merger', 'pipe', 'pump',
  'storage', 'smart_storage', 'logistics_hub',
  // Colony
  'habitat', 'barracks', 'greenhouse', 'med_bay', 'rec_center', 'oxygenator', 'command',
  // Defense
  'turret', 'missile_turret', 'laser_fence', 'wall', 'radar', 'shield_gen',
  // Research / Science
  'telescope', 'bio_lab', 'quantum_comp', 'dna_analyser', 'compound_lab',
  // Power
  'wind_turbine', 'solar', 'geothermal', 'fuel_gen', 'battery', 'reactor', 'fusion',
  // Endgame
  'beacon', 'warp_core', 'launchpad', 'colony_ship',
];

export const resourceTypes = [
  { name: 'Iron Ore', color: 0xaa8866, emissive: 0x442200, shape: 'rock' },
  { name: 'Copper Ore', color: 0xdd8844, emissive: 0x663300, shape: 'rock' },
  { name: 'Quantum Crystal', color: 0x00ddff, emissive: 0x0088ff, shape: 'crystal' },
  { name: 'Plasma Gel', color: 0xcc00ff, emissive: 0x8800cc, shape: 'blob' },
  { name: 'Titanium Ore', color: 0xccccdd, emissive: 0x444466, shape: 'rock' },
  // Liquid resources
  { name: 'Water', color: 0x2288ff, emissive: 0x1144aa, shape: 'liquid' },
  { name: 'Coolant', color: 0x22dddd, emissive: 0x118888, shape: 'liquid' },
  { name: 'Bio-Acid', color: 0x44ff44, emissive: 0x228822, shape: 'liquid' },
];

// Day / night cycle
export const DAY_CYCLE_SPEED = 0.02;
export const SUN_ORBIT_RADIUS = 250;

// Crafting recipes (manual crafting at the Hub)
export const craftingRecipes = [
  {
    id: 'iron_plate',
    name: 'Iron Plate',
    inputs: { 'Iron Ore': 2 },
    output: { 'Iron Plate': 1 },
    desc: 'Smelt raw iron into a usable plate',
  },
  {
    id: 'copper_wire',
    name: 'Nano Circuit',
    inputs: { 'Copper Ore': 3, 'Iron Plate': 1 },
    output: { 'Nano Circuit': 1 },
    desc: 'Weave copper into nano-scale circuitry',
  },
  {
    id: 'power_cell',
    name: 'Power Cell',
    inputs: { 'Nano Circuit': 2, 'Plasma Gel': 1 },
    output: { 'Power Cell': 1 },
    desc: 'Condense plasma into a portable energy unit',
  },
  {
    id: 'titanium_alloy',
    name: 'Titanium Alloy',
    inputs: { 'Titanium Ore': 3, 'Plasma Gel': 1 },
    output: { 'Titanium Alloy': 1 },
    desc: 'Forge titanium into reinforced alloy',
  },
  {
    id: 'data_core',
    name: 'Data Core',
    inputs: { 'Quantum Crystal': 3, 'Nano Circuit': 2 },
    output: { 'Data Core': 1 },
    desc: 'Encode quantum data into a crystalline matrix',
  },
  {
    id: 'iron_plate_bulk',
    name: 'Iron Plate x5',
    inputs: { 'Iron Ore': 8 },
    output: { 'Iron Plate': 5 },
    desc: 'Bulk smelt — more efficient at scale',
  },
  {
    id: 'power_cell_bulk',
    name: 'Power Cell x3',
    inputs: { 'Nano Circuit': 5, 'Plasma Gel': 3 },
    output: { 'Power Cell': 3 },
    desc: 'Bulk condense — triple output',
  },
  // ── ENERGY CELLS ──
  {
    id: 'energy_cell',
    name: 'Energy Cell x5',
    inputs: { 'Power Cell': 1, 'Nano Circuit': 1 },
    output: { 'Energy Cell': 5 },
    desc: 'Compact energy ammunition for ranged weapons',
  },
  {
    id: 'energy_cell_bulk',
    name: 'Energy Cell x15',
    inputs: { 'Power Cell': 2, 'Nano Circuit': 3 },
    output: { 'Energy Cell': 15 },
    desc: 'Bulk energy cell production — triple yield',
  },
  // ── LIQUID RECIPES ──
  {
    id: 'coolant',
    name: 'Coolant',
    inputs: { 'Water': 3, 'Copper Ore': 1 },
    output: { 'Coolant': 2 },
    desc: 'Mix water with copper ore into industrial coolant',
  },
  {
    id: 'bio_acid',
    name: 'Bio-Acid',
    inputs: { 'Water': 2, 'Bioluminescent Mushroom': 1 },
    output: { 'Bio-Acid': 1 },
    desc: 'Distill water and bio-matter into corrosive acid',
  },
  {
    id: 'advanced_power_cell',
    name: 'Advanced Power Cell',
    inputs: { 'Power Cell': 1, 'Coolant': 2 },
    output: { 'Power Cell': 3 },
    desc: 'Coolant-enhanced power cell triplication',
  },
  {
    id: 'reinforced_alloy',
    name: 'Reinforced Alloy',
    inputs: { 'Titanium Alloy': 1, 'Bio-Acid': 1 },
    output: { 'Titanium Alloy': 3 },
    desc: 'Acid-etched alloy with triple yield',
  },
  // ── WEAPON RECIPES ──
  {
    id: 'stun_baton',
    name: 'Stun Baton',
    inputs: { 'Iron Plate': 3, 'Nano Circuit': 1 },
    output: {},
    weapon: 'stun_baton',
    desc: 'Craft a short-range electric baton',
  },
  {
    id: 'energy_sword',
    name: 'Energy Sword',
    inputs: { 'Iron Plate': 5, 'Nano Circuit': 3, 'Power Cell': 1 },
    output: {},
    weapon: 'energy_sword',
    desc: 'Craft a high-damage plasma blade',
  },
  {
    id: 'plasma_pistol',
    name: 'Plasma Pistol',
    inputs: { 'Iron Plate': 4, 'Nano Circuit': 2 },
    output: {},
    weapon: 'plasma_pistol',
    desc: 'Craft a rapid-fire energy sidearm',
  },
  {
    id: 'pulse_rifle',
    name: 'Pulse Rifle',
    inputs: { 'Iron Plate': 8, 'Nano Circuit': 5, 'Power Cell': 2 },
    output: {},
    weapon: 'pulse_rifle',
    desc: 'Craft a precision long-range rifle',
  },
  {
    id: 'scatter_gun',
    name: 'Scatter Gun',
    inputs: { 'Iron Plate': 6, 'Nano Circuit': 3, 'Plasma Gel': 1 },
    output: {},
    weapon: 'scatter_gun',
    desc: 'Craft a spread-fire close-range blaster',
  },
];

// ── WEAPONS ──
export const weaponDefs = {
  stun_baton: {
    name: 'Stun Baton', type: 'melee', damage: 15, range: 3, cooldown: 0.4,
    cost: { 'Iron Plate': 3, 'Nano Circuit': 1 },
    color: 0x44ccff, desc: 'Short-range electric baton',
    critChance: 0.10, critMultiplier: 2.0,
    statusEffect: { type: 'stun', chance: 0.15, duration: 1.0 },
  },
  energy_sword: {
    name: 'Energy Sword', type: 'melee', damage: 35, range: 3.5, cooldown: 0.6,
    cost: { 'Iron Plate': 5, 'Nano Circuit': 3, 'Power Cell': 1 },
    color: 0x00ff88, desc: 'High-damage plasma blade',
    critChance: 0.10, critMultiplier: 2.0,
    statusEffect: { type: 'bleed', chance: 0.25, dps: 5, duration: 3.0 },
  },
  plasma_pistol: {
    name: 'Plasma Pistol', type: 'ranged', damage: 12, range: 50, cooldown: 0.3,
    cost: { 'Iron Plate': 4, 'Nano Circuit': 2 },
    color: 0xff4488, desc: 'Rapid-fire energy sidearm',
    projectileColor: 0xff4488, projectileSpeed: 60,
    critChance: 0.10, critMultiplier: 2.0, ammoCost: 1,
    statusEffect: { type: 'burn', chance: 0.20, dps: 3, duration: 4.0 },
  },
  pulse_rifle: {
    name: 'Pulse Rifle', type: 'ranged', damage: 30, range: 80, cooldown: 0.8,
    cost: { 'Iron Plate': 8, 'Nano Circuit': 5, 'Power Cell': 2 },
    color: 0x4488ff, desc: 'Precision long-range rifle',
    projectileColor: 0x4488ff, projectileSpeed: 80,
    critChance: 0.10, critMultiplier: 2.0, ammoCost: 2,
    statusEffect: { type: 'slow', chance: 0.30, speedMult: 0.5, duration: 2.0 },
  },
  scatter_gun: {
    name: 'Scatter Gun', type: 'ranged_spread', damage: 8, pellets: 5, range: 20, cooldown: 1.0,
    cost: { 'Iron Plate': 6, 'Nano Circuit': 3, 'Plasma Gel': 1 },
    color: 0xffaa00, desc: 'Spread-fire close-range blaster',
    projectileColor: 0xffaa00, projectileSpeed: 50,
    critChance: 0.10, critMultiplier: 2.0, ammoCost: 3,
    statusEffect: { type: 'shred', chance: 0.10, damageMult: 1.25, duration: 3.0 },
  },
};

export const weaponOrder = ['stun_baton', 'energy_sword', 'plasma_pistol', 'pulse_rifle', 'scatter_gun'];

// ── ENEMIES ──
export const enemyDefs = {
  crawler: {
    name: 'Xeno Crawler', hp: 30, damage: 8, speed: 7, attackRange: 2.5,
    detectRange: 30, color: 0x884422, size: [0.8, 0.4, 1.2], attackCooldown: 1.0,
  },
  spitter: {
    name: 'Spitter', hp: 60, damage: 12, speed: 4, attackRange: 18,
    detectRange: 30, color: 0xcc44cc, size: [1.0, 1.2, 1.0], attackCooldown: 3.0,
  },
  brute: {
    name: 'Brute', hp: 150, damage: 25, speed: 2.5, attackRange: 3,
    detectRange: 30, color: 0xcc4444, size: [1.8, 2.0, 1.8], attackCooldown: 2.0,
  },
  sporeBeast: {
    name: 'Spore Beast', hp: 80, damage: 12, speed: 3.5, attackRange: 3.5,
    detectRange: 35, color: 0x447744, size: [1.2, 1.4, 1.2], attackCooldown: 1.5,
  },
  voidStalker: {
    name: 'Void Stalker', hp: 120, damage: 20, speed: 5, attackRange: 3,
    detectRange: 40, color: 0x221133, size: [1.0, 2.5, 1.0], attackCooldown: 1.8,
  },
  plasmaWraith: {
    name: 'Plasma Wraith', hp: 50, damage: 25, speed: 8, attackRange: 4,
    detectRange: 35, color: 0x4444ff, size: [0.8, 1.0, 0.8], attackCooldown: 1.2,
  },
  crystalGolem: {
    name: 'Crystal Golem', hp: 200, damage: 30, speed: 2, attackRange: 3.5,
    detectRange: 25, color: 0x446688, size: [1.8, 2.2, 1.8], attackCooldown: 2.5,
  },
};

export const WAVE_INTERVAL = 240;
export const ENEMY_CAP = 25;
export const ROAM_COUNT = 10;

// ── ENEMY TYPES (for rare overworld spawns) ──
export const ENEMY_TYPES = [
  { key: 'crawler', name: 'Xeno Crawler', health: 30, damage: 8, speed: 7, attackRange: 2.5, spawnWeight: 5, color: 0x884422 },
  { key: 'sporeBeast', name: 'Spore Beast', health: 80, damage: 12, speed: 3.5, attackRange: 3.5, spawnWeight: 3, color: 0x447744 },
  { key: 'voidStalker', name: 'Void Stalker', health: 120, damage: 20, speed: 5, attackRange: 3, spawnWeight: 2, color: 0x221133 },
  { key: 'plasmaWraith', name: 'Plasma Wraith', health: 50, damage: 25, speed: 8, attackRange: 4, spawnWeight: 1.5, color: 0x4444ff },
  { key: 'crystalGolem', name: 'Crystal Golem', health: 200, damage: 30, speed: 2, attackRange: 3.5, spawnWeight: 0.5, color: 0x446688 },
];

// Tool mapping by resource shape
export const TOOL_FOR_SHAPE = {
  rock: 'pickaxe',
  crystal: 'chisel',
  blob: 'ladle',
  mushroom: 'hand',
};

// Quick-select keys (first 9 slots)
export const buildKeys = {
  Digit1: 'hub', Digit2: 'miner', Digit3: 'smelter', Digit4: 'assembler',
  Digit5: 'refinery', Digit6: 'lab', Digit7: 'conveyor', Digit8: 'storage',
  Digit9: 'solar',
};

// ── LORE ──
export const SHIP_ID = `ARTEMIS-${Math.floor(1000 + Math.random() * 9000)}`;
export const PLANET_NAME = (() => {
  const prefixes = ['Keth', 'Vor', 'Zy', 'Ax', 'Nol', 'Thar', 'Elu', 'Pha', 'Bre', 'Xen'];
  const suffixes = ['ara', 'ion', 'ius', 'ova', 'enn', 'ith', 'ax', 'ora', 'ul', 'yne'];
  const p = prefixes[Math.floor(Math.random() * prefixes.length)];
  const s = suffixes[Math.floor(Math.random() * suffixes.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${p}${s}-${num}`;
})();

export const LORE_INTRO = [
  `YEAR 32180 — Humanity had achieved the impossible.`,
  `Zero carbon emissions. Zero war. Complete world peace.`,
  `Then it all collapsed.`,
  ``,
  `By 32181, every energy source in the Sol system was depleted.`,
  `Every asteroid mined hollow. Every planet stripped bare.`,
  `Even the Sun itself flickered on the edge of exhaustion.`,
  ``,
  `Civilization fell into anarchy overnight.`,
  ``,
  `The last act of the Unified Council was Project EXODUS —`,
  `ten thousand generation ships, launched blind into the void,`,
  `each carrying the final hope of the human species.`,
  ``,
  `Most were never heard from again.`,
];

export const LORE_PLAYER = [
  `You are ${SHIP_ID}.`,
  `After 847 years of drift, your ship's AI detected a habitable world`,
  `and executed an emergency landing on ${PLANET_NAME}.`,
  ``,
  `The ship is gone. Fuel cells shattered on impact.`,
  `But the planet is rich — alien minerals, plasma deposits,`,
  `quantum crystals humming with energy.`,
  ``,
  `You have one directive:`,
  `Colonize. Rebuild. Signal home.`,
  `Find out if anyone is still listening.`,
];
