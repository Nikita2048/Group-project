// ═══════════════════════════════════════════════════════════
// COSMOS APP — ВСЕ ДАННЫЕ С БЭКЕНДА
// ═══════════════════════════════════════════════════════════

// ═══ ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ (заполняются с бэкенда) ═══
let SUN = null;
let PLANETS = [];
let SATELLITES = [];
let BLACKHOLES = [];
let BH_TYPES = [];
let QUIZ_QUESTIONS = [];
let QUIZ_ID_MAP = {};
let FACTS = [];
let GALAXIES = [];
let RANDOM_FACTS = [];
let SIZE_COMPARISON = [];

// ═══ ЗАГРУЗКА ДАННЫХ С СЕРВЕРА ═══
async function loadAllData() {
  console.log('📡 Загружаю данные с сервера...');
  
  const [sun, planets, satellites, bhData, galaxies, facts, randomFacts, quiz, sizeComp] = await Promise.all([
    CosmosAPI.getSun(),
    CosmosAPI.getPlanets(),
    CosmosAPI.getSatellites(),
    CosmosAPI.getBlackHoles(),
    CosmosAPI.getGalaxies(),
    CosmosAPI.getFacts(),
    CosmosAPI.getRandomFacts(),
    CosmosAPI.getQuiz(),
    CosmosAPI.getSizeComparison()
  ]);
  
  SUN = sun;
  PLANETS = (planets || []).map(p => ({
    ...p,
    hasRing: p.hasRing || !!p.hasRing,
    p3d_texture: p.p3d_texture || `images/textures/${p.name.toLowerCase().replace('ё','е')}_texture.png`
  }));

  SATELLITES = satellites;
  BLACKHOLES = bhData.blackholes || [];
  BH_TYPES = bhData.types || [];
  GALAXIES = galaxies;
  FACTS = facts;
  RANDOM_FACTS = (randomFacts || []).map(f => f.text);
  SIZE_COMPARISON = sizeComp;
  
  QUIZ_QUESTIONS = [];
  QUIZ_ID_MAP = {};
  quiz.forEach((q, idx) => {
    QUIZ_ID_MAP[q.q] = q.id;
    QUIZ_QUESTIONS.push({ q: q.q, opts: q.opts, a: idx });
  });
  
  console.log('%c✅ Данные загружены!', 'color: #E5AC52; font-weight: bold;');
  return true;
}

// ═══ УТИЛИТЫ (только парсинг данных из бэкенда) ═══
function getPlanetDiameter(planetName) {
  const planet = PLANETS.find(p => p.name === planetName);
  if (!planet) return 10000;
  return parseInt(planet.diameter.replace(/\D/g, '')) || 10000;
}

function getPlanetTemp(planetName) {
  const temps = {
    'Меркурий': 167, 'Венера': 464, 'Земля': 15, 'Марс': -65,
    'Юпитер': -110, 'Сатурн': -140, 'Уран': -195, 'Нептун': -200
  };
  return temps[planetName] || 0;
}

function getCurrentPage() {
  const p = window.location.pathname.split('/').pop().replace('.html', '');
  return p || 'index';
}

function setActiveNav() {
  const page = getCurrentPage();
  document.querySelectorAll('.nav-links a, .mobile-nav-links a').forEach(a => {
    if (a.dataset.page === page) a.classList.add('active');
  });
}


function createStars(count = 220) {
  const bg = document.getElementById('stars-bg');
  if (!bg) return;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const sz = Math.random() * 2.5 + 0.5;
    s.style.cssText = `width:${sz}px;height:${sz}px;top:${Math.random()*100}%;left:${Math.random()*100}%;--d:${2+Math.random()*4}s;animation-delay:${Math.random()*5}s;opacity:${Math.random()*.8+.1}`;
    bg.appendChild(s);
  }
}

function createShootingStars() {
  const hero = document.getElementById('hero');
  if (!hero) return;
  for (let i = 0; i < 4; i++) {
    const s = document.createElement('div');
    s.className = 'shooting-star';
    s.style.cssText = `top:${Math.random()*80+10}%;left:${Math.random()*80}%;animation-delay:${Math.random()*5}s;animation-duration:${3+Math.random()*3}s`;
    hero.appendChild(s);
  }
}

// ═══ БУРГЕР-МЕНЮ ═══
function initBurgerMenu() {
  const burger = document.getElementById('burgerMenu');
  const mobileMenu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('navOverlay');
  const closeBtn = document.getElementById('mobileMenuClose');
  const mobileFactBtn = document.getElementById('mobileFactBtn');
  
  if (!burger || !mobileMenu) return;

  function openMenu() {
    mobileMenu.classList.add('active');
    burger.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.classList.add('menu-open');
  }
  
  function closeMenu() {
    mobileMenu.classList.remove('active');
    burger.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.classList.remove('menu-open');
  }

  burger.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    if (mobileMenu.classList.contains('active')) closeMenu();
    else openMenu();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      closeMenu();
    });
  }

  if (overlay) overlay.addEventListener('click', closeMenu);

  mobileMenu.querySelectorAll('.mobile-nav-links a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Кнопка ФАКТ в мобильном меню вызывает тот же обработчик
  if (mobileFactBtn) {
    mobileFactBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      closeMenu();
      setTimeout(() => {
        const navFactBtn = document.getElementById('navFactBtn');
        if (navFactBtn) navFactBtn.click();
      }, 300);
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
      closeMenu();
    }
  });
}


