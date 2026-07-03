let board = Array(9).fill("");
let current = "X";
let mode = "pvp";
let gameActive = true;

// SCORES (stored)
let xScore = +localStorage.getItem("x") || 0;
let oScore = +localStorage.getItem("o") || 0;
let dScore = +localStorage.getItem("d") || 0;

const cells = document.querySelectorAll(".cell");
const status = document.getElementById("status");

const xEl = document.getElementById("xScore");
const oEl = document.getElementById("oScore");
const dEl = document.getElementById("dScore");

// WIN PATTERNS
const win = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

// INIT SCORE
updateScore();

// CLICK
cells.forEach(c => {
    c.onclick = () => play(c.dataset.i);
});

// MODE
function setMode(m) {
    mode = m;
    reset();
    gameActive = true;
    status.innerText = m.toUpperCase() + " MODE";
}

// PLAY
function play(i) {
    if (!gameActive || board[i]) return;

    clickSound();

    board[i] = current;
    animate(cells[i]);

    update();

    let winLine = checkWin(current);

    if (winLine) return handleWin(current, winLine);

    if (!board.includes("")) return draw();

    current = current === "X" ? "O" : "X";
    status.innerText = current + " Turn";

    if (mode !== "pvp" && current === "O") aiMove();
}

// AI MOVE
function aiMove() {

    setTimeout(() => {

        let i = (mode === "easy")
            ? randomMove()
            : minimax(board, "O").index;

        board[i] = "O";
        animate(cells[i]);
        update();

        let winLine = checkWin("O");

        if (winLine) return handleWin("O", winLine);

        if (!board.includes("")) return draw();

        current = "X";
        status.innerText = "X Turn";

    }, 250);
}

// RANDOM
function randomMove() {
    let empty = board.map((v,i)=>v?null:i).filter(v=>v!=null);
    return empty[Math.floor(Math.random()*empty.length)];
}

// MINIMAX (OPTIMIZED)
function minimax(newBoard, player) {

    let avail = newBoard.map((v,i)=>v?null:i).filter(v=>v!=null);

    if (checkWinSim(newBoard,"X")) return {score:-10};
    if (checkWinSim(newBoard,"O")) return {score:10};
    if (!avail.length) return {score:0};

    let moves = [];

    for (let i of avail) {
        newBoard[i] = player;

        let result = minimax(newBoard, player==="O"?"X":"O");

        moves.push({index:i, score:result.score});

        newBoard[i] = "";
    }

    return player==="O"
        ? moves.reduce((a,b)=>a.score>b.score?a:b)
        : moves.reduce((a,b)=>a.score<b.score?a:b);
}

// CHECK WIN
function checkWin(p) {
    return win.find(w => w.every(i => board[i] === p)) || null;
}

// SIMULATION CHECK
function checkWinSim(b,p){
    return win.some(w => w.every(i => b[i] === p));
}

// HANDLE WIN
function handleWin(p, line) {

    line.forEach(i => cells[i].classList.add("win"));

    status.innerText = p + " Wins!";
    gameActive = false;

    if (p === "X") xScore++;
    else oScore++;

    saveScore();
    updateScore();
}

// DRAW
function draw() {
    dScore++;
    status.innerText = "Draw!";
    gameActive = false;
    saveScore();
    updateScore();
}

// UPDATE BOARD
function update() {
    cells.forEach((c,i)=>c.innerText = board[i]);
}

// RESET
function reset() {
    board = Array(9).fill("");
    current = "X";
    gameActive = true;

    cells.forEach(c => {
        c.innerText = "";
        c.classList.remove("win");
    });

    status.innerText = "X Turn";
}

// SCORE
function updateScore() {
    xEl.innerText = xScore;
    oEl.innerText = oScore;
    dEl.innerText = dScore;
}

function saveScore() {
    localStorage.setItem("x", xScore);
    localStorage.setItem("o", oScore);
    localStorage.setItem("d", dScore);
}

// ANIMATION
function animate(cell) {
    cell.style.transform = "scale(1.2)";
    setTimeout(() => cell.style.transform = "scale(1)", 150);
}

// SOUND (simple click tone)
function clickSound() {
    let audio = new Audio("https://www.soundjay.com/button/beep-07.wav");
    audio.play();
}
function toggleTheme() {
    document.body.classList.toggle("dark");
}
