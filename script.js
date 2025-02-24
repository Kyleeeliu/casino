let balance = 1000;
const symbols = ['7', '🍒', '🍊', '🍋', '💎'];
const REEL_HEIGHT = 80; // Height of each symbol in pixels
const SPIN_DURATION = 2000; // Duration of spin in milliseconds
const SPIN_DELAY = 500; // Delay between each reel stopping

// Add new variables for tracking spinning state
let spinningReels = [false, false, false];
let nextReelToStop = 0;

// Update balance display
function updateBalance() {
    const balanceElement = document.getElementById('balance');
    balanceElement.textContent = balance;
    // Add flash effect on balance change
    balanceElement.style.animation = 'none';
    balanceElement.offsetHeight; // Trigger reflow
    balanceElement.style.animation = 'neon-flicker 0.5s ease-in-out';
}

// Function to create slot items
function createSlotItems(slotElement) {
    const container = document.createElement('div');
    container.className = 'slot-container';
    
    // Create multiple sets of symbols for smooth animation
    for (let i = 0; i < 20; i++) {
        symbols.forEach(symbol => {
            const item = document.createElement('div');
            item.className = 'slot-item';
            item.textContent = symbol;
            container.appendChild(item);
        });
    }
    
    slotElement.innerHTML = '';
    slotElement.appendChild(container);
}

// Initialize slots
const slots = [
    document.getElementById('slot1'),
    document.getElementById('slot2'),
    document.getElementById('slot3')
];

slots.forEach(slot => createSlotItems(slot));

// Add click handlers to each slot
slots.forEach((slot, index) => {
    slot.addEventListener('click', () => stopReel(index));
});

// Add spacebar handler
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && spinningReels.includes(true)) {
        event.preventDefault(); // Prevent page scrolling
        stopReel(nextReelToStop);
    }
});

// Update the spin button click handler
document.getElementById('spin-button').addEventListener('click', () => {
    startSpin();
});

// Add lever functionality
document.querySelector('.slot-lever').addEventListener('click', () => {
    startSpin();
});

// Function to stop a specific reel
function stopReel(index) {
    if (!spinningReels[index] || index !== nextReelToStop) return;
    
    const slot = slots[index];
    slot.classList.remove('spinning');
    spinningReels[index] = false;
    
    // Select random symbol
    const randomIndex = Math.floor(Math.random() * symbols.length);
    const selectedSymbol = symbols[randomIndex];
    
    // Position the reel to show the selected symbol
    const container = slot.querySelector('.slot-container');
    const offset = -(randomIndex * REEL_HEIGHT);
    container.style.top = `${offset}px`;
    
    // Store the result
    slot.dataset.value = selectedSymbol;
    
    // Increment next reel to stop
    nextReelToStop++;
    
    // Check if all reels have stopped
    if (!spinningReels.includes(true)) {
        setTimeout(() => {
            checkWin(slots);
            document.getElementById('spin-button').disabled = false;
        }, 500);
    }
}

// Update the showWinNotification function
function showWinNotification(amount) {
    const notification = document.querySelector('.win-notification');
    const amountDisplay = notification.querySelector('.win-amount span');
    const coinsContainer = notification.querySelector('.win-coins');
    
    // Update amount with counting animation
    const startAmount = 0;
    const duration = 2000;
    const steps = 60;
    const increment = amount / steps;
    let currentAmount = startAmount;
    
    const counter = setInterval(() => {
        currentAmount += increment;
        if (currentAmount >= amount) {
            currentAmount = amount;
            clearInterval(counter);
        }
        amountDisplay.textContent = Math.floor(currentAmount);
    }, duration / steps);

    // Create falling coins with improved distribution
    const numCoins = Math.min(50, Math.floor(amount / 10)); // Scale coins with win amount
    const columns = 10;
    const columnWidth = 100 / columns;
    
    for (let i = 0; i < numCoins; i++) {
        setTimeout(() => {
            const coin = document.createElement('div');
            coin.className = 'coin';
            
            // Distribute coins across columns
            const column = i % columns;
            const randomOffset = Math.random() * columnWidth;
            const left = (column * columnWidth) + randomOffset;
            
            coin.style.left = `${left}%`;
            coin.style.animationDelay = `${Math.random() * 0.5}s`;
            
            // Add random rotation and scale variation
            const randomRotation = Math.random() * 360;
            const randomScale = 0.8 + (Math.random() * 0.4);
            coin.style.transform = `rotate(${randomRotation}deg) scale(${randomScale})`;
            
            coinsContainer.appendChild(coin);
            
            // Add sparkles to each coin
            addSparkles(coin);
            
            // Remove coin after animation
            coin.addEventListener('animationend', () => {
                coin.remove();
            });
        }, i * 50); // Stagger coin creation
    }

    // Show notification
    notification.classList.add('show');

    // Add click to continue
    const hideNotification = () => {
        notification.classList.remove('show');
        coinsContainer.innerHTML = '';
        notification.removeEventListener('click', hideNotification);
    };

    notification.addEventListener('click', hideNotification);
}

