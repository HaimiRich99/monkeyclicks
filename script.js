let boxes = [];
let order = [];
let userOrder = [];
let level = 2;  // Start at level 2 (two boxes)
let score = 0;
let gameInProgress = false;
let canClick = false;  // Prevent clicks before numbers are hidden
let gridSize;
let timerBar;
let timerDuration = 1000;

const gameArea = document.getElementById('game-area');
const startButton = document.getElementById('start-button');
const scoreDisplay = document.getElementById('score');
const timerContainer = document.getElementById('timer-container');
const timerBarElement = document.getElementById('timer-bar');

startButton.addEventListener('click', startGame);
window.addEventListener('resize', updateGameAreaSize);  // Update the game area size on window resize

function startGame() {
    level = 2;
    score = 0;
    timerDuration = 1000;
    resetGame();
    createBoxes(level);  // Start with the current level (initially 2 boxes)
    displayNumbers();
    startTimerBar(timerDuration);  // Start the reverse timing bar with a 3-second duration
    setTimeout(hideNumbers, timerDuration);  // Hide numbers after 3 seconds
}

function resetGame() {
    gameArea.innerHTML = '';  // Clear all previous boxes
    boxes = [];
    order = [];
    userOrder = [];
    scoreDisplay.textContent = score;
    gameInProgress = true;
    canClick = false;  // Prevent clicks until numbers are hidden
    updateGameAreaSize();  // Recalculate game area size dynamically
    startTimerBar(timerDuration)
    //resetTimerBar();   // Reset the timing bar
}

function updateGameAreaSize() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Find the largest dimension
    const maxDimension = Math.max(screenWidth, screenHeight);
    if (maxDimension == screenWidth){
        gameAreaLargerSide = maxDimension * 0.81;  // Set the larger side to 90% of the largest screen dimension
        if (gameAreaLargerSide * (8 / 13) < 0.9 * screenHeight){gameAreaSmallerSide = gameAreaLargerSide * (8 / 13);}
        else {gameAreaSmallerSide = 0.75 * screenHeight}
    }
    else {gameAreaLargerSide = maxDimension * 0.69;
        if (gameAreaLargerSide * (8 / 13) < 0.9 * screenWidth){gameAreaSmallerSide = gameAreaLargerSide * (8 / 13);}
        else {gameAreaSmallerSide = 0.75 * screenWidth}
    }
    
    //const gameAreaSmallerSide = gameAreaLargerSide * (8 / 13);  // Set the smaller side to 8/13 of the larger side

    // Apply dimensions to game area (larger dimension as the width if width is greater, height otherwise)
    if (screenWidth > screenHeight) {
        gameArea.style.width = `${gameAreaLargerSide}px`;
        gameArea.style.height = `${gameAreaSmallerSide}px`;
    } else {
        gameArea.style.height = `${gameAreaLargerSide}px`;
        gameArea.style.width = `${gameAreaSmallerSide}px`;
    }

    // Calculate grid size based on the smaller side of the game area
    gridSize = Math.min(gameArea.offsetWidth, gameArea.offsetHeight) / 8;

    // Update box sizes and positions if they already exist (for responsiveness)
    boxes.forEach(box => {
        const { row, col } = box.dataset;
        const boxSize = gridSize * 0.9;  // Make the boxes 90% of the grid size (to add padding)
        box.style.width = box.style.height = `${boxSize}px`;
        box.style.top = `${row * gridSize}px`;
        box.style.left = `${col * gridSize}px`;
    });
}

