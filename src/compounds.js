// ══════════════════════════════════════════════════════════════════════════════
// COMPOUND & REACTION SYSTEM — 25 base compounds, 300+ deterministic reactions
// Each reaction is pre-computed at load time. NOT AI-powered.
// ══════════════════════════════════════════════════════════════════════════════

export const COMPOUND_CATEGORIES = {
  bio: { label: 'Bio-Organic', color: '#44cc88' },
  mineral: { label: 'Mineral', color: '#cc8844' },
  plasma: { label: 'Plasma', color: '#cc44ff' },
  crystal: { label: 'Crystal', color: '#44ccff' },
  synthetic: { label: 'Synthetic', color: '#8888ff' },
};

export const BASE_COMPOUNDS = [
  // ── Bio-Organic (0–4) ──
  { id: 0,  name: 'Mycelium Extract',   cat: 'bio',       color: '#44cc88', react: 0.6, stab: 0.7, pH: 6.2, visc: 0.4, vol: 0.2 },
  { id: 1,  name: 'Bio-Enzyme',         cat: 'bio',       color: '#88ff44', react: 0.8, stab: 0.4, pH: 5.0, visc: 0.3, vol: 0.3 },
  { id: 2,  name: 'Spore Concentrate',  cat: 'bio',       color: '#aacc22', react: 0.5, stab: 0.6, pH: 6.8, visc: 0.6, vol: 0.5 },
  { id: 3,  name: 'Chloro-Synth',       cat: 'bio',       color: '#22ff88', react: 0.4, stab: 0.8, pH: 7.2, visc: 0.2, vol: 0.1 },
  { id: 4,  name: 'Amino Chain',        cat: 'bio',       color: '#66dd66', react: 0.7, stab: 0.5, pH: 6.0, visc: 0.5, vol: 0.2 },

  // ── Mineral (5–9) ──
  { id: 5,  name: 'Ferro-Carbon',       cat: 'mineral',   color: '#aa6633', react: 0.3, stab: 0.9, pH: 7.0, visc: 0.1, vol: 0.0 },
  { id: 6,  name: 'Silicate Powder',    cat: 'mineral',   color: '#ccbb88', react: 0.2, stab: 0.95,pH: 7.5, visc: 0.0, vol: 0.0 },
  { id: 7,  name: 'Titanium Dust',      cat: 'mineral',   color: '#bbbbcc', react: 0.3, stab: 0.9, pH: 7.0, visc: 0.0, vol: 0.0 },
  { id: 8,  name: 'Copper Sulfate',     cat: 'mineral',   color: '#4488cc', react: 0.6, stab: 0.6, pH: 3.5, visc: 0.3, vol: 0.1 },
  { id: 9,  name: 'Lithium Oxide',      cat: 'mineral',   color: '#ff6644', react: 0.8, stab: 0.3, pH: 12.0,visc: 0.1, vol: 0.4 },

  // ── Plasma (10–14) ──
  { id: 10, name: 'Plasma Residue',     cat: 'plasma',    color: '#cc44ff', react: 0.7, stab: 0.4, pH: 8.0, visc: 0.8, vol: 0.6 },
  { id: 11, name: 'Ion Gel',            cat: 'plasma',    color: '#8866ff', react: 0.5, stab: 0.6, pH: 7.5, visc: 0.9, vol: 0.3 },
  { id: 12, name: 'Neutron Flux',       cat: 'plasma',    color: '#ff88cc', react: 0.9, stab: 0.2, pH: 7.0, visc: 0.1, vol: 0.9 },
  { id: 13, name: 'Proton Salt',        cat: 'plasma',    color: '#ffaa44', react: 0.6, stab: 0.5, pH: 2.0, visc: 0.0, vol: 0.2 },
  { id: 14, name: 'Electron Mist',      cat: 'plasma',    color: '#44aaff', react: 0.4, stab: 0.7, pH: 9.0, visc: 0.0, vol: 0.8 },

  // ── Crystal (15–19) ──
  { id: 15, name: 'Crystal Dust',       cat: 'crystal',   color: '#66ffff', react: 0.3, stab: 0.8, pH: 7.0, visc: 0.0, vol: 0.1 },
  { id: 16, name: 'Quantum Shard',      cat: 'crystal',   color: '#00ddff', react: 0.7, stab: 0.5, pH: 7.5, visc: 0.0, vol: 0.3 },
  { id: 17, name: 'Prismatic Fragment',  cat: 'crystal',  color: '#ff66ff', react: 0.5, stab: 0.7, pH: 6.5, visc: 0.0, vol: 0.2 },
  { id: 18, name: 'Resonance Core',     cat: 'crystal',   color: '#ffff44', react: 0.8, stab: 0.3, pH: 8.5, visc: 0.0, vol: 0.5 },
  { id: 19, name: 'Lattice Compound',   cat: 'crystal',   color: '#88ffaa', react: 0.4, stab: 0.8, pH: 7.0, visc: 0.1, vol: 0.1 },

  // ── Synthetic (20–24) ──
  { id: 20, name: 'Nano Solvent',       cat: 'synthetic', color: '#aaaaff', react: 0.7, stab: 0.5, pH: 4.0, visc: 0.2, vol: 0.4 },
  { id: 21, name: 'Poly-Fiber',         cat: 'synthetic', color: '#cccccc', react: 0.2, stab: 0.9, pH: 7.0, visc: 0.7, vol: 0.0 },
  { id: 22, name: 'Synth-Acid',         cat: 'synthetic', color: '#ccff44', react: 0.9, stab: 0.2, pH: 1.5, visc: 0.3, vol: 0.6 },
  { id: 23, name: 'Catalyst X',         cat: 'synthetic', color: '#ff4488', react: 1.0, stab: 0.1, pH: 6.0, visc: 0.2, vol: 0.7 },
  { id: 24, name: 'Stabilizer-9',       cat: 'synthetic', color: '#44ff44', react: 0.1, stab: 1.0, pH: 7.0, visc: 0.5, vol: 0.0 },
];

// ── Effect types for reaction visuals ──
const FX = {
  GLOW: 'glow', FIZZ: 'fizz', SMOKE: 'smoke', SPARK: 'spark',
  CRYSTAL: 'crystallize', BUBBLE: 'bubble', FLASH: 'flash',
  DISSOLVE: 'dissolve', HEAT: 'heat', FREEZE: 'freeze',
};