// ═══ ПЛАНЕТЫ: рендер карточек и модалки ═══
function renderPlanets(containerId = 'planetsGrid') {
  const grid = document.getElementById(containerId);
  if (!grid || PLANETS.length === 0) return;
  
  grid.innerHTML = PLANETS.map(p => `
    <div class="planet-card" data-name="${p.name}">
      <div class="card-visual">
        <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.src='data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><circle cx='200' cy='200' r='180' fill='${p.color}'/></svg>`)}'">
      </div>
      <div class="planet-icon" style="background:${p.glow}33">${p.emoji || ''}</div>
      <h3>${p.name}</h3>
      <span class="tag" style="background:${p.tagColor}33;color:${p.color}">${p.tag}</span>
      <p>${p.description || ''}</p>
      <div class="planet-stat"><span>Диаметр</span><strong>${p.diameter}</strong></div>
      <div class="planet-stat"><span>Сутки</span><strong>${p.dayLen}</strong></div>
      <div class="planet-stat"><span>Спутники</span><strong>${p.moons}</strong></div>
      <div class="planet-stat"><span>Гравитация</span><strong>${p.gravity} м/с²</strong></div>
      <div class="extra-info">${p.fact}</div>
    </div>
  `).join('');
  
  document.querySelectorAll('.planet-card').forEach(card => {
    card.addEventListener('click', () => {
      const p = PLANETS.find(x => x.name === card.dataset.name);
      if (p) openPlanetModal(p);
    });
  });
}

function openPlanetModal(p) {
  const modal = document.getElementById('planetModal');
  if (!modal) return;
  
  const imgEl = document.getElementById('modalImage');
  imgEl.style.display = 'block';
  imgEl.src = p.img;
  imgEl.alt = p.name;
  imgEl.onerror = function() {
    this.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><rect width="800" height="400" fill="#0a0a1a"/><circle cx="400" cy="200" r="150" fill="${p.color}"/></svg>`
    );
  };
  
  document.getElementById('modalTitle').textContent = p.name;
  document.getElementById('modalDesc').textContent = p.description || '';
  document.getElementById('modalFact').textContent = p.fact;
  document.getElementById('modalStats').innerHTML = `
    <div class="modal-stat"><span>Тип</span><strong>${p.tag}</strong></div>
    <div class="modal-stat"><span>Диаметр</span><strong>${p.diameter}</strong></div>
    <div class="modal-stat"><span>Масса</span><strong>${p.mass}</strong></div>
    <div class="modal-stat"><span>Расстояние</span><strong>${p.distance}</strong></div>
    <div class="modal-stat"><span>Сутки</span><strong>${p.dayLen}</strong></div>
    <div class="modal-stat"><span>Год</span><strong>${p.year}</strong></div>
    <div class="modal-stat"><span>Спутники</span><strong>${p.moons}</strong></div>
    <div class="modal-stat"><span>Гравитация</span><strong>${p.gravity} м/с²</strong></div>
  `;
  
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openSunModal() {
  const modal = document.getElementById('planetModal');
  if (!modal || !SUN) return;
  
  const imgEl = document.getElementById('modalImage');
  imgEl.style.display = 'block';
  imgEl.src = SUN.img;
  imgEl.alt = SUN.name;
  imgEl.onerror = function() {
    this.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400">
        <defs><radialGradient id="s"><stop offset="0%" stop-color="#fff8e1"/><stop offset="30%" stop-color="#FFD740"/><stop offset="70%" stop-color="#FF6D00"/><stop offset="100%" stop-color="#BF360C"/></radialGradient></defs>
        <rect width="800" height="400" fill="#0a0a1a"/><circle cx="400" cy="200" r="170" fill="url(#s)"/></svg>`
    );
  };
  
  document.getElementById('modalTitle').textContent = SUN.name;
  document.getElementById('modalDesc').textContent = SUN.description;
  document.getElementById('modalFact').textContent = SUN.fact;
  document.getElementById('modalStats').innerHTML = `
    <div class="modal-stat"><span>Тип звезды</span><strong>${SUN.type}</strong></div>
    <div class="modal-stat"><span>Диаметр</span><strong>${SUN.diameter}</strong></div>
    <div class="modal-stat"><span>Масса</span><strong>${SUN.mass}</strong></div>
    <div class="modal-stat"><span>Температура поверхности</span><strong>5 500°C</strong></div>
    <div class="modal-stat"><span>Температура ядра</span><strong>15 000 000°C</strong></div>
    <div class="modal-stat"><span>Возраст</span><strong>${SUN.age}</strong></div>
    <div class="modal-stat"><span>Состав</span><strong>${SUN.composition}</strong></div>
    <div class="modal-stat"><span>Тип реакции</span><strong>${SUN.core}</strong></div>
    <div class="modal-stat"><span>Свет до Земли</span><strong>8 мин 20 сек</strong></div>
    <div class="modal-stat"><span>Гравитация</span><strong>274 м/с²</strong></div>
  `;
  
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function scrollToMap() {
  const mapSection = document.getElementById('map-section');
  if (mapSection) mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeAllModals() {
  document.querySelectorAll('.modal.open').forEach(m => m.classList.remove('open'));
  document.body.style.overflow = '';
}

// ═══ СПУТНИКИ ═══
function renderSatellites(containerId = 'satGrid') {
  const grid = document.getElementById(containerId);
  if (!grid || SATELLITES.length === 0) return;
  grid.innerHTML = SATELLITES.map(s => {
    const c = s.color || '#A9C4E0';
    return `
    <div class="sat-card" style="--card-color: ${c}; border-color: ${c}66;">
      <div class="sat-visual">
        <img src="${s.img}" alt="${s.name}" loading="lazy" onerror="this.style.display='none'">
      </div>
      <h3 style="color: ${c}">${s.name}</h3>
      <span class="sat-owner" style="background: ${c}22; color: ${c}">${s.owner}</span>
      <p>${s.description || ''}</p>
      <div class="sat-stat"><span>Орбита</span><strong style="color: ${c}">${s.orbit}</strong></div>
      <div class="sat-stat"><span>Период</span><strong style="color: ${c}">${s.period}</strong></div>
      <div class="sat-stat"><span>Запущен</span><strong style="color: ${c}">${s.launched}</strong></div>
      <div class="sat-stat"><span>Скорость</span><strong style="color: ${c}">${s.speed}</strong></div>
    </div>
  `}).join('');
}


// ═══ ЧЁРНЫЕ ДЫРЫ ═══
function renderBlackHoles(containerId = 'bhGrid') {
  const grid = document.getElementById(containerId);
  if (!grid || BLACKHOLES.length === 0) return;
  grid.innerHTML = BLACKHOLES.map(b => `
    <div class="bh-card" data-title="${b.title}">
      <div class="bh-icon">●</div>
      <h3>${b.title}</h3>
      <p>${b.text}</p>
      <span class="bh-hint">Кликните для подробностей</span>
    </div>
  `).join('');
  
  document.querySelectorAll('.bh-card').forEach(card => {
    card.addEventListener('click', () => {
      const b = BLACKHOLES.find(x => x.title === card.dataset.title);
      if (b) openBHModal(b);
    });
  });
}

function openBHModal(b) {
  const modal = document.getElementById('bhModal');
  if (!modal) return;
  const img = document.getElementById('bhModalImage');
  img.style.display = 'block';
  img.src = b.img;
  img.alt = b.title;
  img.onerror = function() {
    this.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><rect width="800" height="400" fill="#0a0a1a"/><circle cx="400" cy="200" r="150" fill="black"/></svg>`
    );
  };
  document.getElementById('bhModalTitle').textContent = b.title;
  document.getElementById('bhModalShort').textContent = b.text;
  document.getElementById('bhModalDetails').textContent = b.details;
  document.getElementById('bhModalStats').innerHTML = (b.stats || []).map(s => 
    `<div class="modal-stat"><span>${s.label}</span><strong>${s.value}</strong></div>`
  ).join('');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ═══ ФАКТЫ ═══
function renderFacts(containerId = 'factsGrid') {
  const grid = document.getElementById(containerId);
  if (!grid || FACTS.length === 0) return;
  grid.innerHTML = FACTS.map(f => `
    <div class="fact-card" data-num="${f.n}">
      <div class="fact-num">${f.n}</div>
      <h4>${f.title}</h4>
      <p>${f.text}</p>
    </div>
  `).join('');
  
  document.querySelectorAll('.fact-card').forEach(card => {
    card.addEventListener('click', async () => {
      const f = FACTS.find(x => x.n === card.dataset.num);
      if (f) {
        try { await CosmosAPI.viewFact(f.n); } catch (e) {}
        openFactModal(f);
      }
    });
  });
}

