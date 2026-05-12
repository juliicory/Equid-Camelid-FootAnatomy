import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { horseObject } from './horseRenderer.js';
import { camelObject } from './camelRenderer.js';
import { togetherObject, getPairedMeshes, applyRotation,
         getMeshLabel as getTogetherLabel,
         getMeshDescription as getTogetherDesc } from './togetherRenderer.js';
import { getMeshLabel as getHorseLabel, getMeshDescription as getHorseDesc } from './horseDescriptions.js';
import { getMeshLabel as getCamelLabel, getMeshDescription as getCamelDesc } from './camelDescriptions.js';

const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 0);

let currentTheme = 'dark';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
camera.position.z = 3;

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.55));

const key = new THREE.DirectionalLight(0xffffff, 1.3);
key.position.set(5, 8, 5);
scene.add(key);

const fill = new THREE.DirectionalLight(0x6688cc, 0.5);
fill.position.set(-5, -3, -5);
scene.add(fill);

const meshMap = { horse: horseObject, both: togetherObject, camel: camelObject };
let activeView = 'horse';
let activeMesh = horseObject;
scene.add(activeMesh);

// ── Orbit controls ──────────────────────────────────────────
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;

// ── Post-processing ─────────────────────────────────────────
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const outlinePass = new OutlinePass(
  new THREE.Vector2(canvas.clientWidth, canvas.clientHeight),
  scene,
  camera
);
outlinePass.visibleEdgeColor.set('#ff69b4');
outlinePass.hiddenEdgeColor.set('#ff69b4');
outlinePass.edgeStrength = 5;
outlinePass.edgeThickness = 1.5;
outlinePass.edgeGlow = 0;
composer.addPass(outlinePass);
composer.addPass(new OutputPass());

// ── Per-tab label / description lookup ─────────────────────
function getMeshLabel(meshName, mesh) {
  if (activeView === 'horse') return getHorseLabel(meshName);
  if (activeView === 'camel') return getCamelLabel(meshName);
  if (activeView === 'both' && mesh) return getTogetherLabel(mesh);
  return meshName || 'Body Part Name';
}

function getMeshDescription(meshName, mesh) {
  if (activeView === 'horse') return getHorseDesc(meshName);
  if (activeView === 'camel') return getCamelDesc(meshName);
  if (activeView === 'both' && mesh) return getTogetherDesc(mesh);
  return '';
}

// ── Theme toggle ────────────────────────────────────────────
document.getElementById('theme-toggle').addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
});

// ── Selection ───────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedMesh = null;
let mouseDownAt = { x: 0, y: 0 };
const infoHeader = document.getElementById('info-header');
const infoBody   = document.getElementById('info-body');
const defaultInfoBody = infoBody.innerHTML;

function clearSelection() {
  outlinePass.selectedObjects = [];
  selectedMesh = null;
  infoHeader.textContent = 'Body Part Name';
  infoBody.innerHTML = defaultInfoBody;
}

function selectMesh(mesh) {
  selectedMesh = mesh;

  // In Both tab, also highlight all anatomical pairs (if defined)
  const pairs = activeView === 'both' ? getPairedMeshes(mesh) : [];
  outlinePass.selectedObjects = [mesh, ...pairs];

  infoHeader.textContent = getMeshLabel(mesh.name, mesh);
  const desc = getMeshDescription(mesh.name, mesh);
  infoBody.textContent = desc || 'No description added yet.';
}

// ── Both-tab drag rotation ──────────────────────────────────
let bothDragging = false;
let lastDragPos  = { x: 0, y: 0 };

canvas.addEventListener('mousedown', e => {
  mouseDownAt = { x: e.clientX, y: e.clientY };
  if (activeView === 'both') {
    bothDragging = true;
    lastDragPos  = { x: e.clientX, y: e.clientY };
  }
});

canvas.addEventListener('mousemove', e => {
  if (!bothDragging) return;
  const dx = (e.clientX - lastDragPos.x) * 0.007;
  const dy = (e.clientY - lastDragPos.y) * 0.007;
  applyRotation(dx, dy);
  lastDragPos = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener('mouseup',    () => { bothDragging = false; });
canvas.addEventListener('mouseleave', () => { bothDragging = false; });

canvas.addEventListener('click', e => {
  const dx = e.clientX - mouseDownAt.x;
  const dy = e.clientY - mouseDownAt.y;
  if (Math.hypot(dx, dy) > 4) return;

  const rect = canvas.getBoundingClientRect();
  mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
  mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const pickable = [];
  activeMesh.traverse(child => { if (child.isMesh) pickable.push(child); });
  if (activeMesh.isMesh) pickable.push(activeMesh);

  const hits = raycaster.intersectObjects(pickable, false);

  if (hits.length > 0) {
    const hit = hits[0].object;
    if (hit !== selectedMesh) selectMesh(hit);
  } else {
    clearSelection();
  }
});

// ── Nav switching ───────────────────────────────────────────
const HAS_FILTER = new Set(['horse', 'camel']);
// Camera z-distance per tab: Both tab needs to see two models side-by-side
const CAM_Z = { horse: 3, camel: 3, both: 2.75 };

function setFilterVisible(show) {
  document.getElementById('filter-controls').classList.toggle('visible', show);
}

document.querySelectorAll('.nav-label').forEach(label => {
  label.addEventListener('click', () => {
    const view = label.dataset.view;
    const next = meshMap[view];
    if (next === activeMesh) return;
    scene.remove(activeMesh);
    activeView = view;
    activeMesh = next;
    scene.add(activeMesh);
    // Reset camera for the tab; disable orbit in Both tab (drag rotates models instead)
    controls.enabled = view !== 'both';
    camera.position.set(0, 0, CAM_Z[view] ?? 3);
    controls.target.set(0, 0, 0);
    controls.update();
    clearSelection();
    setFilterVisible(HAS_FILTER.has(view));
  });
});

// Show filter controls on initial horse tab
setFilterVisible(true);

// ── Responsive resize ───────────────────────────────────────
function syncSize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== w || canvas.height !== h) {
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    outlinePass.resolution.set(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}

// ── Render loop ─────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  syncSize();
  controls.update();
  composer.render();
}

animate();
