// ═══════════════════════════════════════════════════════════
// COSMOS GAMES — Tetris, Snake, 2048, Clicker
// ═══════════════════════════════════════════════════════════

// ═══ ТЕТРИС ═══
window.tetrisState = {
  running: true,
  currentPiece: null,
  board: [],
  score: 0,
  level: 1,
  lines: 0,
  COLS: 10,
  ROWS: 20,
  BLOCK_SIZE: 20,
  nextPiece: null,
  dropInterval: 800,
  dropCounter: 0,
  lastTime: 0,
  animationId: null,
  pieces: [
    { shape: [[1,1,1,1]], color: '#00ffff', glow: '#00ffff', name: 'I' },
    { shape: [[1,1],[1,1]], color: '#ffff00', glow: '#ffff00', name: 'O' },
    { shape: [[0,1,0],[1,1,1]], color: '#ff00ff', glow: '#ff00ff', name: 'T' },
    { shape: [[0,1,1],[1,1,0]], color: '#00ff88', glow: '#00ff88', name: 'S' },
    { shape: [[1,1,0],[0,1,1]], color: '#ff0088', glow: '#ff0088', name: 'Z' },
    { shape: [[1,0,0],[1,1,1]], color: '#0088ff', glow: '#0088ff', name: 'J' },
    { shape: [[0,0,1],[1,1,1]], color: '#ff8800', glow: '#ff8800', name: 'L' }
  ]
};

function tetrisCollide(piece, offsetX, offsetY) {
  const state = window.tetrisState;
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newX = piece.x + x + offsetX;
        const newY = piece.y + y + offsetY;
        if (newX < 0 || newX >= state.COLS || newY >= state.ROWS) return true;
        if (newY >= 0 && state.board[newY][newX]) return true;
      }
    }
  }
  return false;
}

function tetrisMergePiece() {
  const state = window.tetrisState;
  const piece = state.currentPiece;
  if (!piece) return;
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const boardY = piece.y + y;
        if (boardY >= 0 && boardY < state.ROWS) {
          state.board[boardY][piece.x + x] = { color: piece.color, glow: piece.glow };
        }
      }
    }
  }
}

function tetrisRotatePiece() {
  const state = window.tetrisState;
  const piece = state.currentPiece;
  if (!piece) return;
  const rotated = piece.shape[0].map((_, i) => 
    piece.shape.map(row => row[i]).reverse()
  );
  const oldShape = piece.shape;
  piece.shape = rotated;
  if (tetrisCollide(piece, 0, 0)) piece.shape = oldShape;
}

function tetrisDrop() {
  const state = window.tetrisState;
  if (!state.currentPiece || !state.running) return;
  state.currentPiece.y++;
  if (tetrisCollide(state.currentPiece, 0, 0)) {
    state.currentPiece.y--;
    tetrisMergePiece();
    tetrisClearLines();
    state.currentPiece = state.nextPiece;
    state.nextPiece = tetrisGetRandomPiece();
    if (tetrisCollide(state.currentPiece, 0, 0)) {
      tetrisGameOver();
    }
  }
  state.dropCounter = 0;
}

function tetrisClearLines() {
  const state = window.tetrisState;
  let cleared = 0;
  for (let y = state.ROWS - 1; y >= 0; y--) {
    if (state.board[y].every(cell => cell !== null)) {
      state.board.splice(y, 1);
      state.board.unshift(Array(state.COLS).fill(null));
      cleared++;
      y++;
    }
  }
  if (cleared > 0) {
    const points = [0, 100, 300, 500, 800][cleared] * state.level;
    state.score += points;
    state.lines += cleared;
    state.level = Math.floor(state.lines / 10) + 1;
    state.dropInterval = Math.max(100, 800 - (state.level - 1) * 50);
    
    const scoreEl = document.getElementById('tetrisScore');
    const levelEl = document.getElementById('tetrisLevel');
    const linesEl = document.getElementById('tetrisLines');
    if (scoreEl) scoreEl.textContent = state.score;
    if (levelEl) levelEl.textContent = state.level;
    if (linesEl) linesEl.textContent = state.lines;
    
    // Сохраняем рекорд на сервере
    if (window.CosmosAPI) {
      window.CosmosAPI.saveScore('tetris', state.score).catch(() => {});
    }
  }
}

function tetrisGetRandomPiece() {
  const state = window.tetrisState;
  const piece = state.pieces[Math.floor(Math.random() * state.pieces.length)];
  return {
    shape: piece.shape.map(row => [...row]),
    color: piece.color,
    glow: piece.glow,
    name: piece.name,
    x: Math.floor(state.COLS / 2) - Math.floor(piece.shape[0].length / 2),
    y: 0
  };
}

function tetrisDrawBlock(ctx, x, y, color, glow, size) {
  ctx.shadowBlur = 12;
  ctx.shadowColor = glow;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
  ctx.shadowBlur = 0;
  const innerGrad = ctx.createRadialGradient(x + size/2, y + size/2, 0, x + size/2, y + size/2, size/2);
  innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
  innerGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
  innerGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
  ctx.fillStyle = innerGrad;
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
}

