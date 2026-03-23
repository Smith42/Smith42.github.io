// Clippy assistant
(function() {
    const tips = [
        "It looks like you're reading a CV. Would you like me to hire this person?",
        "I see you've been scrolling. Need a break? Try typing IDDQD.",
        "Fun fact: this website has secrets. Try the Konami code!",
        "It looks like you're stalking someone's GitHub. Need help?",
        "Did you know? The meaning of life is 42. Also, try typing CRT.",
        "You seem lost. Have you tried turning it off and on again?",
        "I'm not saying this is the best website ever, but... it is.",
        "Pro tip: email Mike. I'm a paperclip and even I know that.",
        "Hmm, you've been here a while. Everything okay?",
        "I see you're using a web browser. Excellent choice!",
        "Feeling nostalgic? Type BREAKOUT for a surprise game.",
        "Birds aren't real, but FLAPPY ones are. Try typing it.",
        "Psst... try accessing the /blog/ terminal. If you can hack it."
    ];

    let dismissCount = 0;
    let usedTips = [];

    function getRandomTip() {
        if (usedTips.length >= tips.length) usedTips = [];
        let tip;
        do {
            tip = tips[Math.floor(Math.random() * tips.length)];
        } while (usedTips.includes(tip));
        usedTips.push(tip);
        return tip;
    }

    function createClippy() {
        const clippy = document.createElement('div');
        clippy.id = 'clippy';
        clippy.innerHTML = `
            <div id="clippy-bubble">
                <button id="clippy-close">&times;</button>
                <p id="clippy-tip"></p>
            </div>
            <div id="clippy-body">
                <svg viewBox="0 0 50 80" width="50" height="80">
                    <!-- Paperclip body -->
                    <path d="M25 5 C10 5 8 15 8 25 L8 55 C8 68 15 75 25 75 C35 75 42 68 42 55 L42 25 C42 18 38 12 30 12 C22 12 18 18 18 25 L18 50 C18 56 21 60 25 60 C29 60 32 56 32 50 L32 25"
                          fill="none" stroke="#808080" stroke-width="3.5" stroke-linecap="round"/>
                    <!-- Left eye -->
                    <circle cx="22" cy="28" r="3" fill="white"/>
                    <circle cx="23" cy="28" r="1.5" fill="black"/>
                    <!-- Right eye -->
                    <circle cx="32" cy="28" r="3" fill="white"/>
                    <circle cx="33" cy="28" r="1.5" fill="black"/>
                </svg>
            </div>
        `;
        document.body.appendChild(clippy);

        const bubble = document.getElementById('clippy-bubble');
        const tipEl = document.getElementById('clippy-tip');
        const closeBtn = document.getElementById('clippy-close');
        const body = document.getElementById('clippy-body');

        function showBubble() {
            tipEl.textContent = getRandomTip();
            bubble.classList.add('clippy-bubble-visible');
        }

        function hideBubble() {
            bubble.classList.remove('clippy-bubble-visible');
            dismissCount++;
            if (dismissCount >= 3) {
                tipEl.textContent = "Fine, I can tell when I'm not wanted...";
                bubble.classList.add('clippy-bubble-visible');
                setTimeout(() => {
                    clippy.classList.add('clippy-leaving');
                    setTimeout(() => clippy.remove(), 1000);
                }, 2000);
            }
        }

        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            hideBubble();
        });

        body.addEventListener('click', function() {
            if (dismissCount < 3) showBubble();
        });

        // Show first tip after a short delay
        setTimeout(showBubble, 800);
    }

    // Pop up after 10 seconds on the page (if no game is active)
    setTimeout(function() {
        if (window._breakoutActive) return;
        createClippy();
    }, 60000);
})();
