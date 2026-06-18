// ═══════════════════════════════════════════════════════════
// COSMOS 3D PLANETS — данные из БД
// ═══════════════════════════════════════════════════════════

let scene = null, camera = null, renderer = null, controls = null;
let planetGroup = null;
let rotationEnabled = true;
let ringsEnabled = true;
let moonsEnabled = true;
let autoRotateEnabled = false;
let zoomLevel = 8;
let animationId = null;
let currentIndex = 0;
let isInitialized = false;

const PLANET_DATA = {};
const PLANET_ORDER = ['Солнце', 'Меркурий', 'Венера', 'Земля', 'Луна', 'Марс', 'Юпитер', 'Сатурн', 'Уран', 'Нептун'];

function hexToInt(hex) {
  try {
    const s = String(hex || '#888888').replace('#', '0x');
    const n = parseInt(s);
    return isNaN(n) ? 0x888888 : n;
  } catch (e) {
    return 0x888888;
  }
}

async function loadPlanetData() {
  if (!window.CosmosAPI) {
    console.error('CosmosAPI не загружен');
    return false;
  }
  
  try {
    const [planets, sun, moon] = await Promise.all([
      window.CosmosAPI.getPlanets().catch(() => []),
      window.CosmosAPI.getSun().catch(() => null),
      window.CosmosAPI.getMoon().catch(() => null)
    ]);
    
    if (sun) {
      PLANET_DATA['Солнце'] = {
        name: 'Солнце', type: 'Звезда',
        diameter: sun.diameter, mass: sun.mass,
        distance: '—', description: sun.description,
        color: 0xFFD740, emissive: 0xFF6D00, emissiveIntensity: 1.5,
        radius: 4.0, hasRings: false, moonCount: 0,
        texture: sun.p3d_texture || 'images/textures/sun_texture.png'
      };
    }
    
    (planets || []).forEach(p => {
      const baseName = p.name.toLowerCase().replace('ё', 'е');
      PLANET_DATA[p.name] = {
        name: p.name,
        type: p.p3d_type || p.tag || 'Планета',
        diameter: p.diameter, mass: p.mass,
        distance: p.distance, description: p.description,
        color: hexToInt(p.color),
        emissive: p.p3d_emissive ? hexToInt(p.p3d_emissive) : 0x000000,
        emissiveIntensity: p.p3d_emissiveIntensity || 0,
        radius: p.p3d_radius || 1.0,
        hasRings: !!p.p3d_hasRings,
        moonCount: p.p3d_moonCount || 0,
        texture: p.p3d_texture || `images/textures/${baseName}_texture.png`
      };
    });
    
    if (moon) {
      PLANET_DATA['Луна'] = {
        name: 'Луна', type: 'Спутник',
        diameter: moon.diameter || '3 475 км',
        mass: moon.mass || '7.35 × 10²² кг',
        distance: moon.distance || '384 400 км',
        description: moon.description || 'Естественный спутник Земли',
        color: 0xC9C9C9, emissive: 0x000000, emissiveIntensity: 0,
        radius: 0.7, hasRings: false, moonCount: 0,
        texture: moon.p3d_texture || 'images/textures/moon_texture.png'
      };
    } else {
      PLANET_DATA['Луна'] = {
        name: 'Луна', type: 'Спутник',
        diameter: '3 475 км', mass: '7.35 × 10²² кг',
        distance: '384 400 км',
        description: 'Естественный спутник Земли. Единственное небесное тело, на котором побывал человек.',
        color: 0xC9C9C9, emissive: 0x000000, emissiveIntensity: 0,
        radius: 0.7, hasRings: false, moonCount: 0,
        texture: 'images/textures/moon_texture.png'
      };
    }
    
    console.log('✅ Загружено планет:', Object.keys(PLANET_DATA).length);
    return Object.keys(PLANET_DATA).length > 0;
  } catch (e) {
    console.error('Ошибка загрузки данных планет:', e);
    return false;
  }
}

