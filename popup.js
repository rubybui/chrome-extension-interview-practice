/**
 * Flash Drill - Interview Questions Slider
 * Chrome Extension Popup Script
 */

class InterviewSlider {
    constructor() {
        this.currentIndex = 0;
        this.totalCards = 5;
        this.isAnimating = false;
        
        this.initializeElements();
        this.bindEvents();
        this.updateUI();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.cardsWrapper = document.getElementById('cardsWrapper');
        this.cards = Array.from(document.querySelectorAll('.card'));
        this.prevButton = document.getElementById('prevButton');
        this.nextButton = document.getElementById('nextButton');
        this.indicators = Array.from(document.querySelectorAll('.indicator'));
        this.currentCardSpan = document.getElementById('currentCard');
        this.totalCardsSpan = document.getElementById('totalCards');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Navigation buttons
        this.prevButton.addEventListener('click', () => this.previousCard());
        this.nextButton.addEventListener('click', () => this.nextCard());

        // Indicator clicks
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToCard(index));
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Touch/swipe support
        this.cardsWrapper.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.cardsWrapper.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.cardsWrapper.addEventListener('touchend', (e) => this.handleTouchEnd(e));

        // Prevent context menu on long press
        this.cardsWrapper.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    /**
     * Navigate to the next card
     */
    nextCard() {
        if (this.isAnimating || this.currentIndex >= this.totalCards - 1) return;
        
        this.goToCard(this.currentIndex + 1);
    }

    /**
     * Navigate to the previous card
     */
    previousCard() {
        if (this.isAnimating || this.currentIndex <= 0) return;
        
        this.goToCard(this.currentIndex - 1);
    }

    /**
     * Navigate to a specific card
     * @param {number} index - Target card index
     */
    goToCard(index) {
        if (this.isAnimating || index < 0 || index >= this.totalCards || index === this.currentIndex) {
            return;
        }

        this.isAnimating = true;
        const direction = index > this.currentIndex ? 1 : -1;

        // Update card classes for animation
        this.cards[this.currentIndex].classList.remove('active');
        if (direction === 1) {
            this.cards[this.currentIndex].classList.add('prev');
        } else {
            this.cards[this.currentIndex].classList.remove('prev');
        }

        // Show new card
        this.cards[index].classList.add('active');
        if (direction === -1) {
            this.cards[index].classList.remove('prev');
        }

        // Update current index
        this.currentIndex = index;

        // Update UI after animation
        setTimeout(() => {
            this.updateUI();
            this.isAnimating = false;
            
            // Clean up classes
            this.cards.forEach(card => {
                if (!card.classList.contains('active')) {
                    card.classList.remove('prev');
                }
            });
        }, 500);
    }

    /**
     * Update UI elements
     */
    updateUI() {
        // Update progress indicator
        this.currentCardSpan.textContent = this.currentIndex + 1;
        this.totalCardsSpan.textContent = this.totalCards;

        // Update navigation buttons
        this.prevButton.disabled = this.currentIndex === 0;
        this.nextButton.disabled = this.currentIndex === this.totalCards - 1;

        // Update indicators
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });

        // Update ARIA labels
        this.prevButton.setAttribute('aria-label', 
            this.currentIndex === 0 ? 'No previous question' : 'Previous question');
        this.nextButton.setAttribute('aria-label', 
            this.currentIndex === this.totalCards - 1 ? 'No next question' : 'Next question');
    }

    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboard(e) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.previousCard();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextCard();
                break;
            case 'Home':
                e.preventDefault();
                this.goToCard(0);
                break;
            case 'End':
                e.preventDefault();
                this.goToCard(this.totalCards - 1);
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
                e.preventDefault();
                const index = parseInt(e.key) - 1;
                if (index < this.totalCards) {
                    this.goToCard(index);
                }
                break;
        }
    }

    /**
     * Touch/swipe support variables
     */
    touchStartX = 0;
    touchStartY = 0;
    touchEndX = 0;
    touchEndY = 0;

    /**
     * Handle touch start event
     * @param {TouchEvent} e - Touch event
     */
    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
        this.touchStartY = e.changedTouches[0].screenY;
    }

    /**
     * Handle touch move event
     * @param {TouchEvent} e - Touch event
     */
    handleTouchMove(e) {
        e.preventDefault(); // Prevent scrolling during swipe
    }

    /**
     * Handle touch end event
     * @param {TouchEvent} e - Touch event
     */
    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.touchEndY = e.changedTouches[0].screenY;
        this.handleSwipe();
    }

    /**
     * Handle swipe gesture
     */
    handleSwipe() {
        const deltaX = this.touchStartX - this.touchEndX;
        const deltaY = this.touchStartY - this.touchEndY;
        const minSwipeDistance = 50;

        // Check if it's a horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                // Swipe left - next card
                this.nextCard();
            } else {
                // Swipe right - previous card
                this.previousCard();
            }
        }
    }

    /**
     * Save current state to Chrome storage
     */
    saveState() {
        if (chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({
                currentCardIndex: this.currentIndex,
                lastVisited: Date.now()
            });
        }
    }

    /**
     * Load state from Chrome storage
     */
    async loadState() {
        if (chrome.storage && chrome.storage.local) {
            try {
                const result = await chrome.storage.local.get(['currentCardIndex']);
                if (result.currentCardIndex !== undefined) {
                    this.goToCard(result.currentCardIndex);
                }
            } catch (error) {
                console.warn('Failed to load state:', error);
            }
        }
    }

    /**
     * Initialize the slider
     */
    async init() {
        await this.loadState();
        
        // Add focus management
        this.cardsWrapper.setAttribute('tabindex', '0');
        this.cardsWrapper.focus();
        
        // Save state periodically
        setInterval(() => this.saveState(), 5000);
    }
}

// Initialize the slider when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const slider = new InterviewSlider();
    slider.init();
});

// Handle extension popup lifecycle
if (chrome.runtime) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'reset') {
            // Reset to first card
            const slider = new InterviewSlider();
            slider.goToCard(0);
        }
    });
}