function tetrisDrawBoard(ctx, canvas) {
  const state = window.tetrisState;
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(100, 150, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= state.COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * state.BLOCK_SIZE, 0);
    ctx.lineTo(x * state.BLOCK_SIZE, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= state.ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * state.BLOCK_SIZE);
    ctx.lineTo(canvas.width, y * state.BLOCK_SIZE);
    ctx.stroke();
  }
  for (let y = 0; y < state.ROWS; y++) {
    for (let x = 0; x < state.COLS; x++) {
      if (state.board[y][x]) {
        tetrisDrawBlock(ctx, x * state.BLOCK_SIZE, y * state.BLOCK_SIZE, 
                       state.board[y][x].color, state.board[y][x].glow, state.BLOCK_SIZE);
      }
    }
  }
}

function tetrisDrawPiece(ctx, canvas, piece) {
  const state = window.tetrisState;
  if (!piece) return;
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const drawX = (piece.x + x) * state.BLOCK_SIZE;
        const drawY = (piece.y + y) * state.BLOCK_SIZE;
        tetrisDrawBlock(ctx, drawX, drawY, piece.color, piece.glow, state.BLOCK_SIZE);
      }
    }
  }
}

function tetrisDrawNext(ctx, canvas, piece) {
  const state = window.tetrisState;
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (!piece) return;
  const size = 18;
  const offsetX = (canvas.width - piece.shape[0].length * size) / 2;
  const offsetY = (canvas.height - piece.shape.length * size) / 2;
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        tetrisDrawBlock(ctx, offsetX + x * size, offsetY + y * size, 
                       piece.color, piece.glow, size);
      }
    }
  }
}

function tetrisGameOver() {
  const state = window.tetrisState;
  state.running = false;
  if (state.animationId) cancelAnimationFrame(state.animationId);
  const canvas = document.getElementById('tetrisCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#E5AC52';
  ctx.fillStyle = '#E5AC52';
  ctx.font = 'bold 26px Orbitron, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#A9A6B8';
  ctx.font = '13px Orbitron, monospace';
  ctx.fillText('Счёт: ' + state.score, canvas.width / 2, canvas.height / 2 + 10);
  ctx.fillText('Линии: ' + state.lines, canvas.width / 2, canvas.height / 2 + 30);
  const btn = document.getElementById('btnTetris');
  if (btn) btn.textContent = 'СНОВА';
}

function tetrisUpdate(time) {
  const state = window.tetrisState;
  if (!state.running) return;
  const deltaTime = time - state.lastTime;
  state.lastTime = time;
  state.dropCounter += deltaTime;
  if (state.dropCounter > state.dropInterval) {
    tetrisDrop();
  }
  const canvas = document.getElementById('tetrisCanvas');
  const nextCanvas = document.getElementById('tetrisNextCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    tetrisDrawBoard(ctx, canvas);
    tetrisDrawPiece(ctx, canvas, state.currentPiece);
  }
  if (nextCanvas) {
    const nextCtx = nextCanvas.getContext('2d');
    tetrisDrawNext(nextCtx, nextCanvas, state.nextPiece);
  }
  state.animationId = requestAnimationFrame(tetrisUpdate);
}

function startTetris() {
  const state = window.tetrisState;
  state.board = Array.from({ length: state.ROWS }, () => Array(state.COLS).fill(null));
  state.score = 0;
  state.level = 1;
  state.lines = 0;
  state.dropInterval = 800;
  state.dropCounter = 0;
  state.running = true;
  state.currentPiece = tetrisGetRandomPiece();
  state.nextPiece = tetrisGetRandomPiece();
  const scoreEl = document.getElementById('tetrisScore');
  const levelEl = document.getElementById('tetrisLevel');
  const linesEl = document.getElementById('tetrisLines');
  if (scoreEl) scoreEl.textContent = '0';
  if (levelEl) levelEl.textContent = '1';
  if (linesEl) linesEl.textContent = '0';
  const btn = document.getElementById('btnTetris');
  if (btn) btn.textContent = 'СТОП';
  state.lastTime = performance.now();
  state.animationId = requestAnimationFrame(tetrisUpdate);
}

function stopTetris() {
  const state = window.tetrisState;
  state.running = false;
  if (state.animationId) cancelAnimationFrame(state.animationId);
  const btn = document.getElementById('btnTetris');
  if (btn) btn.textContent = 'СТАРТ';
  const canvas = document.getElementById('tetrisCanvas');
  const nextCanvas = document.getElementById('tetrisNextCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    tetrisDrawBoard(ctx, canvas);
    tetrisDrawPiece(ctx, canvas, state.currentPiece);
  }
  if (nextCanvas) {
    const nextCtx = nextCanvas.getContext('2d');
    tetrisDrawNext(nextCtx, nextCanvas, state.nextPiece);
  }
}

function initTetris() {
  const btn = document.getElementById('btnTetris');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (window.tetrisState.running) stopTetris();
    else startTetris();
  });
  const state = window.tetrisState;
  state.board = Array.from({ length: state.ROWS }, () => Array(state.COLS).fill(null));
  state.nextPiece = tetrisGetRandomPiece();
  const canvas = document.getElementById('tetrisCanvas');
  const nextCanvas = document.getElementById('tetrisNextCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    tetrisDrawBoard(ctx, canvas);
  }
  if (nextCanvas) {
    const nextCtx = nextCanvas.getContext('2d');
    tetrisDrawNext(nextCtx, nextCanvas, state.nextPiece);
  }
}

