const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const os = require("os");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname));

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

app.get('/lanip', (req, res) => {
  res.json({ ip: getLocalIp() });
});

let players = {};
let board = Array(9).fill("");
let currentTurn = "X";
let gameActive = true;

io.on("connection", (socket) => {
    if (!players.X) {
        players.X = socket.id;
        socket.emit("playerType", "X");
    } else if (!players.O) {
        players.O = socket.id;
        socket.emit("playerType", "O");
    } else {
        socket.emit("playerType", "spectator");
        return;
    }

    socket.on("makeMove", ({ index }) => {
        if (!gameActive || board[index] !== "") return;
        const symbol = (socket.id === players.X) ? "X" : (socket.id === players.O ? "O" : null);
        if (symbol !== currentTurn) return;

        board[index] = symbol;
        io.emit("moveMade", { index, symbol });

        if (checkWin(symbol)) {
            gameActive = false;
            io.emit("gameOver", { winner: symbol });
        } else if (board.every(cell => cell !== "")) {
            gameActive = false;
            io.emit("gameOver", { winner: "draw" });
        } else {
            currentTurn = currentTurn === "X" ? "O" : "X";
        }
    });

    socket.on("resetGame", () => {
        board = Array(9).fill("");
        currentTurn = "X";
        gameActive = true;
        io.emit("resetBoard");
    });

    socket.on("disconnect", () => {
        if (players.X === socket.id) delete players.X;
        if (players.O === socket.id) delete players.O;
        board = Array(9).fill("");
        gameActive = false;
        io.emit("resetBoard");
    });
});

function checkWin(symbol) {
    const wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    return wins.some(comb => comb.every(i => board[i] === symbol));
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