// ── All 300 reactions defined as [id1, id2, outputName, color, effect, description] ──
// Organized by category pair for maintainability
const REACTION_DATA = [
  // ═══════════════════════════ BIO + BIO (10) ═══════════════════════════
  [0, 1, 'Vital Serum',            '#22ff66', FX.GLOW,    'Potent healing compound from fungal enzymes'],
  [0, 2, 'Spore Cloud Tonic',      '#88ee44', FX.FIZZ,    'Concentrated aerial spore suspension'],
  [0, 3, 'Photosynthetic Gel',     '#33ffaa', FX.GLOW,    'Light-reactive bio-gel that stores solar energy'],
  [0, 4, 'Protein Matrix',         '#55dd77', FX.BUBBLE,  'Dense structural protein web for bio-construction'],
  [1, 2, 'Catalytic Broth',        '#aaee33', FX.FIZZ,    'Enzyme-activated spore solution with rapid metabolism'],
  [1, 3, 'Active Green Extract',   '#44ff55', FX.BUBBLE,  'Fast-acting photochemical accelerant'],
  [1, 4, 'Peptide Accelerant',     '#77ee55', FX.HEAT,    'Supercharged amino fusion that boosts cellular repair'],
  [2, 3, 'Luminescent Sap',        '#66ffcc', FX.GLOW,    'Bioluminescent fluid that glows for hours'],
  [2, 4, 'Mutagenic Paste',        '#cccc22', FX.SMOKE,   'Unstable organic mix that rewrites cellular DNA'],
  [3, 4, 'Synthetic Chlorophyll',  '#33ee44', FX.GLOW,    'Artificial photosynthesis compound for energy harvesting'],

  // ═══════════════════════════ BIO + MINERAL (25) ═══════════════════════════
  [0, 5, 'Fungal Steel',           '#887755', FX.HEAT,    'Iron-threaded mycelium with metallic strength'],
  [0, 6, 'Bio-Glass Fiber',        '#aabb99', FX.CRYSTAL, 'Transparent organic silicate weave'],
  [0, 7, 'Bio-Titanium Mesh',      '#99aabb', FX.HEAT,    'Living metal composite with self-repair capability'],
  [0, 8, 'Verdigris Extract',      '#44aa88', FX.FIZZ,    'Blue-green copper-fungal compound with antimicrobial properties'],
  [0, 9, 'Lithium Spore Salt',     '#ee8844', FX.SPARK,   'Highly reactive crystallized spore-lithium fusion'],
  [1, 5, 'Enzymatic Rust',         '#cc6633', FX.DISSOLVE,'Bio-corrosive compound that breaks down metal structures'],
  [1, 6, 'Silica-Enzyme Lattice',  '#bbaa77', FX.CRYSTAL, 'Glass-hard enzymatic crystal formation'],
  [1, 7, 'Titan-Enzyme Complex',   '#aabbaa', FX.FIZZ,    'Catalytic titanium activator for industrial processes'],
  [1, 8, 'Copper Enzyme Reagent',  '#55aacc', FX.BUBBLE,  'Blue catalytic solution with high conductivity'],
  [1, 9, 'Lithium Bio-Reactor',    '#ff9944', FX.SPARK,   'Volatile bio-lithium energy source'],
  [2, 5, 'Iron Spore Composite',   '#998866', FX.HEAT,    'Metallic spore armor plating compound'],
  [2, 6, 'Silica Spore Pod',       '#bbbb88', FX.CRYSTAL, 'Glass-encased dormant spore with preservation properties'],
  [2, 7, 'Armored Spore Shell',    '#aabbbb', FX.HEAT,    'Titanium-hardened spore casing for extreme environments'],
  [2, 8, 'Toxic Spore Bloom',      '#44cc99', FX.SMOKE,   'Poisonous copper-spore compound — handle with care'],
  [2, 9, 'Volatile Spore Charge',  '#ff7744', FX.FLASH,   'Explosive lithium-spore detonation compound'],
  [3, 5, 'Ferro-Chloride Tonic',   '#668844', FX.FIZZ,    'Iron-enriched plant extract for structural growth'],
  [3, 6, 'Crystal Leaf Compound',  '#88cc88', FX.CRYSTAL, 'Silicate-infused photosynthetic crystal'],
  [3, 7, 'Titanium Chloride Sol',  '#99bbaa', FX.DISSOLVE,'Industrial-grade titanium processing solution'],
  [3, 8, 'Copper Chlorophyll',     '#44bb88', FX.GLOW,    'Blue-green energy harvesting bio-compound'],
  [3, 9, 'Lithium Chloride Salt',  '#ddaa44', FX.SPARK,   'Bright reactive salt for emergency power cells'],
  [4, 5, 'Ferrous Peptide',        '#997766', FX.HEAT,    'Metal-amino compound for reinforced bio-structures'],
  [4, 6, 'Silicate Protein Web',   '#aabb88', FX.CRYSTAL, 'Glass-protein composite with extreme tensile strength'],
  [4, 7, 'Titan Peptide Armor',    '#aabbcc', FX.HEAT,    'Titanium-bonded amino plating for maximum defense'],
  [4, 8, 'Copper Peptide Wire',    '#55aaaa', FX.SPARK,   'Conductive bio-wire for organic circuitry'],
  [4, 9, 'Lithium Peptide Cell',   '#ee8855', FX.FLASH,   'Charged amino chain for portable bio-energy'],

  // ═══════════════════════════ BIO + PLASMA (25) ═══════════════════════════
  [0, 10, 'Plasma Mycelium',        '#aa66cc', FX.GLOW,    'Fungal network infused with plasma energy'],
  [0, 11, 'Ion-Fungal Gel',         '#7788cc', FX.BUBBLE,  'Ionic mushroom gel with energy storage properties'],
  [0, 12, 'Neutron Spore Cloud',    '#dd88aa', FX.FLASH,   'Radioactive spore cloud — extremely volatile'],
  [0, 13, 'Proton Mycelium Salt',   '#cc9944', FX.FIZZ,    'Acidic fungal salt with proton emission'],
  [0, 14, 'Electron Fungal Mist',   '#55bbcc', FX.SMOKE,   'Electrified mushroom vapor with charge capacity'],
  [1, 10, 'Plasma Enzyme Catalyst', '#bb55dd', FX.HEAT,    'Superheated enzymatic plasma fusion'],
  [1, 11, 'Ion Enzyme Solution',    '#8877dd', FX.FIZZ,    'Charged enzyme solution for rapid decomposition'],
  [1, 12, 'Neutron Enzyme Burst',   '#ee77aa', FX.FLASH,   'Explosive enzyme chain reaction in neutron medium'],
  [1, 13, 'Proton Enzyme Acid',     '#dd8833', FX.DISSOLVE,'Hyper-acidic enzyme that dissolves anything organic'],
  [1, 14, 'Electron Enzyme Mist',   '#66aadd', FX.SPARK,   'Electrically active enzyme cloud for circuit etching'],
  [2, 10, 'Plasma Spore Field',     '#bb66bb', FX.GLOW,    'Energy-radiating spore network'],
  [2, 11, 'Ion Spore Cluster',      '#8877bb', FX.BUBBLE,  'Ionized spore colony with magnetic properties'],
  [2, 12, 'Neutron Spore Bomb',     '#ee66aa', FX.FLASH,   'Critical mass spore detonator — stand back'],
  [2, 13, 'Proton Spore Dust',      '#cc8833', FX.FIZZ,    'Acidic spore powder that eats through metal'],
  [2, 14, 'Electron Spore Haze',    '#55aacc', FX.SMOKE,   'Static-charged spore suspension'],
  [3, 10, 'Plasma-Synth Leaf',      '#88aadd', FX.GLOW,    'Photosynthetic plasma harvester'],
  [3, 11, 'Ion Chloro-Gel',         '#77aacc', FX.BUBBLE,  'Ionic photogel for sustained energy'],
  [3, 12, 'Neutron Chloride',       '#dd88aa', FX.HEAT,    'Neutron-activated chlorine compound'],
  [3, 13, 'Proton Plant Acid',      '#cc9944', FX.DISSOLVE,'Acidic plant extract enhanced with proton flux'],
  [3, 14, 'Electron Vine Extract',  '#55ccaa', FX.SPARK,   'Electrified vine compound for bio-energy grids'],
  [4, 10, 'Plasma Amino Fusion',    '#bb77cc', FX.HEAT,    'Plasma-bonded protein chain with extreme energy'],
  [4, 11, 'Ion Peptide Gel',        '#8888cc', FX.BUBBLE,  'Charged protein gel for medical applications'],
  [4, 12, 'Neutron Chain Reaction', '#ee88bb', FX.FLASH,   'Neutron-activated amino cascade — unstable'],
  [4, 13, 'Proton Amino Salt',      '#cc9955', FX.FIZZ,    'Proton-enriched amino crystal'],
  [4, 14, 'Electron Peptide Arc',   '#66bbdd', FX.SPARK,   'Electric protein arc for neural interfaces'],

  // ═══════════════════════════ BIO + CRYSTAL (25) ═══════════════════════════
  [0, 15, 'Mycelium Crystal',       '#55ddbb', FX.CRYSTAL, 'Organic crystal grown from fungal substrate'],
  [0, 16, 'Quantum Fungal Node',    '#33cccc', FX.GLOW,    'Quantum-entangled mushroom network node'],
  [0, 17, 'Prismatic Mycelium',     '#cc88dd', FX.GLOW,    'Rainbow-refracting fungal crystal mesh'],
  [0, 18, 'Resonant Fungal Core',   '#cccc44', FX.SPARK,   'Vibrating mushroom crystal that emits sound waves'],
  [0, 19, 'Lattice Mycelium Web',   '#66ddaa', FX.CRYSTAL, 'Structured crystal-fungal network'],
  [1, 15, 'Enzyme Crystal Matrix',  '#66eedd', FX.CRYSTAL, 'Enzymatic crystal lattice with catalytic properties'],
  [1, 16, 'Quantum Enzyme Shard',   '#44ccdd', FX.FLASH,   'Quantum-active enzyme crystal'],
  [1, 17, 'Prismatic Enzyme',       '#cc77ee', FX.GLOW,    'Light-splitting enzymatic crystal'],
  [1, 18, 'Resonant Enzyme Pulse',  '#dddd55', FX.SPARK,   'Vibrating enzyme crystal that amplifies reactions'],
  [1, 19, 'Lattice Enzyme Grid',    '#77ddbb', FX.CRYSTAL, 'Structured enzyme-crystal mesh'],
  [2, 15, 'Spore Crystal Cluster',  '#77ddcc', FX.CRYSTAL, 'Crystal-encased spore colony'],
  [2, 16, 'Quantum Spore Matrix',   '#44ccbb', FX.GLOW,    'Quantum-linked spore network with instant signaling'],
  [2, 17, 'Prismatic Spore Lens',   '#bb88dd', FX.GLOW,    'Light-focusing spore-crystal compound'],
  [2, 18, 'Resonant Spore Chime',   '#cccc55', FX.SPARK,   'Sound-emitting spore crystal'],
  [2, 19, 'Lattice Spore Shell',    '#77ddaa', FX.CRYSTAL, 'Crystal lattice spore armor'],
  [3, 15, 'Chloro-Crystal Prism',   '#55eebb', FX.GLOW,    'Photosynthetic crystal that converts light to energy'],
  [3, 16, 'Quantum Chlorophyll',    '#44ccaa', FX.FLASH,   'Quantum photosynthetic compound'],
  [3, 17, 'Prismatic Chloro-Lens',  '#bb88cc', FX.GLOW,    'Rainbow light harvesting crystal'],
  [3, 18, 'Resonant Green Crystal', '#aacc44', FX.SPARK,   'Vibrating photosynthetic resonator'],
  [3, 19, 'Lattice Chloro-Grid',    '#66ddaa', FX.CRYSTAL, 'Structured photosynthetic crystal network'],
  [4, 15, 'Amino Crystal Fiber',    '#66ddcc', FX.CRYSTAL, 'Crystal-reinforced protein fiber'],
  [4, 16, 'Quantum Peptide Shard',  '#44cccc', FX.FLASH,   'Quantum-entangled amino crystal'],
  [4, 17, 'Prismatic Amino Prism',  '#bb88ee', FX.GLOW,    'Light-refracting protein crystal'],
  [4, 18, 'Resonant Peptide Core',  '#ddcc44', FX.SPARK,   'Vibrating protein crystal resonator'],
  [4, 19, 'Lattice Amino Mesh',     '#77ddbb', FX.CRYSTAL, 'Crystal lattice protein network'],

  // ═══════════════════════════ BIO + SYNTHETIC (25) ═══════════════════════════
  [0, 20, 'Nano-Fungal Solution',   '#7788dd', FX.DISSOLVE,'Nano-dissolved mushroom extract'],
  [0, 21, 'Mycelium Fiber Weave',   '#88bb88', FX.FIZZ,    'Poly-fiber reinforced fungal thread'],
  [0, 22, 'Acid-Fungal Digest',     '#88cc33', FX.DISSOLVE,'Acid-dissolved mushroom compound'],
  [0, 23, 'Catalyzed Mycelium',     '#cc6688', FX.HEAT,    'Hyper-accelerated fungal growth medium'],
  [0, 24, 'Stabilized Fungal Core', '#44bb66', FX.GLOW,    'Perfectly preserved mycelium sample'],
  [1, 20, 'Nano-Enzyme Solvent',    '#8888ee', FX.DISSOLVE,'Nano-scale enzyme dissolution agent'],
  [1, 21, 'Enzyme Poly-Thread',     '#99bb99', FX.FIZZ,    'Enzymatic polymer fiber'],
  [1, 22, 'Acid-Enzyme Reactor',    '#99cc22', FX.HEAT,    'Dual-acid enzymatic reactor compound'],
  [1, 23, 'Catalytic Enzyme Storm', '#dd5588', FX.FLASH,   'Explosive catalytic enzyme reaction'],
  [1, 24, 'Stabilized Enzyme',      '#55cc55', FX.BUBBLE,  'Long-lasting stable enzyme solution'],
  [2, 20, 'Nano-Spore Suspension',  '#8899dd', FX.BUBBLE,  'Nanoscale spore delivery system'],
  [2, 21, 'Spore Fiber Composite',  '#99aa88', FX.FIZZ,    'Polymer-encased spore structural material'],
  [2, 22, 'Acid Spore Toxin',       '#99bb22', FX.SMOKE,   'Corrosive spore toxin for defense'],
  [2, 23, 'Catalytic Spore Bloom',  '#dd6688', FX.FLASH,   'Rapidly multiplying catalyzed spore field'],
  [2, 24, 'Stabilized Spore Core',  '#55bb55', FX.CRYSTAL, 'Permanently preserved spore in stasis'],
  [3, 20, 'Nano-Chloro Fluid',      '#66aacc', FX.DISSOLVE,'Nanoscale photosynthetic fluid'],
  [3, 21, 'Chloro-Fiber Cable',     '#77bb77', FX.FIZZ,    'Light-conducting organic fiber optic'],
  [3, 22, 'Acid Chloro-Wash',       '#88cc22', FX.DISSOLVE,'Acidic photosynthetic cleaning solution'],
  [3, 23, 'Catalyzed Chlorophyll',  '#cc5577', FX.HEAT,    'Hyper-efficient photosynthetic catalyst'],
  [3, 24, 'Stable Photo-Compound',  '#44cc44', FX.GLOW,    'Long-lasting bioluminescent light source'],
  [4, 20, 'Nano-Amino Solvent',     '#8899ee', FX.DISSOLVE,'Nanoscale amino acid dissolution'],
  [4, 21, 'Amino Fiber Bundle',     '#88bb88', FX.FIZZ,    'Polymer-reinforced protein strand'],
  [4, 22, 'Acid Amino Digest',      '#99cc33', FX.DISSOLVE,'Acid-denatured protein compound'],
  [4, 23, 'Catalytic Protein Storm','#dd6699', FX.FLASH,   'Explosive protein refolding catalyst'],
  [4, 24, 'Stabilized Amino Core',  '#55cc66', FX.BUBBLE,  'Permanently stable amino compound'],

  // ═══════════════════════════ MINERAL + MINERAL (10) ═══════════════════════════
  [5, 6, 'Ferrosilicate Alloy',     '#bb9966', FX.HEAT,    'Iron-silicon alloy with extreme hardness'],
  [5, 7, 'Ferro-Titanium Blend',    '#aa9999', FX.HEAT,    'Heavy-duty dual-metal alloy for construction'],
  [5, 8, 'Iron Copper Amalgam',     '#8899aa', FX.HEAT,    'Conductive iron-copper blend'],
  [5, 9, 'Ferro-Lithium Charge',    '#dd7744', FX.SPARK,   'Reactive iron-lithium battery compound'],
  [6, 7, 'Silica-Titanium Ceramic', '#bbbbaa', FX.HEAT,    'Ultra-hard ceramic composite'],
  [6, 8, 'Copper Silicate Glass',   '#88aaaa', FX.CRYSTAL, 'Blue-tinted conductive glass'],
  [6, 9, 'Lithium Silicate Flux',   '#dd9966', FX.SPARK,   'Reactive flux agent for high-temp processing'],
  [7, 8, 'Copper Titanium Wire',    '#8899bb', FX.HEAT,    'Premium conductive wire alloy'],
  [7, 9, 'Lithium Titanium Cell',   '#cc8877', FX.SPARK,   'High-density energy storage alloy'],
  [8, 9, 'Copper Lithium Battery',  '#dd8866', FX.SPARK,   'Potent electrochemical power compound'],

  // ═══════════════════════════ MINERAL + PLASMA (25) ═══════════════════════════
  [5, 10, 'Plasma-Forged Iron',     '#aa66aa', FX.HEAT,    'Plasma-tempered iron with enhanced durability'],
  [5, 11, 'Ion-Steel Compound',     '#8877aa', FX.HEAT,    'Ionically bonded steel variant'],
  [5, 12, 'Neutron-Forged Iron',    '#cc77aa', FX.FLASH,   'Neutron-bombarded ultra-dense iron'],
  [5, 13, 'Proton Iron Salt',       '#bb8844', FX.FIZZ,    'Acidic iron-proton compound'],
  [5, 14, 'Electron Iron Mist',     '#6699bb', FX.SMOKE,   'Electrically suspended iron particles'],
  [6, 10, 'Plasma Glass',           '#aa77cc', FX.GLOW,    'Plasma-infused transparent material'],
  [6, 11, 'Ion Silicate Gel',       '#8888bb', FX.BUBBLE,  'Flexible ionic glass gel'],
  [6, 12, 'Neutron Glass Shard',    '#dd77bb', FX.FLASH,   'Radioactive crystalline glass fragment'],
  [6, 13, 'Proton Silicate',        '#bb9955', FX.FIZZ,    'Acid-etched reactive silicate'],
  [6, 14, 'Electron Glass Vapor',   '#66aabb', FX.SMOKE,   'Electrically charged glass particles'],
  [7, 10, 'Plasma Titanium',        '#aa77bb', FX.HEAT,    'Plasma-enhanced titanium superalloy'],
  [7, 11, 'Ion Titanium Plate',     '#8899bb', FX.HEAT,    'Ion-hardened titanium armor plating'],
  [7, 12, 'Neutron Titanium Core',  '#cc88aa', FX.FLASH,   'Ultra-dense neutron titanium'],
  [7, 13, 'Proton Titanium Acid',   '#bb8855', FX.DISSOLVE,'Corrosive titanium processing acid'],
  [7, 14, 'Electron Titanium Arc',  '#66aacc', FX.SPARK,   'Titanium conductor for energy arcs'],
  [8, 10, 'Plasma Copper Coil',     '#9966bb', FX.GLOW,    'Plasma-charged copper energy coil'],
  [8, 11, 'Ion Copper Solution',    '#7788bb', FX.FIZZ,    'Ionic copper conductor solution'],
  [8, 12, 'Neutron Copper Core',    '#dd77aa', FX.FLASH,   'Neutron-dense copper energy core'],
  [8, 13, 'Copper Proton Cell',     '#aa8844', FX.SPARK,   'Copper-proton electrochemical cell'],
  [8, 14, 'Copper Electron Cloud',  '#55aabb', FX.SMOKE,   'Free-electron copper conductor cloud'],
  [9, 10, 'Lithium Plasma Fire',    '#ee55cc', FX.FLASH,   'Incendiary lithium-plasma compound — extreme heat'],
  [9, 11, 'Lithium Ion Gel',        '#cc66cc', FX.HEAT,    'Lithium-ion gel for battery applications'],
  [9, 12, 'Lithium Neutron Bomb',   '#ff66aa', FX.FLASH,   'Critical lithium-neutron compound — DANGER'],
  [9, 13, 'Lithium Proton Salt',    '#ee8844', FX.SPARK,   'Dual-reactive proton-lithium crystal'],
  [9, 14, 'Lithium Electron Storm', '#88aadd', FX.SPARK,   'Lightning-in-a-bottle lithium compound'],

  // ═══════════════════════════ MINERAL + CRYSTAL (25) ═══════════════════════════
  [5, 15, 'Iron Crystal Ingot',     '#88bbaa', FX.CRYSTAL, 'Crystal-reinforced iron ingot'],
  [5, 16, 'Quantum Iron Shard',     '#77aabb', FX.FLASH,   'Quantum-phased iron crystal'],
  [5, 17, 'Prismatic Iron',         '#bb88cc', FX.GLOW,    'Rainbow-reflecting iron crystal'],
  [5, 18, 'Resonant Iron Bell',     '#ccbb55', FX.SPARK,   'Vibrating iron crystal that produces sound'],
  [5, 19, 'Iron Lattice Frame',     '#88bb99', FX.CRYSTAL, 'Crystal-lattice iron structural frame'],
  [6, 15, 'Crystal Glass Lens',     '#99ddcc', FX.CRYSTAL, 'Precision optical crystal-glass lens'],
  [6, 16, 'Quantum Glass Prism',    '#77cccc', FX.GLOW,    'Quantum light-splitting glass prism'],
  [6, 17, 'Prismatic Glass Orb',    '#cc99dd', FX.GLOW,    'Multicolor light-projecting glass sphere'],
  [6, 18, 'Resonant Glass Chime',   '#cccc66', FX.SPARK,   'Crystal glass resonator for sound manipulation'],
  [6, 19, 'Silicate Lattice',       '#99ccaa', FX.CRYSTAL, 'Ordered silicate crystal structure'],
  [7, 15, 'Titanium Crystal Edge',  '#99ccbb', FX.CRYSTAL, 'Crystal-sharpened titanium blade material'],
  [7, 16, 'Quantum Titanium Core',  '#77bbcc', FX.FLASH,   'Quantum-stabilized titanium powercore'],
  [7, 17, 'Prismatic Titanium',     '#bb99cc', FX.GLOW,    'Light-refracting titanium crystal alloy'],
  [7, 18, 'Resonant Titanium Rod',  '#ccbb66', FX.SPARK,   'Tuning-fork titanium crystal resonator'],
  [7, 19, 'Titanium Lattice Mesh',  '#99bbaa', FX.CRYSTAL, 'Crystal-lattice titanium supermesh'],
  [8, 15, 'Copper Crystal Coil',    '#66ccbb', FX.CRYSTAL, 'Crystal-wound copper energy coil'],
  [8, 16, 'Quantum Copper Wire',    '#55bbcc', FX.SPARK,   'Quantum-tunneling copper superconductor'],
  [8, 17, 'Prismatic Copper Band',  '#bb77cc', FX.GLOW,    'Rainbow-reflecting copper bracelet compound'],
  [8, 18, 'Resonant Copper Bell',   '#ccaa55', FX.SPARK,   'Copper crystal bell with perfect resonance'],
  [8, 19, 'Copper Lattice Grid',    '#66bbaa', FX.CRYSTAL, 'Crystal-structured copper conductor grid'],
  [9, 15, 'Lithium Crystal Fire',   '#ddbb88', FX.FLASH,   'Incendiary lithium crystal compound'],
  [9, 16, 'Quantum Lithium Shard',  '#aacc99', FX.FLASH,   'Quantum-reactive lithium crystal — unstable'],
  [9, 17, 'Prismatic Lithium',      '#dd88dd', FX.SPARK,   'Light-splitting reactive lithium crystal'],
  [9, 18, 'Resonant Lithium Core',  '#ddcc55', FX.FLASH,   'Vibrating lithium crystal power source'],
  [9, 19, 'Lithium Lattice Cell',   '#aacc88', FX.CRYSTAL, 'Structured lithium crystal battery cell'],

  // ═══════════════════════════ MINERAL + SYNTHETIC (25) ═══════════════════════════
  [5, 20, 'Nano-Iron Solution',     '#8888bb', FX.DISSOLVE,'Nanoscale iron particle suspension'],
  [5, 21, 'Iron Fiber Cable',       '#998888', FX.HEAT,    'Polymer-wrapped iron conductor'],
  [5, 22, 'Acid-Etched Iron',       '#aa8833', FX.DISSOLVE,'Acid-patterned iron for precision parts'],
  [5, 23, 'Catalytic Iron',         '#cc6677', FX.HEAT,    'Iron catalyst for industrial reactions'],
  [5, 24, 'Stabilized Iron Core',   '#88aa77', FX.HEAT,    'Permanently non-oxidizing iron'],
  [6, 20, 'Nano-Silicate Fluid',    '#9999cc', FX.DISSOLVE,'Nanoscale silicate in solvent suspension'],
  [6, 21, 'Silicate Fiber Mat',     '#bbaa99', FX.FIZZ,    'Woven silicate fiber insulation'],
  [6, 22, 'Acid Glass Etch',        '#aaaa33', FX.DISSOLVE,'Precision glass etching solution'],
  [6, 23, 'Catalytic Silicate',     '#cc7788', FX.HEAT,    'Silicon catalyst for crystal growth'],
  [6, 24, 'Stable Silicate Block',  '#99bb88', FX.CRYSTAL, 'Permanently stable glass-like material'],
  [7, 20, 'Nano-Titanium Fluid',    '#9999bb', FX.DISSOLVE,'Nanoscale titanium colloidal suspension'],
  [7, 21, 'Titanium Fiber Strand',  '#aabb99', FX.HEAT,    'Polymer-coated titanium fiber'],
  [7, 22, 'Acid-Washed Titanium',   '#aabb44', FX.DISSOLVE,'Acid-polished pure titanium'],
  [7, 23, 'Catalytic Titanium',     '#bb7788', FX.HEAT,    'Titanium-based reaction catalyst'],
  [7, 24, 'Stable Titanium Alloy',  '#99aa88', FX.HEAT,    'Non-degrading titanium compound'],
  [8, 20, 'Nano-Copper Solution',   '#6688cc', FX.DISSOLVE,'Colloidal copper nanoparticle solution'],
  [8, 21, 'Copper Fiber Wire',      '#7799aa', FX.HEAT,    'Polymer-insulated copper conductor'],
  [8, 22, 'Acid Copper Etch',       '#77aa44', FX.DISSOLVE,'Copper circuit board etching acid'],
  [8, 23, 'Catalytic Copper',       '#bb6688', FX.SPARK,   'Copper reaction accelerator'],
  [8, 24, 'Stable Copper Salt',     '#66aa77', FX.CRYSTAL, 'Non-reactive stabilized copper compound'],
  [9, 20, 'Nano-Lithium Fluid',     '#cc88cc', FX.SPARK,   'Nanoscale lithium in volatile suspension'],
  [9, 21, 'Lithium Fiber Cell',     '#cc9988', FX.HEAT,    'Polymer-encased lithium battery fiber'],
  [9, 22, 'Lithium Acid Solution',  '#dd9933', FX.FLASH,   'Highly reactive lithium acid — DANGER'],
  [9, 23, 'Catalytic Lithium Fire', '#ff5577', FX.FLASH,   'Self-igniting lithium catalyst'],
  [9, 24, 'Stabilized Lithium',     '#88cc66', FX.FIZZ,    'Safely stabilized lithium compound'],

  // ═══════════════════════════ PLASMA + PLASMA (10) ═══════════════════════════
  [10, 11, 'Dense Plasma Gel',       '#aa66dd', FX.GLOW,    'Ultra-dense plasma-ion gel for energy storage'],
  [10, 12, 'Plasma Neutron Core',    '#ee66cc', FX.FLASH,   'Critical plasma-neutron energy core'],
  [10, 13, 'Plasma Proton Acid',     '#dd8855', FX.DISSOLVE,'Super-acidic plasma-proton solution'],
  [10, 14, 'Plasma Electron Field',  '#8899dd', FX.SPARK,   'Electromagnetic plasma field generator compound'],
  [11, 12, 'Ion Neutron Reactor',    '#bb77cc', FX.FLASH,   'Ion-neutron reactor fuel compound'],
  [11, 13, 'Ion Proton Battery',     '#aa8866', FX.SPARK,   'Dual-charge ion-proton energy cell'],
  [11, 14, 'Ion Electron Bridge',    '#6699dd', FX.SPARK,   'Complete-charge ionic bridge compound'],
  [12, 13, 'Neutron Proton Mass',    '#ee9977', FX.FLASH,   'Near-atomic mass compound — extremely heavy'],
  [12, 14, 'Neutron Electron Void',  '#bb88cc', FX.SMOKE,   'Charge-null compound that absorbs energy'],
  [13, 14, 'Proton Electron Balance','#aa9988', FX.GLOW,    'Perfectly charge-balanced equilibrium compound'],

  // ═══════════════════════════ PLASMA + CRYSTAL (25) ═══════════════════════════
  [10, 15, 'Plasma Crystal Shard',  '#aa88dd', FX.GLOW,    'Plasma-infused crystal fragment'],
  [10, 16, 'Quantum Plasma Core',   '#77aadd', FX.FLASH,   'Quantum-plasma hybrid power core'],
  [10, 17, 'Prismatic Plasma',      '#dd88ee', FX.GLOW,    'Rainbow plasma crystal compound'],
  [10, 18, 'Resonant Plasma Wave',  '#ddcc66', FX.SPARK,   'Plasma crystal resonance amplifier'],
  [10, 19, 'Plasma Lattice Grid',   '#88ccbb', FX.CRYSTAL, 'Crystal lattice plasma containment grid'],
  [11, 15, 'Ion Crystal Matrix',    '#77bbdd', FX.CRYSTAL, 'Ionic crystal growth matrix'],
  [11, 16, 'Quantum Ion Shard',     '#66aadd', FX.FLASH,   'Quantum-ionic crystal power source'],
  [11, 17, 'Prismatic Ion Prism',   '#cc88ee', FX.GLOW,    'Ion-powered prismatic light crystal'],
  [11, 18, 'Resonant Ion Core',     '#cccc77', FX.SPARK,   'Ionic resonance energy core'],
  [11, 19, 'Ion Lattice Shell',     '#77ccaa', FX.CRYSTAL, 'Crystal-lattice ionic shield compound'],
  [12, 15, 'Neutron Crystal Mass',  '#dd88cc', FX.FLASH,   'Neutron-heavy crystal — incredibly dense'],
  [12, 16, 'Quantum Neutron Void',  '#aa88dd', FX.FLASH,   'Quantum-neutron singularity crystal'],
  [12, 17, 'Prismatic Neutron',     '#ee88dd', FX.FLASH,   'Neutron-charged prismatic crystal'],
  [12, 18, 'Resonant Neutron Core', '#eecc66', FX.FLASH,   'Neutron-powered resonance engine core'],
  [12, 19, 'Neutron Lattice',       '#cc88aa', FX.CRYSTAL, 'Dense neutron crystal lattice structure'],
  [13, 15, 'Proton Crystal Salt',   '#ccbb77', FX.FIZZ,    'Proton-charged crystal salt'],
  [13, 16, 'Quantum Proton Shard',  '#aaaa88', FX.SPARK,   'Quantum proton energy crystal'],
  [13, 17, 'Prismatic Proton Gem',  '#ddaa99', FX.GLOW,    'Proton-fired prismatic gemstone'],
  [13, 18, 'Resonant Proton Bell',  '#ddbb55', FX.SPARK,   'Proton-crystal acoustic resonator'],
  [13, 19, 'Proton Lattice Grid',   '#aabb88', FX.CRYSTAL, 'Crystal-lattice proton containment'],
  [14, 15, 'Electron Crystal Arc',  '#66ccdd', FX.SPARK,   'Crystal electron arc conductor'],
  [14, 16, 'Quantum Electron Core', '#55bbdd', FX.FLASH,   'Quantum electron power crystal'],
  [14, 17, 'Prismatic Electron',    '#aa88ff', FX.SPARK,   'Light-bending electron crystal'],
  [14, 18, 'Resonant Electron Coil','#cccc88', FX.SPARK,   'Electron resonance energy harvester'],
  [14, 19, 'Electron Lattice Web',  '#66ccaa', FX.CRYSTAL, 'Crystal lattice electron conductor mesh'],

  // ═══════════════════════════ PLASMA + SYNTHETIC (25) ═══════════════════════════
  [10, 20, 'Nano-Plasma Fluid',     '#9977dd', FX.GLOW,    'Nanoscale plasma suspension'],
  [10, 21, 'Plasma Fiber Conduit',  '#aa88bb', FX.HEAT,    'Plasma-conducting polymer fiber'],
  [10, 22, 'Plasma Acid Burn',      '#cc7744', FX.DISSOLVE,'Plasma-enhanced super acid'],
  [10, 23, 'Catalytic Plasma',      '#dd55aa', FX.FLASH,   'Catalyzed plasma chain reaction'],
  [10, 24, 'Stable Plasma Cell',    '#88aa88', FX.GLOW,    'Safely contained plasma energy cell'],
  [11, 20, 'Nano-Ion Solution',     '#8877dd', FX.DISSOLVE,'Nano-dissolved ionic solution'],
  [11, 21, 'Ion Fiber Network',     '#9988bb', FX.FIZZ,    'Ionically conductive fiber mesh'],
  [11, 22, 'Ion Acid Electrolyte',  '#998844', FX.FIZZ,    'Ionic acid electrolyte for batteries'],
  [11, 23, 'Catalytic Ion Storm',   '#dd66bb', FX.FLASH,   'Catalyzed ionic cascade reaction'],
  [11, 24, 'Stable Ion Gel',        '#77bb88', FX.BUBBLE,  'Long-lasting stable ionic gel'],
  [12, 20, 'Nano-Neutron Fluid',    '#cc77cc', FX.SMOKE,   'Neutron-dense nano fluid — heavy'],
  [12, 21, 'Neutron Fiber Shield',  '#bb88aa', FX.HEAT,    'Neutron-absorbing polymer shield'],
  [12, 22, 'Neutron Acid',          '#dd7744', FX.FLASH,   'Neutron-activated acid — eats everything'],
  [12, 23, 'Catalytic Neutron',     '#ee55aa', FX.FLASH,   'Catalyzed neutron cascade — STAND BACK'],
  [12, 24, 'Stable Neutron Mass',   '#99aa77', FX.HEAT,    'Safely contained neutron mass'],
  [13, 20, 'Nano-Proton Spray',     '#cc8899', FX.FIZZ,    'Nano-scale proton spray compound'],
  [13, 21, 'Proton Fiber Line',     '#aa8899', FX.HEAT,    'Proton-conducting fiber cable'],
  [13, 22, 'Proton Acid Melt',      '#dd9944', FX.DISSOLVE,'Proton-enhanced super-acid'],
  [13, 23, 'Catalytic Proton Fire', '#ee6688', FX.FLASH,   'Self-igniting proton catalyst'],
  [13, 24, 'Stable Proton Salt',    '#99aa88', FX.CRYSTAL, 'Safely stabilized proton crystal'],
  [14, 20, 'Nano-Electron Cloud',   '#77aaee', FX.SPARK,   'Nanoscale electron cloud suspension'],
  [14, 21, 'Electron Fiber Arc',    '#88aacc', FX.SPARK,   'Electron-conducting polymer arc'],
  [14, 22, 'Electron Acid Bolt',    '#88aa44', FX.SPARK,   'Acid-enhanced lightning bolt compound'],
  [14, 23, 'Catalytic Electron',    '#cc66cc', FX.FLASH,   'Catalyzed electron cascade'],
  [14, 24, 'Stable Electron Cell',  '#66bb88', FX.GLOW,    'Safely stored electron charge cell'],

  // ═══════════════════════════ CRYSTAL + CRYSTAL (10) ═══════════════════════════
  [15, 16, 'Quantum Crystal Matrix','#55ddee', FX.CRYSTAL, 'Dual-crystal quantum entanglement lattice'],
  [15, 17, 'Prismatic Dust Cloud',  '#bb88ee', FX.GLOW,    'Crystal dust rainbow refraction field'],
  [15, 18, 'Resonant Crystal Choir','#ccdd55', FX.SPARK,   'Multi-frequency crystal resonance array'],
  [15, 19, 'Double Lattice Frame',  '#77ddaa', FX.CRYSTAL, 'Reinforced dual-lattice crystal frame'],
  [16, 17, 'Quantum Prismatic Core','#88aaee', FX.FLASH,   'Quantum-prismatic power crystal'],
  [16, 18, 'Quantum Resonance',     '#88dd77', FX.SPARK,   'Quantum-resonant energy crystal pair'],
  [16, 19, 'Quantum Lattice Shard', '#66ccbb', FX.CRYSTAL, 'Quantum-structured lattice crystal'],
  [17, 18, 'Prismatic Resonator',   '#eeaa88', FX.GLOW,    'Light-bending resonant crystal harmonic'],
  [17, 19, 'Prismatic Lattice',     '#aa99cc', FX.CRYSTAL, 'Rainbow-structured crystal lattice'],
  [18, 19, 'Resonant Lattice Core', '#bbcc66', FX.SPARK,   'Vibrating crystal lattice power core'],

  // ═══════════════════════════ CRYSTAL + SYNTHETIC (25) ═══════════════════════════
  [15, 20, 'Nano-Crystal Solution', '#77bbee', FX.DISSOLVE,'Dissolved crystal nanoparticle solution'],
  [15, 21, 'Crystal Fiber Optic',   '#99ccbb', FX.GLOW,    'Crystal-core fiber optic cable compound'],
  [15, 22, 'Acid Crystal Etch',     '#88cc44', FX.DISSOLVE,'Acid-etched precision crystal'],
  [15, 23, 'Catalytic Crystal',     '#cc77aa', FX.FLASH,   'Catalyst-activated crystal growth'],
  [15, 24, 'Stable Crystal Block',  '#77cc99', FX.CRYSTAL, 'Permanently stable crystal compound'],
  [16, 20, 'Nano-Quantum Fluid',    '#66bbee', FX.GLOW,    'Nanoscale quantum crystal suspension'],
  [16, 21, 'Quantum Fiber Thread',  '#88bbbb', FX.FIZZ,    'Quantum-entangled polymer fiber'],
  [16, 22, 'Quantum Acid Wash',     '#77bb44', FX.DISSOLVE,'Quantum-acid precision etching'],
  [16, 23, 'Catalytic Quantum',     '#cc66bb', FX.FLASH,   'Catalyzed quantum reaction cascade'],
  [16, 24, 'Stable Quantum Core',   '#66cc99', FX.GLOW,    'Permanently stable quantum crystal'],
  [17, 20, 'Nano-Prismatic Fluid',  '#aa88ee', FX.GLOW,    'Nanoscale prismatic crystal solution'],
  [17, 21, 'Prismatic Fiber',       '#bb99cc', FX.GLOW,    'Rainbow-conducting polymer strand'],
  [17, 22, 'Prismatic Acid',        '#bb8844', FX.DISSOLVE,'Acid that splits light into components'],
  [17, 23, 'Catalytic Prism',       '#dd66cc', FX.FLASH,   'Light-activated catalytic crystal'],
  [17, 24, 'Stable Prism Block',    '#88bb99', FX.CRYSTAL, 'Permanently preserved prismatic crystal'],
  [18, 20, 'Nano-Resonance Fluid',  '#ccaa77', FX.SPARK,   'Vibrating nanoscale crystal suspension'],
  [18, 21, 'Resonant Fiber Cable',  '#bbaa88', FX.SPARK,   'Sound-conducting polymer strand'],
  [18, 22, 'Resonant Acid Tone',    '#ccaa33', FX.DISSOLVE,'Acid that vibrates at crystal frequency'],
  [18, 23, 'Catalytic Resonance',   '#ee77aa', FX.FLASH,   'Catalyst that amplifies vibrations'],
  [18, 24, 'Stable Resonance Cell', '#99bb77', FX.SPARK,   'Contained resonance energy cell'],
  [19, 20, 'Nano-Lattice Fluid',    '#77bbaa', FX.DISSOLVE,'Dissolved lattice crystal nanoparticles'],
  [19, 21, 'Lattice Fiber Weave',   '#88bbaa', FX.FIZZ,    'Crystal-lattice polymer composite'],
  [19, 22, 'Lattice Acid Wash',     '#88bb44', FX.DISSOLVE,'Lattice-etching precision acid'],
  [19, 23, 'Catalytic Lattice',     '#cc77aa', FX.CRYSTAL, 'Catalyst-grown crystal lattice'],
  [19, 24, 'Stable Lattice Core',   '#77cc88', FX.CRYSTAL, 'Permanently stable lattice structure'],

  // ═══════════════════════════ SYNTHETIC + SYNTHETIC (10) ═══════════════════════════
  [20, 21, 'Nano-Fiber Composite',  '#9999cc', FX.FIZZ,    'Nanoscale polymer composite material'],
  [20, 22, 'Nano-Acid Solution',    '#99aa44', FX.DISSOLVE,'Nanoscale acid dissolution agent'],
  [20, 23, 'Nano-Catalyst Surge',   '#cc77bb', FX.FLASH,   'Nano-catalyzed explosive reaction'],
  [20, 24, 'Nano-Stable Solution',  '#77bb99', FX.BUBBLE,  'Perfectly stabilized nanoparticle solution'],
  [21, 22, 'Acid-Etched Polymer',   '#aaaa44', FX.DISSOLVE,'Acid-patterned precision polymer'],
  [21, 23, 'Catalytic Polymer',     '#cc7799', FX.HEAT,    'Self-replicating catalytic polymer chain'],
  [21, 24, 'Stable Polymer Block',  '#88bb88', FX.FIZZ,    'Ultra-stable structural polymer'],
  [22, 23, 'Acid-Catalyst Bomb',    '#ee5555', FX.FLASH,   'Explosive acid-catalyst combination — DANGER'],
  [22, 24, 'Neutralized Acid',      '#99aa88', FX.FIZZ,    'Safely neutralized acid compound'],
  [23, 24, 'Balanced Catalyst',     '#aa8899', FX.GLOW,    'Perfectly balanced catalyst-stabilizer compound'],
];

