import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { MESH_LABELS as HORSE_LABELS, MESH_COLORS as HORSE_COLORS,
         getMeshLabel as getHorseLabel, getMeshDescription as getHorseDesc } from './horseDescriptions.js';
import { MESH_LABELS as CAMEL_LABELS, MESH_COLORS as CAMEL_COLORS,
         getMeshLabel as getCamelLabel, getMeshDescription as getCamelDesc } from './camelDescriptions.js';

// ── Pair definitions ─────────────────────────────────────────
// Maps a horse mesh keyword → array of camel mesh keywords, or null for no pair.
// Use an array to map one part to multiple counterparts on the other model.
// Keys must match entries in horseDescriptions MESH_LABELS.
export const MESH_PAIRS = new Map([
  // Skeleton
  ['cannon',                  ['metatarsus']],
  ['coffin',                  ['phal_3']],
  ['navicular',               null],
  ['pasternlong',             ['phal_1']],
  ['pasternshort',            ['phal_2']],
  ['sesamoid',                null],
  ['sesamoidanlig',           null],
  // Soft tissue
  ['digitalcushion',          ['padmiddle', 'padaxial', 'padabaxial']],
  ['flexordeep',              ['flexordeep']],
  ['flexorsuperficial',       ['flexorsuperficial']],
  ['frog',                    null],
  ['laminalcorium',           null],
  ['sole',                    ['solecamel']],
]);

// Reverse map: camel keyword → horse keyword[] (auto-computed)
const REVERSE_PAIRS = new Map();
for (const [hk, cks] of MESH_PAIRS) {
  if (!cks) continue;
  for (const ck of cks) {
    if (!REVERSE_PAIRS.has(ck)) REVERSE_PAIRS.set(ck, []);
    REVERSE_PAIRS.get(ck).push(hk);
  }
}

// ── Internal mesh registries ─────────────────────────────────
const horseMeshByKey = new Map(); // horse keyword → THREE.Mesh
const camelMeshByKey = new Map(); // camel keyword → THREE.Mesh
const meshToKey      = new Map(); // THREE.Mesh   → keyword
const meshSource     = new Map(); // THREE.Mesh   → 'horse' | 'camel'

// Longest-key match against a label Map's keys
function findBestKey(labelMap, meshName) {
  const lower = (meshName || '').toLowerCase();
  let bestKey = null;
  for (const key of labelMap.keys()) {
    if (lower.includes(key) && key.length > (bestKey?.length ?? 0)) bestKey = key;
  }
  return bestKey;
}

// Apply longest-match color from a color Map
function applyColor(colorMap, child) {
  const lower = child.name.toLowerCase();
  let bestKey = null, bestColor = null;
  for (const [key, color] of colorMap) {
    if (lower.includes(key) && key.length > (bestKey?.length ?? 0)) {
      bestKey = key; bestColor = color;
    }
  }
  if (bestColor) child.material = new THREE.MeshPhongMaterial({ color: bestColor, shininess: 50 });
}

// ── Public API ───────────────────────────────────────────────

// Applies the same rotation delta to both models in local space.
// Called by index.js drag handler when the Both tab is active.
export function applyRotation(dx, dy) {
  horseGroup.rotation.y += dx;
  horseGroup.rotation.x += dy;
  camelGroup.rotation.y += dx;
  camelGroup.rotation.x += dy;
}

// Returns all paired meshes from the opposite FBX (array, may be empty).
export function getPairedMeshes(mesh) {
  const key    = meshToKey.get(mesh);
  const source = meshSource.get(mesh);
  if (!key || !source) return [];

  if (source === 'horse') {
    const cks = MESH_PAIRS.get(key);
    if (!cks) return [];
    return cks.map(ck => camelMeshByKey.get(ck)).filter(Boolean);
  } else {
    const hks = REVERSE_PAIRS.get(key);
    if (!hks) return [];
    return hks.map(hk => horseMeshByKey.get(hk)).filter(Boolean);
  }
}

export function getMeshLabel(mesh) {
  const source = meshSource.get(mesh);
  if (source === 'horse') return getHorseLabel(mesh.name);
  if (source === 'camel') return getCamelLabel(mesh.name);
  return mesh.name || 'Body Part Name';
}

export function getMeshDescription(mesh) {
  const source = meshSource.get(mesh);
  if (source === 'horse') return getHorseDesc(mesh.name);
  if (source === 'camel') return getCamelDesc(mesh.name);
  return '';
}

// ── Scene ────────────────────────────────────────────────────
export const togetherObject = new THREE.Group();

const horseGroup = new THREE.Group();
const camelGroup = new THREE.Group();
horseGroup.position.x = -1.2;
camelGroup.position.x =  1.2;
togetherObject.add(horseGroup, camelGroup);

// Placeholder boxes while FBXs load
const makePlaceholder = color => new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshPhongMaterial({ color })
);
horseGroup.add(makePlaceholder(0x4a8eff));
camelGroup.add(makePlaceholder(0x4affc8));

// ── FBX loading ──────────────────────────────────────────────
function fitAndCenter(fbx) {
  const box   = new THREE.Box3().setFromObject(fbx);
  const center = box.getCenter(new THREE.Vector3());
  const size   = box.getSize(new THREE.Vector3());
  const scale  = 1.6 / Math.max(size.x, size.y, size.z); // slightly smaller for side-by-side
  fbx.scale.setScalar(scale);
  fbx.position.copy(center).multiplyScalar(-scale);
}

function clearGroup(group) {
  while (group.children.length) group.remove(group.children[0]);
}

const loader = new FBXLoader();

loader.load('./horseCrossSections.fbx', fbx => {
  fitAndCenter(fbx);
  fbx.traverse(child => {
    if (!child.isMesh) return;
    applyColor(HORSE_COLORS, child);
    const key = findBestKey(HORSE_LABELS, child.name);
    if (key) { horseMeshByKey.set(key, child); meshToKey.set(child, key); }
    meshSource.set(child, 'horse');
  });
  clearGroup(horseGroup);
  horseGroup.add(fbx);
});

loader.load('./camelCrossSections.fbx', fbx => {
  fitAndCenter(fbx);
  fbx.traverse(child => {
    if (!child.isMesh) return;
    applyColor(CAMEL_COLORS, child);
    const key = findBestKey(CAMEL_LABELS, child.name);
    if (key) { camelMeshByKey.set(key, child); meshToKey.set(child, key); }
    meshSource.set(child, 'camel');
  });
  clearGroup(camelGroup);
  camelGroup.add(fbx);
});
