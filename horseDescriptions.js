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
  ['sesamoid',                'Sesamoid'],
  // Soft tissue
  ['digitalcushion',          'Digital Cushion'],
  ['flexordeep',              'Deep Digital Flexor'],
  ['flexorsuperficial',       'Superficial Digital Flexor'],
  ['frog',                    'Frog'],
  ['laminalcorium',           'Laminal Corium'],
  ['superficialsesamoidanlig','Superficial Sesamoidan Ligament'],
  ['sole',                    'Sole'],
]);

export const MESH_COLORS = new Map([
  // Skeleton
  ['cannon',                  '#e8dcc8'],
  ['coffin',                  '#dfd0b8'],
  ['navicular',               '#d8c8b0'],
  ['pasternlong',             '#d4bc96'],
  ['pasternshort',            '#ceb48e'],
  ['sesamoid',                '#c8aa84'],
  // Soft tissue
  ['digitalcushion',          '#e8b4a0'],
  ['flexordeep',              '#f5e8d0'],
  ['flexorsuperficial',       '#f0e0c8'],
  ['frog',                    '#454440'],
  ['laminalcorium',           '#e87878'],
  ['superficialsesamoidanlig','#e8d8a0'],
  ['sole',                    '#d4c090'],
]);

export const MESH_DESCRIPTIONS = new Map([
  // Skeleton
  ['cannon',                  ''],
  ['coffin',                  ''],
  ['navicular',               ''],
  ['pasternlong',             ''],
  ['pasternshort',            ''],
  ['sesamoid',                ''],
  // Soft tissue
  ['digitalcushion',          ''],
  ['flexordeep',              ''],
  ['flexorsuperficial',       ''],
  ['frog',                    ''],
  ['laminalcorium',           ''],
  ['superficialsesamoidanlig',''],
  ['sole',                    ''],
]);

// Longest key match wins — more specific keys always beat shorter overlapping ones
// (e.g. 'superficialsesamoidanlig' beats 'sesamoid' for the ligament mesh).
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