function openFactModal(f) {
  const modal = document.getElementById('bhModal');
  if (!modal) return;
  const img = document.getElementById('bhModalImage');
  img.style.display = 'block';
  img.src = f.img || '';
  img.alt = f.title;
  img.onerror = function() { this.style.display = 'none'; };
  document.getElementById('bhModalTitle').textContent = f.title;
  document.getElementById('bhModalShort').textContent = f.text;
  document.getElementById('bhModalDetails').textContent = f.details;
  document.getElementById('bhModalStats').innerHTML = (f.stats || []).map(s => 
    `<div class="modal-stat"><span>${s.label}</span><strong>${s.value}</strong></div>`
  ).join('');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ═══ ГАЛАКТИКИ ═══
let currentGalaxies = [];
let currentFilter = 'all';
let currentSearch = '';

async function renderGalaxies(containerId = 'galaxiesGrid') {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  
  try {
    // === ФИЛЬТРАЦИЯ НА КЛИЕНТЕ (надёжнее, чем серверный поиск с LOWER) ===
    // GALAXIES уже загружены в loadAllData() и хранятся в памяти
    
    // 1) Фильтр по типу
    let filtered = GALAXIES;
    if (currentFilter && currentFilter !== 'all') {
      filtered = filtered.filter(g => g.typeKey === currentFilter);
    }
    
    // 2) Поиск — JS корректно работает с Unicode
    if (currentSearch && currentSearch.trim()) {
      const q = currentSearch.toLowerCase().trim();
      filtered = filtered.filter(g => {
        const name = (g.name || '').toLowerCase();
        const desc = (g.description || '').toLowerCase();
        const details = (g.details || '').toLowerCase();
        const type = (g.type || '').toLowerCase();
        const facts = (g.facts || []).join(' ').toLowerCase();
        return name.includes(q) || desc.includes(q) || details.includes(q) || type.includes(q) || facts.includes(q);
      });
    }
    
    currentGalaxies = filtered;
    
  } catch (e) {
    console.error('Ошибка рендера галактик:', e);
    currentGalaxies = [];
  }
  
  if (currentGalaxies.length === 0) {
    grid.innerHTML = '<div class="no-galaxies">Ничего не найдено по запросу "' + 
      (currentSearch || '') + '"</div>';
    return;
  }
  
  const totalEl = document.getElementById('statTotal');
  if (totalEl) totalEl.textContent = currentGalaxies.length;
  
  grid.innerHTML = currentGalaxies.map(g => `
    <div class="galaxy-card" data-name="${g.name}" style="--card-color: ${g.color}; --card-glow: ${g.glow}33">
      <div class="galaxy-card-visual"><span class="galaxy-emoji">✦</span></div>
      <h3>${g.name}</h3>
      <span class="galaxy-type" style="background:${g.glow}33; color:${g.color}; border:1px solid ${g.glow}">${g.type}</span>
      <p>${g.description || ''}</p>
      <div class="galaxy-card-stats">
        <div class="galaxy-stat-row"><span class="label">Расстояние</span><span class="value">${g.distance}</span></div>
        <div class="galaxy-stat-row"><span class="label">Диаметр</span><span class="value">${g.diameter}</span></div>
        <div class="galaxy-stat-row"><span class="label">Звёзды</span><span class="value">${g.stars}</span></div>
        <div class="galaxy-stat-row"><span class="label">Масса</span><span class="value">${g.mass}</span></div>
      </div>
      <span class="galaxy-hint">Клик</span>
    </div>
  `).join('');
  
  document.querySelectorAll('.galaxy-card').forEach(card => {
    card.addEventListener('click', () => {
      const g = GALAXIES.find(x => x.name === card.dataset.name);
      if (g) openGalaxyModal(g);
    });
  });
}


function openGalaxyModal(g) {
  const modal = document.getElementById('galaxyModal');
  if (!modal) return;
  const imgEl = document.getElementById('galaxyModalImage');
  imgEl.style.display = 'block';
  imgEl.src = g.img;
  imgEl.alt = g.name;
  imgEl.onerror = function() {
    this.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><rect width="800" height="400" fill="#0a0a1a"/><circle cx="400" cy="200" r="150" fill="${g.color}"/></svg>`
    );
  };
  document.getElementById('galaxyModalTitle').textContent = g.name;
  document.getElementById('galaxyModalShort').textContent = g.description || '';
  document.getElementById('galaxyModalDetails').textContent = g.details;
  document.getElementById('galaxyModalStats').innerHTML = `
    <div class="modal-stat"><span>Тип</span><strong>${g.type}</strong></div>
    <div class="modal-stat"><span>Расстояние</span><strong>${g.distance}</strong></div>
    <div class="modal-stat"><span>Диаметр</span><strong>${g.diameter}</strong></div>
    <div class="modal-stat"><span>Масса</span><strong>${g.mass}</strong></div>
    <div class="modal-stat"><span>Звёзды</span><strong>${g.stars}</strong></div>
    <div class="modal-stat"><span>Возраст</span><strong>${g.age}</strong></div>
  ` + (g.facts || []).map((f, i) => 
    `<div class="modal-stat" style="grid-column:1/-1"><span>Факт ${i+1}</span><strong style="font-family:'Rajdhani',sans-serif;font-size:.85rem;text-transform:none">${f}</strong></div>`
  ).join('');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function initGalaxyFilters() {
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter;
      renderGalaxies();
    });
  });
  
  const searchInput = document.getElementById('galaxiesSearch');
  const searchBtn = document.getElementById('galaxiesSearchBtn');
  const suggestionsBox = document.getElementById('galaxiesSuggestions');
  
  if (searchInput && suggestionsBox) {
    let searchTimeout;
    
    // Показ подсказок при наборе
    searchInput.addEventListener('input', e => {
      const query = e.target.value.trim();
      
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(async () => {
        if (query.length < 1) {
          suggestionsBox.style.display = 'none';
          currentSearch = '';
          renderGalaxies();
          return;
        }
        
        // Получаем все галактики для подсказок
        const all = await CosmosAPI.getGalaxies({ type: 'all' });
        const matches = all.filter(g => 
          g.name.toLowerCase().includes(query.toLowerCase()) ||
          (g.description || '').toLowerCase().includes(query.toLowerCase()) ||
          (g.type || '').toLowerCase().includes(query.toLowerCase())
        ).slice(0, 6);
        
        if (matches.length === 0) {
          suggestionsBox.innerHTML = '<div class="suggestion-item no-results">Ничего не найдено</div>';
          suggestionsBox.style.display = 'block';
          return;
        }
        
        suggestionsBox.innerHTML = matches.map(g => `
          <div class="suggestion-item" data-name="${g.name}">
            <span class="suggestion-emoji" style="color:${g.color}">✦</span>
            <div class="suggestion-info">
              <div class="suggestion-name">${highlightMatch(g.name, query)}</div>
              <div class="suggestion-type">${g.type}</div>
            </div>
          </div>
        `).join('');
        
        suggestionsBox.style.display = 'block';
        
        // Клик по подсказке
        suggestionsBox.querySelectorAll('.suggestion-item').forEach(item => {
          item.addEventListener('click', () => {
            const name = item.dataset.name;
            searchInput.value = name;
            currentSearch = name;
            suggestionsBox.style.display = 'none';
            renderGalaxies();
          });
        });
      }, 200);
    });
    
    // Поиск при клике на кнопку
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        currentSearch = searchInput.value.trim();
        suggestionsBox.style.display = 'none';
        renderGalaxies();
      });
    }
    
    // Enter для поиска
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        currentSearch = searchInput.value.trim();
        suggestionsBox.style.display = 'none';
        renderGalaxies();
      } else if (e.key === 'Escape') {
        suggestionsBox.style.display = 'none';
        searchInput.value = '';
        currentSearch = '';
        renderGalaxies();
      }
    });
    
    // Закрытие подсказок при клике вне
    document.addEventListener('click', e => {
      if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.style.display = 'none';
      }
    });
  }
}

// Подсветка совпадений в подсказках
function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}


// ═══ СРАВНЕНИЕ РАЗМЕРОВ (только с бэкенда) ═══
let sizeCompPositions = [];
let sizeCompHovered = null;
let sizeCompLog = true;
let sizeCompFilter = 'all';
let sizeCompScale = 1;

function initSizeComparison() {
  const canvas = document.getElementById('sizeCompCanvas');
  const canvasWrap = document.querySelector('.size-comp-canvas-wrap');
  if (!canvas || SIZE_COMPARISON.length === 0) return;
  
  const ctx = canvas.getContext('2d');
  let sizeCompHovered = null;
  let sizeCompSelected = null;
  let scrollX = 0;           
  let maxScrollX = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let spacePressed = false;
  
  function setCanvasSize() {
    if (!canvasWrap) return;
    const visibleWidth = canvasWrap.clientWidth - 32;
    const visibleHeight = 300;
    canvas.width = visibleWidth;
    canvas.height = visibleHeight;
    canvas.style.width = '100%';
    canvas.style.maxHeight = '300px';
  }
  
  setCanvasSize();
  let W = canvas.width, H = canvas.height;
  let positions = [];
  let isMobile = window.innerWidth <= 768;
  
  function getObjects() {
    return SIZE_COMPARISON.filter(o => {
      if (sizeCompFilter === 'planet') return o.type === 'Планета' || o.type === 'Спутник' || o.type === 'Карликовая';
      if (sizeCompFilter === 'star') return o.type === 'Звезда';
      return true;
    });
  }
  
    function calcRadius(diameter) {
  const W = canvas.width;
  const H = canvas.height;
  const maxVisibleRadius = Math.min(W, H) * 0.45;  // 45% от меньшей стороны
  
  if (sizeCompLog) {
    const r = Math.log10(diameter) * 8;
    return Math.max(4, r * sizeCompScale);
  } else {
    const r = Math.cbrt(diameter) * 0.18;
    const scaled = Math.max(3, r * sizeCompScale);
    return Math.min(scaled, maxVisibleRadius);
  }
  }

  
  function drawOutlinedText(text, x, y, size, color, isSelected = false) {
    ctx.font = `bold ${size}px Orbitron, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.lineWidth = Math.max(3, size * 0.28);
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(text, x, y);
    if (isSelected) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#FFD740';
    }
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
  }
  
  function draw() {
    W = canvas.width;
    H = canvas.height;
    isMobile = window.innerWidth <= 768;
    ctx.clearRect(0, 0, W, H);
    
    const objects = getObjects();
    if (objects.length === 0) {
      updateInfoPanel(null);
      return;
    }
    
    // === РАСЧЁТ ПОЗИЦИЙ С УЧЁТОМ ПРОКРУТКИ ===
    const objSizes = objects.map(o => ({ obj: o, r: calcRadius(o.diameter) }));
    let totalWidth = 40;
    objSizes.forEach((s, idx) => { totalWidth += s.r * 2 + (idx === 0 ? 0 : 30); });
    
    // Если всё помещается — центрируем
    // Если нет — добавляем прокрутку
    const minSpacing = isMobile ? 25 : 35;
    const objGap = 30;
    
        positions = [];
    let currentX = 40;
    objSizes.forEach((s, idx) => {
      // Если радиус превысил max — используем максимальный для расчёта отступов
      const r = s.r;
      const displayR = Math.min(r, Math.min(W, H) * 0.4);
      positions.push({ obj: s.obj, x: currentX + displayR, y: H / 2, r: r, displayR: displayR, idx: idx });
      currentX += displayR * 2 + objGap;
    });

    
    // Реальная ширина всего контента
    const contentWidth = currentX;
    const visibleWidth = W;
    
    // Если контент шире видимой области — включаем прокрутку
    if (contentWidth > visibleWidth) {
      maxScrollX = contentWidth - visibleWidth + 40;
    } else {
      maxScrollX = 0;
    }
    
    // Ограничиваем прокрутку
    scrollX = Math.max(0, Math.min(maxScrollX, scrollX));
    
    const y = H / 2;
    
    // === РИСУЕМ С УЧЁТОМ ПРОКРУТКИ ===
    positions.forEach((pos) => {
      const screenX = pos.x - scrollX;  // ← Прокрутка
      const obj = pos.obj;
      const r = pos.r;
      const isHovered = sizeCompHovered === pos.idx;
      const isSelected = sizeCompSelected === pos.idx;
      const isActive = isHovered || isSelected;
      
      // Не рисуем если за пределами видимой области (оптимизация)
      if (screenX + r < 0 || screenX - r > W) return;
      
      const grad = ctx.createRadialGradient(screenX - r * 0.35, y - r * 0.35, 0, screenX, y, r);
      grad.addColorStop(0, '#fff');
      grad.addColorStop(0.4, obj.color);
      grad.addColorStop(1, obj.glow || obj.color);
      
      if (obj.type === 'Звезда') {
        ctx.save();
        ctx.shadowBlur = 40;
        ctx.shadowColor = obj.glow;
      }
      
      ctx.beginPath();
      ctx.arc(screenX, y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      
      if (obj.type === 'Звезда') ctx.restore();
      
      ctx.strokeStyle = isActive ? '#FFD740' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = isActive ? 2.5 : 1;
      ctx.stroke();
      
      const fontSize = isActive 
        ? (isMobile ? 14 : 13) 
        : (isMobile ? 12 : 11);
      const textY = y + r + (isMobile ? 14 : 16);
      
      drawOutlinedText(
        obj.name, 
        screenX, 
        textY, 
        fontSize, 
        isActive ? '#FFD740' : '#F1EDE4', 
        isActive
      );
    });
    
    // === ИНДИКАТОР ПРОКРУТКИ ===
    if (maxScrollX > 0) {
      drawScrollIndicator();
    }
  }
  
  function drawScrollIndicator() {
    const barHeight = 6;
    const barY = H - barHeight - 4;
    const barWidth = W - 40;
    const barX = 20;
    
    // Фон полосы
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Позиция ползунка
    const contentWidth = W + maxScrollX;
    const thumbWidth = Math.max(30, (W / contentWidth) * barWidth);
    const thumbX = barX + (scrollX / maxScrollX) * (barWidth - thumbWidth);
    
    ctx.fillStyle = '#E5AC52';
    ctx.fillRect(thumbX, barY, thumbWidth, barHeight);
    
    // Подсказка
    if (scrollX === 0) {
      ctx.fillStyle = 'rgba(229, 172, 82, 0.8)';
      ctx.font = 'bold 11px Orbitron, monospace';
      ctx.textAlign = 'right';
      ctx.fillText('→ Прокрутите вправо', W - 20, 20);
    }
  }
  
  function updateInfoPanel(selectedPos) {
    const panel = document.getElementById('sizeCompInfo');
    if (!panel) return;
    
    if (!selectedPos) {
      panel.className = 'size-comp-info-panel';
      panel.innerHTML = `
        <div class="info-panel-placeholder">
          <div class="info-panel-icon">☝</div>
          <div class="info-panel-text">Наведите на объект</div>
          <div class="info-panel-hint">Информация появится здесь</div>
        </div>
      `;
      return;
    }
    
    const obj = selectedPos.obj;
    const isSun = obj.name === 'Солнце';
    const planetData = PLANETS.find(p => p.name === obj.name);
    
    let desc = obj.description || '';
    let typeLabel = obj.type;
    let additionalStats = '';
    
    if (isSun && SUN) {
      desc = desc || SUN.description;
      typeLabel = 'Звезда';
      additionalStats = `
        <div class="info-panel-stat">
          <span class="info-stat-label">Температура поверхности</span>
          <span class="info-stat-value">5 500°C</span>
        </div>
        <div class="info-panel-stat">
          <span class="info-stat-label">Возраст</span>
          <span class="info-stat-value">${SUN.age}</span>
        </div>
      `;
    } else if (planetData) {
      desc = desc || planetData.description;
      additionalStats = `
        ${planetData.distance ? `
        <div class="info-panel-stat">
          <span class="info-stat-label">Расстояние от Солнца</span>
          <span class="info-stat-value">${planetData.distance}</span>
        </div>` : ''}
        ${planetData.gravity ? `
        <div class="info-panel-stat">
          <span class="info-stat-label">Гравитация</span>
          <span class="info-stat-value">${planetData.gravity} м/с²</span>
        </div>` : ''}
        ${planetData.dayLen ? `
        <div class="info-panel-stat">
          <span class="info-stat-label">Сутки</span>
          <span class="info-stat-value">${planetData.dayLen}</span>
        </div>` : ''}
      `;
    } else if (obj.name === 'Луна' || obj.type === 'Спутник') {
      const sat = SATELLITES.find(s => s.name === obj.name);
      if (sat) {
        desc = desc || sat.description;
        additionalStats = `
          <div class="info-panel-stat">
            <span class="info-stat-label">Планета</span>
            <span class="info-stat-value">Земля</span>
          </div>
          <div class="info-panel-stat">
            <span class="info-stat-label">Орбита</span>
            <span class="info-stat-value">${sat.orbit}</span>
          </div>
        `;
      }
    } else if (obj.type === 'Карликовая') {
      desc = desc || 'Карликовая планета Солнечной системы.';
    }
    
    const earthSize = 12742;
    const ratio = (obj.diameter / earthSize).toFixed(2);
    let comparisonText = '';
    if (isSun) {
      comparisonText = `Солнце в ${(obj.diameter / earthSize).toFixed(0)}× больше Земли`;
    } else if (obj.name === 'Земля') {
      comparisonText = 'Это наша планета';
    } else {
      comparisonText = obj.diameter > earthSize 
        ? `В ${ratio}× больше Земли` 
        : `В ${(earthSize / obj.diameter).toFixed(1)}× меньше Земли`;
    }
    
    panel.className = 'size-comp-info-panel has-content';
    panel.innerHTML = `
      <div class="info-panel-header">
        <div class="info-panel-emoji" style="background: radial-gradient(circle at 30% 30%, ${obj.color} 0%, ${obj.glow || obj.color} 100%);">${obj.name === 'Солнце' ? '★' : '⊕'}</div>
        <div class="info-panel-title-block">
          <h4 class="info-panel-name">${obj.name}</h4>
          <div class="info-panel-type">${typeLabel}</div>
        </div>
      </div>
      <p class="info-panel-desc">${desc}</p>
      <div class="info-panel-stats">
        <div class="info-panel-stat">
          <span class="info-stat-label">Диаметр</span>
          <span class="info-stat-value">${obj.diameter.toLocaleString('ru')} км</span>
        </div>
        <div class="info-panel-stat">
          <span class="info-stat-label">Тип</span>
          <span class="info-stat-value">${typeLabel}</span>
        </div>
        ${additionalStats}
      </div>
      <div class="info-panel-comparison">
        <div class="info-panel-comparison-label">Сравнение</div>
        <div class="info-panel-comparison-value">${comparisonText}</div>
      </div>
    `;
  }
  
  // === КЛИК ===
  canvas.addEventListener('click', e => {
    if (isDragging) return;  // Не реагируем если перетаскивали
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const mx = (e.clientX - rect.left) * scaleX;
    
    let foundIdx = null;
    positions.forEach((p, i) => {
      const screenX = p.x - scrollX;
      if (Math.abs(screenX - mx) < p.r + 8) foundIdx = i;
    });
    
    if (foundIdx !== null) {
      if (sizeCompSelected === foundIdx) {
        sizeCompSelected = null;
        updateInfoPanel(null);
      } else {
        sizeCompSelected = foundIdx;
        updateInfoPanel(positions[foundIdx]);
      }
    } else {
      sizeCompSelected = null;
      updateInfoPanel(null);
    }
    draw();
  });
  
  // === HOVER ===
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    if (isDragging) {
      const dx = e.clientX - dragStartX;
      scrollX = dragStartScroll - dx * (canvas.width / rect.width);
      scrollX = Math.max(0, Math.min(maxScrollX, scrollX));
      draw();
      return;
    }
    
    let foundIdx = null;
    positions.forEach((p, i) => {
      const screenX = p.x - scrollX;
      const dy = my - p.y;
      if (Math.abs(screenX - mx) < p.r + 8 && Math.abs(dy) < p.r + 8) foundIdx = i;
    });
    
    if (foundIdx !== sizeCompHovered) {
      sizeCompHovered = foundIdx;
      canvas.style.cursor = foundIdx !== null ? 'pointer' : (maxScrollX > 0 ? 'grab' : 'default');
      draw();
      if (sizeCompSelected === null && foundIdx !== null) {
        updateInfoPanel(positions[foundIdx]);
      } else if (sizeCompSelected === null && foundIdx === null) {
        updateInfoPanel(null);
      }
    }
  });
  
  canvas.addEventListener('mouseleave', () => {
    sizeCompHovered = null;
    if (!isDragging) {
      canvas.style.cursor = 'default';
      if (sizeCompSelected === null) updateInfoPanel(null);
    }
    draw();
  });
  
  // === ПЕРЕТАСКИВАНИЕ МЫШЬЮ ===
  canvas.addEventListener('mousedown', e => {
    if (maxScrollX > 0) {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartScroll = scrollX;
      canvas.style.cursor = 'grabbing';
    }
  });
  
  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      setTimeout(() => { isDragging = false; }, 100);  // Защита от случайного клика
      canvas.style.cursor = maxScrollX > 0 ? 'grab' : 'default';
    }
  });
  
  // === КОЛЁСИКО МЫШИ ===
  canvas.addEventListener('wheel', e => {
    if (maxScrollX > 0) {
      e.preventDefault();
      scrollX += e.deltaY * 1.5;
      scrollX = Math.max(0, Math.min(maxScrollX, scrollX));
      draw();
    }
  }, { passive: false });
  
  // === СТРЕЛКИ КЛАВИАТУРЫ ===
  document.addEventListener('keydown', e => {
    if (!document.getElementById('sizeCompCanvas')) return;
    if (e.key === 'ArrowRight' || e.key === 'd') {
      scrollX = Math.min(maxScrollX, scrollX + 50);
      draw();
    } else if (e.key === 'ArrowLeft' || e.key === 'a') {
      scrollX = Math.max(0, scrollX - 50);
      draw();
    }
  });
  
  // === TOUCH (МОБИЛЬНЫЕ) ===
  let touchStartX = 0;
  let touchStartScroll = 0;
  
  canvas.addEventListener('touchstart', e => {
    if (maxScrollX > 0 && e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartScroll = scrollX;
    }
  }, { passive: true });
  
  canvas.addEventListener('touchmove', e => {
    if (maxScrollX > 0 && e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchStartX;
      scrollX = touchStartScroll - dx * 1.5;
      scrollX = Math.max(0, Math.min(maxScrollX, scrollX));
      draw();
    }
  }, { passive: true });
  
  // Контролы
  const scaleRange = document.getElementById('sizeCompScale');
  if (scaleRange) {
    scaleRange.addEventListener('input', e => {
      sizeCompScale = parseFloat(e.target.value);
      const v = document.getElementById('sizeCompScaleVal');
      if (v) v.textContent = sizeCompScale.toFixed(1) + '×';
      scrollX = 0;  // Сброс прокрутки при изменении масштаба
      draw();
    });
  }
  
  const modeSelect = document.getElementById('sizeCompMode');
  if (modeSelect) {
    modeSelect.addEventListener('change', e => {
      sizeCompLog = e.target.value === 'log';
      sizeCompSelected = null;
      scrollX = 0;
      updateInfoPanel(null);
      draw();
    });
  }
  
  const filterSelect = document.getElementById('sizeCompFilter');
  if (filterSelect) {
    filterSelect.addEventListener('change', e => {
      sizeCompFilter = e.target.value;
      sizeCompSelected = null;
      scrollX = 0;
      updateInfoPanel(null);
      draw();
    });
  }
  
  // === КНОПКА "К СОЛНЦУ" ===
  const scrollToStartBtn = document.createElement('button');
  scrollToStartBtn.textContent = '☀ К Солнцу';
  scrollToStartBtn.style.cssText = 'position:absolute;top:10px;left:10px;background:rgba(229,172,82,0.2);border:1px solid #E5AC52;color:#FFD740;padding:4px 10px;border-radius:4px;cursor:pointer;font-family:Orbitron,monospace;font-size:11px;z-index:5;';
  scrollToStartBtn.onclick = () => {
    scrollX = 0;
    draw();
  };
  if (canvasWrap) {
    canvasWrap.style.position = 'relative';
    canvasWrap.appendChild(scrollToStartBtn);
  }
  
  draw();
  
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      setCanvasSize();
      draw();
    }, 250);
  });
}