// ═══ ЗМЕЙКА ═══
window.snakeState = {
  running: false,
  canvas: null,
  ctx: null,
  snake: [],
  food: null,
  direction: 'right',
  nextDirection: 'right',
  score: 0,
  best: 0,
  speed: 150,
  lastTime: 0,
  animationId: null,
  cellSize: 18,
  cols: 16,
  rows: 16,
  particles: []
};

function snakeReset() {
  const state = window.snakeState;
  const cx = Math.floor(state.cols / 2);
  const cy = Math.floor(state.rows / 2);
  state.snake = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
  state.direction = 'right';
  state.nextDirection = 'right';
  state.score = 0;
  state.speed = 150;
  state.particles = [];
  const scoreEl = document.getElementById('snakeScore');
  if (scoreEl) scoreEl.textContent = '0';
  snakeSpawnFood();
}

function snakeSpawnFood() {
  const state = window.snakeState;
  let attempts = 0;
  while (attempts < 100) {
    state.food = {
      x: Math.floor(Math.random() * state.cols),
      y: Math.floor(Math.random() * state.rows),
      type: Math.random() < 0.15 ? 'star' : 'planet'
    };
    if (!state.snake.some(s => s.x === state.food.x && s.y === state.food.y)) break;
    attempts++;
  }
}

function snakeDrawBackground(ctx, canvas) {
  const bgGrad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, 250);
  bgGrad.addColorStop(0, '#0a1a3a');
  bgGrad.addColorStop(1, '#000208');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + Math.random() * 0.3})`;
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
  }
}

function snakeDrawIdle() {
  const state = window.snakeState;
  if (!state.ctx) return;
  const ctx = state.ctx;
  snakeDrawBackground(ctx, state.canvas);
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#00ffff';
  ctx.fillStyle = '#00ffff';
  ctx.font = 'bold 16px Orbitron, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('НАЖМИ СТАРТ', state.canvas.width / 2, state.canvas.height / 2);
  ctx.shadowBlur = 0;
}

function snakeDraw() {
  const state = window.snakeState;
  if (!state.ctx) return;
  const ctx = state.ctx;
  const size = state.cellSize;
  snakeDrawBackground(ctx, state.canvas);
  if (state.food) {
    const fx = state.food.x * size + size / 2;
    const fy = state.food.y * size + size / 2;
    if (state.food.type === 'star') {
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#FFD700';
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(fx, fy, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#88BBEE';
      const grad = ctx.createRadialGradient(fx - 2, fy - 2, 0, fx, fy, size / 2);
      grad.addColorStop(0, '#aaccff');
      grad.addColorStop(1, '#4A7BAA');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(fx, fy, size / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  state.snake.forEach((seg, i) => {
    const x = seg.x * size;
    const y = seg.y * size;
    const isHead = i === 0;
    if (isHead) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ffff';
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
      ctx.shadowBlur = 0;
    } else {
      const alpha = Math.max(0.3, 1 - (i / state.snake.length) * 0.7);
      ctx.fillStyle = `rgba(79, 195, 247, ${alpha})`;
      ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    }
  });
}

function snakeUpdate(time) {
  const state = window.snakeState;
  if (!state.running) return;
  if (time - state.lastTime < state.speed) {
    state.animationId = requestAnimationFrame(snakeUpdate);
    return;
  }
  state.lastTime = time;
  state.direction = state.nextDirection;
  const head = { ...state.snake[0] };
  if (state.direction === 'up') head.y--;
  else if (state.direction === 'down') head.y++;
  else if (state.direction === 'left') head.x--;
  else if (state.direction === 'right') head.x++;
  if (head.x < 0 || head.x >= state.cols || head.y < 0 || head.y >= state.rows) {
    snakeGameOver();
    return;
  }
  if (state.snake.some(s => s.x === head.x && s.y === head.y)) {
    snakeGameOver();
    return;
  }
  state.snake.unshift(head);
  if (head.x === state.food.x && head.y === state.food.y) {
    state.score += state.food.type === 'star' ? 5 : 1;
    const scoreEl = document.getElementById('snakeScore');
    if (scoreEl) scoreEl.textContent = state.score;
    if (state.score > state.best) {
      state.best = state.score;
      const bestEl = document.getElementById('snakeBest');
      if (bestEl) bestEl.textContent = state.best;
      localStorage.setItem('snakeBest', state.best);
    }
    snakeSpawnFood();
    state.speed = Math.max(70, 150 - Math.floor(state.score / 5) * 10);
  } else {
    state.snake.pop();
  }
  snakeDraw();
  state.animationId = requestAnimationFrame(snakeUpdate);
}

function snakeGameOver() {
  const state = window.snakeState;
  state.running = false;
  if (state.animationId) cancelAnimationFrame(state.animationId);
  if (window.CosmosAPI) {
    window.CosmosAPI.saveScore('snake', state.score).catch(() => {});
  }
  if (!state.ctx) return;
  const ctx = state.ctx;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#ff0055';
  ctx.fillStyle = '#ff0055';
  ctx.font = 'bold 20px Orbitron, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', state.canvas.width / 2, state.canvas.height / 2);
  ctx.shadowBlur = 0;
  const btn = document.getElementById('btnSnake');
  if (btn) btn.textContent = 'СНОВА';
}

function startSnake() {
  const state = window.snakeState;
  snakeReset();
  state.running = true;
  const btn = document.getElementById('btnSnake');
  if (btn) btn.textContent = 'СТОП';
  state.lastTime = performance.now();
  state.animationId = requestAnimationFrame(snakeUpdate);
}

function stopSnake() {
  const state = window.snakeState;
  state.running = false;
  if (state.animationId) cancelAnimationFrame(state.animationId);
  const btn = document.getElementById('btnSnake');
  if (btn) btn.textContent = 'СТАРТ';
  snakeDrawIdle();
}

function initSnake() {
  const canvas = document.getElementById('snakeCanvas');
  if (!canvas) return;
  
  const state = window.snakeState;
  state.canvas = canvas;
  state.ctx = canvas.getContext('2d');
  
  // Читаем рекорд из localStorage
  state.best = parseInt(localStorage.getItem('snakeBest') || '0');
  const bestEl = document.getElementById('snakeBest');
  if (bestEl) bestEl.textContent = state.best;
  
  // Инициализация начального состояния
  snakeReset();
  snakeDrawIdle();
  
  // Кнопка СТАРТ/СТОП
  const btn = document.getElementById('btnSnake');
  if (btn && !btn._bound) {
    btn._bound = true;
    btn.addEventListener('click', () => {
      if (state.running) stopSnake();
      else startSnake();
    });
  }
}


// ═══ КЛИКЕР ═══
window.clickerState = {
  energy: 0,
  perClick: 1,
  autoPerSecond: 0,
  clickCost: 10,
  autoCost: 50,
  interval: null,
  emojis: ['⊕', '●', '◉', '⊜', '◌', '⊙', '★', '✦', '✺', '⊛'],
  emojiIndex: 0
};

function clickerUpdate() {
  const state = window.clickerState;
  const energyEl = document.getElementById('clickerEnergy');
  const perClickEl = document.getElementById('clickerPerClick');
  const autoEl = document.getElementById('clickerAuto');
  if (energyEl) energyEl.textContent = Math.floor(state.energy);
  if (perClickEl) perClickEl.textContent = state.perClick;
  if (autoEl) autoEl.textContent = state.autoPerSecond + '/сек';
}

function clickerSpawnParticles(x, y, amount) {
  const target = document.getElementById('clickerTarget');
  if (!target) return;
  for (let i = 0; i < 3; i++) {
    const particle = document.createElement('div');
    particle.textContent = '+' + amount;
    particle.style.cssText = `position:absolute;left:${x}px;top:${y}px;color:#00ffff;font-weight:bold;font-family:'Orbitron',monospace;pointer-events:none;transition:all 0.8s ease-out;z-index:10;text-shadow:0 0 10px #00ffff,0 0 20px #00ffff;`;
    target.parentElement.appendChild(particle);
    requestAnimationFrame(() => {
      particle.style.transform = `translate(${Math.random() * 60 - 30}px, -80px)`;
      particle.style.opacity = '0';
    });
    setTimeout(() => particle.remove(), 800);
  }
}

