import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { MESH_COLORS } from './horseDescriptions.js';

// 'sesamoidanlig' is unique to the ligament and is NOT a substring of 'sesamoid',
// so it safely guards against the ligament being mis-classified as bone.
const SOFT_TISSUE_PRIORITY = ['sesamoidanlig'];
const SKELETON_KEYWORDS    = ['cannon', 'coffin', 'navicular', 'pasternlong', 'pasternshort', 'sesamoid'];

const horseGroups = { skeleton: [], softTissue: [] };

// ── Exported group — index.js adds this to the scene ────────
export const horseObject = new THREE.Group();

const placeholder = new THREE.Mesh(
  new THREE.BoxGeometry(1.2, 1.2, 1.2),
  new THREE.MeshPhongMaterial({ color: 0x4a8eff, shininess: 70 })
);
horseObject.add(placeholder);

function getCurrentFilter() {
  const checked = document.querySelector('input[name="filter"]:checked');
  return checked ? checked.value : 'both';
}

function applyMeshFilter(value) {
  const showBone = value === 'skeleton'   || value === 'both';
  const showSoft = value === 'softTissue' || value === 'both';
  horseGroups.skeleton.forEach(m => { m.visible = showBone; });
  horseGroups.softTissue.forEach(m => { m.visible = showSoft; });
}

document.querySelectorAll('input[name="filter"]').forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.checked) applyMeshFilter(radio.value);
  });
});

const loader = new FBXLoader();
loader.load('./horseCrossSections.fbx', (fbx) => {
  const box = new THREE.Box3().setFromObject(fbx);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const scale = 2.0 / Math.max(size.x, size.y, size.z);
  fbx.scale.setScalar(scale);
  fbx.position.copy(center).multiplyScalar(-scale);

  fbx.traverse(child => {
    if (!child.isMesh) return;
    const name = child.name.toLowerCase();

    // Longest key wins — prevents 'sesamoid' matching the ligament's color
    let bestColorKey = null, bestColor = null;
    for (const [key, color] of MESH_COLORS) {
      if (name.includes(key) && key.length > (bestColorKey?.length ?? 0)) {
        bestColorKey = key; bestColor = color;
      }
    }
    if (bestColor) child.material = new THREE.MeshPhongMaterial({ color: bestColor, shininess: 50 });

    const isSoftTissuePriority = SOFT_TISSUE_PRIORITY.some(kw => name.includes(kw));
    const isBone = !isSoftTissuePriority && SKELETON_KEYWORDS.some(kw => name.includes(kw));
    (isBone ? horseGroups.skeleton : horseGroups.softTissue).push(child);
  });

  applyMeshFilter(getCurrentFilter());

  horseObject.remove(placeholder);
  horseObject.add(fbx);
});