// ═══ ТАБЫ ═══
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      const container = btn.closest('.tabs-container') || document;
      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      container.querySelectorAll('.tab-content').forEach(c => {
        c.classList.toggle('active', c.dataset.tab === targetTab);
      });
      if (targetTab === 'size-comparison') {
        setTimeout(initSizeComparison, 100);
      }
    });
  });
}

// ═══ СЛУЧАЙНЫЙ ФАКТ ═══
let factsShownSet = new Set();

function initRandomFact() {
  const btn = document.getElementById('navFactBtn');
  if (!btn) return;
  btn.addEventListener('click', showRandomFact);
}

async function showRandomFact() {
  try {
    const data = await CosmosAPI.getRandomFact();
    const idx = RANDOM_FACTS.indexOf(data.text);
    if (factsShownSet.size >= RANDOM_FACTS.length) factsShownSet.clear();
    if (idx !== -1) factsShownSet.add(idx);
    openRandomFactModal({ text: data.text }, factsShownSet.size, RANDOM_FACTS.length);
  } catch (e) {
    console.error('Ошибка:', e);
  }
}

function openRandomFactModal(fact, count, total) {
  let modal = document.getElementById('randomFactModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'randomFactModal';
    modal.className = 'modal align-top';
    modal.innerHTML = `
      <div class="random-fact-modal-content">
        <button class="modal-close" type="button">×</button>
        <div class="random-fact-label">СЛУЧАЙНЫЙ ФАКТ О КОСМОСЕ</div>
        <div class="random-fact-text" id="randomFactText"></div>
        <div class="random-fact-actions">
          <button class="random-fact-btn primary" id="nextFactBtn" type="button">ЕЩЁ ФАКТ</button>
          <button class="random-fact-btn secondary" id="shareFactBtn" type="button">СКОПИРОВАТЬ</button>
        </div>
        <div class="random-fact-counter" id="randomFactCounter"></div>
      </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('nextFactBtn').addEventListener('click', e => {
      e.stopPropagation();
      showRandomFact();
    });
    
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    });
    
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
  
  const textEl = document.getElementById('randomFactText');
  const counterEl = document.getElementById('randomFactCounter');
  textEl.style.animation = 'none';
  void textEl.offsetWidth;
  setTimeout(() => {
    textEl.textContent = fact.text;
    textEl.style.animation = 'fadeIn 0.4s';
    counterEl.textContent = `Просмотрено фактов: ${count} / ${total}`;
  }, 50);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ═══ СОЛНЕЧНАЯ СИСТЕМА  ═══
function initSolarSystem() {
  const canvas = document.getElementById('solarCanvas');
  const container = document.getElementById('solar-canvas-wrap');
  if (!canvas || !container || PLANETS.length === 0) return;
  const ctx = canvas.getContext('2d');
  
  let W, H, cx, cy;
  let orbitScale = 1;
  let planetScale = 1;
  let speed = 1, paused = false;
  const angles = PLANETS.map(() => Math.random() * Math.PI * 2);
  let selected = null;
  
  function getPlanetSize(planet) {
    return Math.max(6, Math.log10(getPlanetDiameter(planet.name)) * 4 * planetScale);
  }
  
  function calculateSize() {
    const cw = container.clientWidth;
    
    let aw, ar;
    if (window.innerWidth <= 600) {
      aw = Math.min(cw - 20, 500);
      ar = 0.55;
      planetScale = 0.65;
    } else if (window.innerWidth <= 1024) {
      aw = Math.min(cw - 30, 900);
      ar = 0.45;
      planetScale = 0.7;
    } else {
      aw = Math.min(cw - 40, 1200);
      ar = 0.4;
      planetScale = 0.8;
    }
    
    W = aw;
    H = Math.min(W * ar, 450);
    canvas.width = W;
    canvas.height = H;
    cx = W / 2;
    cy = H / 2;
    
    const maxOrbit = Math.max(...PLANETS.map(p => p.dist));
    const sunSize = 30 * planetScale;
    const availableWidth = (W / 2) - sunSize - 50;
    orbitScale = availableWidth / maxOrbit;
  }
  
  calculateSize();
  
  function drawSun() {
    const sunSize = 30 * planetScale;
    ctx.save();
    ctx.shadowBlur = 60;
    ctx.shadowColor = '#FFD740';
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunSize * 1.4);
    grad.addColorStop(0, '#fff8e1');
    grad.addColorStop(0.2, '#FFE082');
    grad.addColorStop(0.5, '#FFD740');
    grad.addColorStop(0.8, '#FF6D00');
    grad.addColorStop(1, 'rgba(255,109,0,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, sunSize, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
    
    ctx.fillStyle = 'rgba(255, 215, 64, 0.9)';
    ctx.font = 'bold 11px Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('СОЛНЦЕ', cx, cy - sunSize - 8);
  }
  
  function drawOrbit(distance) {
    const r = distance * orbitScale;
    const ry = r * 0.4;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, ry, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.18)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  
  function drawPlanet(p, angle, idx) {
    const r = p.dist * orbitScale;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r * 0.4;
    const planetRadius = getPlanetSize(p);
    p._lastX = x;
    p._lastY = y;
    p._clickRadius = Math.max(planetRadius, 16);
    
    if (p.hasRing) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(x, y, planetRadius * 1.8, planetRadius * 0.55, -0.2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 241, 118, 0.7)';
      ctx.lineWidth = Math.max(1.5, planetRadius * 0.12);
      ctx.stroke();
      ctx.restore();
    }
    
    ctx.save();
    if (idx === selected) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = p.glow;
    }
    const gr = ctx.createRadialGradient(
      x - planetRadius * 0.35, y - planetRadius * 0.35, 0,
      x, y, planetRadius
    );
    gr.addColorStop(0, '#fff');
    gr.addColorStop(0.3, p.color);
    gr.addColorStop(1, p.glow || p.color);
    ctx.beginPath();
    ctx.arc(x, y, planetRadius, 0, Math.PI * 2);
    ctx.fillStyle = gr;
    ctx.fill();
    if (idx === selected) {
      ctx.strokeStyle = p.glow;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, planetRadius + 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  
  function draw() {
    ctx.clearRect(0, 0, W, H);
    PLANETS.forEach(p => drawOrbit(p.dist));
    drawSun();
    PLANETS.forEach((p, i) => {
      if (!paused) angles[i] += p.speed * 0.0003 * speed;
      drawPlanet(p, angles[i], i);
    });
    requestAnimationFrame(draw);
  }
  
  draw();
  
  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);
    
    const sunSize = 30 * planetScale;
    if (Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2) < sunSize + 15) {
      const info = document.getElementById('planetInfo');
      if (info && SUN) {
        info.innerHTML = `<h3>${SUN.emoji || '★'} ${SUN.name}</h3><p>${SUN.description}</p><p style="color:#DEC18C;font-size:.9rem"><strong>Факт:</strong> ${SUN.fact}</p>`;
      }
      selected = null;
      return;
    }
    
    let hit = null;
    PLANETS.forEach((p, i) => {
      if (!p._lastX) return;
      if (Math.sqrt((mx - p._lastX) ** 2 + (my - p._lastY) ** 2) < p._clickRadius) hit = i;
    });
    selected = hit;
    if (hit !== null) {
      const p = PLANETS[hit];
      const info = document.getElementById('planetInfo');
      if (info) {
        info.innerHTML = `<h3>${p.emoji || '⊕'} ${p.name}</h3><p>${p.description || ''}</p><p style="color:#DEC18C;font-size:.9rem"><strong>Факт:</strong> ${p.fact}</p>`;
      }
    }
  });
  
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);
    let found = false;
    PLANETS.forEach(p => {
      if (!p._lastX) return;
      if (Math.sqrt((mx - p._lastX) ** 2 + (my - p._lastY) ** 2) < p._clickRadius) found = true;
    });
    canvas.style.cursor = found ? 'pointer' : 'default';
  });
  
  const speedRange = document.getElementById('speedRange');
  if (speedRange) {
    speedRange.addEventListener('input', e => {
      speed = parseFloat(e.target.value);
      const v = document.getElementById('speedVal');
      if (v) v.textContent = speed.toFixed(1) + '×';
    });
  }
  
  const pauseBtn = document.getElementById('pauseBtn');
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
}


function initMap() {
  const canvas = document.getElementById('mapCanvas');
  if (!canvas || PLANETS.length === 0) return;
  
  const ctx = canvas.getContext('2d');
  let currentMode = 'sizes';
  let planetPositions = [];
  let selectedPlanet = null;
  
  function resizeCanvas() {
    const parent = canvas.parentElement;
    if (!parent) return;
    canvas.width = parent.clientWidth || 1800;
    canvas.height = 450;
    draw();
  }
  
  function draw() {
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    planetPositions = [];
    
    if (currentMode === 'sizes') drawSizes(W, H);
    else if (currentMode === 'distances') drawDistances(W, H);
    else if (currentMode === 'spectrum') drawTemperature(W, H);
    
    if (currentMode !== 'spectrum' && planetPositions.length > 1) drawDottedLines();
  }
  
  function drawDottedLines() {
    ctx.save();
    ctx.strokeStyle = 'rgba(229, 172, 82, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    for (let i = 0; i < planetPositions.length - 1; i++) {
      ctx.beginPath();
      ctx.moveTo(planetPositions[i].x, planetPositions[i].y);
      ctx.lineTo(planetPositions[i+1].x, planetPositions[i+1].y);
      ctx.stroke();
    }
    ctx.restore();
  }
  
  // ═══ УТИЛИТА: текст с чёрной обводкой для читаемости ═══
  function drawOutlinedText(text, x, y, size, color, isSelected = false) {
    ctx.font = `bold ${size}px Orbitron, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Чёрная обводка вокруг текста
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.lineWidth = Math.max(3, size * 0.28);
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(text, x, y);
    
    // Свечение для выделенного
    if (isSelected) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#FFD740';
    }
    
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
  }
  
  function drawSun(x, y, r) {
    const sg = ctx.createRadialGradient(x, y, 0, x, y, r * 1.5);
    sg.addColorStop(0, '#fff8e1');
    sg.addColorStop(0.3, '#FFD740');
    sg.addColorStop(0.7, '#FF6D00');
    sg.addColorStop(1, 'rgba(255,109,0,0)');
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = sg;
    ctx.fill();
    planetPositions.push({ name: 'sun', x, y, r: r + 10, planet: SUN });
  }
  
  function drawPlanet(p, x, y, r, isSelected) {
    const g = ctx.createRadialGradient(x - r*0.35, y - r*0.35, 0, x, y, r);
    g.addColorStop(0, '#fff');
    g.addColorStop(0.3, p.color);
    g.addColorStop(1, p.glow);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = isSelected ? '#FFD740' : 'rgba(255,255,255,0.5)';
    ctx.lineWidth = isSelected ? 3 : 1.5;
    ctx.stroke();
    
    // === ТЕКСТ: размер зависит от экрана ===
    const isMobile = window.innerWidth <= 768;
    const isTiny = window.innerWidth <= 480;
    const fontSize = isSelected 
      ? (isTiny ? 16 : isMobile ? 17 : 15)
      : (isTiny ? 13 : isMobile ? 14 : 13);
    const textY = y + r + (isMobile ? 12 : 14);
    
    drawOutlinedText(
      p.name.toUpperCase(), 
      x, 
      textY, 
      fontSize, 
      isSelected ? '#FFD740' : '#F1EDE4', 
      isSelected
    );
    
    planetPositions.push({ name: p.name, x, y, r: r + 10, planet: p });
  }
  
  // ═══ РАЗМЕРЫ ═══
  function drawSizes(W, H) {
    const PAD = 90, cy = H / 2;
    const isMobile = window.innerWidth <= 768;
    drawSun(PAD, cy, isMobile ? 18 : 22);
    drawOutlinedText('СОЛНЦЕ', PAD, cy + 42, isMobile ? 13 : 12, '#FFD740');
    
    const minGap = 95;
    const rawPositions = [];
    const startX = PAD + 70;
    const stepX = (W - startX - PAD) / PLANETS.length;
    
    PLANETS.forEach((p, i) => {
      rawPositions.push({ planet: p, x: startX + i * stepX });
    });
    
    const positions = [];
    rawPositions.forEach((item) => {
      if (positions.length > 0) {
        const prev = positions[positions.length - 1];
        if (item.x - prev.x < minGap) {
          item.x = prev.x + minGap;
        }
      }
      positions.push(item);
    });
    
    positions.forEach((item) => {
      const p = item.planet;
      const r = Math.max(7, Math.log10(getPlanetDiameter(p.name)) * 4.5);
      drawPlanet(p, item.x, cy, r, selectedPlanet === p.name);
    });
  }
  
  // ═══ РАССТОЯНИЯ (Меркурий дальше от Солнца) ═══
  function drawDistances(W, H) {
    const PAD = 50, cy = H / 2, mapW = W - PAD * 2;
    const SUN_X = PAD;
    const SUN_RADIUS = 14;
    const SUN_CLEARANCE = 85;       // ← Меркурий минимум в 85px от центра Солнца
    const RIGHT_MARGIN = 20;
    const minGap = 90;
    const usableWidth = mapW - SUN_CLEARANCE - RIGHT_MARGIN;
    
    const isMobile = window.innerWidth <= 768;
    drawSun(SUN_X, cy, isMobile ? 12 : SUN_RADIUS);
    drawOutlinedText('СОЛНЦЕ', SUN_X, cy + (isMobile ? 22 : 26), isMobile ? 11 : 12, '#FFD740');
    
    const maxDist = Math.max(...PLANETS.map(p => p.dist || 0));
    const minDist = Math.min(...PLANETS.filter(p => p.dist > 0).map(p => p.dist));
    const logMin = Math.log(minDist);
    const logMax = Math.log(maxDist);
    
    // Стартуем от Солнца + clearance, чтобы Меркурий не лип к нему
    const rawPositions = PLANETS.map(p => {
      const distA = p.dist || 1;
      const logDist = Math.log(distA);
      const normalized = (logDist - logMin) / (logMax - logMin);
      return {
        planet: p,
        x: SUN_X + SUN_CLEARANCE + normalized * usableWidth
      };
    });
    
    // Сдвигаем чтобы не накладывались
    const positions = [];
    rawPositions.forEach((item) => {
      if (positions.length > 0) {
        const prev = positions[positions.length - 1];
        if (item.x - prev.x < minGap) {
          item.x = prev.x + minGap;
        }
      }
      positions.push(item);
    });
    
    // Если вышли за границу — сдвигаем, но НЕ приближаем Меркурий к Солнцу
    if (positions.length > 0) {
      const last = positions[positions.length - 1];
      const minMercuryX = SUN_X + SUN_CLEARANCE;
      if (last.x > W - 50) {
        const neededShift = last.x - (W - 50);
        const projectedMercury = positions[0].x - neededShift;
        if (projectedMercury >= minMercuryX) {
          positions.forEach(item => item.x -= neededShift);
        }
      }
    }
    
    positions.forEach((item) => {
      const p = item.planet;
      const r = Math.max(5, Math.log10(getPlanetDiameter(p.name)) * 3.5);
      drawPlanet(p, item.x, cy, r, selectedPlanet === p.name);
    });
  }
  
  // ═══ ТЕМПЕРАТУРА ═══
  function drawTemperature(W, H) {
    const PAD = 60, mapW = W - PAD * 2;
    const isMobile = window.innerWidth <= 768;
    const minTemp = -220, maxTemp = 5500;
    const barY = isMobile ? 30 : 40, barH = isMobile ? 35 : 50;
    const planetRow = barY + barH + (isMobile ? 70 : 90);
    
    for (let i = 0; i < mapW; i++) {
      const temp = minTemp + (i / mapW) * (maxTemp - minTemp);
      ctx.fillStyle = getTempColor(temp);
      ctx.fillRect(PAD + i, barY, 1, barH);
    }
    ctx.strokeStyle = 'rgba(229,172,82,0.5)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(PAD, barY, mapW, barH);
    
    // Заголовок — с обводкой
    drawOutlinedText('🌡️ ТЕМПЕРАТУРА ПОВЕРХНОСТИ', W/2, barY - (isMobile ? 10 : 14), 
                     isMobile ? 12 : 15, '#FFD740');
    
    // Подписи шкалы
    const labelSize = isMobile ? 11 : 12;
    drawOutlinedText('-220°C', PAD, barY + barH + (isMobile ? 14 : 18), labelSize, '#F1EDE4');
    drawOutlinedText('0°C', PAD + (220 / 5720) * mapW, barY + barH + (isMobile ? 14 : 18), labelSize, '#F1EDE4');
    drawOutlinedText('+5500°C', PAD + mapW, barY + barH + (isMobile ? 14 : 18), labelSize, '#F1EDE4');
    
    ctx.strokeStyle = 'rgba(229, 172, 82, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 6]);
    ctx.beginPath();
    ctx.moveTo(PAD, planetRow);
    ctx.lineTo(PAD + mapW, planetRow);
    ctx.stroke();
    ctx.setLineDash([]);
    
    const sunTemp = 5500;
    const sunX = PAD + ((sunTemp - minTemp) / (maxTemp - minTemp)) * mapW;
    drawSun(sunX, planetRow, isMobile ? 18 : 22);
    drawOutlinedText('СОЛНЦЕ', sunX, planetRow + (isMobile ? 30 : 40), isMobile ? 12 : 12, '#FFD740');
    
    const planetsWithTemp = PLANETS.map(p => ({
      planet: p,
      temp: getPlanetTemp(p.name)
    })).sort((a, b) => a.temp - b.temp);
    
    const minDistance = isMobile ? 75 : 100;
    const finalPositions = [];
    
    planetsWithTemp.forEach(item => {
      const x = PAD + ((item.temp - minTemp) / (maxTemp - minTemp)) * mapW;
      let finalX = x;
      let attempts = 0;
      while (finalPositions.length > 0 && attempts < 50) {
        const last = finalPositions[finalPositions.length - 1];
        if (finalX - last.x < minDistance) {
          finalX = last.x + minDistance;
        } else break;
        attempts++;
      }
      if (finalX > PAD + mapW) finalX = PAD + mapW - 10;
      finalPositions.push({ planet: item.planet, x: finalX, colorX: x });
    });
    
    finalPositions.forEach(item => {
      const r = Math.max(8, Math.log10(getPlanetDiameter(item.planet.name)) * 4);
      drawPlanet(item.planet, item.x, planetRow, r, selectedPlanet === item.planet.name);
    });
    
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    finalPositions.forEach(item => {
      ctx.beginPath();
      ctx.moveTo(item.colorX, barY + barH);
      ctx.lineTo(item.x, planetRow - 12);
      ctx.stroke();
    });
    ctx.beginPath();
    ctx.moveTo(sunX, barY + barH);
    ctx.lineTo(sunX, planetRow - 22);
    ctx.stroke();
    ctx.restore();
  }
  
  function getTempColor(temp) {
    if (temp >= 1000) return '#FF1A1A';
    if (temp >= 500) return '#FF4500';
    if (temp >= 200) return '#FF8C00';
    if (temp >= 100) return '#FFA500';
    if (temp >= 50) return '#FFD700';
    if (temp >= 20) return '#FFFF00';
    if (temp >= 0) return '#FFE680';
    if (temp >= -30) return '#88E0FF';
    if (temp >= -100) return '#4FB3FF';
    if (temp >= -150) return '#3399FF';
    return '#1E5BA8';
  }
  
  document.querySelectorAll('.map-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.map-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
      selectedPlanet = null;
      draw();
      updateInfoPanel(null);
    });
  });
  
  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  }
  
  function findPlanet(mx, my) {
    for (let i = planetPositions.length - 1; i >= 0; i--) {
      const p = planetPositions[i];
      const dx = mx - p.x, dy = my - p.y;
      if (Math.sqrt(dx*dx + dy*dy) < p.r) return p;
    }
    return null;
  }
  
  canvas.addEventListener('click', e => {
    const pos = getMousePos(e);
    const found = findPlanet(pos.x, pos.y);
    if (!found) {
      selectedPlanet = null;
      updateInfoPanel(null);
      draw();
      return;
    }
    selectedPlanet = found.name;
    draw();
    updateInfoPanel(found);
  });
  
  canvas.addEventListener('mousemove', e => {
    const pos = getMousePos(e);
    canvas.style.cursor = findPlanet(pos.x, pos.y) ? 'pointer' : 'default';
  });
  
  function updateInfoPanel(planetData) {
    const panel = document.getElementById('mapInfoPanel');
    if (!panel) return;
    
    if (!planetData) {
      panel.className = 'map-info-panel';
      panel.innerHTML = '<div class="info-placeholder">' +
        '<span class="info-placeholder-icon">👆</span>' +
        '<p style="font-size: 1.2rem; color: var(--text-main); margin-top: 1rem;">' +
        '<strong style="color: var(--accent-gold);">Нажмите на планету</strong> ' +
        'для просмотра информации</p></div>';
      return;
    }
    
    const info = planetData.planet;
    const isSun = planetData.name === 'sun';
    
    panel.className = 'map-info-panel has-content';
    let modeLabel = '', statsHtml = '';
    
    if (currentMode === 'sizes') {
      modeLabel = '📏 СРАВНЕНИЕ РАЗМЕРОВ';
      const realDiam = isSun ? 1392000 : getPlanetDiameter(info.name);
      const earthSize = (realDiam / 12742).toFixed(2);
      statsHtml = 
        '<div class="map-info-stat"><span class="map-info-stat-label">Диаметр</span><span class="map-info-stat-value">' + info.diameter + '</span></div>' +
        '<div class="map-info-stat"><span class="map-info-stat-label">Относительно Земли</span><span class="map-info-stat-value">' + (isSun ? (realDiam / 12742).toFixed(0) + '× больше' : earthSize + '× Земли') + '</span></div>' +
        '<div class="map-info-stat"><span class="map-info-stat-label">Тип</span><span class="map-info-stat-value">' + (isSun ? 'Звезда' : 'Планета') + '</span></div>';
    } else if (currentMode === 'distances') {
      modeLabel = '📐 РАССТОЯНИЯ ОТ СОЛНЦА';
      const distA = isSun ? 0 : (info.dist || 0);
      const millionKm = Math.round(distA * 149.6);
      statsHtml = 
        '<div class="map-info-stat"><span class="map-info-stat-label">Расстояние</span><span class="map-info-stat-value">' + (isSun ? '—' : distA + ' а.е.') + '</span></div>' +
        '<div class="map-info-stat"><span class="map-info-stat-label">В млн км</span><span class="map-info-stat-value">' + millionKm.toLocaleString('ru') + '</span></div>' +
        '<div class="map-info-stat"><span class="map-info-stat-label">Диаметр</span><span class="map-info-stat-value">' + info.diameter + '</span></div>';
    } else if (currentMode === 'spectrum') {
      modeLabel = '🌡️ ТЕМПЕРАТУРА ПОВЕРХНОСТИ';
      const temp = isSun ? 5500 : getPlanetTemp(info.name);
      statsHtml = 
        '<div class="map-info-stat"><span class="map-info-stat-label">Температура</span><span class="map-info-stat-value">' + (temp > 0 ? '+' : '') + temp + '°C</span></div>' +
        '<div class="map-info-stat"><span class="map-info-stat-label">В Кельвинах</span><span class="map-info-stat-value">' + (temp + 273) + ' K</span></div>' +
        '<div class="map-info-stat"><span class="map-info-stat-label">Диаметр</span><span class="map-info-stat-value">' + info.diameter + '</span></div>';
    }
    
    panel.innerHTML = 
      '<div class="map-info-header">' +
        '<div class="map-info-emoji">' + (isSun ? '★' : '⊕') + '</div>' +
        '<div class="map-info-title-block">' +
          '<h3 class="map-info-title">' + info.name + '</h3>' +
          '<div class="map-info-type">' + modeLabel + '</div>' +
        '</div>' +
      '</div>' +
      '<p class="map-info-desc">' + (info.description || '') + '</p>' +
      '<div class="map-info-stats">' + statsHtml + '</div>';
  }
  
  resizeCanvas();
  window.addEventListener('resize', () => {
    clearTimeout(window._mapResizeTimeout);
    window._mapResizeTimeout = setTimeout(resizeCanvas, 250);
  });
}


