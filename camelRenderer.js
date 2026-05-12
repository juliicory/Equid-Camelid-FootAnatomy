import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

const SKELETON_KEYWORDS = ['metatarsus', 'phal1', 'phal2', 'phal3', 'phal_1', 'phal_2', 'phal_3'];
const camelGroups = { skeleton: [], softTissue: [] };

// Exported group — index.js adds this to the scene.
// Its contents are managed here (placeholder → FBX).
export const camelObject = new THREE.Group();

const placeholder = new THREE.Mesh(
  new THREE.SphereGeometry(0.8, 48, 48),
  new THREE.MeshPhongMaterial({ color: 0x4affc8, shininess: 70 })
);
camelObject.add(placeholder);

function getCurrentFilter() {
  const checked = document.querySelector('input[name="filter"]:checked');
  return checked ? checked.value : 'both';
}

function applyMeshFilter(value) {
  const showBone = value === 'skeleton'   || value === 'both';
  const showSoft = value === 'softTissue' || value === 'both';
  camelGroups.skeleton.forEach(m => { m.visible = showBone; });
  camelGroups.softTissue.forEach(m => { m.visible = showSoft; });
}

document.querySelectorAll('input[name="filter"]').forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.checked) applyMeshFilter(radio.value);
  });
});

const loader = new FBXLoader();
loader.load('./camelCrossSections.fbx', (fbx) => {
  // Fit into ~2-unit bounding box and center
  const box = new THREE.Box3().setFromObject(fbx);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const scale = 2.0 / Math.max(size.x, size.y, size.z);
  fbx.scale.setScalar(scale);
  fbx.position.copy(center).multiplyScalar(-scale);

  // Categorize meshes
  fbx.traverse(child => {
    if (!child.isMesh) return;
    const name = child.name.toLowerCase();
    const isBone = SKELETON_KEYWORDS.some(kw => name.includes(kw));
    (isBone ? camelGroups.skeleton : camelGroups.softTissue).push(child);
  });

  applyMeshFilter(getCurrentFilter());

  camelObject.remove(placeholder);
  camelObject.add(fbx);
});
