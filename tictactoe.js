
const joinLink = document.getElementById('join-link');
const HARD_CODED_URL = "http://192.168.29.66:3000/tictactoe.html"; 
joinLink.href = HARD_CODED_URL;
joinLink.textContent = HARD_CODED_URL;

const socket = io();
const statusText = document.getElementById("status");
const cells = document.querySelectorAll(".cell");
const resetBtn = document.getElementById("reset");

let playerSymbol = null;
let myTurn = false;

socket.on("playerType", (symbol) => {
    playerSymbol = symbol;
    if (symbol === "spectator") {
        statusText.textContent = "Room is full. You are a spectator.";
        myTurn = false;
    } else {
        statusText.textContent = `You are "${playerSymbol}". ${playerSymbol === 'X' ? "Your move." : "Waiting for opponent..."}`;
        myTurn = (playerSymbol === 'X');
    }
});
socket.on("moveMade", ({ index, symbol }) => {
    cells[index].textContent = symbol;
    myTurn = (symbol !== playerSymbol);
    if (playerSymbol === "spectator") {
        statusText.textContent = "You are a spectator.";
    } else {
        statusText.textContent = myTurn ? "Your move." : "Opponent's move.";
    }
});
socket.on("gameOver", ({ winner }) => {
    if (winner === "draw") {
        statusText.textContent = "It's a draw!";
    } else {
        statusText.textContent = winner === playerSymbol ? "You win!" : (playerSymbol === "spectator" ? `"${winner}" wins!` : "You lose!");
    }
    myTurn = false;
});
socket.on("resetBoard", () => {
    cells.forEach(cell => cell.textContent = "");
    if (playerSymbol === "spectator") {
        statusText.textContent = "You are a spectator.";
        myTurn = false;
    } else {
        statusText.textContent = playerSymbol === 'X' ? "Your move." : "Waiting for opponent...";
        myTurn = (playerSymbol === 'X');
    }
});
cells.forEach(cell => {
    cell.addEventListener("click", () => {
        if (cell.textContent === "" && myTurn) {
            const index = parseInt(cell.dataset.index);
            socket.emit("makeMove", { index });
        }
    });
});
resetBtn.addEventListener("click", () => {
    socket.emit("resetGame");
});