function getPlanetData(name) {
  return PLANET_DATA[name] || null;
}

function initThreeJS() {
  const container = document.getElementById('threeContainer');
  if (!container) return;
  
  if (!window.THREE) {
    container.innerHTML = '<p style="color:#E5AC52;text-align:center;padding:2rem">Three.js не загружен</p>';
    return;
  }
  
  if (Object.keys(PLANET_DATA).length === 0) {
    container.innerHTML = '<p style="color:#E5AC52;text-align:center;padding:2rem">⚠️ Данные не загружены</p>';
    return;
  }
  
  if (animationId) cancelAnimationFrame(animationId);
  if (renderer) {
    try {
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    } catch (e) {}
  }
  
  scene = new THREE.Scene();
  const w = container.clientWidth || 800;
  const h = container.clientHeight || 500;
  
  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
  camera.position.set(0, 0, zoomLevel);
  
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);
  
  if (THREE.OrbitControls) {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.5;
    controls.maxDistance = 30;
  }
  
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dl = new THREE.DirectionalLight(0xffffff, 1.0);
  dl.position.set(5, 3, 5);
  scene.add(dl);
  const dl2 = new THREE.DirectionalLight(0xffffff, 0.4);
  dl2.position.set(-5, -2, -3);
  scene.add(dl2);
  
  addStarfield();
  loadPlanet(currentIndex);
  animate();
  isInitialized = true;
  
  window.addEventListener('resize', onWindowResize);
  console.log('✅ 3D инициализирован');
}

function addStarfield() {
  if (!scene) return;
  const sg = new THREE.BufferGeometry();
  const positions = new Float32Array(3000 * 3);
  for (let i = 0; i < 3000; i++) {
    positions[i*3] = (Math.random() - 0.5) * 200;
    positions[i*3+1] = (Math.random() - 0.5) * 200;
    positions[i*3+2] = (Math.random() - 0.5) * 200;
  }
  sg.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const sm = new THREE.PointsMaterial({ size: 0.15, color: 0xffffff, transparent: true, opacity: 0.9 });
  scene.add(new THREE.Points(sg, sm));
}

function loadPlanet(index) {
  if (!scene) return;
  
  if (index < 0) index = 0;
  if (index >= PLANET_ORDER.length) index = PLANET_ORDER.length - 1;
  currentIndex = index;
  
  const name = PLANET_ORDER[index];
  const data = getPlanetData(name);
  
  if (!data) {
    console.warn('Планета не найдена:', name);
    return;
  }
  
  if (planetGroup) {
    scene.remove(planetGroup);
    disposeObject(planetGroup);
    planetGroup = null;
  }
  
  updatePlanetInfo(data);
  updateActivePlanet();
  
  planetGroup = new THREE.Group();
  const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
  
  const material = new THREE.MeshPhongMaterial({
    color: data.color,
    specular: 0x222222,
    shininess: 8,
    emissive: data.emissive || 0x000000,
    emissiveIntensity: data.emissiveIntensity || 0
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  planetGroup.add(mesh);
  
  if (data.texture && THREE.TextureLoader) {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    loader.load(
      data.texture,
      (texture) => {
        console.log('✓ Текстура загружена:', data.texture);
        try {
          texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          material.map = texture;
          material.color.setHex(0xffffff);
          material.needsUpdate = true;
        } catch (e) {}
      },
      undefined,
      () => {
        console.warn('⚠️ Не найдена:', data.texture);
      }
    );
  }
  
  if (data.hasRings && ringsEnabled) addRings(data);
  if (data.moonCount > 0 && moonsEnabled) addMoons(data);
  
  scene.add(planetGroup);
  if (data.name === 'Уран') planetGroup.rotation.z = Math.PI / 2;
}

function addRings(data) {
  if (!planetGroup) return;
  let innerRadius, outerRadius, ringOpacity;
  if (data.name === 'Юпитер') { innerRadius = data.radius * 1.5; outerRadius = data.radius * 1.6; ringOpacity = 0.25; }
  else if (data.name === 'Сатурн') { innerRadius = data.radius * 1.3; outerRadius = data.radius * 2.2; ringOpacity = 0.85; }
  else if (data.name === 'Уран') { innerRadius = data.radius * 1.4; outerRadius = data.radius * 1.65; ringOpacity = 0.4; }
  else return;
  
  const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 128);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xDCC8A6, side: THREE.DoubleSide, transparent: true, opacity: ringOpacity
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2;
  planetGroup.add(ring);
}

function addMoons(data) {
  if (!planetGroup) return;
  const count = data.moonCount;
  const baseOrbit = data.radius * 2.8;
  for (let i = 0; i < count; i++) {
    const moonSize = data.radius * 0.15;
    const moonGeometry = new THREE.SphereGeometry(moonSize, 16, 16);
    const moonMaterial = new THREE.MeshPhongMaterial({ color: 0xBBBBBB, shininess: 3 });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.userData = {
      orbitRadius: baseOrbit + i * data.radius * 1.0,
      orbitSpeed: 0.3 + Math.random() * 0.4,
      orbitAngle: (i / Math.max(1, count)) * Math.PI * 2,
      yOffset: (Math.random() - 0.5) * 0.3
    };
    planetGroup.add(moon);
  }
}

function disposeObject(obj) {
  obj.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
      else child.material.dispose();
    }
  });
}

