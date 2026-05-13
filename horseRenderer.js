import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { MESH_COLORS, MESH_MATERIALS } from './horseDescriptions.js';

// 'sesamoidanlig' is checked first to prevent the ligament being mis-classified as bone.
const SOFT_TISSUE_PRIORITY = ['sesamoidanlig'];
const SKELETON_KEYWORDS    = ['cannon', 'coffin', 'navicular', 'pasternlong', 'pasternshort', 'sesamoid'];

const groups = {
  crossSection: { skeleton: [], softTissue: [] },
  full:         { skeleton: [], softTissue: [] },
};

// ── Exported group — index.js adds this to the scene ────────
export const horseObject = new THREE.Group();

const crossGroup = new THREE.Group();
const fullGroup  = new THREE.Group();
fullGroup.visible = false;
horseObject.add(crossGroup, fullGroup);

// Placeholder while cross-section FBX loads
const placeholder = new THREE.Mesh(
  new THREE.BoxGeometry(1.2, 1.2, 1.2),
  new THREE.MeshPhongMaterial({ color: 0x4a8eff, shininess: 70 })
);
crossGroup.add(placeholder);

// ── Filter ──────────────────────────────────────────────────
function readFilter() {
  return {
    skeleton:   document.querySelector('input[name="filter-skeleton"]')?.checked  ?? true,
    softTissue: document.querySelector('input[name="filter-softtissue"]')?.checked ?? true,
    full:       document.querySelector('input[name="filter-full"]')?.checked       ?? false,
  };
}

function syncFilter() {
  const f = readFilter();
  crossGroup.visible = !f.full;
  fullGroup.visible  =  f.full;
  const g = f.full ? groups.full : groups.crossSection;
  g.skeleton.forEach(m   => { m.visible = f.skeleton; });
  g.softTissue.forEach(m => { m.visible = f.softTissue; });
}

document.querySelectorAll('input[name^="filter-"]').forEach(el => {
  el.addEventListener('change', syncFilter);
});

// ── Material application ────────────────────────────────────
function applyMeshMaterial(child) {
  const lower = child.name.toLowerCase();
  let bestKey = null, bestColor = null;
  for (const [key, color] of MESH_COLORS) {
    if (lower.includes(key) && key.length > (bestKey?.length ?? 0)) {
      bestKey = key; bestColor = color;
    }
  }
  if (!bestColor) return;
  const mat = MESH_MATERIALS.get(bestKey) ?? { shininess: 50 };
  child.material = new THREE.MeshPhongMaterial({
    color: bestColor,
    transparent: (mat.opacity ?? 1) < 1,
    ...mat,
  });
}

function categorize(name) {
  const isSoftPriority = SOFT_TISSUE_PRIORITY.some(kw => name.includes(kw));
  const isBone = !isSoftPriority && SKELETON_KEYWORDS.some(kw => name.includes(kw));
  return isBone ? 'skeleton' : 'softTissue';
}

// ── FBX loading ─────────────────────────────────────────────
function loadIntoGroup(url, groupsKey, container) {
  const loader = new FBXLoader();
  loader.load(url, fbx => {
    const box    = new THREE.Box3().setFromObject(fbx);
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    const scale  = 2.0 / Math.max(size.x, size.y, size.z);
    fbx.scale.setScalar(scale);
    fbx.position.copy(center).multiplyScalar(-scale);

    fbx.traverse(child => {
      if (!child.isMesh) return;
      applyMeshMaterial(child);
      const cat = categorize(child.name.toLowerCase());
      groups[groupsKey][cat].push(child);
    });

    syncFilter();
    while (container.children.length) container.remove(container.children[0]);
    container.add(fbx);
  });
}

loadIntoGroup('./horseCrossSections.fbx', 'crossSection', crossGroup);
loadIntoGroup('./horseFull.fbx',          'full',         fullGroup);
