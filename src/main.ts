import "./style.css";
import "@fontsource-variable/fredoka";
import fredokaUrl from "@fontsource-variable/fredoka/files/fredoka-latin-wght-normal.woff2";

let intervalId = 0;
const cell = 20;
let tickMs = 150;
let freshStart = true;
const game = document.getElementById("game");
if (!(game instanceof HTMLCanvasElement)) {
    throw new Error("Element #game is not a canvas");
}
const columns = game.width / cell;
const rows = game.height / cell;

const context2D = game.getContext('2d');

if (context2D === null) {
    throw new Error("2d context is not available");
}

type Position = { x: number; y: number };
let snake: Position[] = [{x: 13, y: 13}, {x: 12, y: 13}, {x: 11, y: 13}];
let food = getRandomFoodPosition();

type Direction = "up" | "down" | "left" | "right";
let currentDirection: Direction = "right";
let lastDirection: Direction = "right";

let touchStartX = 0;
let touchStartY = 0;

const scoreElement = document.getElementById("score-number");
if (scoreElement === null) {
    throw new Error("Score element is null.");
}
let score = 0;
let gameOver = false;
let gamePaused = false;

function getRandomFoodPosition(): Position {
    let foodPosition: Position;
    do {
        foodPosition = {x: Math.floor(Math.random() * columns), y: Math.floor(Math.random() * rows)};
    } while (isCollision(foodPosition));
    return foodPosition;
}

function isCollision(position: Position): boolean {
    return snake.some(p => p.x === position.x && p.y === position.y)
        || (position.x < 0 || position.x >= columns)
        || (position.y < 0 || position.y >= rows);
}

function changeDirection(direction: Direction) {
    if (direction === "right") {
        if (lastDirection !== "left") {
            currentDirection = "right";
        }
    } else if (direction === "left") {
        if (lastDirection !== "right") {
            currentDirection = "left";
        }
    } else if (direction === "up") {
        if (lastDirection !== "down") {
            currentDirection = "up";
        }
    } else if (direction === "down") {
        if (lastDirection !== "up") {
            currentDirection = "down";
        }
    }
}

const drawMessage = (title: string, subtitle: string) => {
    context2D.font = "600 32px 'Fredoka Variable', sans-serif";
    context2D.fillStyle = "deeppink";
    context2D.textAlign = "center";
    context2D.fillText(title, game.width / 2, game.height / 2);
    context2D.font = "600 18px 'Fredoka Variable', sans-serif";
    context2D.fillText(subtitle, game.width / 2, game.height / 2 + 35);
}

const togglePause = () => {
    if (!gamePaused) {
        clearInterval(intervalId);
        gamePaused = true;
        drawMessage("Game is paused!", "tap or press space to resume.");
    } else {
        intervalId = setInterval(tick, tickMs);
        gamePaused = false;
    }
}

const drawBoard = () => {
    context2D.fillStyle = "pink";
    context2D.fillRect(0, 0, game.width, game.height);
    context2D.fillStyle = "red";
    context2D.font = "30px sans-serif";
    context2D.textAlign = "center";
    context2D.textBaseline = "middle";
    context2D.fillText("♥", ((food.x * cell) + (cell / 2)), ((food.y * cell) + (cell / 2)));
    context2D.fillStyle = "hotpink";
    for (const p of snake) {
        context2D.fillRect(p.x * cell, p.y * cell, cell, cell);
    }
}

const tick = () => {

    let xChange = 0;
    let yChange = 0;
    if (currentDirection === "up") {
        yChange -= 1;
    } else if (currentDirection === "down") {
        yChange += 1;
    } else if (currentDirection === "right") {
        xChange += 1;
    } else if (currentDirection === "left") {
        xChange -= 1;
    }
    const head = snake[0];
    const newHead: Position = {x: head.x + xChange, y: head.y + yChange};
    if (isCollision(newHead)) {
        gameOver = true;
        clearInterval(intervalId);
        drawMessage("Game Over!", "tap or press space to restart.");
        return;
    }
    snake.unshift(newHead);
    if (newHead.x === food.x && newHead.y === food.y) {
        food = getRandomFoodPosition();
        score++;
        scoreElement.textContent = `${score}`;
    } else {
        snake.pop();
    }
    lastDirection = currentDirection;

    drawBoard();
};

const startGame = () => {
    snake = [{x: 13, y: 13}, {x: 12, y: 13}, {x: 11, y: 13}];
    food = getRandomFoodPosition();
    drawBoard();
    currentDirection = "right";
    lastDirection = "right";
    score = 0;
    scoreElement.textContent = `${score}`;
    gameOver = false;
    gamePaused = true;
    clearInterval(intervalId);
    if (!freshStart) {
        gamePaused = false;
        intervalId = setInterval(tick, tickMs);
    } else {
        drawMessage("Welcome to the Snake!", "tap or press space to start/pause/restart.");
    }
}

const fredoka = new FontFace("Fredoka Variable", `url(${fredokaUrl})`, { weight: "300 700" });
try {
    await fredoka.load();
    document.fonts.add(fredoka);
} catch (error) {
    console.warn(error);
}
startGame();
freshStart = false;

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" || event.key === "w") {
        changeDirection("up");
    } else if (event.key === "ArrowDown"  || event.key === "s") {
        changeDirection("down");
    } else if (event.key === "ArrowLeft"  || event.key === "a") {
        changeDirection("left");
    } else if (event.key === "ArrowRight"  || event.key === "d") {
        changeDirection("right");
    } else if (event.key === " ") {
        if (event.repeat) {
            return;
        }
        if (gameOver) {
            startGame();
        } else {
            togglePause();
        }
    }
});

document.addEventListener("touchstart", (event) => {
    const firstFinger = event.touches.item(0);
    if (firstFinger === null) {
        return;
    }
    touchStartX = firstFinger.clientX;
    touchStartY = firstFinger.clientY;
});

document.addEventListener("touchend", (event) => {
    event.preventDefault();
    const liftedFinger = event.changedTouches.item(0);
    if (liftedFinger === null) {
        return;
    }

    const xDifference = liftedFinger.clientX - touchStartX;
    const yDifference = liftedFinger.clientY - touchStartY;
    if (Math.abs(xDifference) < 30 && Math.abs(yDifference) < 30) {
        if (gameOver) {
            startGame();
        } else {
            togglePause();
        }
        return;
    }

    if (Math.abs(xDifference) > Math.abs(yDifference)) {
        if (xDifference < 0) {
            changeDirection("left");
        } else if (xDifference > 0) {
            changeDirection("right");
        }
    } else if (Math.abs(xDifference) < Math.abs(yDifference)) {
        if (yDifference < 0) {
            changeDirection("up");
        } else if (yDifference > 0) {
            changeDirection("down");
        }
    }
});