function updatePlanetInfo(data) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val || '—';
  };
  set('p3dName', data.name);
  set('p3dType', data.type);
  set('p3dDiameter', data.diameter);
  set('p3dMass', data.mass);
  set('p3dDistance', data.distance);
  set('p3dDesc', data.description);
}

function updateActivePlanet() {
  document.querySelectorAll('.planet3d-item').forEach((el, i) => {
    el.classList.toggle('active', i === currentIndex);
  });
}

function animate() {
  if (!scene || !camera || !renderer) return;
  animationId = requestAnimationFrame(animate);
  
  if (planetGroup && rotationEnabled) {
    planetGroup.children.forEach(child => {
      if (child.userData && child.userData.orbitRadius) {
        child.userData.orbitAngle += child.userData.orbitSpeed * 0.008;
        child.position.x = Math.cos(child.userData.orbitAngle) * child.userData.orbitRadius;
        child.position.z = Math.sin(child.userData.orbitAngle) * child.userData.orbitRadius;
        child.position.y = child.userData.yOffset;
      } else if (child.type === 'Mesh' && child.geometry && child.geometry.type === 'SphereGeometry') {
        child.rotation.y += 0.005;
      }
    });
  }
  
  if (autoRotateEnabled) {
    const time = Date.now() * 0.0003;
    camera.position.x = Math.cos(time) * zoomLevel;
    camera.position.z = Math.sin(time) * zoomLevel;
    camera.position.y = Math.sin(time * 0.5) * 1.5;
    camera.lookAt(0, 0, 0);
  }
  
  if (controls) controls.update();
  renderer.render(scene, camera);
}

function buildPlanetList() {
  const list = document.getElementById('planet3dList');
  if (!list) return;
  
  list.innerHTML = PLANET_ORDER.map((name, i) => {
    const data = PLANET_DATA[name];
    if (!data) return '';
    const colorHex = '#' + data.color.toString(16).padStart(6, '0');
    return `<div class="planet3d-item" data-index="${i}">
      <div class="planet3d-item-icon" style="background: radial-gradient(circle at 30% 30%, ${colorHex} 0%, ${colorHex}88 40%, transparent 70%);"></div>
      <div class="planet3d-item-name">${name}</div>
    </div>`;
  }).join('');
  
  list.querySelectorAll('.planet3d-item').forEach((item, i) => {
    item.addEventListener('click', () => loadPlanet(parseInt(item.dataset.index)));
  });
}

