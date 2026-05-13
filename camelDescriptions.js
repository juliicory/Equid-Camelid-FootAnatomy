// ── Central data file for all camel mesh metadata ───────────
// Edit labels, colors, and descriptions here.
// Keys are case-insensitive substrings of the mesh's .name in the FBX.

export const MESH_LABELS = new Map([
  // Skeleton
  ['metatarsus',        'Metatarsus + Proximal Sesamoid Bones'],
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

// ── Material presets ─────────────────────────────────────────
// Define property objects here, then assign them by name in MESH_MATERIALS.
// Supported keys: shininess (0–100), opacity (0–1), transparent (bool),
//                 wireframe (bool), flatShading (bool)
const BONE       = { shininess: 80 };
const TENDON     = { shininess: 40, specular: '#d2cdac'};
const PAD        = { shininess: 15 };
const PAD_GLOSSY = { shininess: 70, specular: '#aaaaaa' };
const NAIL       = { shininess: 60 };
const SOLE       = { shininess: 10 };

export const MESH_MATERIALS = new Map([
  // Skeleton
  ['metatarsus',        BONE],
  ['phal_1',            BONE],
  ['phal_2',            BONE],
  ['phal_3',            BONE],
  // Soft tissue
  ['flexordeep',        TENDON],
  ['flexorsuperficial', TENDON],
  ['nail',              NAIL],
  ['padaxial',          PAD_GLOSSY],
  ['padabaxial',        PAD_GLOSSY],
  ['padmiddle',         PAD_GLOSSY],
  ['solecamel',         SOLE],
  ['soleepidermis',     SOLE],
]);

export const MESH_COLORS = new Map([
  // Skeleton
  ['metatarsus',        '#94bef3'],
  ['phal_1',            '#bae599'],
  ['phal_2',            '#f7f0b1'],
  ['phal_3',            '#ffcdba'],
  // Soft tissue
  ['flexordeep',        '#9f36dc'],
  ['flexorsuperficial', '#cd990a'],
  ['nail',              '#454440'],
  ['padaxial',          '#ecc8bd'],
  ['padabaxial',        '#ecc8bd'],
  ['padmiddle',         '#e8b4a0'],
  ['solecamel',         '#cbcbcb'],
  ['soleepidermis',     '#d4c090'],
]);

export const MESH_DESCRIPTIONS = new Map([
  // Skeleton
  ['metatarsus',        'Composed of two digits fused together during evolution. It branches into two at the bottom for separate phalanges. The proximal sesamoid bones on each bifurcated end help provide support and an anchor for ligaments. '],
  ['phal_1',            '1st phalange or proximal phalanx.'],
  ['phal_2',            'Camels do not have distal sesamoid (navicular) the same way that horses do, likely because the position of the joints does not require the extra leverage. '],
  ['phal_3',            '3rd phalange or distal phalanx. Unlike horses, the 3rd phalange is not as specialized. Camels bear weight on both this and the middle phalanx, not just the distal phalanx.'],
  // Soft tissue
  ['flexordeep',        'Stabilises joints and keeps joints from hyperextending.'],
  ['flexorsuperficial', 'The SDF bifurcates in camels. it stabilises joints and keeps from hyperextending the leg. Despite the bifurcation, it still has holes to pass DDF to inside of leg, just duplicated for each phalange.'],
  ['nail',              'Camels have v-shaped, keratinised nails. They also grow throughout their lives and can be trimmed or worn down, but do not really bear weight the way a hoof does.'],
  ['padaxial',          'The axial (inner) pad is slightly thicker as they also have to support the interdigital septum, the space between the two toes.'],
  ['padabaxial',        'Despite the presence of the additional outer fat pads, camels distribute pressure evenly throughout their feet, despite their natural ‘pacing’ gait, which uses both legs from one side at a time. '],
  ['padmiddle',         'Fat pads are composed of a collagenous outer layer and filled with a viscous gel-like tissue. This tissue is threaded with elastic fibres which stretch when in contact with the ground and recoil back to their shape, making the foot more adaptable to different speeds and pressure, as well as aiding in energy conservation. '],
  ['solecamel',         'The sole bed is thinner and keratinised like the equine hoof, but flexible. This does mean that injuries in the foot pad tend to be more common than other bone density related issues. '],
  ['soleepidermis',     'Camels have a relatively large foot contact area compared to other two-toed quadrupeds. This is partially due to the environment they live in, as a larger surface area helps to distribute their weight and pressure when walking in soft terrain such as sand, which can be easy to sink into. '],
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