function initClicker() {
  const target = document.getElementById('clickerTarget');
  if (!target) return;
  const state = window.clickerState;
  target.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const amount = state.perClick;
    state.energy += amount;
    const parentRect = target.parentElement.getBoundingClientRect();
    clickerSpawnParticles(e.clientX - parentRect.left, e.clientY - parentRect.top, amount);
    target.style.transform = 'scale(0.85)';
    setTimeout(() => target.style.transform = 'scale(1)', 100);
    state.emojiIndex = (state.emojiIndex + 1) % state.emojis.length;
    target.textContent = state.emojis[state.emojiIndex];
    clickerUpdate();
  });
  document.querySelectorAll('.clicker-upgrade').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const type = btn.dataset.upgrade;
      if (type === 'click') {
        if (state.energy >= state.clickCost) {
          state.energy -= state.clickCost;
          state.perClick++;
          state.clickCost = Math.floor(state.clickCost * 1.5);
          const costEl = btn.querySelector('.upgrade-cost');
          if (costEl) costEl.textContent = '⚡ ' + state.clickCost;
        }
      } else if (type === 'auto') {
        if (state.energy >= state.autoCost) {
          state.energy -= state.autoCost;
          state.autoPerSecond++;
          state.autoCost = Math.floor(state.autoCost * 2);
          const costEl = btn.querySelector('.upgrade-cost');
          if (costEl) costEl.textContent = '⚡ ' + state.autoCost;
          if (!state.interval) {
            state.interval = setInterval(() => {
              state.energy += state.autoPerSecond;
              clickerUpdate();
            }, 1000);
          }
        }
      }
      clickerUpdate();
    });
  });
  clickerUpdate();
}

// ═══ 2048 ═══
window.game2048State = {
  board: [],
  size: 4,
  score: 0,
  started: false,
  planets: ['🌑', '🌕', '🌍', '🪐', '🌟', '⭐', '🌌', '☀️', '💫', '✨', '🌞']
};

function g2048CreateBoard() {
  return Array.from({ length: window.game2048State.size }, () => 
    Array(window.game2048State.size).fill(0)
  );
}

function g2048AddRandomTile() {
  const state = window.game2048State;
  const empty = [];
  for (let y = 0; y < state.size; y++) {
    for (let x = 0; x < state.size; x++) {
      if (state.board[y][x] === 0) empty.push({ x, y });
    }
  }
  if (empty.length > 0) {
    const tile = empty[Math.floor(Math.random() * empty.length)];
    state.board[tile.y][tile.x] = Math.random() < 0.9 ? 1 : 2;
  }
}

