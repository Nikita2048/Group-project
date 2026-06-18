// ═══════════════════════════════════════════════════════════
// COSMOS API Client — только бэкенд, без моков
// ═══════════════════════════════════════════════════════════

(function() {
  'use strict';
  
  const API_BASE = window.API_BASE_URL || (window.location.origin + '/api');
  
  // Глобальный ID пользователя
  function getUserId() {
    let id = localStorage.getItem('cosmos_user_id');
    if (!id) {
      id = 'anon_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem('cosmos_user_id', id);
    }
    return id;
  }
  
  // Базовая функция запроса с обработкой ошибок
  async function apiRequest(endpoint, options = {}) {
    const url = API_BASE + endpoint;
    const headers = {
      'Content-Type': 'application/json',
      'X-User-ID': getUserId(),
      ...options.headers
    };
    
    const adminToken = sessionStorage.getItem('cosmos_admin_token');
    if (adminToken) {
      headers['X-Admin-Token'] = adminToken;
    }
    
    const response = await fetch(url, {
      ...options,
      headers: headers
    });
    
    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}`;
      try {
        const errData = await response.json();
        errorMsg = errData.error || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }
    
    return await response.json();
  }
  
  // === ПУБЛИЧНЫЙ API ===
  const CosmosAPI = {
    
    // Солнце
    getSun: () => apiRequest('/sun'),
    
    // Планеты
    getPlanets: () => apiRequest('/planets'),
    getPlanet: (name) => apiRequest('/planets/' + encodeURIComponent(name)),
    
    // Спутники
    getSatellites: () => apiRequest('/satellites'),
    // Луна (для 3D)
    getMoon: () => apiRequest('/moon'),

    // Чёрные дыры
    getBlackHoles: () => apiRequest('/blackholes'),
    
    // Галактики (с поиском и фильтрацией)
    getGalaxies: (params = {}) => {
      const query = new URLSearchParams();
      if (params.search) query.set('search', params.search);
      if (params.type && params.type !== 'all') query.set('type', params.type);
      if (params.sort) query.set('sort', params.sort);
      if (params.order) query.set('order', params.order);
      const qs = query.toString();
      return apiRequest('/galaxies' + (qs ? '?' + qs : ''));
    },
    getGalaxy: (name) => apiRequest('/galaxies/' + encodeURIComponent(name)),
    
    // Факты
    getFacts: () => apiRequest('/facts'),
    getFact: (n) => apiRequest('/facts/' + encodeURIComponent(n)),
    viewFact: (n) => apiRequest('/facts/' + encodeURIComponent(n) + '/view', { method: 'POST' }),
    
    // Случайные факты
    getRandomFacts: () => apiRequest('/random-facts'),
    getRandomFact: () => apiRequest('/random-fact'),
    
    // Квиз
    getQuiz: () => apiRequest('/quiz'),
    checkQuizAnswer: (questionId, answer) => apiRequest('/quiz/check', {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId, answer })
    }),
    
    // Прогресс квиза
    getQuizProgress: () => apiRequest('/progress/quiz'),
    saveQuizProgress: (questionId, correct) => apiRequest('/progress/quiz', {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId, correct })
    }),
    resetQuizProgress: () => apiRequest('/progress/quiz/reset', { method: 'POST' }),
    
    // Рекорды
    saveScore: (game, score) => apiRequest('/scores', {
      method: 'POST',
      body: JSON.stringify({ game, score })
    }),
    getBestScore: (game) => apiRequest('/scores/' + game).then(d => d.best || 0),
    getLeaderboard: (game) => apiRequest('/scores/' + game + '/leaderboard'),
    
    // Сравнение размеров
    getSizeComparison: () => apiRequest('/size-comparison'),
    
    // Здоровье
    healthCheck: () => apiRequest('/health'),
    
    // === АДМИНКА ===
    adminLogin: (password) => apiRequest('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password })
    }),
    adminStats: () => apiRequest('/admin/stats'),
    adminCreatePlanet: (data) => apiRequest('/admin/planets', {
      method: 'POST', body: JSON.stringify(data)
    }),
    adminDeletePlanet: (name) => apiRequest('/admin/planets/' + encodeURIComponent(name), {
      method: 'DELETE'
    }),
    adminCreateGalaxy: (data) => apiRequest('/admin/galaxies', {
      method: 'POST', body: JSON.stringify(data)
    }),
    adminDeleteGalaxy: (name) => apiRequest('/admin/galaxies/' + encodeURIComponent(name), {
      method: 'DELETE'
    }),
    adminCreateFact: (data) => apiRequest('/admin/facts', {
      method: 'POST', body: JSON.stringify(data)
    }),
    adminDeleteFact: (n) => apiRequest('/admin/facts/' + encodeURIComponent(n), {
      method: 'DELETE'
    }),
    adminCreateBlackhole: (data) => apiRequest('/admin/blackholes', {
      method: 'POST', body: JSON.stringify(data)
    }),
    adminDeleteBlackhole: (title) => apiRequest('/admin/blackholes/' + encodeURIComponent(title), {
      method: 'DELETE'
    }),
    
    // === ИНФОРМАЦИЯ ===
    isOnline: false,
    isAdmin: () => !!sessionStorage.getItem('cosmos_admin_token'),
    getUserId: getUserId
  };
  
  // Проверяем доступность API
  CosmosAPI.healthCheck()
    .then(() => {
      CosmosAPI.isOnline = true;
      console.log('%c🚀 COSMOS API подключен!', 'color: #E5AC52; font-weight: bold;');
    })
    .catch(() => {
      CosmosAPI.isOnline = false;
      console.error('%c❌ COSMOS API недоступен! Запустите сервер: python app.py', 
                    'color: #EF5350; font-weight: bold; font-size: 14px;');
    });
  
  window.CosmosAPI = CosmosAPI;
  
})();
// ═══ ТРЕКЕР СПУТНИКОВ ═══
// ═══ ТРЕКЕР СПУТНИКОВ (ПОЛНОСТЬЮ ПЕРЕДЕЛАН) ═══
// ═══ ТРЕКЕР СПУТНИКОВ (дизайн как на скрине) ═══
function initSatTracker() {
  const canvas = document.getElementById('satCanvas');
  const container = document.getElementById('sat-canvas-wrap');
  if (!canvas || !container || SATELLITES.length === 0) return;
  
  const ctx = canvas.getContext('2d');
  let W, H;
  let speed = 1, paused = false;
  let angles = {};
  let satPositions = [];
  let hoveredSat = null;
  
  SATELLITES.forEach(s => angles[s.name] = Math.random() * Math.PI * 2);
  
  function calculateSize() {
    const cw = container.clientWidth || 900;
    if (window.innerWidth <= 600) {
      W = Math.min(cw - 20, 500);
    } else if (window.innerWidth <= 1024) {
      W = Math.min(cw - 30, 800);
    } else {
      W = Math.min(cw - 40, 1200);
    }
    H = Math.min(W * 0.55, 550);
    canvas.width = W;
    canvas.height = H;
  }
  calculateSize();
  
  // Адаптивные радиусы — все орбиты помещаются
  function getOrbitRadii() {
    const cx = W / 2, cy = H / 2;
    const minR = 55;
    const maxR = Math.min(W, H) * 0.42;
    const radii = [];
    for (let i = 0; i < SATELLITES.length; i++) {
      const t = SATELLITES.length > 1 ? i / (SATELLITES.length - 1) : 0;
      radii.push(minR + t * (maxR - minR));
    }
    return { radii, cx, cy };
  }
  
  function drawEarth(cx, cy) {
    const r = 25;
    ctx.save();
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#6E7FA3';
    const g = ctx.createRadialGradient(cx - r*0.3, cy - r*0.3, 0, cx, cy, r);
    g.addColorStop(0, '#8FA0C0');
    g.addColorStop(0.6, '#4A5A7C');
    g.addColorStop(1, '#1a3a5a');
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(110, 127, 163, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  function drawOrbit(cx, cy, radius) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(110, 127, 163, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  
  function drawSatellite(sat, x, y, idx) {
    const size = sat.satSize || 4;
    const color = sat.color || '#A9C4E0';
    const isHovered = hoveredSat === sat.name;
    
    satPositions[idx] = { name: sat.name, x: x, y: y, r: Math.max(size, 18) };
    
    ctx.save();
    ctx.shadowBlur = isHovered ? 20 : 12;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
    
    // Подпись рядом (как на скрине — справа от спутника)
    ctx.font = `bold ${isHovered ? 12 : 10}px Orbitron, monospace`;
    ctx.textAlign = 'left';
    const label = sat.name === 'Джеймс Уэбб' ? 'JWST' : sat.name;
    const labelX = x + size + 5;
    const labelY = y + 4;
    
    // Чёрная обводка для читаемости
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.strokeText(label, labelX, labelY);
    ctx.fillStyle = isHovered ? color : '#F1EDE4';
    ctx.fillText(label, labelX, labelY);
  }
  
  function draw() {
    ctx.clearRect(0, 0, W, H);
    satPositions = [];
    
    const { radii, cx, cy } = getOrbitRadii();
    radii.forEach(r => drawOrbit(cx, cy, r));
    drawEarth(cx, cy);
    
    SATELLITES.forEach((sat, i) => {
      const radius = radii[i];
      if (!paused) angles[sat.name] += (sat.orbitSpeed || 0.01) * speed;
      const x = cx + Math.cos(angles[sat.name]) * radius;
      const y = cy + Math.sin(angles[sat.name]) * radius;
      drawSatellite(sat, x, y, i);
    });
    
    requestAnimationFrame(draw);
  }
  
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);
    
    let found = null;
    const cx = W / 2, cy = H / 2;
    if (Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2) < 35) found = 'ЗЕМЛЯ';
    else {
      for (const pos of satPositions) {
        const dist = Math.sqrt((mx - pos.x) ** 2 + (my - pos.y) ** 2);
        if (dist < pos.r) { found = pos.name; break; }
      }
    }
    
    if (found !== hoveredSat) {
      hoveredSat = found;
      canvas.style.cursor = found ? 'pointer' : 'default';
    }
  });
  
  canvas.addEventListener('mouseleave', () => {
    hoveredSat = null;
    canvas.style.cursor = 'default';
  });
  
  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);
    
    const info = document.getElementById('satInfoPanel');
    if (!info) return;
    
    const cx = W / 2, cy = H / 2;
    
    if (Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2) < 35) {
  info.innerHTML = `
    <h3 style="color: #6E7FA3; margin-bottom: 0.5rem;">🌍 ЗЕМЛЯ</h3>
    <p style="color: #6E7FA3; font-size: 1.05rem; margin-bottom: 1rem; font-weight: 600;">Наша планета</p>
    <p style="color: var(--text-dim); line-height: 1.7; margin-bottom: 1.5rem;">Вокруг неё вращаются спутники из каталога и Луна.</p>
    <div class="sat-stat" style="display: flex; justify-content: space-between; padding: 0.6rem 0; border-top: 1px solid rgba(255,255,255,0.06);">
      <span style="color: var(--text-dim);">Радиус</span>
      <strong style="color: #6E7FA3; font-weight: 700;">6 371 км</strong>
    </div>
    <div class="sat-stat" style="display: flex; justify-content: space-between; padding: 0.6rem 0; border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06);">
      <span style="color: var(--text-dim);">Масса</span>
      <strong style="color: #6E7FA3; font-weight: 700;">5.97 × 10²⁴ кг</strong>
    </div>
  `;
  return;
}
    
    for (const pos of satPositions) {
  const dist = Math.sqrt((mx - pos.x) ** 2 + (my - pos.y) ** 2);
  if (dist < pos.r) {
    const s = SATELLITES.find(x => x.name === pos.name);
    if (!s) continue;
    const sColor = s.color || '#A9C4E0';
    info.innerHTML = `
      <h3 style="color: ${sColor}; margin-bottom: 0.5rem;">${s.emoji || '🛰'} ${s.name}</h3>
      <p style="color: ${sColor}; font-size: 1.05rem; margin-bottom: 1rem; font-weight: 600;">
        ${s.fullName || s.name}
      </p>
      <p style="color: var(--text-dim); line-height: 1.7; margin-bottom: 1.5rem;">
        ${s.description || ''}
      </p>
      <div class="sat-stat" style="display: flex; justify-content: space-between; padding: 0.6rem 0; border-top: 1px solid rgba(255,255,255,0.06);">
        <span style="color: var(--text-dim);">Владелец</span>
        <strong style="color: ${sColor}; font-weight: 700;">${s.owner}</strong>
      </div>
      <div class="sat-stat" style="display: flex; justify-content: space-between; padding: 0.6rem 0; border-top: 1px solid rgba(255,255,255,0.06);">
        <span style="color: var(--text-dim);">Орбита</span>
        <strong style="color: ${sColor}; font-weight: 700;">${s.orbit}</strong>
      </div>
      <div class="sat-stat" style="display: flex; justify-content: space-between; padding: 0.6rem 0; border-top: 1px solid rgba(255,255,255,0.06);">
        <span style="color: var(--text-dim);">Период</span>
        <strong style="color: ${sColor}; font-weight: 700;">${s.period}</strong>
      </div>
      <div class="sat-stat" style="display: flex; justify-content: space-between; padding: 0.6rem 0; border-top: 1px solid rgba(255,255,255,0.06);">
        <span style="color: var(--text-dim);">Запущен</span>
        <strong style="color: ${sColor}; font-weight: 700;">${s.launched}</strong>
      </div>
      <div class="sat-stat" style="display: flex; justify-content: space-between; padding: 0.6rem 0; border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06);">
        <span style="color: var(--text-dim);">Скорость</span>
        <strong style="color: ${sColor}; font-weight: 700;">${s.speed}</strong>
      </div>
    `;
    return;
  }
}

  });
  
  const speedRange = document.getElementById('satSpeedRange');
  if (speedRange) {
    speedRange.addEventListener('input', e => {
      speed = parseFloat(e.target.value);
      const v = document.getElementById('satSpeedVal');
      if (v) v.textContent = speed.toFixed(1) + '×';
    });
  }
  
  const pauseBtn = document.getElementById('satPauseBtn');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      paused = !paused;
      pauseBtn.textContent = paused ? '▶ СТАРТ' : '❚❚ ПАУЗА';
    });
  }
  
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(calculateSize, 250);
  });
  
  draw();
}



// ═══ СИМУЛЯТОР АККРЕЦИИ ═══
function initBHSimulator() {
  const canvas = document.getElementById('bhCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let W = canvas.width = canvas.parentElement.clientWidth - 40 || 600;
  let H = canvas.height = 400;
  let speed = 1, paused = false;
  let particles = [];
  
  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    W = canvas.width = Math.min(parent.clientWidth - 40, 1200);
    H = canvas.height = 400;
  }
  
  function initParticles() {
    particles = [];
    for (let i = 0; i < 200; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: 80 + Math.random() * 200,
        size: 1 + Math.random() * 2,
        speed: 0.005 + Math.random() * 0.015,
        color: `hsl(${30 + Math.random() * 30}, 100%, ${50 + Math.random() * 30}%)`
      });
    }
  }
  initParticles();
  resize();
  
  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;
    
    ctx.save();
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#E5AC52';
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
    grad.addColorStop(0, '#000');
    grad.addColorStop(0.7, '#000');
    grad.addColorStop(1, 'rgba(229, 172, 82, 0.5)');
    ctx.beginPath();
    ctx.arc(cx, cy, 50, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
    
    if (!paused) {
      particles.forEach(p => {
        p.angle += p.speed * speed;
        p.radius -= 0.05 * speed;
        if (p.radius < 55) p.radius = 280;
      });
    }
    
    particles.forEach(p => {
      const x = cx + Math.cos(p.angle) * p.radius;
      const y = cy + Math.sin(p.angle) * p.radius * 0.4;
      ctx.save();
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    });
    
    requestAnimationFrame(draw);
  }
  draw();
  
  const speedRange = document.getElementById('bhSpeedRange');
  if (speedRange) {
    speedRange.addEventListener('input', e => {
      speed = parseFloat(e.target.value);
      const v = document.getElementById('bhSpeedVal');
      if (v) v.textContent = speed.toFixed(1) + '×';
    });
  }
  
  const pauseBtn = document.getElementById('bhPauseBtn');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      paused = !paused;
      pauseBtn.textContent = paused ? '▶ СТАРТ' : '❚❚ ПАУЗА';
    });
  }
  
  const resetBtn = document.getElementById('bhResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', initParticles);
  }
  
  window.addEventListener('resize', () => {
    clearTimeout(window._bhResizeTimeout);
    window._bhResizeTimeout = setTimeout(resize, 250);
  });
}
