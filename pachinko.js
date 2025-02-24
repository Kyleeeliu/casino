let balance = 1000;
const BALL_COST = 25;
const GRAVITY = 0.3;
const BOUNCE = 0.7;
const FRICTION = 0.99;
let debugMode = false;

class Ball {
    constructor(x, y, power) {
        this.radius = 4; // Even smaller radius for more precise collisions
        // x and y represent the center of the ball
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.power = power;
        this.element = document.createElement('div');
        this.element.className = 'ball';
        this.active = true;
        this.pins = document.querySelectorAll('.pin');
        this.debugTrail = [];
        if (debugMode) {
            this.debugCircle = document.createElement('div');
            this.debugCircle.className = 'debug-circle ball-debug';
            this.updateDebugPosition();
            document.querySelector('.pins-container').appendChild(this.debugCircle);
        }
        this.updatePosition();
    }

    updatePosition() {
        // Convert center coordinates to top-left for element positioning
        this.element.style.left = `${this.x - this.radius}px`;
        this.element.style.top = `${this.y - this.radius}px`;
    }

    updateDebugPosition() {
        if (this.debugCircle) {
            this.debugCircle.style.left = `${this.x - this.radius}px`;
            this.debugCircle.style.top = `${this.y - this.radius}px`;
        }
    }

    update() {
        if (!this.active) return;

        if (debugMode) {
            // Add trail point at center coordinates
            this.debugTrail.push({ x: this.x, y: this.y });
            if (this.debugTrail.length > 50) this.debugTrail.shift();
            
            this.updateDebugPosition();
            this.drawDebugVector();
            this.updateDebugCoordinates();
        }

        this.vy += GRAVITY;
        this.vx *= FRICTION;
        this.vy *= FRICTION;
        
        this.checkPinCollisions();
        this.checkBarrierCollisions();
        
        this.x += this.vx;
        this.y += this.vy;

        this.updatePosition();

        if (this.y > 700) {
            this.active = false;
            if (debugMode) {
                this.debugCircle.remove();
                this.clearDebugTrail();
            }
            this.checkWin();
        }
    }

    checkPinCollisions() {
        this.pins.forEach(pin => {
            // Get pin center coordinates
            const pinX = parseInt(pin.style.left) + pin.offsetWidth / 2;
            const pinY = parseInt(pin.style.top) + pin.offsetHeight / 2;
            const pinRadius = 3; // Smaller pin hitbox
            
            const dx = this.x - pinX;
            const dy = this.y - pinY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < (this.radius + pinRadius)) {
                const angle = Math.atan2(dy, dx);
                
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                const newVx = Math.cos(angle) * speed * BOUNCE + (Math.random() - 0.5) * 2;
                const newVy = Math.sin(angle) * speed * BOUNCE + (Math.random() - 0.5) * 2;
                
                this.vx = newVx;
                this.vy = newVy;
                
                const overlap = (this.radius + pinRadius) - distance;
                this.x += Math.cos(angle) * overlap;
                this.y += Math.sin(angle) * overlap;
                
                this.showPinHit(pin);
                this.playPinSound();
            }
        });
    }
    
    showPinHit(pin) {
        pin.classList.add('hit');
        setTimeout(() => pin.classList.remove('hit'), 100);
    }

    playPinSound() {
        const audio = new Audio('data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==');
        audio.volume = 0.1;
        audio.play().catch(() => {}); // Ignore autoplay restrictions
    }

    checkWin() {
        const collectors = document.querySelectorAll('.collector');
        const ballCenter = this.x;  // this.x is already the center
        
        collectors.forEach((collector, index) => {
            const collectorLeft = 40 + (index * ((520 - 40) / 6));
            const collectorRight = collectorLeft + ((520 - 40) / 6);
            
            if (ballCenter >= collectorLeft && ballCenter <= collectorRight) {
                const multiplier = parseInt(collector.dataset.multiplier);
                if (multiplier > 0) {
                    const winAmount = BALL_COST * multiplier;
                    balance += winAmount;
                    updateBalance();
                    showWin(collector, winAmount);
                }
            }
        });

        setTimeout(() => this.element.remove(), 1000);
    }

    checkBarrierCollisions() {
        const leftBarrier = 70;  // Match the pins-container left offset
        const rightBarrier = 510; // Match the pins-container right offset
        
        if (this.x - this.radius < leftBarrier) {
            this.x = leftBarrier + this.radius;
            this.vx = Math.abs(this.vx) * BOUNCE + (Math.random() * 2);  // Add randomness
        }
        if (this.x + this.radius > rightBarrier) {
            this.x = rightBarrier - this.radius;
            this.vx = -Math.abs(this.vx) * BOUNCE - (Math.random() * 2);  // Add randomness
        }
    }

    drawDebugVector() {
        const oldVector = document.querySelector('.debug-vector');
        if (oldVector) oldVector.remove();
        
        const vector = document.createElement('div');
        vector.className = 'debug-vector';
        // Position vector at ball's center
        vector.style.left = `${this.x}px`;
        vector.style.top = `${this.y}px`;
        const angle = Math.atan2(this.vy, this.vx);
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy) * 10;
        vector.style.transform = `rotate(${angle}rad) scaleX(${speed})`;
        document.querySelector('.pins-container').appendChild(vector);
    }

    clearDebugTrail() {
        this.debugTrail.forEach((point, i) => {
            const trail = document.createElement('div');
            trail.className = 'debug-trail';
            // Position trail points at center coordinates
            trail.style.left = `${point.x}px`;
            trail.style.top = `${point.y}px`;
            trail.style.opacity = i / this.debugTrail.length;
            document.querySelector('.pins-container').appendChild(trail);
            setTimeout(() => trail.remove(), 1000);
        });
    }

    updateDebugCoordinates() {
        let coordsDisplay = document.getElementById('debug-coords');
        if (!coordsDisplay) {
            coordsDisplay = document.createElement('div');
            coordsDisplay.id = 'debug-coords';
            document.querySelector('.pins-container').appendChild(coordsDisplay);
        }
        coordsDisplay.textContent = `x: ${Math.round(this.x)}, y: ${Math.round(this.y)}`;
    }
}

