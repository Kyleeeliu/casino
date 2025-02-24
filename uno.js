class UnoCard {
    constructor(color, value) {
        this.color = color;
        this.value = value;
    }
}

class UnoGame {
    constructor() {
        this.colors = ['red', 'blue', 'green', 'yellow'];
        this.values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', '+2'];
        this.deck = [];
        this.discardPile = [];
        this.playerHand = [];
        this.opponentHand = [];
        this.currentPlayer = 'player';
        this.direction = 1;
        this.initializeDeck();
    }

    initializeDeck() {
        // Create standard cards
        this.colors.forEach(color => {
            this.values.forEach(value => {
                this.deck.push(new UnoCard(color, value));
                if (value !== '0') { // Add duplicates of non-zero cards
                    this.deck.push(new UnoCard(color, value));
                }
            });
        });

        // Shuffle deck
        this.shuffle(this.deck);

        // Deal initial hands
        for (let i = 0; i < 7; i++) {
            this.playerHand.push(this.deck.pop());
            this.opponentHand.push(this.deck.pop());
        }

        // Start discard pile
        this.discardPile.push(this.deck.pop());
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    isValidPlay(card) {
        const topCard = this.discardPile[this.discardPile.length - 1];
        return card.color === topCard.color || card.value === topCard.value;
    }

    playCard(card, player) {
        if (player === 'player') {
            const index = this.playerHand.findIndex(c => c.color === card.color && c.value === card.value);
            if (index !== -1) {
                this.playerHand.splice(index, 1);
                this.discardPile.push(card);
                this.handleSpecialCard(card);
            }
        } else {
            const index = this.opponentHand.findIndex(c => c.color === card.color && c.value === card.value);
            if (index !== -1) {
                this.opponentHand.splice(index, 1);
                this.discardPile.push(card);
                this.handleSpecialCard(card);
            }
        }
    }

    drawCard(player) {
        if (this.deck.length === 0) {
            const topCard = this.discardPile.pop();
            this.deck = this.discardPile;
            this.discardPile = [topCard];
            this.shuffle(this.deck);
        }

        const card = this.deck.pop();
        if (player === 'player') {
            this.playerHand.push(card);
        } else {
            this.opponentHand.push(card);
        }
        return card;
    }

    handleSpecialCard(card) {
        switch (card.value) {
            case 'Skip':
                // Skip next player's turn
                break;
            case 'Reverse':
                this.direction *= -1;
                break;
            case '+2':
                const nextPlayer = this.currentPlayer === 'player' ? 'opponent' : 'player';
                this.drawCard(nextPlayer);
                this.drawCard(nextPlayer);
                break;
        }
    }

    makeOpponentMove() {
        // Find a valid card to play
        const validCards = this.opponentHand.filter(card => this.isValidPlay(card));
        
        if (validCards.length > 0) {
            // Play the first valid card
            const cardToPlay = validCards[0];
            this.playCard(cardToPlay, 'opponent');
            return cardToPlay;
        } else {
            // Draw a card
            const drawnCard = this.drawCard('opponent');
            if (this.isValidPlay(drawnCard)) {
                this.playCard(drawnCard, 'opponent');
                return drawnCard;
            }
        }
        return null;
    }
}

// Game UI handling
let game = new UnoGame();
let unoButtonPressed = false;

function showNotification(message, isWin = true) {
    const notification = document.createElement('div');
    notification.className = 'win-notification';
    notification.innerHTML = `
        <div class="win-content">
            <div class="win-title">${isWin ? 'YOU WIN!' : 'Game Over'}</div>
            <div class="win-message">${message}</div>
        </div>
    `;
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove on click
    notification.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
}

function createCardElement(card, faceUp = true) {
    const cardDiv = document.createElement('div');
    cardDiv.className = `card ${faceUp && card ? card.color : 'back'}`;
    
    // Add data attribute for special cards
    if (card && ['Skip', 'Reverse', '+2'].includes(card.value)) {
        cardDiv.setAttribute('data-special', card.value);
    }
    
    if (faceUp && card) {
        const displayValue = ['Skip', 'Reverse', '+2'].includes(card.value) ? '' : card.value;
        cardDiv.innerHTML = `
            <div class="corner-design top-left">
                <div class="symbol">${card.value}</div>
            </div>
            <div class="number">${displayValue}</div>
            <div class="corner-design bottom-right">
                <div class="symbol">${card.value}</div>
            </div>
        `;
        
        cardDiv.addEventListener('click', () => {
            if (game.currentPlayer === 'player' && game.isValidPlay(card)) {
                cardDiv.classList.add('played');
               
                // Get the positions for animation
                const cardRect = cardDiv.getBoundingClientRect();
                const discardPile = document.getElementById('discard-pile');
                const pileRect = discardPile.getBoundingClientRect();
                
                // Calculate the distance to move
                const startX = cardRect.left - pileRect.left;
                const startY = cardRect.top - pileRect.top;
                
                // Create a clone for the animation
                const clone = cardDiv.cloneNode(true);
                clone.style.setProperty('--start-x', `${startX}px`);
                clone.style.setProperty('--start-y', `${startY}px`);
                clone.style.setProperty('--random-rotate', `${Math.random() * 20 - 10}deg`);
                clone.classList.add('moving-to-discard');
                
                // Position clone at start position
                clone.style.left = `${cardRect.left}px`;
                clone.style.top = `${cardRect.top}px`;
                document.body.appendChild(clone);
                
                // Remove clone after animation
                clone.addEventListener('animationend', () => {
                    clone.remove();
                });

                game.playCard(card, 'player');
                setTimeout(() => {
                    updateUI();
                    game.currentPlayer = 'opponent';
                    
                    if (game.playerHand.length === 1 && !unoButtonPressed) {
                        game.drawCard('player');
                        game.drawCard('player');
                        showNotification('Forgot to say UNO! Draw 2 cards.', false);
                    }
                    
                    if (game.playerHand.length === 0) {
                        showNotification('Congratulations! You are the UNO champion!', true);
                        return;
                    }
                    
                    // Opponent's turn
                    setTimeout(() => {
                        const playedCard = game.makeOpponentMove();
                        if (game.opponentHand.length === 0) {
                            showNotification('Better luck next time!', false);
                            return;
                        }
                        if (playedCard) {
                            // Animate opponent's card
                            const opponentCards = document.getElementById('opponent-cards');
                            const opponentRect = opponentCards.getBoundingClientRect();
                            const pileRect = discardPile.getBoundingClientRect();
                            
                            const clone = createCardElement(playedCard).cloneNode(true);
                            clone.style.setProperty('--start-x', `${opponentRect.left - pileRect.left}px`);
                            clone.style.setProperty('--start-y', `${opponentRect.top - pileRect.top}px`);
                            clone.style.setProperty('--random-rotate', `${Math.random() * 20 - 10}deg`);
                            clone.classList.add('moving-to-discard');
                            
                            clone.style.left = `${opponentRect.left}px`;
                            clone.style.top = `${opponentRect.top}px`;
                            document.body.appendChild(clone);
                            
                            clone.addEventListener('animationend', () => {
                                clone.remove();
                            });
                        }
                        game.currentPlayer = 'player';
                        updateUI();
                    }, 1000);
                }, 500);
            }
        });
    } else {
        // Add decorative elements for card back
        cardDiv.innerHTML = `
            <div class="corner-design top-left">♠</div>
            <div class="corner-design bottom-right">♠</div>
        `;
    }
    
    return cardDiv;
}

function updateUI() {
    // Update player's hand
    const playerCards = document.getElementById('player-cards');
    playerCards.innerHTML = '';
    game.playerHand.forEach(card => {
        const cardElement = createCardElement(card);
        if (!game.isValidPlay(card)) {
            cardElement.style.opacity = '0.7';
            cardElement.style.transform = 'translateY(-10px)';
        }
        playerCards.appendChild(cardElement);
    });
    
    // Update opponent's hand
    const opponentCards = document.getElementById('opponent-cards');
    opponentCards.innerHTML = '';
    game.opponentHand.forEach(() => {
        const cardElement = createCardElement(null, false);
        cardElement.classList.add('drawn');
        opponentCards.appendChild(cardElement);
    });
    
    // Update discard pile
    const discardPile = document.getElementById('discard-pile');
    discardPile.innerHTML = '';
    // Show last 3 cards for depth effect
    const lastThreeCards = game.discardPile.slice(-3);
    lastThreeCards.forEach(card => {
        discardPile.appendChild(createCardElement(card));
    });
    
    // Update opponent's card count
    document.getElementById('opponent-count').textContent = game.opponentHand.length;
    
    // Show/hide UNO button
    const unoButton = document.getElementById('uno-button');
    if (game.playerHand.length === 2 && game.currentPlayer === 'player') {
        unoButton.classList.remove('hidden');
        unoButtonPressed = false;
    } else {
        unoButton.classList.add('hidden');
    }
}

// Initialize deck click handler
document.getElementById('deck').addEventListener('click', () => {
    if (game.currentPlayer === 'player') {
        const drawnCard = game.drawCard('player');
        const cardElement = createCardElement(drawnCard);
        cardElement.classList.add('drawn');
        document.getElementById('player-cards').appendChild(cardElement);
        
        setTimeout(() => {
            updateUI();
            game.currentPlayer = 'opponent';
            
            // Opponent's turn
            setTimeout(() => {
                const playedCard = game.makeOpponentMove();
                game.currentPlayer = 'player';
                updateUI();
            }, 1000);
        }, 500);
    }
});

// Initialize UNO button
document.getElementById('uno-button').addEventListener('click', () => {
    unoButtonPressed = true;
    document.getElementById('uno-button').className = 'hidden';
});

// Initialize back button
document.querySelector('.back-button').addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Initial UI setup
updateUI(); 