// ── Build reaction lookup map ──
const REACTION_MAP = {};
for (const r of REACTION_DATA) {
  const key = r[0] < r[1] ? `${r[0]}-${r[1]}` : `${r[1]}-${r[0]}`;
  REACTION_MAP[key] = {
    output: r[2],
    color: r[3],
    effect: r[4],
    desc: r[5],
    inputIds: [r[0], r[1]],
  };
}

// ── Tier 2 output compounds (indexed by name for further reactions) ──
const TIER2_COMPOUNDS = {};
let tier2Id = 100;
for (const r of REACTION_DATA) {
  if (!TIER2_COMPOUNDS[r[2]]) {
    TIER2_COMPOUNDS[r[2]] = {
      id: tier2Id++,
      name: r[2],
      color: r[3],
      cat: 'derived',
      tier: 2,
    };
  }
}

// ── Some tier 2 + base reactions for chaining ──
const TIER2_REACTION_DATA = [
  ['Vital Serum', 0, 'Concentrated Vitality', '#00ff44', FX.GLOW, 'Double-strength healing serum'],
  ['Vital Serum', 23, 'Hyper Heal Catalyst', '#ff44aa', FX.FLASH, 'Instant full-heal compound'],
  ['Fungal Steel', 5, 'Reinforced Fungal Plate', '#776644', FX.HEAT, 'Triple-layered bio-metal armor'],
  ['Plasma Crystal Shard', 16, 'Quantum Plasma Gem', '#aa88ff', FX.FLASH, 'Ultimate energy crystal'],
  ['Mutagenic Paste', 22, 'Hyper Mutagen', '#ff4444', FX.SMOKE, 'Dangerously unstable mutagen'],
  ['Luminescent Sap', 3, 'Radiant Sap', '#88ffee', FX.GLOW, 'Blinding bioluminescent fluid'],
  ['Protein Matrix', 4, 'Dense Protein Block', '#44cc44', FX.BUBBLE, 'Ultra-dense structural protein'],
  ['Ferrosilicate Alloy', 7, 'Tri-Metal Alloy', '#aabb99', FX.HEAT, 'Three-metal superalloy'],
  ['Plasma Neutron Core', 18, 'Resonant Plasma Engine', '#ff88cc', FX.FLASH, 'Plasma engine power core'],
  ['Quantum Crystal Matrix', 10, 'Quantum Plasma Matrix', '#bb77ff', FX.FLASH, 'Ultimate quantum power source'],
  ['Dense Plasma Gel', 24, 'Stable Plasma Block', '#9977cc', FX.GLOW, 'Safe solid plasma'],
  ['Acid-Catalyst Bomb', 24, 'Controlled Detonation', '#cc8877', FX.FIZZ, 'Stabilized explosive compound'],
  ['Nano-Fiber Composite', 15, 'Nano-Crystal Fiber', '#88ccee', FX.CRYSTAL, 'Crystal-reinforced nanofiber'],
  ['Copper Lithium Battery', 14, 'Electron Battery Plus', '#88aaee', FX.SPARK, 'Enhanced electron battery'],
  ['Lithium Plasma Fire', 24, 'Controlled Plasma Flame', '#dd88aa', FX.HEAT, 'Safely burning plasma fire'],
  ['Iron Spore Composite', 10, 'Plasma Spore Armor', '#bb6699', FX.GLOW, 'Living plasma-spore armor plate'],
  ['Bio-Glass Fiber', 20, 'Nano Bio-Glass', '#99ccaa', FX.CRYSTAL, 'Nanoscale bio-glass material'],
  ['Synthetic Chlorophyll', 15, 'Crystal Chlorophyll', '#44ee88', FX.GLOW, 'Crystal-enhanced photosynthesis'],
  ['Peptide Accelerant', 23, 'Hyper Peptide Catalyst', '#ee88aa', FX.FLASH, 'Instant protein synthesis'],
  ['Neutralized Acid', 1, 'Enzyme Buffer', '#88cc88', FX.BUBBLE, 'pH-balanced enzyme solution'],
];

