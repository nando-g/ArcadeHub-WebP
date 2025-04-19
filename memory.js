const EMOJIS = [
    "🐶", "🐱", "🦁", "🐸", "🐵", "🐙", "🦄", "🐼",
    "🐻", "🐨", "🐰", "🐔", "🦊", "🐷", "🐧", "🐢"
];

let gameBoard = document.getElementById('game-board');
let movesDisplay = document.getElementById('moves');
let timerDisplay = document.getElementById('timer');
let difficultySelect = document.getElementById('difficulty');
let startButton = document.getElementById('start');
let winPopup = document.getElementById('win-popup');

let cards = [];
let flippedCards = [];
let moves = 0;
let time = 0;
let timerId;
let gameActive = false;

function createGame(pairsCount) {
    gameBoard.innerHTML = '';
    cards = [];
    flippedCards = [];
    let emojis = EMOJIS.slice(0, pairsCount);
    let symbols = shuffle([...emojis, ...emojis]);
    symbols.forEach(symbol => {
        let card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="front">${symbol}</div>
            <div class="back">?</div>
        `;
        card.dataset.value = symbol;
        card.addEventListener('click', handleCardClick);
        cards.push(card);
    });
    cards.forEach(card => gameBoard.appendChild(card));
}

function handleCardClick(e) {
    if (!gameActive || flippedCards.length === 2) return;
    let card = e.currentTarget;
    if (flippedCards.includes(card) || card.classList.contains('matched') || card.classList.contains('flipped')) return;

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = moves;
        checkMatch();
    }
}

function checkMatch() {
    let [card1, card2] = flippedCards;
    if (card1.dataset.value === card2.dataset.value) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        flippedCards = [];
        checkWin();
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
        }, 850);
    }
}

function checkWin() {
    if (cards.every(card => card.classList.contains('matched'))) {
        gameActive = false;
        clearInterval(timerId);
        showWinPopup();
    }
}

function showWinPopup() {
    document.getElementById('win-moves').textContent = moves;
    document.getElementById('win-time').textContent = time;
    winPopup.style.display = 'flex';
}

function startGame() {
    gameActive = true;
    moves = 0;
    time = 0;
    movesDisplay.textContent = '0';
    timerDisplay.textContent = '0';
    winPopup.style.display = 'none';

    let cardsCount = parseInt(difficultySelect.value);
    let pairsCount = cardsCount / 2;
    gameBoard.className = `grid-${cardsCount}`;
    createGame(pairsCount);

    clearInterval(timerId);
    timerId = setInterval(() => {
        time++;
        timerDisplay.textContent = time;
    }, 1000);
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

startButton.addEventListener('click', startGame);
difficultySelect.addEventListener('change', startGame);

winPopup.addEventListener('click', function(e) {
    if (e.target === winPopup) winPopup.style.display = 'none';
});

startGame();