function g2048Render() {
  const state = window.game2048State;
  const boardEl = document.getElementById('game2048Board');
  const scoreEl = document.getElementById('game2048Score');
  if (!boardEl) return;
  boardEl.innerHTML = '';
  for (let y = 0; y < state.size; y++) {
    for (let x = 0; x < state.size; x++) {
      const cell = document.createElement('div');
      cell.className = 'game-2048-cell';
      const value = state.board[y][x];
      if (value > 0) {
        const planetIdx = Math.min(value - 1, state.planets.length - 1);
        cell.textContent = state.planets[planetIdx];
        cell.classList.add(`level-${Math.min(value, 8)}`);
      }
      boardEl.appendChild(cell);
    }
  }
  if (scoreEl) scoreEl.textContent = state.score;
}

function g2048RenderIdle() {
  const boardEl = document.getElementById('game2048Board');
  if (!boardEl) return;
  boardEl.innerHTML = '';
  for (let y = 0; y < window.game2048State.size; y++) {
    for (let x = 0; x < window.game2048State.size; x++) {
      const cell = document.createElement('div');
      cell.className = 'game-2048-cell';
      boardEl.appendChild(cell);
    }
  }
}

function g2048Rotate(board) {
  const state = window.game2048State;
  const newBoard = g2048CreateBoard();
  for (let y = 0; y < state.size; y++) {
    for (let x = 0; x < state.size; x++) {
      newBoard[x][state.size - 1 - y] = board[y][x];
    }
  }
  return newBoard;
}

function g2048MoveLeft(board) {
  const state = window.game2048State;
  let changed = false;
  for (let y = 0; y < state.size; y++) {
    let row = board[y].filter(v => v !== 0);
    for (let i = 0; i < row.length - 1; i++) {
      if (row[i] === row[i + 1]) {
        row[i] *= 2;
        state.score += row[i];
        row.splice(i + 1, 1);
        changed = true;
      }
    }
    while (row.length < state.size) row.push(0);
    for (let x = 0; x < state.size; x++) {
      if (board[y][x] !== row[x]) changed = true;
      board[y][x] = row[x];
    }
  }
  return changed;
}

function g2048Move(direction) {
  const state = window.game2048State;
  if (!state.started) return;
  const workBoard = state.board.map(row => [...row]);
  let moved = false;
  if (direction === 'right') {
    const reversed = workBoard.map(row => row.reverse());
    if (g2048MoveLeft(reversed)) {
      state.board = reversed.map(row => row.reverse());
      moved = true;
    }
  } else if (direction === 'left') {
    if (g2048MoveLeft(workBoard)) {
      state.board = workBoard;
      moved = true;
    }
  } else if (direction === 'up') {
    const rotated = g2048Rotate(g2048Rotate(g2048Rotate(workBoard)));
    if (g2048MoveLeft(rotated)) {
      state.board = g2048Rotate(rotated);
      moved = true;
    }
  } else if (direction === 'down') {
    const rotated = g2048Rotate(workBoard);
    if (g2048MoveLeft(rotated)) {
      state.board = g2048Rotate(g2048Rotate(g2048Rotate(rotated)));
      moved = true;
    }
  }
  if (moved) {
    g2048AddRandomTile();
    g2048Render();
    if (state.score > 0 && state.score % 100 === 0) {
      if (window.CosmosAPI) window.CosmosAPI.saveScore('2048', state.score).catch(() => {});
    }
  }
}

function g2048Reset() {
  const state = window.game2048State;
  state.board = g2048CreateBoard();
  state.score = 0;
  state.started = true;
  g2048AddRandomTile();
  g2048AddRandomTile();
  g2048Render();
  const btn = document.getElementById('btn2048Start');
  if (btn) btn.textContent = 'СБРОС';
}

function init2048() {
  const boardEl = document.getElementById('game2048Board');
  const btn = document.getElementById('btn2048Start');
  if (!boardEl) return;
  g2048RenderIdle();
  if (btn) {
    btn.addEventListener('click', () => g2048Reset());
  }
  let touchStartX = 0, touchStartY = 0;
  boardEl.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  boardEl.addEventListener('touchend', (e) => {
    if (!window.game2048State.started) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) g2048Move(dx > 0 ? 'right' : 'left');
    else g2048Move(dy > 0 ? 'down' : 'up');
  }, { passive: true });
}

// ═══ КЛАВИАТУРА ═══
document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (window.tetrisState && window.tetrisState.running && window.tetrisState.currentPiece) {
    if (key === 'arrowleft' || key === 'a') {
      e.preventDefault();
      window.tetrisState.currentPiece.x--;
      if (tetrisCollide(window.tetrisState.currentPiece, 0, 0)) window.tetrisState.currentPiece.x++;
    } else if (key === 'arrowright' || key === 'd') {
      e.preventDefault();
      window.tetrisState.currentPiece.x++;
      if (tetrisCollide(window.tetrisState.currentPiece, 0, 0)) window.tetrisState.currentPiece.x--;
    } else if (key === 'arrowdown' || key === 's') {
      e.preventDefault();
      tetrisDrop();
    } else if (key === 'arrowup' || key === 'w') {
      e.preventDefault();
      tetrisRotatePiece();
    }
  }
  if (window.snakeState && window.snakeState.running) {
    if ((key === 'arrowup' || key === 'w') && window.snakeState.direction !== 'down') {
      e.preventDefault();
      window.snakeState.nextDirection = 'up';
    } else if ((key === 'arrowdown' || key === 's') && window.snakeState.direction !== 'up') {
      e.preventDefault();
      window.snakeState.nextDirection = 'down';
    } else if ((key === 'arrowleft' || key === 'a') && window.snakeState.direction !== 'right') {
      e.preventDefault();
      window.snakeState.nextDirection = 'left';
    } else if ((key === 'arrowright' || key === 'd') && window.snakeState.direction !== 'left') {
      e.preventDefault();
      window.snakeState.nextDirection = 'right';
    }
  }
  if (document.getElementById('game2048Board')) {
    if (key === 'arrowleft' || key === 'a') { e.preventDefault(); g2048Move('left'); }
    else if (key === 'arrowright' || key === 'd') { e.preventDefault(); g2048Move('right'); }
    else if (key === 'arrowup' || key === 'w') { e.preventDefault(); g2048Move('up'); }
    else if (key === 'arrowdown' || key === 's') { e.preventDefault(); g2048Move('down'); }
  }
});