// ═══ КВИЗ (с проверкой через бэкенд) ═══
function initQuiz() {
  const qEl = document.getElementById('quizQ');
  if (!qEl || QUIZ_QUESTIONS.length === 0) return;
  const scoreEl = document.getElementById('quizScore');
  const optsEl = document.getElementById('quizOpts');
  const fbEl = document.getElementById('quizFb');
  const nextBtn = document.getElementById('btnNext');
  let cur = 0, score = 0, answered = false;
  const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);

  function show() {
    if (cur >= shuffled.length) {
      qEl.textContent = 'Квиз завершён!';
      optsEl.innerHTML = '';
      fbEl.textContent = `Итог: ${score} из ${shuffled.length}`;
      fbEl.className = 'quiz-feedback ok';
      if (nextBtn) nextBtn.style.display = 'none';
      return;
    }
    answered = false;
    const q = shuffled[cur];
    qEl.textContent = (cur+1) + '. ' + q.q;
    fbEl.textContent = '';
    fbEl.className = 'quiz-feedback';
    if (nextBtn) nextBtn.style.display = 'none';
    if (scoreEl) scoreEl.textContent = `Очки: ${score} / ${cur}`;
    optsEl.innerHTML = '';
    q.opts.forEach((o, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt';
      btn.textContent = o;
      btn.addEventListener('click', () => handleAnswer(i, q, btn));
      optsEl.appendChild(btn);
    });
  }

  async function handleAnswer(i, question, btn) {
    if (answered) return;
    answered = true;
    const buttons = optsEl.querySelectorAll('.quiz-opt');
    buttons.forEach(b => b.disabled = true);
    
    const questionId = QUIZ_ID_MAP[question.q];
    let isCorrect = false;
    let correctAnswer = question.a;
    
    if (questionId) {
      try {
        const result = await CosmosAPI.checkQuizAnswer(questionId, i);
        isCorrect = result.correct || result.is_correct;
        if (result.correct_answer !== undefined) correctAnswer = result.correct_answer;
        await CosmosAPI.saveQuizProgress(questionId, isCorrect);
      } catch (e) {
        isCorrect = i === question.a;
      }
    } else {
      isCorrect = i === question.a;
    }
    
    if (isCorrect) {
      btn.classList.add('correct');
      fbEl.textContent = '✓ Правильно!';
      fbEl.className = 'quiz-feedback ok';
      score++;
    } else {
      btn.classList.add('wrong');
      buttons[correctAnswer].classList.add('correct');
      fbEl.textContent = '✗ Неверно.';
      fbEl.className = 'quiz-feedback fail';
    }
    if (scoreEl) scoreEl.textContent = `Очки: ${score} / ${cur+1}`;
    if (nextBtn) nextBtn.style.display = 'inline-block';
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { cur++; show(); });
  show();
}

