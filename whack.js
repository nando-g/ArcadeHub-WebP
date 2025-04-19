const board = document.getElementById('game-board');
const difficultySlider = document.getElementById('difficulty');
const scoreSpan = document.getElementById('score');
const timeSpan = document.getElementById('time');
const messageDiv = document.getElementById('message');
const startBtn = document.getElementById('start-btn');
const sliderValueLabel = document.getElementById('slider-value-label');
const popup = document.getElementById('popup');
const popupScore = document.getElementById('popup-score');
const popupRestart = document.getElementById('popup-restart');
const popupClose = document.getElementById('popup-close');

let currentDifficulty = 2;
let gridSize = 5;
let score = 0;
let timeLeft = 30;
let timer;
let moleTimer;
let gameActive = false;
let lastHole = null;

const gameSettings = {
  1: { grid: 4, speed: { min: 1000, max: 1500 }, class: 'easy-mode', label: 'Easy', color: '#27ae60' },
  2: { grid: 5, speed: { min: 600, max: 1000 }, class: 'medium-mode', label: 'Medium', color: '#f1c40f' },
  3: { grid: 6, speed: { min: 300, max: 700 }, class: 'hard-mode', label: 'Hard', color: '#e74c3c' }
};

function updateDifficulty() {
  currentDifficulty = parseInt(difficultySlider.value);
  const { grid, class: modeClass } = gameSettings[currentDifficulty];
  gridSize = grid;
  board.className = modeClass;
  createBoard();
  updateSliderLabel();
  difficultySlider.classList.remove('easy', 'medium', 'hard');
  if (currentDifficulty === 1) difficultySlider.classList.add('easy');
  if (currentDifficulty === 2) difficultySlider.classList.add('medium');
  if (currentDifficulty === 3) difficultySlider.classList.add('hard');
}

function updateSliderLabel() {
  const { label, color } = gameSettings[currentDifficulty];
  sliderValueLabel.textContent = label;
  sliderValueLabel.style.background = color;
  const slider = difficultySlider;
  const min = parseInt(slider.min);
  const max = parseInt(slider.max);
  const val = parseInt(slider.value);
  const percent = (val - min) / (max - min);
  const sliderWidth = slider.offsetWidth || 300;
  const thumbWidth = 38;
  sliderValueLabel.style.left = `calc(${percent * 100}% - 19px)`;
}

function createBoard() {
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  for (let i = 0; i < gridSize ** 2; i++) {
    const hole = document.createElement('div');
    hole.className = 'hole';
    board.appendChild(hole);
  }
}

function randomTime(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function randomHole() {
  const holes = document.querySelectorAll('.hole');
  let idx;
  do {
    idx = Math.floor(Math.random() * holes.length);
  } while (holes[idx] === lastHole);
  lastHole = holes[idx];
  return holes[idx];
}

function createMole() {
  const mole = document.createElement('div');
  mole.className = 'mole';
  mole.innerHTML = `
    <div class="eyes">
      <div class="eye"></div>
      <div class="eye"></div>
    </div>
    <div class="nose"></div>
  `;
  return mole;
}

function showMole() {
  if (!gameActive) return;
  const holes = document.querySelectorAll('.hole');
  let hole;
  do {
    hole = holes[Math.floor(Math.random() * holes.length)];
  } while (hole === lastHole || hole.querySelector('.mole'));
  lastHole = hole;

  const mole = createMole();
  hole.appendChild(mole);
  setTimeout(() => mole.classList.add('active'), 10);

  mole.addEventListener('click', function whack(e) {
    if (!gameActive) return;
    score++;
    scoreSpan.textContent = score;
    mole.removeEventListener('click', whack);
    mole.classList.remove('active');
    mole.style.bottom = '0%';
    mole.style.background = '#ffd600';
    setTimeout(() => {
      if (mole.parentNode) mole.parentNode.removeChild(mole);
    }, 150);
  });

  const { min, max } = gameSettings[currentDifficulty].speed;
  moleTimer = setTimeout(() => {
    if (mole.parentNode) mole.parentNode.removeChild(mole);
    showMole();
  }, randomTime(min, max));
}

function startGame() {
  score = 0;
  timeLeft = 30;
  scoreSpan.textContent = score;
  timeSpan.textContent = timeLeft;
  messageDiv.textContent = '';
  gameActive = true;
  createBoard();
  showMole();
  timer = setInterval(() => {
    timeLeft--;
    timeSpan.textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  gameActive = false;
  clearInterval(timer);
  clearTimeout(moleTimer);
  document.querySelectorAll('.mole').forEach(mole => mole.remove());
  document.querySelectorAll('.hole').forEach(hole => hole.classList.remove('active'));
  showPopup();
}

function showPopup() {
  popupScore.textContent = `Your score: ${score}`;
  popup.classList.add('show');
}

function hidePopup() {
  popup.classList.remove('show');
}

startBtn.addEventListener('click', () => {
  if (gameActive) endGame();
  hidePopup();
  startGame();
});

difficultySlider.addEventListener('input', () => {
  updateDifficulty();
  updateSliderLabel();
});
window.addEventListener('resize', updateSliderLabel);

popupRestart.addEventListener('click', () => {
  hidePopup();
  startGame();
});
popupClose.addEventListener('click', hidePopup);
popup.addEventListener('click', (e) => {
  if (e.target === popup) hidePopup();
});

updateDifficulty();
updateSliderLabel();
