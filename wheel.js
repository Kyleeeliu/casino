let balance = 1000;
const SPIN_COST = 10;
let currentBet = null;
let isSpinning = false;

const segments = [
    { symbol: '🎯', multiplier: 40 },
    { symbol: '🎰', multiplier: 2 },
    { symbol: '💎', multiplier: 20 },
    { symbol: '🎰', multiplier: 2 },
    { symbol: '🌟', multiplier: 10 },
    { symbol: '🎰', multiplier: 2 },
    { symbol: '🎲', multiplier: 5 },
    { symbol: '🎰', multiplier: 2 },
];

function initializeWheel() {
    const wheel = document.querySelector('.wheel-outer');
    const segmentAngle = 360 / segments.length;
    
    segments.forEach((segment, index) => {
        const segmentEl = document.createElement('div');
        segmentEl.className = 'wheel-segment';
        const rotation = index * segmentAngle;
        segmentEl.style.transform = `rotate(${rotation}deg)`;
        
        const textEl = document.createElement('div');
        textEl.className = 'wheel-text';
        textEl.textContent = segment.symbol;
        textEl.style.transform = `translate(-50%, -50%) rotate(${-rotation}deg)`;
        
        segmentEl.appendChild(textEl);
        wheel.appendChild(segmentEl);
    });
}

function updateBalance() {
    document.getElementById('balance').textContent = balance;
}

function spinWheel() {
    if (isSpinning || balance < SPIN_COST || !currentBet) {
        if (!currentBet) alert('Please place a bet first!');
        return;
    }
    
    balance -= SPIN_COST;
    updateBalance();
    isSpinning = true;
    
    const wheel = document.querySelector('.wheel-outer');
    const spinButton = document.getElementById('spin-button');
    
    wheel.classList.add('spinning');
    spinButton.disabled = true;
    
    // Remove highlights during spin
    document.querySelectorAll('.wheel-segment').forEach(segment => {
        segment.classList.remove('selected');
    });
    
    // Random number of full rotations plus segment
    const rotations = 5 + Math.random() * 5;
    const segmentAngle = 360 / segments.length;
    // Weighted random selection based on multipliers
    const totalWeight = segments.reduce((sum, seg) => sum + (40 / seg.multiplier), 0);
    let random = Math.random() * totalWeight;
    let randomSegment = 0;
    
    for (let i = 0; i < segments.length; i++) {
        random -= (40 / segments[i].multiplier);
        if (random <= 0) {
            randomSegment = i;
            break;
        }
    }
    
    const finalAngle = -(rotations * 360 + randomSegment * segmentAngle);
    wheel.style.transform = `rotate(${finalAngle}deg)`;
    
    setTimeout(() => {
        const winningSegment = segments[randomSegment];
        let winAmount = 0;
        
        if (winningSegment.symbol === currentBet.symbol) {
            winAmount = SPIN_COST * currentBet.multiplier;
            
            if (winAmount > 0) {
                balance += winAmount;
                updateBalance();
                alert(`You won $${winAmount}! (${winningSegment.symbol})`);
            }
        } else {
            alert(`Sorry, it landed on ${winningSegment.symbol}. Try again!`);
        }
        
        wheel.classList.remove('spinning');
        spinButton.disabled = false;
        isSpinning = false;
        
        // Re-highlight the selected bet after spin
        if (currentBet) {  // Only re-highlight if bet is still selected
            document.querySelectorAll('.wheel-segment').forEach(segment => {
                const segmentSymbol = segment.querySelector('.wheel-text').textContent;
                if (segmentSymbol === currentBet.symbol) {
                    segment.classList.add('selected');
                }
            });
        }
    }, 5000);
}

document.getElementById('spin-button').addEventListener('click', spinWheel);

document.querySelectorAll('.bet-button').forEach(button => {
    button.addEventListener('click', () => {
        const betOption = button.parentElement;
        currentBet = {
            multiplier: parseInt(betOption.dataset.multiplier),
            symbol: betOption.querySelector('.symbol').textContent.trim()
        };
        
        // Remove previous selections
        document.querySelectorAll('.bet-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        betOption.classList.add('selected');
        
        // Highlight matching wheel segments
        document.querySelectorAll('.wheel-segment').forEach(segment => {
            const segmentSymbol = segment.querySelector('.wheel-text').textContent;
            segment.classList.remove('selected');
            if (segmentSymbol === currentBet.symbol) {
                segment.classList.add('selected');
            }
        });
    });
});

document.querySelector('.back-button').addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Initialize the wheel
initializeWheel(); 