// ═══ КАЛЬКУЛЯТОР ВЕСА (с бэкенда) ═══
function initCalculator() {
  const input = document.getElementById('weightInput');
  if (!input || PLANETS.length === 0 || !SUN) return;
  const resultsEl = document.getElementById('calcResults');
  
  function calculate() {
    const w = parseFloat(input.value);
    if (!resultsEl) return;
    if (isNaN(w) || w <= 0) {
      resultsEl.innerHTML = '<p style="color:var(--text-dim);text-align:center;padding:1rem">Введите ваш вес</p>';
      return;
    }
    
    const sunGravity = 274;
    
    resultsEl.innerHTML = `
      <div class="calc-sun calc-row">
        <span class="calc-emoji">${SUN.emoji || '★'}</span>
        <span class="calc-name">${SUN.name}</span>
        <span class="calc-weight">${(w * sunGravity / 9.81).toFixed(1)} кг</span>
      </div>
    ` + PLANETS.map(p => {
      const g = parseFloat(p.gravity) || 9.81;
      return `<div class="calc-row">
        <span class="calc-emoji">${p.emoji || '⊕'}</span>
        <span class="calc-name">${p.name}</span>
        <span class="calc-weight">${(w * g / 9.81).toFixed(1)} кг</span>
      </div>`;
    }).join('');
  }
  input.addEventListener('input', calculate);
  calculate();
}