// Add sparkle effect function
function addSparkles(coin) {
    const numSparkles = 3;
    
    for (let i = 0; i < numSparkles; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        
        // Position sparkle randomly around the coin
        const angle = (i / numSparkles) * Math.PI * 2;
        const radius = 20;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        sparkle.style.left = `calc(50% + ${x}px)`;
        sparkle.style.top = `calc(50% + ${y}px)`;
        sparkle.style.animationDelay = `${Math.random() * 1}s`;
        
        coin.appendChild(sparkle);
    }
}

// Update the checkWin function
function checkWin(slots) {
    const results = slots.map(slot => slot.dataset.value);
    
    if (results[0] === results[1] && results[1] === results[2]) {
        // All three match
        const winAmount = results[0] === '7' ? 500 : 200;
        balance += winAmount;
        
        // Add win animation
        const slotMachine = document.querySelector('.machine-frame');
        const lights = document.querySelectorAll('.light');
        
        // Flash the top lights rapidly
        lights.forEach(light => {
            light.style.animation = 'none';
            light.offsetHeight;
            light.style.animation = 'blink 0.2s infinite';
        });
        
        slotMachine.classList.add('win');
        setTimeout(() => {
            slotMachine.classList.remove('win');
            // Reset light animation
            lights.forEach(light => {
                light.style.animation = 'blink 2s infinite';
            });
        }, 1500);
        
        showWinNotification(winAmount);
    } else if (results[0] === results[1] || results[1] === results[2]) {
        // Two match
        balance += 100;
        showWinNotification(100);
    }
    updateBalance();
}

// Add start screen handlers
document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const casinoContainer = document.getElementById('casino-container');
    const gameOptions = document.querySelectorAll('.game-option:not(.coming-soon)');
    const backButton = document.querySelector('.back-button');

    // Handle game selection
    gameOptions.forEach(option => {
        option.addEventListener('click', () => {
            const game = option.dataset.game;
            if (game === 'slots') {
                startScreen.classList.add('hidden');
                document.querySelector('.child-mode-section').classList.add('hidden');
                casinoContainer.classList.remove('hidden');
            } else if (game === 'wheel_roulette') {
                window.location.href = 'wheel_roulette.html';
            } else if (game === 'uno') {
                window.location.href = 'uno.html';
            }
        });
    });

    // Handle back button
    backButton.addEventListener('click', () => {
        casinoContainer.classList.add('hidden');
        document.querySelector('.child-mode-section').classList.remove('hidden');
        startScreen.classList.remove('hidden');
    });
});

function startSpin() {
    if (balance >= 50 && !spinningReels.includes(true)) {
        balance -= 50;
        updateBalance();
        
        // Disable spin button during spin
        document.getElementById('spin-button').disabled = true;
        
        // Reset stopping sequence
        nextReelToStop = 0;
        
        // Animate lever pull
        const lever = document.querySelector('.slot-lever');
        lever.classList.add('pulled');
        setTimeout(() => {
            lever.classList.remove('pulled');
        }, 1000);
        
        // Start spinning animation for each slot
        slots.forEach((slot, index) => {
            spinningReels[index] = true;
            slot.classList.add('spinning');
        });
    }
} 