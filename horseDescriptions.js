// ── Central data file for all horse mesh metadata ───────────
// Edit labels, colors, and descriptions here.
// Keys are case-insensitive substrings of the mesh's .name in the FBX.
// Ordering within each map does not matter — the longest matching key always wins.

export const MESH_LABELS = new Map([
  // Skeleton
  ['cannon',                  'Cannon Bone'],
  ['coffin',                  'Coffin Bone'],
  ['navicular',               'Navicular Bone'],
  ['pasternlong',             'Long Pastern'],
  ['pasternshort',            'Short Pastern'],
  ['sesamoid',                'Proximal Sesamoid Bones'],
  // Soft tissue
  ['digitalcushion',          'Digital Cushion'],
  ['flexordeep',              'Deep Digital Flexor'],
  ['flexorsuperficial',       'Superficial Digital Flexor'],
  ['frog',                    'Frog'],
  ['laminalcorium',           'Laminal Corium'],
  ['sesamoidanlig','Superficial Sesamoidan Ligament'],
  ['sole',                    'Sole'],
]);

// ── Material presets ─────────────────────────────────────────
// Define property objects here, then assign them by name in MESH_MATERIALS.
// Supported keys: shininess (0–100), opacity (0–1), transparent (bool),
//                 wireframe (bool), flatShading (bool)
const BONE   = { shininess: 80 };
const TENDON = { shininess: 40, specular: '#a9a582' };
const LIG    = { shininess: 40, specular: '#a9a582' };
const SOFT   = { shininess: 20 };
const FROG   = { shininess: 15 };
const SOLE   = { shininess: 10 };

export const MESH_MATERIALS = new Map([
  // Skeleton
  ['cannon',                  BONE],
  ['coffin',                  BONE],
  ['navicular',               BONE],
  ['pasternlong',             BONE],
  ['pasternshort',            BONE],
  ['sesamoid',                BONE],
  ['sesamoidanlig',LIG],
  // Soft tissue
  ['digitalcushion',          SOFT],
  ['flexordeep',              TENDON],
  ['flexorsuperficial',       TENDON],
  ['frog',                    FROG],
  ['laminalcorium',           SOFT],
  ['sole',                    SOLE],
]);

export const MESH_COLORS = new Map([
  // Skeleton
  ['cannon',                  '#94bef3'],
  ['coffin',                  '#ffcdba'],
  ['navicular',               '#cea8ff'],
  ['pasternlong',             '#bae599'],
  ['pasternshort',            '#f7f0b1'],
  ['sesamoid',                '#94bef3'],
  // Soft tissue
  ['digitalcushion',          '#e8b4a0'],
  ['flexordeep',              '#9f36dc'],
  ['flexorsuperficial',       '#cd990a'],
  ['frog',                    '#454440'],
  ['laminalcorium',           '#e87878'],
  ['sesamoidanlig','#70c67d'],
  ['sole',                    '#cbcbcb'],
]);

export const MESH_DESCRIPTIONS = new Map([
  // Skeleton
  ['cannon',                  'Early digits fused together into a single bone. Splint bones, vestigial remnants of other digits, are sometimes evident on the sides of the cannon bone. '],
  ['coffin',                  '3rd phalange or distal phalanx. Highly vascularized which helps with shock absorption, as well as providing blood supply for laminae growth since hooves grow constantly like nails.'],
  ['navicular',               'Also known as thedistal sesamoid bone. It acts as a fulcrum for the DDF, maintaining its angle of entry into the coffin bone and provides leverage during motion. The bone can degrade and cause issues such as navicular syndrome. '],
  ['pasternlong',             '1st phalange or proximal phalanx.'],
  ['pasternshort',            '2nd phalange or middle phalanx.'],
  ['sesamoid',                'Provides an anchor for ligaments as well as additional shock absorption for the fetlock '],
  // Soft tissue
  ['digitalcushion',          'Provides shock absorption and helps hemodynamic system, pumping blood back up the leg. Composed of collagen bundles, adipose tissue, elastic fiber profiles, blood vessels, as well as nerve fascicles. Creates rebound effect when pressed down, which is good for energy conservation over long distances (wild horses can roam 10-40 miles or 15-65 km a day!)'],
  ['flexordeep',              'Stabilises joints and keeps joints from hyperextending.'],
  ['flexorsuperficial',       'Acts as a spring to store energy by stretching on landing and coiling to release energy. Also provides stability to fetlock and helps prevent hyperextension. The SSF has slits where the DDF passes through to the inside. '],
  ['frog',                    'The frog aids in shock absorption and maintaining traction on terrain. It is keratinised (like nails) but elastic. This also helps with pumping blood and stimulating the venous return of the digit, helping the foot act as a vascular pump to send blood back up the leg.'],
  ['laminalcorium',           'The Laminal corium is essentially a wall of blood vessels around the hoof. It provides blood supply for the constantly growing hoof, and contains MSCs (similar to stem cells) for regeneration.'],
  ['sesamoidanlig','Prevents overextension when the foot lands, anchored to sesamoid bones.'],
  ['sole',                    'Helps distribute weight due to its arched shape. Also acts as a protective barrier to coffin bone and digital cushion. '],
]);

// Longest key match wins — more specific keys always beat shorter overlapping ones
// (e.g. 'sesamoidanlig' beats 'sesamoid' for the ligament mesh).
function lookup(map, meshName) {
  const lower = (meshName || '').toLowerCase();
  let bestKey = null;
  let bestValue = null;
  for (const [key, value] of map) {
    if (lower.includes(key) && key.length > (bestKey?.length ?? 0)) {
      bestKey = key;
      bestValue = value;
    }
  }
  return bestValue;
}

export function getMeshLabel(meshName) {
  return lookup(MESH_LABELS, meshName) ?? meshName ?? 'Body Part Name';
}

export function getMeshDescription(meshName) {
  return lookup(MESH_DESCRIPTIONS, meshName) ?? '';
}