// Build tier 2 reaction map
const TIER2_REACTION_MAP = {};
for (const r of TIER2_REACTION_DATA) {
  const t2 = TIER2_COMPOUNDS[r[0]];
  if (!t2) continue;
  const key = `t2_${t2.id}-${r[1]}`;
  TIER2_REACTION_MAP[key] = {
    output: r[2],
    color: r[3],
    effect: r[4],
    desc: r[5],
    inputIds: [t2.id, r[1]],
  };
  // Also register the output as tier 3
  if (!TIER2_COMPOUNDS[r[2]]) {
    TIER2_COMPOUNDS[r[2]] = {
      id: tier2Id++,
      name: r[2],
      color: r[3],
      cat: 'derived',
      tier: 3,
    };
  }
}

// ══════════════════════════════════════════════════════════════════════
// Public API
// ══════════════════════════════════════════════════════════════════════

export function getCompound(id) {
  if (id < 25) return BASE_COMPOUNDS[id];
  // Search tier 2
  for (const c of Object.values(TIER2_COMPOUNDS)) {
    if (c.id === id) return c;
  }
  return null;
}

export function getCompoundByName(name) {
  const base = BASE_COMPOUNDS.find(c => c.name === name);
  if (base) return base;
  return TIER2_COMPOUNDS[name] || null;
}

export function getReaction(id1, id2) {
  // Try base + base
  const a = Math.min(id1, id2);
  const b = Math.max(id1, id2);
  const key = `${a}-${b}`;
  if (REACTION_MAP[key]) return REACTION_MAP[key];

  // Try tier2 + base (either direction)
  const t2key1 = `t2_${id1}-${id2}`;
  if (TIER2_REACTION_MAP[t2key1]) return TIER2_REACTION_MAP[t2key1];
  const t2key2 = `t2_${id2}-${id1}`;
  if (TIER2_REACTION_MAP[t2key2]) return TIER2_REACTION_MAP[t2key2];

  return null; // "Nothing appears to be happening here..."
}

export function getAllReactions() {
  return { ...REACTION_MAP, ...TIER2_REACTION_MAP };
}

export function getAllCompounds() {
  return [...BASE_COMPOUNDS, ...Object.values(TIER2_COMPOUNDS)];
}

export const TOTAL_BASE_REACTIONS = REACTION_DATA.length;
export const TOTAL_TIER2_REACTIONS = TIER2_REACTION_DATA.length;
export const TOTAL_REACTIONS = REACTION_DATA.length + TIER2_REACTION_DATA.length;
