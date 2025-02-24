class WheelRoulette {
    constructor() {
        this.chambers = 6;
        this.currentChamber = Math.floor(Math.random() * this.chambers);
        this.markedChamber = Math.floor(Math.random() * this.chambers);
        this.spinSound = new Audio('data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==');
    }

    spin() {
        this.currentChamber = Math.floor(Math.random() * this.chambers);
        this.spinSound.play().catch(() => {});
        return this.check();
    }

    check() {
        if (this.currentChamber === this.markedChamber) {
            return {
                hit: true,
                message: "You found the lucky chamber! 6x multiplier!",
                multiplier: 6
            };
        }
        return {
            hit: false,
            message: "Not the lucky chamber. Try again!",
            multiplier: 0
        };
    }
}

let balance = 1000;
const SPIN_COST = 50;
let spinCount = 0;
let winCount = 0;
let game = new WheelRoulette();

function updateBalance() {
    document.getElementById('balance').textContent = balance;
}

function updateStats() {
    document.getElementById('spin-count').textContent = spinCount;
    document.getElementById('win-count').textContent = winCount;
}

function showNotification(message, isWin) {
    const notification = document.querySelector('.win-notification');
    const winTitle = notification.querySelector('.win-title');
    const winAmount = notification.querySelector('.win-amount');
    const winCoins = notification.querySelector('.win-coins');
    
    winTitle.textContent = isWin ? 'YOU WON!' : message;
    winAmount.textContent = isWin ? `$${SPIN_COST * 6}` : '';
    
    // Clear any existing coins
    winCoins.innerHTML = '';
    
    if (isWin) {
        for (let i = 0; i < 20; i++) {
            const coin = document.createElement('div');
            coin.className = 'coin';
            coin.style.left = Math.random() * 100 + '%';
            coin.style.animationDuration = (Math.random() * 1 + 1) + 's';
            coin.style.animationDelay = (Math.random() * 0.5) + 's';
            winCoins.appendChild(coin);
        }
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

function spin() {
    if (balance < SPIN_COST) {
        showNotification("Not enough balance!", false);
        return;
    }

    balance -= SPIN_COST;
    updateBalance();
    
    const cylinderVisual = document.querySelector('.cylinder-visual');
    cylinderVisual.classList.add('spinning');
    
    // Disable spin button during animation
    document.getElementById('spin-button').disabled = true;
    
    setTimeout(() => {
        cylinderVisual.classList.remove('spinning');
        const result = game.spin();
        spinCount++;
        
        if (result.hit) {
            winCount++;
            const winAmount = SPIN_COST * result.multiplier;
            balance += winAmount;
            showNotification(`You won $${winAmount}!`, true);
        } else {
            showNotification(result.message, false);
        }
        
        document.getElementById('current-chamber').textContent = game.currentChamber + 1;
        updateBalance();
        updateStats();
        
        // Re-enable spin button
        document.getElementById('spin-button').disabled = false;
    }, 2000);
}

function newGame() {
    game = new WheelRoulette();
    document.getElementById('current-chamber').textContent = '?';
    spinCount = 0;
    winCount = 0;
    updateStats();
    showNotification('New game started!', true);
}

// Initialize event listeners
document.getElementById('spin-button').addEventListener('click', spin);
document.getElementById('new-game').addEventListener('click', newGame);
document.querySelector('.back-button').addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Initialize display
updateBalance();
updateStats(); 