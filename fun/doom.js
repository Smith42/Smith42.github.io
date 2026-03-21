// DOOM Mode implementation
let keySequence = '';
const cheatCode = 'IDDQD';
let godModeActive = false;

// Create audio element for doom sound
const doomSound = new Audio('fun/doom.mp3');

function handleKeydown(event) {
    // Add the latest key to the sequence
    keySequence += event.key.toUpperCase();

    // Only keep the last 5 characters (length of IDDQD)
    if (keySequence.length > cheatCode.length) {
        keySequence = keySequence.substring(keySequence.length - cheatCode.length);
    }

    // Check if the sequence matches the cheat code
    if (keySequence === cheatCode) {
        if (!godModeActive) {
            activateGodMode();
        }
        keySequence = ''; // Reset the sequence
    }
}

function activateGodMode() {
    godModeActive = true;

    // Play the doom song
    doomSound.play();

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'doom-overlay';

    // Create DOOM-style message container
    const doomMessage = document.createElement('div');
    doomMessage.className = 'doom-message';
    overlay.appendChild(doomMessage);
    document.body.appendChild(overlay);

    // Define the text lines - short and punchy
    const lines = [
        "GOD MODE ACTIVATED",
        "",
        "RIP AND TEAR, UNTIL IT IS DONE."
    ];

    // Create line elements
    const lineElements = lines.map(line => {
        const lineElement = document.createElement('div');
        lineElement.className = 'doom-text-line';
        lineElement.textContent = line;
        doomMessage.appendChild(lineElement);
        return lineElement;
    });

    // Function to reveal one character
    function revealChar(lineElement, charIndex) {
        const text = lineElement.textContent;
        if (charIndex < text.length) {
            lineElement.innerHTML = '';

            // Add revealed characters
            for (let i = 0; i <= charIndex; i++) {
                const charSpan = document.createElement('span');
                charSpan.className = 'doom-char';
                charSpan.textContent = text[i] === ' ' ? '\u00A0' : text[i];
                lineElement.appendChild(charSpan);
            }

            // Add hidden characters
            if (charIndex < text.length - 1) {
                const remainingText = document.createElement('span');
                remainingText.textContent = text.substring(charIndex + 1);
                lineElement.appendChild(remainingText);
            }

            // Schedule next character
            setTimeout(() => revealChar(lineElement, charIndex + 1), 30);
        }
    }

    // Start revealing each line with shorter delay
    lineElements.forEach((line, index) => {
        setTimeout(() => {
            revealChar(line, 0);
        }, index * 800);
    });

    // After text reveals (~3s), melt screen then launch Doom
    const totalDuration = (lines.length * 800) + (Math.max(...lines.map(l => l.length)) * 30) + 1000;
    setTimeout(() => {
        meltScreen(overlay, () => {
            overlay.remove();
            doomSound.pause();
            doomSound.currentTime = 0;
            launchDoom();
        });
    }, totalDuration);
}

function launchDoom() {
    window.open('fun/doom.html', 'DOOM', 'width=800,height=600');
    godModeActive = false;
}

function meltScreen(element, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = element.offsetWidth;
    canvas.height = element.offsetHeight;

    html2canvas(element).then(renderedCanvas => {
        element.innerHTML = '';
        element.style.backgroundColor = 'transparent';
        element.style.backgroundImage = 'none';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        element.appendChild(canvas);

        ctx.drawImage(renderedCanvas, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';

        const columnOffsets = new Array(canvas.width).fill(0);
        const meltSpeed = 3;

        function melt() {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.putImageData(imageData, 0, 0);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let stillMelting = false;
            for(let x = 0; x < canvas.width; x++) {
                const randomSpeed = Math.random() * meltSpeed + 1;
                if(columnOffsets[x] < canvas.height) {
                    columnOffsets[x] += randomSpeed;
                    stillMelting = true;
                }

                ctx.drawImage(tempCanvas,
                    x, 0, 1, canvas.height,
                    x, columnOffsets[x], 1, canvas.height);
            }

            if(stillMelting) {
                requestAnimationFrame(melt);
            } else {
                callback();
            }
        }

        melt();
    });
}

// Initialize when the document is loaded
document.addEventListener('keydown', handleKeydown);
