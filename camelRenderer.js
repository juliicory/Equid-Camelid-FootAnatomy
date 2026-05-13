import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { MESH_COLORS, MESH_MATERIALS } from './camelDescriptions.js';

const SKELETON_KEYWORDS = ['metatarsus', 'phal_1', 'phal_2', 'phal_3'];

const groups = {
  crossSection: { skeleton: [], softTissue: [] },
  full:         { skeleton: [], softTissue: [] },
};

// ── Exported group — index.js adds this to the scene ────────
export const camelObject = new THREE.Group();

const crossGroup = new THREE.Group();
const fullGroup  = new THREE.Group();
fullGroup.visible = false;
camelObject.add(crossGroup, fullGroup);

// Placeholder while cross-section FBX loads
const placeholder = new THREE.Mesh(
  new THREE.SphereGeometry(0.8, 48, 48),
  new THREE.MeshPhongMaterial({ color: 0x4affc8, shininess: 70 })
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
      const name  = child.name.toLowerCase();
      const isBone = SKELETON_KEYWORDS.some(kw => name.includes(kw));
      (isBone ? groups[groupsKey].skeleton : groups[groupsKey].softTissue).push(child);
    });

    syncFilter();
    while (container.children.length) container.remove(container.children[0]);
    container.add(fbx);
  });
}

loadIntoGroup('./camelCrossSections.fbx', 'crossSection', crossGroup);
loadIntoGroup('./camelFull.fbx',          'full',         fullGroup);