function createBoxes(num) {
    const gridPositions = [];
    const padding = gridSize * 0.05;  // Add padding to prevent overlap

    // Create an array of grid positions (e.g., [0,0], [0,1], ..., [7,7] for an 8x8 grid)
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            gridPositions.push({ row, col });
        }
    }

    shuffle(gridPositions);  // Randomize the grid positions
    const numbers = [...Array(num).keys()].map(i => i + 1);  // Create an array of unique numbers [1, 2, 3, ..., num]
    shuffle(numbers);  // Shuffle the numbers for random order

    for (let i = 0; i < num; i++) {
        const { row, col } = gridPositions[i];  // Get a random grid position
        const box = document.createElement('div');
        box.classList.add('box');
        const boxSize = gridSize * 0.9;  // Make the boxes 90% of the grid size (to add padding)

        // Ensure boxes don't overlap with the boundaries by adjusting for padding
        box.style.width = box.style.height = `${boxSize}px`;
        box.style.top = `${row * gridSize + padding}px`;  // Add padding to the top
        box.style.left = `${col * gridSize + padding}px`;  // Add padding to the left

        box.dataset.number = numbers[i];  // Assign a unique number to each box
        box.dataset.clicked = false;  // Ensure box can be clicked only once
        box.dataset.row = row;  // Store row for resizing
        box.dataset.col = col;  // Store col for resizing
        box.textContent = numbers[i];  // Initially show the number
        box.addEventListener('click', () => handleBoxClick(i));

        gameArea.appendChild(box);
        boxes.push(box);
        order.push(numbers[i]);  // Store the correct order (based on the shuffled numbers)
    }
}


function displayNumbers() {
    boxes.forEach(box => {
        box.textContent = box.dataset.number;  // Show the number in each box
    });
}

function hideNumbers() {
    boxes.forEach(box => {
        box.textContent = '';  // Hide the number in each box after the display time
    });
    canClick = true;  // Allow clicks once numbers are hidden
}

function handleBoxClick(index) {
    if (!gameInProgress || !canClick) return;  // Prevent clicks if the game isn't in progress or if numbers are still visible

    const clickedBox = boxes[index];
    const clickedNumber = parseInt(clickedBox.dataset.number);

    if (clickedBox.dataset.clicked === "true") {
        return;  // Prevent the box from being clicked again
    }

    clickedBox.dataset.clicked = "true";  // Mark the box as clicked
    clickedBox.textContent = clickedNumber;  // Reveal the number of the clicked box

    // Check if the clicked number is the correct next number in sequence
    if (clickedNumber !== userOrder.length + 1) {
        gameInProgress = false;
        showAllNumbersAndTurnRed();
        setTimeout(restartGame, 1000);  // Restart the game after a short delay
        return;
    }

    // If the correct number is clicked, push it to userOrder
    userOrder.push(clickedNumber);

    // Check if the user has completed the current level
    if (userOrder.length === order.length) {
        score++;
        scoreDisplay.textContent = score;
        nextLevel();
    }
}

function nextLevel() {
    level++;  // Increase the level by one
    userOrder = [];  // Reset user order for the next round
    timerDuration += 450;
    setTimeout(() => {
        resetGame();  // Clear the board
        createBoxes(level);  // Create one more box than the previous level
        displayNumbers();  // Show numbers again for a brief period
        startTimerBar(timerDuration);  // Restart the timer bar
        setTimeout(hideNumbers, timerDuration);  // Hide numbers after 3 seconds
    }, 1000);  // Short delay before starting the next round
}

function restartGame() {
    level = 2;  // Reset the level to 2
    score = 0;  // Reset the score
    startGame();  // Start the game again with 2 boxes
}

function showAllNumbersAndTurnRed() {
    boxes.forEach(box => {
        box.textContent = box.dataset.number;  // Show the hidden number
        box.style.backgroundColor = '#e74c3c';  // Turn the box red
    });
    setTimeout(() => alert('Game over! Restarting...'), 500);  // Delay for game over message
}

// Timer bar functions
function startTimerBar(duration) {
    timerBar = duration;  // Set the timer duration
    timerContainer.style.display = 'block';  // Show the timer bar
    let start = Date.now();
    
    const timerInterval = setInterval(() => {
        let timePassed = Date.now() - start;
        let progress = Math.max(0, (1 - timePassed / duration));  // Calculate progress

        // Update the width of the timer bar based on time left
        timerBarElement.style.width = `${progress * 100}%`;

        if (progress === 0) {
            clearInterval(timerInterval);  // Stop the timer when finished
        }
    }, 16);  // Update the timer bar every 16ms (~60fps)
}

function resetTimerBar() {
    timerBarElement.style.width = '100%';  // Reset the timer bar to full width
    timerContainer.style.display = 'none';  // Hide the timer bar when not in use
}

// Utility function to shuffle an array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
