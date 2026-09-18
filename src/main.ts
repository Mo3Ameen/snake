import "./style.css";
import "@fontsource-variable/fredoka";

let intervalId = 0;
const cell = 20;
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
        context2D.font = "600 32px 'Fredoka Variable', sans-serif";
        context2D.fillStyle = "deeppink";
        context2D.textAlign = "center";
        context2D.fillText("Game Over!", game.width / 2, game.height / 2);
        context2D.font = "600 18px 'Fredoka Variable', sans-serif";
        context2D.fillText("tap or press space to restart.", game.width / 2, game.height / 2 + 35);
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
};

const startGame = () => {
    snake = [{x: 13, y: 13}, {x: 12, y: 13}, {x: 11, y: 13}];
    food = getRandomFoodPosition();
    currentDirection = "right";
    lastDirection = "right";
    score = 0;
    scoreElement.textContent = `${score}`;
    gameOver = false;
    clearInterval(intervalId);
    intervalId = setInterval(tick, 150);
}

startGame();

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
        if (gameOver) {
            startGame();
        }
    }
});

game.addEventListener("touchstart", (event) => {
    const firstFinger = event.touches.item(0);
    if (firstFinger === null) {
        return;
    }
    touchStartX = firstFinger.clientX;
    touchStartY = firstFinger.clientY;
});

game.addEventListener("touchend", (event) => {
    const liftedFinger = event.changedTouches.item(0);
    if (liftedFinger === null) {
        return;
    }

    const xDifference = liftedFinger.clientX - touchStartX;
    const yDifference = liftedFinger.clientY - touchStartY;
    if (Math.abs(xDifference) < 30 && Math.abs(yDifference) < 30) {
        if (gameOver) {
            startGame();
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
