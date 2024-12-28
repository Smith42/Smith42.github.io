class KonamiCode {
    constructor() {
        // The Konami Code sequence
        this.konamiCode = [
            'ArrowUp', 'ArrowUp',
            'ArrowDown', 'ArrowDown',
            'ArrowLeft', 'ArrowRight',
            'ArrowLeft', 'ArrowRight',
            'b', 'a'
        ];
        this.konamiIndex = 0;
        
        // Bind the key handler to this instance
        this.handleKeydown = this.handleKeydown.bind(this);
        
        // Add event listener
        document.addEventListener('keydown', this.handleKeydown);
    }

    handleKeydown(event) {
        // Get the key that was pressed
        const key = event.key.toLowerCase();
        
        // Get the expected key
        const expectedKey = this.konamiCode[this.konamiIndex].toLowerCase();
        
        // Check if the key matches the expected key
        if (key === expectedKey) {
            this.konamiIndex++;
            
            // If we've matched all keys, trigger the easter egg
            if (this.konamiIndex === this.konamiCode.length) {
                this.triggerEasterEgg();
                this.konamiIndex = 0; // Reset the sequence
            }
        } else {
            this.konamiIndex = 0; // Reset if wrong key
            
            // If the wrong key was the first key in sequence, check it
            if (key === this.konamiCode[0].toLowerCase()) {
                this.konamiIndex = 1;
            }
        }
    }

    triggerEasterEgg() {
        // Create a rain of your floating images
        const images = [
            'fun/toast.gif',
            'fun/shoggoth_telescope.png',
            'fun/sunGlassesGalaxy.png'
        ];

        // Launch confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Create a bunch of floating images
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const randomImage = images[Math.floor(Math.random() * images.length)];
                const floater = document.createElement('div');
                floater.className = 'floater konami-floater';
                
                const img = document.createElement('img');
                img.src = randomImage;
                floater.appendChild(img);
                
                // Random starting position
                floater.style.right = `${Math.random() * 100}vw`;
                
                document.getElementById('float-container').appendChild(floater);
                
                // Remove the floater after animation
                setTimeout(() => floater.remove(), 10000);
            }, i * 200); // Stagger the creation of floaters
        }

        // Flash the banner text different colors rapidly
        const bannerLinks = document.querySelectorAll('#ban1 a, #ban2 a, #banLeft a, #banRight a');
        bannerLinks.forEach(link => {
            link.style.animation = 'konamiFlash 0.5s linear infinite';
            setTimeout(() => {
                link.style.animation = '';
            }, 5000);
        });
    }
}

// Initialize when the document is loaded
window.addEventListener('load', () => {
    new KonamiCode();
});
