// ── Central data file for all camel mesh metadata ───────────
// Edit labels, colors, and descriptions here.
// Keys are case-insensitive substrings of the mesh's .name in the FBX.

export const MESH_LABELS = new Map([
  // Skeleton
  ['metatarsus',        'Metatarsus'],
  ['phal_1',            'Proximal Phalanx'],
  ['phal_2',            'Middle Phalanx'],
  ['phal_3',            'Distal Phalanx'],
  // Soft tissue
  ['flexordeep',        'Deep Digital Flexor'],
  ['flexorsuperficial', 'Superficial Digital Flexor'],
  ['nail',              'Nail'],
  ['padaxial',          'Axial Digital Cushion'],
  ['padabaxial',        'Abaxial Digital Cushion'],
  ['padmiddle',         'Middle Digital Cushion'],
  ['solecamel',         'Sole Pad'],
  ['soleepidermis',     'Sole (Epidermal Layer)'],
]);

export const MESH_COLORS = new Map([
  // Skeleton
  ['metatarsus',        '#e8dcc8'],
  ['phal_1',            '#d4bc96'],
  ['phal_2',            '#c8a96e'],
  ['phal_3',            '#baa07c'],
  // Soft tissue
  ['flexordeep',        '#f5e8d0'],
  ['flexorsuperficial', '#f0e0c8'],
  ['nail',              '#4a3728'],
  ['padaxial',          '#e8b4a0'],
  ['padabaxial',        '#e8b4a0'],
  ['padmiddle',         '#e0a898'],
  ['solecamel',         '#d4c090'],
  ['soleepidermis',     '#e8d4a8'],
]);

export const MESH_DESCRIPTIONS = new Map([
  // Skeleton
  ['metatarsus',        ''],
  ['phal_1',            ''],
  ['phal_2',            ''],
  ['phal_3',            ''],
  // Soft tissue
  ['flexordeep',        ''],
  ['flexorsuperficial', ''],
  ['nail',              ''],
  ['padaxial',          ''],
  ['padabaxial',        ''],
  ['padmiddle',         ''],
  ['solecamel',         ''],
  ['soleepidermis',     ''],
]);

function lookup(map, meshName) {
  const lower = (meshName || '').toLowerCase();
  for (const [key, value] of map) {
    if (lower.includes(key)) return value;
  }
  return null;
}

export function getMeshLabel(meshName) {
  return lookup(MESH_LABELS, meshName) ?? meshName ?? 'Body Part Name';
}

export function getMeshDescription(meshName) {
  return lookup(MESH_DESCRIPTIONS, meshName) ?? '';
}