// ═══ ИНИЦИАЛИЗАЦИЯ ═══
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('tetrisCanvas')) initTetris();
  if (document.getElementById('snakeCanvas')) initSnake();
  if (document.getElementById('clickerTarget')) initClicker();
  if (document.getElementById('game2048Board')) init2048();
});
// ═══════════════════════════════════════════════════════════
// УКЛОНЕНИЕ ОТ АСТЕРОИДОВ
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// УКЛОНЕНИЕ ОТ АСТЕРОИДОВ + СТРЕЛЬБА
// ═══════════════════════════════════════════════════════════
window.dodgeState = {
  running: false,
  canvas: null,
  ctx: null,
  ship: { x: 0, y: 0, w: 24, h: 28 },
  asteroids: [],
  bullets: [],
  particles: [],
  score: 0,
  kills: 0,
  lives: 3,
  speed: 2,
  spawnRate: 0.04,
  fireRate: 200,
  lastFire: 0,
  animationId: null,
  lastTime: 0,
  mouseX: 0,
  mouseY: 0,
  bulletsLeft: Infinity,
  lastShotAsteroid: null
};

function dodgeInit() {
  const state = window.dodgeState;
  const canvas = document.getElementById('dodgeCanvas');
  if (!canvas) return;
  state.canvas = canvas;
  state.ctx = canvas.getContext('2d');
  canvas.width = 288;
  canvas.height = 220;
  
  state.ship.x = canvas.width / 2;
  state.ship.y = canvas.height - 40;
  state.mouseX = state.ship.x;
  state.mouseY = state.ship.y;
  
  const btn = document.getElementById('btnDodge');
  if (btn && !btn._bound) {
    btn._bound = true;
    btn.addEventListener('click', () => {
      if (state.running) dodgeStop();
      else dodgeStart();
    });
  }
  
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    state.mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    state.mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
  });
  
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    state.mouseX = (t.clientX - rect.left) * (canvas.width / rect.width);
    state.mouseY = (t.clientY - rect.top) * (canvas.height / rect.height);
  }, { passive: false });
  
  // Клик/тап = выстрел
  canvas.addEventListener('mousedown', e => dodgeFire());
  canvas.addEventListener('touchstart', e => { e.preventDefault(); dodgeFire(); }, { passive: false });
  
  // Пробел = выстрел (на странице)
  document.addEventListener('keydown', e => {
    if (state.running && (e.key === ' ' || e.key === 'Spacebar')) {
      e.preventDefault();
      dodgeFire();
    }
  });
  
  // HUD: добавляем счётчик убийств
  const hud = document.querySelector('#dodgeCanvas')?.closest('.game-card')?.querySelector('.game-hud');
  if (hud && !document.getElementById('dodgeKills')) {
    const killsDiv = document.createElement('div');
    killsDiv.innerHTML = `<div class="hud-val" id="dodgeKills">0</div><div class="hud-label">УБИТО</div>`;
    const btn = hud.querySelector('#btnDodge');
    if (btn) hud.insertBefore(killsDiv, btn);
  }
  
  dodgeRender();
}

function dodgeFire() {
  const state = window.dodgeState;
  if (!state.running) return;
  const now = performance.now();
  if (now - state.lastFire < state.fireRate) return;
  state.lastFire = now;
  
  state.bullets.push({
    x: state.ship.x,
    y: state.ship.y - 14,
    vy: -7
  });
}

function dodgeStart() {
  const state = window.dodgeState;
  state.running = true;
  state.asteroids = [];
  state.bullets = [];
  state.particles = [];
  state.score = 0;
  state.kills = 0;
  state.lives = 3;
  state.speed = 2;
  state.spawnRate = 0.04;
  state.lastTime = performance.now();
  state.lastFire = 0;
  
  const scoreEl = document.getElementById('dodgeScore');
  const livesEl = document.getElementById('dodgeLives');
  const killsEl = document.getElementById('dodgeKills');
  if (scoreEl) scoreEl.textContent = '0';
  if (livesEl) livesEl.textContent = '♥♥♥';
  if (killsEl) killsEl.textContent = '0';
  
  const btn = document.getElementById('btnDodge');
  if (btn) btn.textContent = 'СТОП';
  
  state.animationId = requestAnimationFrame(dodgeLoop);
}

