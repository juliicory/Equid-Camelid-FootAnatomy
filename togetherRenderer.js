import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { MESH_LABELS as HORSE_LABELS, MESH_COLORS as HORSE_COLORS, MESH_MATERIALS as HORSE_MATERIALS,
         getMeshLabel as getHorseLabel, getMeshDescription as getHorseDesc } from './horseDescriptions.js';
import { MESH_LABELS as CAMEL_LABELS, MESH_COLORS as CAMEL_COLORS, MESH_MATERIALS as CAMEL_MATERIALS,
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
  ['sesamoid',                ['metatarsus']],
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
// Per key, store one mesh per mode: { crossSection, full }
const horseMeshesByKey = new Map(); // key → { crossSection: Mesh|null, full: Mesh|null }
const camelMeshesByKey = new Map();
const meshToKey        = new Map(); // Mesh → keyword
const meshSource       = new Map(); // Mesh → 'horse' | 'camel'

const horseGroups = {
  crossSection: { skeleton: [], softTissue: [] },
  full:         { skeleton: [], softTissue: [] },
};
const camelGroups = {
  crossSection: { skeleton: [], softTissue: [] },
  full:         { skeleton: [], softTissue: [] },
};

// ── Filter helpers ───────────────────────────────────────────
function readFilter() {
  return {
    skeleton:   document.querySelector('input[name="filter-skeleton"]')?.checked  ?? true,
    softTissue: document.querySelector('input[name="filter-softtissue"]')?.checked ?? true,
    full:       document.querySelector('input[name="filter-full"]')?.checked       ?? false,
  };
}

function syncFilter() {
  const f = readFilter();

  horseCrossGroup.visible = !f.full;
  horseFullGroup.visible  =  f.full;
  camelCrossGroup.visible = !f.full;
  camelFullGroup.visible  =  f.full;

  const hg = f.full ? horseGroups.full : horseGroups.crossSection;
  const cg = f.full ? camelGroups.full : camelGroups.crossSection;

  hg.skeleton.forEach(m   => { m.visible = f.skeleton; });
  hg.softTissue.forEach(m => { m.visible = f.softTissue; });
  cg.skeleton.forEach(m   => { m.visible = f.skeleton; });
  cg.softTissue.forEach(m => { m.visible = f.softTissue; });
}

document.querySelectorAll('input[name^="filter-"]').forEach(el => {
  el.addEventListener('change', syncFilter);
});

// ── Longest-key helpers ──────────────────────────────────────
function findBestKey(labelMap, meshName) {
  const lower = (meshName || '').toLowerCase();
  let bestKey = null;
  for (const key of labelMap.keys()) {
    if (lower.includes(key) && key.length > (bestKey?.length ?? 0)) bestKey = key;
  }
  return bestKey;
}

function applyMaterial(colorMap, materialMap, child) {
  const lower = child.name.toLowerCase();
  let bestKey = null, bestColor = null;
  for (const [key, color] of colorMap) {
    if (lower.includes(key) && key.length > (bestKey?.length ?? 0)) {
      bestKey = key; bestColor = color;
    }
  }
  if (!bestColor) return;
  const mat = (bestKey && materialMap.get(bestKey)) ?? { shininess: 50 };
  child.material = new THREE.MeshPhongMaterial({
    color: bestColor,
    transparent: (mat.opacity ?? 1) < 1,
    ...mat,
  });
}

// ── Public API ───────────────────────────────────────────────

export function applyRotation(dx, dy) {
  horseGroup.rotation.y += dx;
  horseGroup.rotation.x += dy;
  camelGroup.rotation.y += dx;
  camelGroup.rotation.x += dy;
}

export function getPairedMeshes(mesh) {
  const key    = meshToKey.get(mesh);
  const source = meshSource.get(mesh);
  if (!key || !source) return [];

  const mode = (document.querySelector('input[name="filter-full"]')?.checked ?? false)
    ? 'full' : 'crossSection';

  if (source === 'horse') {
    const cks = MESH_PAIRS.get(key);
    if (!cks) return [];
    return cks.map(ck => camelMeshesByKey.get(ck)?.[mode] ?? null).filter(Boolean);
  } else {
    const hks = REVERSE_PAIRS.get(key);
    if (!hks) return [];
    return hks.map(hk => horseMeshesByKey.get(hk)?.[mode] ?? null).filter(Boolean);
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

const horseCrossGroup = new THREE.Group();
const horseFullGroup  = new THREE.Group();
horseFullGroup.visible = false;
horseGroup.add(horseCrossGroup, horseFullGroup);

const camelCrossGroup = new THREE.Group();
const camelFullGroup  = new THREE.Group();
camelFullGroup.visible = false;
camelGroup.add(camelCrossGroup, camelFullGroup);

// Placeholders
const mkBox = c => new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshPhongMaterial({ color: c }));
horseCrossGroup.add(mkBox(0x4a8eff));
camelCrossGroup.add(mkBox(0x4affc8));

// ── FBX loading ──────────────────────────────────────────────
function fitAndCenter(fbx) {
  const box    = new THREE.Box3().setFromObject(fbx);
  const center = box.getCenter(new THREE.Vector3());
  const size   = box.getSize(new THREE.Vector3());
  const scale  = 1.6 / Math.max(size.x, size.y, size.z);
  fbx.scale.setScalar(scale);
  fbx.position.copy(center).multiplyScalar(-scale);
}

function clearGroup(group) {
  while (group.children.length) group.remove(group.children[0]);
}

// Register a mesh into the appropriate registry and group arrays
function registerHorseMesh(child, key, mode, groupsData) {
  if (!horseMeshesByKey.has(key)) horseMeshesByKey.set(key, { crossSection: null, full: null });
  horseMeshesByKey.get(key)[mode] = child;
  meshToKey.set(child, key);
  meshSource.set(child, 'horse');

  const isSoftPriority = ['sesamoidanlig'].some(kw => child.name.toLowerCase().includes(kw));
  const isBone = !isSoftPriority && ['cannon','coffin','navicular','pasternlong','pasternshort','sesamoid']
    .some(kw => child.name.toLowerCase().includes(kw));
  groupsData[isBone ? 'skeleton' : 'softTissue'].push(child);
}

function registerCamelMesh(child, key, mode, groupsData) {
  if (!camelMeshesByKey.has(key)) camelMeshesByKey.set(key, { crossSection: null, full: null });
  camelMeshesByKey.get(key)[mode] = child;
  meshToKey.set(child, key);
  meshSource.set(child, 'camel');

  const isBone = ['metatarsus','phal_1','phal_2','phal_3'].some(kw => child.name.toLowerCase().includes(kw));
  groupsData[isBone ? 'skeleton' : 'softTissue'].push(child);
}

const loader = new FBXLoader();

loader.load('./horseCrossSections.fbx', fbx => {
  fitAndCenter(fbx);
  fbx.traverse(child => {
    if (!child.isMesh) return;
    applyMaterial(HORSE_COLORS, HORSE_MATERIALS, child);
    const key = findBestKey(HORSE_LABELS, child.name);
    if (key) registerHorseMesh(child, key, 'crossSection', horseGroups.crossSection);
    meshSource.set(child, 'horse');
  });
  syncFilter();
  clearGroup(horseCrossGroup);
  horseCrossGroup.add(fbx);
});

loader.load('./horseFull.fbx', fbx => {
  fitAndCenter(fbx);
  fbx.traverse(child => {
    if (!child.isMesh) return;
    applyMaterial(HORSE_COLORS, HORSE_MATERIALS, child);
    const key = findBestKey(HORSE_LABELS, child.name);
    if (key) registerHorseMesh(child, key, 'full', horseGroups.full);
    meshSource.set(child, 'horse');
  });
  syncFilter();
  clearGroup(horseFullGroup);
  horseFullGroup.add(fbx);
});

loader.load('./camelCrossSections.fbx', fbx => {
  fitAndCenter(fbx);
  fbx.traverse(child => {
    if (!child.isMesh) return;
    applyMaterial(CAMEL_COLORS, CAMEL_MATERIALS, child);
    const key = findBestKey(CAMEL_LABELS, child.name);
    if (key) registerCamelMesh(child, key, 'crossSection', camelGroups.crossSection);
    meshSource.set(child, 'camel');
  });
  syncFilter();
  clearGroup(camelCrossGroup);
  camelCrossGroup.add(fbx);
});

loader.load('./camelFull.fbx', fbx => {
  fitAndCenter(fbx);
  fbx.traverse(child => {
    if (!child.isMesh) return;
    applyMaterial(CAMEL_COLORS, CAMEL_MATERIALS, child);
    const key = findBestKey(CAMEL_LABELS, child.name);
    if (key) registerCamelMesh(child, key, 'full', camelGroups.full);
    meshSource.set(child, 'camel');
  });
  syncFilter();
  clearGroup(camelFullGroup);
  camelFullGroup.add(fbx);
});