function initPlanet3DControls() {
  const btnRings = document.getElementById('toggleRings');
  if (btnRings) {
    btnRings.addEventListener('click', function() {
      ringsEnabled = !ringsEnabled;
      const text = this.querySelector('.ctrl-text');
      if (text) text.textContent = ringsEnabled ? 'Вкл' : 'Выкл';
      if (isInitialized) loadPlanet(currentIndex);
    });
  }
  
  const btnMoons = document.getElementById('toggleMoons');
  if (btnMoons) {
    btnMoons.addEventListener('click', function() {
      moonsEnabled = !moonsEnabled;
      const text = this.querySelector('.ctrl-text');
      if (text) text.textContent = moonsEnabled ? 'Вкл' : 'Выкл';
      if (isInitialized) loadPlanet(currentIndex);
    });
  }
  
  const btnRotation = document.getElementById('toggleRotation');
  if (btnRotation) {
    btnRotation.addEventListener('click', function() {
      rotationEnabled = !rotationEnabled;
      const icon = this.querySelector('.ctrl-icon');
      const text = this.querySelector('.ctrl-text');
      if (icon) icon.textContent = rotationEnabled ? '⏸' : '▶';
      if (text) text.textContent = rotationEnabled ? 'Пауза' : 'Старт';
    });
  }
  
  const btnAutoRotate = document.getElementById('toggleAutoRotate');
  if (btnAutoRotate) {
    btnAutoRotate.addEventListener('click', function() {
      autoRotateEnabled = !autoRotateEnabled;
      const icon = this.querySelector('.ctrl-icon');
      const text = this.querySelector('.ctrl-text');
      if (icon) icon.textContent = autoRotateEnabled ? '🔄' : '⏹';
      if (text) text.textContent = autoRotateEnabled ? 'Вкл' : 'Выкл';
      if (controls) controls.enabled = !autoRotateEnabled;
    });
  }
  
  const zoomInput = document.getElementById('planetZoom');
  const zoomVal = document.getElementById('zoomVal');
  if (zoomInput) {
    zoomInput.addEventListener('input', e => {
      zoomLevel = parseFloat(e.target.value);
      if (zoomVal) zoomVal.textContent = zoomLevel.toFixed(1) + '×';
      if (camera) {
        camera.position.setLength(zoomLevel);
        camera.lookAt(0, 0, 0);
      }
    });
  }
}

function onWindowResize() {
  const container = document.getElementById('threeContainer');
  if (!container || !camera || !renderer) return;
  camera.aspect = container.clientWidth / Math.max(container.clientHeight, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, Math.max(container.clientHeight, 400));
}

async function startPlanet3D() {
  if (!document.getElementById('threeContainer')) return;
  
  initPlanet3DControls();
  
  const waitForApi = () => new Promise((resolve) => {
    const check = () => {
      if (window.CosmosAPI && window.CosmosAPI.isOnline) resolve();
      else setTimeout(check, 200);
    };
    check();
  });
  
  const timeout = new Promise(resolve => setTimeout(resolve, 10000));
  
  try {
    await Promise.race([waitForApi(), timeout]);
    
    if (window.CosmosAPI && window.CosmosAPI.isOnline) {
      const loaded = await loadPlanetData();
      if (loaded) {
        buildPlanetList();
        initThreeJS();
      } else {
        document.getElementById('threeContainer').innerHTML = 
          '<p style="color:#E5AC52;text-align:center;padding:2rem">⚠️ Ошибка загрузки данных</p>';
      }
    } else {
      document.getElementById('threeContainer').innerHTML = 
        '<p style="color:#E5AC52;text-align:center;padding:2rem">⚠️ API недоступен. Запустите: python app.py</p>';
    }
  } catch (e) {
    console.error('Ошибка запуска 3D:', e);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startPlanet3D);
} else {
  startPlanet3D();
}