// ═══ АККОРДЕОН ЧЁРНЫХ ДЫР (с бэкенда) ═══
function initBHAccordion() {
  const acc = document.getElementById('bhAccordion');
  if (!acc || BH_TYPES.length === 0) return;
  acc.innerHTML = BH_TYPES.map(t => `
    <div class="bh-acc-item">
      <div class="bh-acc-head"><span>${t.title}</span><span class="arrow">▼</span></div>
      <div class="bh-acc-body">${t.body}</div>
    </div>
  `).join('');
  acc.querySelectorAll('.bh-acc-head').forEach(head => {
    head.addEventListener('click', () => head.parentElement.classList.toggle('open'));
  });
}

function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) btn.classList.add('show');
    else btn.classList.remove('show');
  });
  btn.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));
}

// ═══ ГЛАВНАЯ ИНИЦИАЛИЗАЦИЯ ═══
async function initApp() {
  console.log('🚀 Запуск COSMOS...');
  
  try {
    await loadAllData();
  } catch (e) {
    document.body.innerHTML = `
      <div style="position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,#1B1D27 0%,#2A1F0A 100%);color:#E5AC52;font-family:'Orbitron',monospace;text-align:center;padding:2rem;">
        <div style="font-size:4rem;margin-bottom:1rem;">🚀❌</div>
        <h1 style="font-size:2rem;margin-bottom:1rem;letter-spacing:4px;">СЕРВЕР НЕДОСТУПЕН</h1>
        <p style="color:#DEC18C;margin-bottom:2rem;max-width:500px;">
          Запустите сервер: <code style="background:#000;padding:.3rem .6rem;border-radius:4px">python app.py</code>
        </p>
        <button onclick="location.reload()" style="margin-top:2rem;padding:1rem 2rem;background:#E5AC52;color:#1B1D27;border:none;border-radius:8px;font-weight:700;letter-spacing:2px;cursor:pointer;font-size:1rem;">ПОВТОРИТЬ</button>
      </div>
    `;
    return;
  }
  
  createStars();
  createShootingStars();
  setActiveNav();
  initBurgerMenu();
  
  initSolarSystem();
  initMap();
  initSatTracker();
  initQuiz();
  initCalculator();
  initBHSimulator();
  initBHAccordion();
  initScrollTop();
  initRandomFact();
  initTabs();
  initGalaxyFilters();
  
  renderPlanets();
  renderSatellites();
  renderBlackHoles();
  renderFacts();
  await renderGalaxies();
  
  const sunModalBtn = document.getElementById('sunModalBtn');
  if (sunModalBtn) sunModalBtn.addEventListener('click', openSunModal);
  
  const scrollToMapBtn = document.getElementById('scrollToMapBtn');
  if (scrollToMapBtn) scrollToMapBtn.addEventListener('click', scrollToMap);
  
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });
  
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeAllModals();
    });
  });
  
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllModals();
  });
  
  console.log('%c✅ COSMOS готов!', 'color: #E5AC52; font-weight: bold;');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