function dodgeStop() {
  const state = window.dodgeState;
  state.running = false;
  if (state.animationId) cancelAnimationFrame(state.animationId);
  const btn = document.getElementById('btnDodge');
  if (btn) btn.textContent = 'СТАРТ';
  dodgeRender();
}

function dodgeLoop(time) {
  const state = window.dodgeState;
  if (!state.running) return;
  
  const delta = time - state.lastTime;
  state.lastTime = time;
  
  // Движение корабля
  const dx = state.mouseX - state.ship.x;
  const dy = state.mouseY - state.ship.y;
  state.ship.x += dx * 0.15;
  state.ship.y += dy * 0.15;
  state.ship.x = Math.max(15, Math.min(state.canvas.width - 15, state.ship.x));
  state.ship.y = Math.max(15, Math.min(state.canvas.height - 15, state.ship.y));
  
  // Спавн астероидов
  if (Math.random() < state.spawnRate) {
    state.asteroids.push({
      x: Math.random() * state.canvas.width,
      y: -20,
      r: 8 + Math.random() * 12,
      vy: state.speed + Math.random() * 2,
      vx: (Math.random() - 0.5) * 1.5,
      rot: 0,
      rotSpeed: (Math.random() - 0.5) * 0.1,
      color: `hsl(${20 + Math.random() * 20}, 60%, ${40 + Math.random() * 20}%)`
    });
  }
  
  // Астероиды
  state.asteroids.forEach(a => {
    a.x += a.vx;
    a.y += a.vy;
    a.rot += a.rotSpeed;
  });
  state.asteroids = state.asteroids.filter(a => a.y < state.canvas.height + 30);
  
  // Пули
  state.bullets.forEach(b => { b.y += b.vy; });
  state.bullets = state.bullets.filter(b => b.y > -10);
  
  // === СТОЛКНОВЕНИЯ ПУЛЬ С АСТЕРОИДАМИ ===
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const b = state.bullets[i];
    for (let j = state.asteroids.length - 1; j >= 0; j--) {
      const a = state.asteroids[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      if (Math.sqrt(dx*dx + dy*dy) < a.r + 4) {
        // Взрыв астероида
        for (let p = 0; p < 10; p++) {
          state.particles.push({
            x: a.x, y: a.y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            r: 1.5 + Math.random() * 2.5,
            life: 25 + Math.random() * 15,
            color: a.color
          });
        }
        state.asteroids.splice(j, 1);
        state.bullets.splice(i, 1);
        state.kills++;
        state.score += 10;
        const killsEl = document.getElementById('dodgeKills');
        if (killsEl) killsEl.textContent = state.kills;
        break;
      }
    }
  }
  
  // === СТОЛКНОВЕНИЯ КОРАБЛЯ С АСТЕРОИДАМИ ===
  for (let i = state.asteroids.length - 1; i >= 0; i--) {
    const a = state.asteroids[i];
    const dx = a.x - state.ship.x;
    const dy = a.y - state.ship.y;
    if (Math.sqrt(dx*dx + dy*dy) < a.r + 13) {
      for (let p = 0; p < 12; p++) {
        state.particles.push({
          x: a.x, y: a.y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          r: 2 + Math.random() * 3,
          life: 35,
          color: '#ff5500'
        });
      }
      state.asteroids.splice(i, 1);
      state.lives--;
      const livesEl = document.getElementById('dodgeLives');
      if (livesEl) livesEl.textContent = '♥'.repeat(Math.max(0, state.lives));
      
      if (state.lives <= 0) {
        dodgeGameOver();
        return;
      }
    }
  }
  
  // Частицы
  state.particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.96;
    p.vy *= 0.96;
    p.life--;
  });
  state.particles = state.particles.filter(p => p.life > 0);
  
  // Очки за выживание
  state.score += 1;
  if (state.score % 200 === 0) {
    state.speed += 0.3;
    state.spawnRate = Math.min(0.08, state.spawnRate + 0.005);
  }
  const scoreEl = document.getElementById('dodgeScore');
  if (scoreEl) scoreEl.textContent = state.score;
  
  dodgeRender();
  state.animationId = requestAnimationFrame(dodgeLoop);
}

function dodgeRender() {
  const state = window.dodgeState;
  const ctx = state.ctx;
  const W = state.canvas.width;
  const H = state.canvas.height;
  
  // Фон
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  for (let i = 0; i < 25; i++) {
    const x = (i * 53 + state.score * 0.1) % W;
    const y = (i * 31) % H;
    ctx.fillRect(x, y, 1, 1);
  }
  
  // Частицы
  state.particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.min(1, p.life / 25);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  
  // Пули
  state.bullets.forEach(b => {
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#FFD740';
    ctx.fillStyle = '#FFD740';
    ctx.beginPath();
    ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(b.x - 1, b.y - 2, 2, 6);
    ctx.restore();
  });
  
  // Астероиды
  state.asteroids.forEach(a => {
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.rot);
    ctx.fillStyle = a.color;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = a.r * (0.8 + (i % 2) * 0.2);
      if (i === 0) ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      else ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  });
  
  // Корабль
  ctx.save();
  ctx.translate(state.ship.x, state.ship.y);
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#00ffff';
  ctx.fillStyle = '#00ffff';
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(-12, 12);
  ctx.lineTo(-4, 8);
  ctx.lineTo(0, 14);
  ctx.lineTo(4, 8);
  ctx.lineTo(12, 12);
  ctx.closePath();
  ctx.fill();
  // Пламя
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FF8C00';
  ctx.beginPath();
  ctx.moveTo(-3, 12);
  ctx.lineTo(0, 18 + Math.random() * 4);
  ctx.lineTo(3, 12);
  ctx.fill();
  ctx.restore();
}

