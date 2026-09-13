// Game variables
const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');
let playerScore = 0;
let computerScore = 0;
let gameRunning = true;

// Game objects
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: 5,
    velocityX: 5,
    velocityY: 5,
    color: '#fff'
};

const player = {
    x: 0,
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    color: '#4CAF50',
    score: 0
};

const computer = {
    x: canvas.width - 10,
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    color: '#F44336',
    score: 0
};

const net = {
    x: canvas.width / 2 - 1,
    y: 0,
    width: 2,
    height: 10,
    color: '#fff'
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Mouse movement
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        player.y = e.clientY - rect.top - player.height / 2;
        
        // Keep paddle within canvas
        if (player.y < 0) {
            player.y = 0;
        }
        if (player.y + player.height > canvas.height) {
            player.y = canvas.height - player.height;
        }
    });
    
    // Touch movement for mobile
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        player.y = touch.clientY - rect.top - player.height / 2;
        
        // Keep paddle within canvas
        if (player.y < 0) {
            player.y = 0;
        }
        if (player.y + player.height > canvas.height) {
            player.y = canvas.height - player.height;
        }
    }, { passive: false });
    
    // Restart button
    document.getElementById('restart-btn').addEventListener('click', resetGame);
    
    // Start the game
    gameLoop();
});

// Draw functions
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    for (let i = 0; i <= canvas.height; i += 15) {
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}

function drawScore() {
    document.getElementById('player-score').textContent = player.score;
    document.getElementById('computer-score').textContent = computer.score;
}

// Collision detection
function collision(ball, paddle) {
    const paddleTop = paddle.y;
    const paddleBottom = paddle.y + paddle.height;
    const paddleLeft = paddle.x;
    const paddleRight = paddle.x + paddle.width;
    
    const ballTop = ball.y - ball.radius;
    const ballBottom = ball.y + ball.radius;
    const ballLeft = ball.x - ball.radius;
    const ballRight = ball.x + ball.radius;
    
    return ballRight > paddleLeft && 
           ballLeft < paddleRight && 
           ballBottom > paddleTop && 
           ballTop < paddleBottom;
}

// Reset ball
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 5;
}

// Reset game
function resetGame() {
    player.score = 0;
    computer.score = 0;
    resetBall();
    gameRunning = true;
    drawScore();
}

// Update game state
function update() {
    if (!gameRunning) return;
    
    // Move the ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    
    // Simple AI for computer paddle
    const computerLevel = 0.1; // Difficulty level (0 to 1)
    computer.y += (ball.y - (computer.y + computer.height/2)) * computerLevel;
    
    // Wall collision (top and bottom)
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.velocityY = -ball.velocityY;
    }
    
    // Determine which paddle is being hit
    let paddle = (ball.x < canvas.width/2) ? player : computer;
    
    // Paddle collision
    if (collision(ball, paddle)) {
        // Where the ball hit the paddle
        let collidePoint = ball.y - (paddle.y + paddle.height/2);
        
        // Normalization
        collidePoint = collidePoint / (paddle.height/2);
        
        // Calculate angle
        let angleRad = collidePoint * Math.PI/4;
        
        // X direction of the ball when it hits
        let direction = (ball.x < canvas.width/2) ? 1 : -1;
        
        // Change velocity X and Y
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        
        // Increase speed
        ball.speed += 0.2;
    }
    
    // Update score
    if (ball.x - ball.radius < 0) {
        // Computer scores
        computer.score++;
        drawScore();
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        // Player scores
        player.score++;
        drawScore();
        resetBall();
    }
    
    // Check for game end (first to 5 points)
    if (player.score >= 5 || computer.score >= 5) {
        gameRunning = false;
    }
}

// Render game
function render() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, '#222');
    
    // Draw net
    drawNet();
    
    // Draw paddles
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(computer.x, computer.y, computer.width, computer.height, computer.color);
    
    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Initialize the game
window.onload = function() {
    drawScore();
};
