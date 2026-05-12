import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { camelObject } from './camelRenderer.js';

const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);

const SCENE_BG = { dark: 0x0e0e1c, light: 0xceced4 };
let currentTheme = 'dark';
renderer.setClearColor(SCENE_BG[currentTheme], 1);

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

// ── Placeholder meshes ──────────────────────────────────────
// Horse → cube
const horseMesh = new THREE.Mesh(
  new THREE.BoxGeometry(1.2, 1.2, 1.2),
  new THREE.MeshPhongMaterial({ color: 0x4a8eff, shininess: 70 })
);

// Both → square pyramid
const bothMesh = new THREE.Mesh(
  new THREE.ConeGeometry(0.9, 1.4, 4),
  new THREE.MeshPhongMaterial({ color: 0xff8f4a, shininess: 70 })
);

const meshMap = { horse: horseMesh, both: bothMesh, camel: camelObject };
let activeMesh = horseMesh;
scene.add(activeMesh);

// ── Orbit controls ──────────────────────────────────────────
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;

// ── Theme toggle ────────────────────────────────────────────
document.getElementById('theme-toggle').addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  renderer.setClearColor(SCENE_BG[currentTheme], 1);
});

// ── Nav switching ───────────────────────────────────────────
function setFilterVisible(show) {
  document.getElementById('filter-controls').classList.toggle('visible', show);
}

document.querySelectorAll('.nav-label').forEach(label => {
  label.addEventListener('click', () => {
    const next = meshMap[label.dataset.view];
    if (next === activeMesh) return;
    scene.remove(activeMesh);
    activeMesh = next;
    scene.add(activeMesh);
    controls.reset();
    setFilterVisible(label.dataset.view === 'camel');
  });
});

// ── Responsive resize ───────────────────────────────────────
function syncSize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== w || canvas.height !== h) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}

// ── Render loop ─────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  syncSize();
  controls.update();
  renderer.render(scene, camera);
}

animate();