function dodgeGameOver() {
  const state = window.dodgeState;
  state.running = false;
  if (state.animationId) cancelAnimationFrame(state.animationId);
  if (window.CosmosAPI) {
    window.CosmosAPI.saveScore('dodge', state.score).catch(() => {});
  }
  const ctx = state.ctx;
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);
  ctx.fillStyle = '#ff0055';
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#ff0055';
  ctx.font = 'bold 18px Orbitron, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', state.canvas.width/2, state.canvas.height/2 - 15);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#A9A6B8';
  ctx.font = '12px Orbitron, monospace';
  ctx.fillText('Счёт: ' + state.score, state.canvas.width/2, state.canvas.height/2 + 5);
  ctx.fillText('Убито: ' + state.kills, state.canvas.width/2, state.canvas.height/2 + 22);
  const btn = document.getElementById('btnDodge');
  if (btn) btn.textContent = 'СНОВА';
}



// ═══════════════════════════════════════════════════════════
// КОСМИЧЕСКАЯ ПАМЯТЬ
// ═══════════════════════════════════════════════════════════
window.memoryState = {
  cards: [],
  flipped: [],
  matched: 0,
  moves: 0,
  locked: false,
  emojis: ['🌍', '🪐', '🌙', '⭐', '☄️', '🌌', '🚀', '🛸']
};

function memoryInit() {
  const state = window.memoryState;
  const grid = document.getElementById('memGrid');
  if (!grid) return;
  
  const btn = document.getElementById('btnMem');
  if (btn && !btn._bound) {
    btn._bound = true;
    btn.addEventListener('click', () => memoryReset());
  }
  
  memoryReset();
}

function memoryReset() {
  const state = window.memoryState;
  const grid = document.getElementById('memGrid');
  if (!grid) return;
  
  // Создаём пары
  const items = [...state.emojis, ...state.emojis];
  // Перемешиваем
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  
  state.cards = items.map((emoji, i) => ({
    id: i,
    emoji: emoji,
    flipped: false,
    matched: false
  }));
  state.flipped = [];
  state.matched = 0;
  state.moves = 0;
  state.locked = false;
  
  const movesEl = document.getElementById('memMoves');
  const pairsEl = document.getElementById('memPairs');
  if (movesEl) movesEl.textContent = '0';
  if (pairsEl) pairsEl.textContent = '0';
  
  memoryRender();
}

function memoryRender() {
  const state = window.memoryState;
  const grid = document.getElementById('memGrid');
  if (!grid) return;
  
  grid.innerHTML = state.cards.map(card => `
    <div class="mem-card ${card.flipped || card.matched ? 'flipped' : ''} ${card.matched ? 'matched' : ''}" data-id="${card.id}">
      <span class="face">${card.emoji}</span>
      <span class="back">✦</span>
    </div>
  `).join('');
  
  grid.querySelectorAll('.mem-card').forEach(el => {
    el.addEventListener('click', () => memoryFlip(parseInt(el.dataset.id)));
  });
}

function memoryFlip(id) {
  const state = window.memoryState;
  if (state.locked) return;
  const card = state.cards.find(c => c.id === id);
  if (!card || card.flipped || card.matched) return;
  
  card.flipped = true;
  state.flipped.push(card);
  memoryRender();
  
  if (state.flipped.length === 2) {
    state.moves++;
    const movesEl = document.getElementById('memMoves');
    if (movesEl) movesEl.textContent = state.moves;
    
    const [a, b] = state.flipped;
    if (a.emoji === b.emoji) {
      // Совпадение
      setTimeout(() => {
        a.matched = true;
        b.matched = true;
        state.matched++;
        state.flipped = [];
        const pairsEl = document.getElementById('memPairs');
        if (pairsEl) pairsEl.textContent = state.matched;
        memoryRender();
        
        if (state.matched === state.emojis.length) {
          setTimeout(() => {
            if (window.CosmosAPI) {
              window.CosmosAPI.saveScore('memory', 1000 - state.moves * 10).catch(() => {});
            }
            alert('🎉 Победа! Ходов: ' + state.moves);
          }, 300);
        }
      }, 500);
    } else {
      // Не совпало
      state.locked = true;
      setTimeout(() => {
        a.flipped = false;
        b.flipped = false;
        state.flipped = [];
        state.locked = false;
        memoryRender();
      }, 1000);
    }
  }
}


document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('tetrisCanvas') && !window.tetrisState._init) {
    window.tetrisState._init = true;
    initTetris();
  }
  if (document.getElementById('snakeCanvas') && !window.snakeState._init) {
    window.snakeState._init = true;
    initSnake();
  }
  if (document.getElementById('clickerTarget') && !window.clickerState._init) {
    window.clickerState._init = true;
    initClicker();
  }
  if (document.getElementById('game2048Board') && !window.game2048State._init) {
    window.game2048State._init = true;
    init2048();
  }
  if (document.getElementById('dodgeCanvas') && !window.dodgeState._init) {
    window.dodgeState._init = true;
    dodgeInit();
  }
  if (document.getElementById('memGrid') && !window.memoryState._init) {
    window.memoryState._init = true;
    memoryInit();
  }
});