function createPins() {
    const container = document.querySelector('.pins-container');
    const rows = 10;
    const pinsPerRow = 12;
    const spacing = 40;  // Adjust spacing
    
    // Calculate total width of pins container (right - left)
    const containerWidth = 520 - 70 - 70; // Total width minus barrier offsets
    // Calculate starting X position to center the pins
    const startX = (containerWidth - (pinsPerRow - 1) * spacing) / 2;
    
    for (let row = 0; row < rows; row++) {
        const offset = row % 2 ? spacing / 2 : 0;
        for (let pin = 0; pin < pinsPerRow - (row % 2); pin++) {
            const pinElement = document.createElement('div');
            pinElement.className = 'pin';
            pinElement.style.left = `${startX + offset + pin * spacing}px`;
            pinElement.style.top = `${row * spacing + 50}px`;  // Add some top padding
            pinElement.style.setProperty('--pin-delay', Math.random() * 10);
            container.appendChild(pinElement);
        }
    }
}

function updateBalance() {
    document.getElementById('balance').textContent = balance;
}

function showWin(collector, amount) {
    collector.classList.add('highlight');
    setTimeout(() => collector.classList.remove('highlight'), 1000);
}

// Power meter animation
let powerLevel = 0;
let increasing = true;
let powerInterval;

function updatePowerMeter() {
    if (increasing) {
        powerLevel += 2;
        if (powerLevel >= 100) {
            increasing = false;
        }
    } else {
        powerLevel -= 2;
        if (powerLevel <= 0) {
            increasing = true;
        }
    }
    document.querySelector('.power-bar').style.height = `${powerLevel}%`;
}

document.getElementById('launch-button').addEventListener('mousedown', () => {
    if (balance >= BALL_COST) {
        powerInterval = setInterval(updatePowerMeter, 20);
    }
});

document.getElementById('launch-button').addEventListener('mouseup', () => {
    if (powerInterval) {
        clearInterval(powerInterval);
        launchBall(powerLevel);
    }
});

function launchBall(power) {
    if (balance >= BALL_COST) {
        balance -= BALL_COST;
        updateBalance();

        const ball = new Ball(200, 0, power);
        const board = document.querySelector('.pachinko-board');
        board.appendChild(ball.element);

        ball.vx = (Math.random() - 0.5) * (power / 12);
        ball.vy = power / 35;

        // Add launch sound
        const audio = new Audio('data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==');
        audio.volume = 0.2;
        audio.play().catch(() => {});

        function animate() {
            if (ball.active) {
                ball.update();
                requestAnimationFrame(animate);
            }
        }
        animate();
    }
}

// Back button functionality
document.querySelector('.back-button').addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Initialize the game
createPins();

// Add debug mode toggle
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'h') {
        debugMode = !debugMode;
        document.querySelector('.pachinko-board').classList.toggle('debug-mode');
        
        // Show/hide debug elements
        const debugElements = document.querySelectorAll('.debug-circle, .debug-grid');
        debugElements.forEach(el => el.remove());
        
        if (debugMode) {
            createDebugGrid();
            // Show collision circles around pins
            document.querySelectorAll('.pin').forEach(pin => {
                const circle = document.createElement('div');
                circle.className = 'debug-circle';
                circle.style.left = `${parseInt(pin.style.left) - 4}px`;
                circle.style.top = `${parseInt(pin.style.top) - 4}px`;
                document.querySelector('.pins-container').appendChild(circle);
            });
        }
    }
});

// Add debug grid creation
function createDebugGrid() {
    const container = document.querySelector('.pins-container');
    const grid = document.createElement('div');
    grid.className = 'debug-grid';
    
    // Create vertical lines every 50px
    for (let x = 0; x <= container.offsetWidth; x += 50) {
        const line = document.createElement('div');
        line.className = 'debug-grid-line vertical';
        line.style.left = `${x}px`;
        
        const label = document.createElement('div');
        label.className = 'debug-grid-label';
        label.style.left = `${x}px`;
        label.style.top = '0';
        label.textContent = x;
        
        grid.appendChild(line);
        grid.appendChild(label);
    }
    
    // Create horizontal lines every 50px
    for (let y = 0; y <= container.offsetHeight; y += 50) {
        const line = document.createElement('div');
        line.className = 'debug-grid-line horizontal';
        line.style.top = `${y}px`;
        
        const label = document.createElement('div');
        label.className = 'debug-grid-label';
        label.style.left = '0';
        label.style.top = `${y}px`;
        label.textContent = y;
        
        grid.appendChild(line);
        grid.appendChild(label);
    }
    
    container.appendChild(grid);
} 