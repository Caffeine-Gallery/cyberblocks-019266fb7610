import { backend } from 'declarations/backend';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FF00AA', // Pink
    '#00FF00', // Lime
    '#FF3300', // Orange-Red
    '#3300FF', // Blue
    '#FFFF00'  // Yellow
];

const SHAPES = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1, 1], [0, 1, 0]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1, 1], [0, 0, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]]
];

let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let currentPiece = null;
let currentX = 0;
let currentY = 0;
let score = 0;
let level = 1;
let gameInterval = null;
let isPaused = false;

const gameBoard = document.getElementById('game-board');
const nextPieceDisplay = document.getElementById('next-piece');
const scoreDisplay = document.getElementById('score-value');
const levelDisplay = document.getElementById('level-value');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const highScoresList = document.getElementById('high-scores-list');

function createPiece() {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    const colorIndex = Math.floor(Math.random() * COLORS.length);
    return { shape: SHAPES[shapeIndex], color: COLORS[colorIndex] };
}

function drawBoard() {
    gameBoard.innerHTML = '';
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (board[y][x]) {
                cell.style.backgroundColor = COLORS[board[y][x] - 1];
            }
            gameBoard.appendChild(cell);
        }
    }
}

function drawPiece() {
    const cells = gameBoard.children;
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const cellIndex = (currentY + y) * COLS + (currentX + x);
                cells[cellIndex].style.backgroundColor = currentPiece.color;
            }
        });
    });
}

function canMove(newX, newY, newPiece = currentPiece.shape) {
    for (let y = 0; y < newPiece.length; y++) {
        for (let x = 0; x < newPiece[y].length; x++) {
            if (newPiece[y][x]) {
                if (newY + y >= ROWS || newX + x < 0 || newX + x >= COLS || board[newY + y][newX + x]) {
                    return false;
                }
            }
        }
    }
    return true;
}

function rotate() {
    const newPiece = currentPiece.shape[0].map((_, i) => 
        currentPiece.shape.map(row => row[i]).reverse()
    );
    if (canMove(currentX, currentY, newPiece)) {
        currentPiece.shape = newPiece;
    }
}

function moveDown() {
    if (canMove(currentX, currentY + 1)) {
        currentY++;
    } else {
        freeze();
        clearLines();
        if (!spawnPiece()) {
            gameOver();
        }
    }
    drawBoard();
    drawPiece();
}

function moveLeft() {
    if (canMove(currentX - 1, currentY)) {
        currentX--;
        drawBoard();
        drawPiece();
    }
}

function moveRight() {
    if (canMove(currentX + 1, currentY)) {
        currentX++;
        drawBoard();
        drawPiece();
    }
}

function freeze() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[currentY + y][currentX + x] = COLORS.indexOf(currentPiece.color) + 1;
            }
        });
    });
}

function clearLines() {
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++;
        }
    }
    if (linesCleared > 0) {
        score += linesCleared * 100 * level;
        scoreDisplay.textContent = score;
        if (score >= level * 1000) {
            level++;
            levelDisplay.textContent = level;
            clearInterval(gameInterval);
            gameInterval = setInterval(moveDown, 1000 - (level - 1) * 50);
        }
        playLineClearSound(linesCleared);
    }
}

function spawnPiece() {
    currentPiece = createPiece();
    currentX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentY = 0;
    return canMove(currentX, currentY);
}

function gameOver() {
    clearInterval(gameInterval);
    alert(`Game Over! Your score: ${score}`);
    const playerName = prompt("Enter your name for the high score:");
    if (playerName) {
        backend.addHighScore(playerName, score).then(updateHighScores);
    }
}

function updateHighScores() {
    backend.getHighScores().then(scores => {
        highScoresList.innerHTML = '';
        scores.forEach(score => {
            const li = document.createElement('li');
            li.textContent = `${score.name}: ${score.score}`;
            highScoresList.appendChild(li);
        });
    });
}

function startGame() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    score = 0;
    level = 1;
    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;
    spawnPiece();
    drawBoard();
    drawPiece();
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(moveDown, 1000);
    startButton.disabled = true;
    pauseButton.disabled = false;
    isPaused = false;
}

function togglePause() {
    if (isPaused) {
        gameInterval = setInterval(moveDown, 1000 - (level - 1) * 50);
        pauseButton.textContent = 'Pause';
    } else {
        clearInterval(gameInterval);
        pauseButton.textContent = 'Resume';
    }
    isPaused = !isPaused;
}

function playLineClearSound(linesCleared) {
    const audio = new Audio(`line_clear_${linesCleared}.mp3`);
    audio.play();
}

document.addEventListener('keydown', event => {
    if (!isPaused) {
        switch (event.key) {
            case 'ArrowLeft':
                moveLeft();
                break;
            case 'ArrowRight':
                moveRight();
                break;
            case 'ArrowDown':
                moveDown();
                break;
            case 'ArrowUp':
                rotate();
                drawBoard();
                drawPiece();
                break;
        }
    }
});

startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);

updateHighScores();
