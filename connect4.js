const ROWS = 6;
const COLS = 7;
const CELL_SIZE = 62; 
const DISC_SIZE = 46; 
const DISC_OFFSET_X = 0; 
const DISC_OFFSET_Y = 0; 

let board = [];
let currentPlayer = 1; // 1 = red, 2 = yellow
let gameActive = true;
let winningCells = [];

const gameTable = document.getElementById('game-table');
const boardHoles = document.getElementById('board-holes');
const messageDiv = document.getElementById('message');
const restartBtn = document.getElementById('restart');

function drawBoardHoles() {
  boardHoles.innerHTML = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const hole = document.createElement('div');
      hole.className = 'board-hole';
      boardHoles.appendChild(hole);
    }
  }
}

function createBoard() {
  board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
  currentPlayer = 1;
  gameActive = true;
  winningCells = [];
  renderBoard();
  messageDiv.textContent = "Player 1's turn (Red)";
}

function renderBoard() {
  Array.from(document.querySelectorAll('.disc')).forEach(d => d.remove());
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== 0) {
        const disc = document.createElement('div');
        disc.className = 'disc ' + (board[r][c] === 1 ? 'red' : 'yellow');
        disc.style.left = (c * CELL_SIZE + (CELL_SIZE - DISC_SIZE) / 2) + 'px';
        disc.style.top = (r * CELL_SIZE + (CELL_SIZE - DISC_SIZE) / 2) + 'px';
        disc.dataset.row = r;
        disc.dataset.col = c;
        if (winningCells.some(([wr, wc]) => wr === r && wc === c)) {
          disc.classList.add('win');
        }
        gameTable.appendChild(disc);
      }
    }
  }
}

function dropDisc(col) {
  if (!gameActive) return;
  
  let row = -1;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      row = r;
      break;
    }
  }
  if (row === -1) {
    messageDiv.textContent = "Column is full! Choose another.";
    return;
  }
  board[row][col] = currentPlayer;
  const disc = document.createElement('div');
  disc.className = 'disc ' + (currentPlayer === 1 ? 'red' : 'yellow');
  disc.style.left = (col * CELL_SIZE + (CELL_SIZE - DISC_SIZE) / 2) + 'px';
  disc.style.top = ((-1) * CELL_SIZE + (CELL_SIZE - DISC_SIZE) / 2) + 'px'; 
  gameTable.appendChild(disc);

  setTimeout(() => {
    disc.style.top = (row * CELL_SIZE + (CELL_SIZE - DISC_SIZE) / 2) + 'px';
  }, 10);

  setTimeout(() => {
    renderBoard();
    if (checkWin(row, col, currentPlayer)) {
      highlightWinningCells();
      messageDiv.textContent = `Player ${currentPlayer} wins! 🎉`;
      gameActive = false;
      return;
    } else if (board.flat().every(cell => cell !== 0)) {
      messageDiv.textContent = "It's a draw!";
      gameActive = false;
      return;
    }
    currentPlayer = 3 - currentPlayer;
    messageDiv.textContent = `Player ${currentPlayer}'s turn (${currentPlayer === 1 ? 'Red' : 'Yellow'})`;
  }, 420);
}

function checkWin(row, col, player) {
  function countDir(dr, dc) {
    let count = 1, cells = [[row, col]];
    for (let d = 1; d < 4; d++) {
      let r = row + dr * d, c = col + dc * d;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        count++; cells.push([r, c]);
      } else break;
    }
    for (let d = 1; d < 4; d++) {
      let r = row - dr * d, c = col - dc * d;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        count++; cells.push([r, c]);
      } else break;
    }
    if (count >= 4) {
      winningCells = cells;
      return true;
    }
    return false;
  }
  return (
    countDir(0, 1) ||
    countDir(1, 0) ||
    countDir(1, 1) ||
    countDir(1, -1)
  );
}

function highlightWinningCells() {
  renderBoard();
}

gameTable.addEventListener('click', function(e) {
  if (!gameActive) return;
  const rect = gameTable.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const col = Math.floor(x / CELL_SIZE);
  if (col >= 0 && col < COLS) {
    dropDisc(col);
  }
});

gameTable.addEventListener('mousemove', function(e) {
  const rect = gameTable.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const col = Math.floor(x / CELL_SIZE);

  Array.from(boardHoles.children).forEach((hole, idx) => {
    const holeCol = idx % COLS;
    hole.style.outline = (holeCol === col && gameActive) ? '2px solid #00bfff' : 'none';
    hole.style.boxShadow = (holeCol === col && gameActive) ? '0 0 12px #00bfff' : 'inset 0 2px 8px #b0b0b0';
  });
});
gameTable.addEventListener('mouseleave', function() {
  Array.from(boardHoles.children).forEach(hole => {
    hole.style.outline = 'none';
    hole.style.boxShadow = 'inset 0 2px 8px #b0b0b0';
  });
});

restartBtn.addEventListener('click', createBoard);

drawBoardHoles();
createBoard();
