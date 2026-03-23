// Clippy assistant — secrets-aware
(function() {
    // Hint tips — only shown if that secret is NOT yet found
    var hints = {
        konami: "I know a cheat code but I'm not supposed to tell you. It starts with up.",
        iddqd: "I see you've been scrolling. Need a break? Try typing IDDQD.",
        crt: "Did you know? The meaning of life is 42. Also, try typing CRT.",
        breakout: "Type BREAKOUT. I'll wait. I'm a paperclip, I've got nothing but time.",
        flappy: "Birds aren't real, but FLAPPY ones are. Try typing it.",
        secrets_await: "That banner up there is more clickable than it looks."
    };

    // Reaction tips — only shown if that secret IS found
    var reactions = {
        konami: "Konami code. You and every other '90s kid.",
        iddqd: "God Mode. Somewhere, John Carmack felt a disturbance.",
        crt: "CRT mode. Your eyeballs must be thrilled.",
        flappy: "A flappy shoggoth. The eldritch horrors just keep getting more casual."
    };

    // General tips — always available
    var general = [
        "It looks like you're reading a CV. Would you like me to hire this person?",
        "It looks like you're stalking someone's GitHub. Need help?",
        "You seem lost. That's okay. I live here and I'm also lost.",
        "You've been here a while. Not judging. Okay, slightly judging.",
        "You're using a web browser. Bold move in $CURRENT_YEAR.",
        "There's a /blog/ terminal. It has a password. I'm not helping.",
        "The paperclip maximizer is a thought experiment about an AI that turns everything into paperclips. I'm not saying it worked, but here I am.",
    ];

    // Completionist tips — all 6 secrets found
    var completionist = [
        "You found everything. I'm genuinely unsure what to say.",
        "All secrets found. I'm unemployed now :( .",
        "100% completion. You check behind waterfalls in games, don't you?",
        "That's all of them. We should both go touch grass."
    ];

    var dismissCount = 0;
    var usedTips = [];

    function getFoundSecrets() {
        try {
            return JSON.parse(localStorage.getItem('secrets-found') || '{}');
        } catch(e) {
            return {};
        }
    }

    function getRandomTip() {
        var found = getFoundSecrets();
        var count = Object.keys(found).length;
        var pool = [];

        if (count >= 6) {
            // All secrets found — use completionist + general
            pool = pool.concat(completionist);
            pool = pool.concat(general);
        } else {
            // Add hints for undiscovered secrets
            var secretKeys = Object.keys(hints);
            for (var i = 0; i < secretKeys.length; i++) {
                if (!found[secretKeys[i]]) {
                    pool.push(hints[secretKeys[i]]);
                }
            }
            // Add reactions for discovered secrets
            var reactionKeys = Object.keys(reactions);
            for (var i = 0; i < reactionKeys.length; i++) {
                if (found[reactionKeys[i]]) {
                    pool.push(reactions[reactionKeys[i]]);
                }
            }
            // Always add general tips
            pool = pool.concat(general);
        }

        // Avoid repeats
        if (usedTips.length >= pool.length) usedTips = [];
        var tip;
        var tries = 0;
        do {
            tip = pool[Math.floor(Math.random() * pool.length)];
            tries++;
        } while (usedTips.includes(tip) && tries < 50);
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

    // Pop up after 60 seconds on the page (if no game is active)
    setTimeout(function() {
        if (window._breakoutActive) return;
        createClippy();
    }, 60000);
})();
