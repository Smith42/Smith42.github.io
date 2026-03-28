// Clippy assistant — secrets-aware, idle-detecting, draggable, context-aware
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

    // Page-context tips
    var contextTips = {
        header: [
            "It looks like you're admiring the title. Very flashy.",
            "You can email Mike, you know. He's right there.",
            "Bluesky, GitHub, X... this person is on every platform. Suspicious."
        ],
        projects: [
            "It looks like you're browsing projects. Want me to pad the descriptions?",
            "Scroll slower. These projects have feelings."
        ],
        footer: [
            "You've reached the bottom. There is no treasure here.",
            "Best viewed with Netscape Navigator. Trust the GIF.",
            "You scrolled all the way down. I respect the commitment."
        ]
    };

    // Time-aware tips
    var hour = new Date().getHours();
    var timeTips = [];
    if (hour >= 0 && hour < 6) {
        timeTips.push("It's past midnight. This is a portfolio, not a debugging emergency.");
        timeTips.push("Go to sleep. I'll still be here tomorrow. Unfortunately.");
    } else if (hour < 12) {
        timeTips.push("Good morning! Early bird gets the... paperclip.");
        timeTips.push("Morning browsing. Very productive. I approve.");
    } else if (hour < 18) {
        timeTips.push("Afternoon scrolling. Peak procrastination hours.");
    } else {
        timeTips.push("Evening browsing. Very chill. Very on-brand.");
        timeTips.push("Late night coding session? I know the signs.");
    }

    // Visit tracking
    var visits = parseInt(localStorage.getItem('clippy-visits') || '0', 10) + 1;
    try { localStorage.setItem('clippy-visits', visits); } catch(e) {}
    var visitTips = [];
    if (visits === 1) {
        visitTips.push("First time here? Don't worry, I'll be annoying enough for both of us.");
    } else if (visits <= 3) {
        visitTips.push("You've been here " + visits + " times now. I'm flattered.");
    } else if (visits <= 10) {
        visitTips.push("Visit #" + visits + ". At this point you should just bookmark it.");
    } else {
        visitTips.push("Visit #" + visits + ". We're basically coworkers now.");
        visitTips.push(visits + " visits. Should I start charging rent?");
    }

    var dismissCount = 0;
    var usedTips = [];
    var usedContextTips = [];

    function getFoundSecrets() {
        try {
            return JSON.parse(localStorage.getItem('secrets-found') || '{}');
        } catch(e) {
            return {};
        }
    }

    function getContextTip() {
        var headerEl = document.getElementById('header');
        var mainEl = document.querySelector('main');
        var footerEl = document.querySelector('.footer-content');
        var zone = null;

        if (footerEl) {
            var fr = footerEl.getBoundingClientRect();
            if (fr.top < window.innerHeight && fr.bottom > 0) zone = 'footer';
        }
        if (!zone && headerEl) {
            var hr = headerEl.getBoundingClientRect();
            if (hr.top > -hr.height && hr.bottom > 0) zone = 'header';
        }
        if (!zone && mainEl) {
            var mr = mainEl.getBoundingClientRect();
            if (mr.top < window.innerHeight && mr.bottom > 0) zone = 'projects';
        }

        if (!zone || !contextTips[zone]) return null;

        var pool = contextTips[zone];
        var available = pool.filter(function(t) { return usedContextTips.indexOf(t) === -1; });
        if (available.length === 0) {
            usedContextTips = [];
            available = pool;
        }
        var tip = available[Math.floor(Math.random() * available.length)];
        usedContextTips.push(tip);
        return tip;
    }

    function getRandomTip() {
        var found = getFoundSecrets();
        var count = Object.keys(found).length;
        var pool = [];

        if (count >= 6) {
            pool = pool.concat(completionist);
            pool = pool.concat(general);
        } else {
            var secretKeys = Object.keys(hints);
            for (var i = 0; i < secretKeys.length; i++) {
                if (!found[secretKeys[i]]) {
                    pool.push(hints[secretKeys[i]]);
                }
            }
            var reactionKeys = Object.keys(reactions);
            for (var i = 0; i < reactionKeys.length; i++) {
                if (found[reactionKeys[i]]) {
                    pool.push(reactions[reactionKeys[i]]);
                }
            }
            pool = pool.concat(general);
        }

        // Add time and visit tips
        pool = pool.concat(timeTips);
        pool = pool.concat(visitTips);

        // Avoid repeats
        if (usedTips.length >= pool.length) usedTips = [];
        var tip;
        var tries = 0;
        do {
            tip = pool[Math.floor(Math.random() * pool.length)];
            tries++;
        } while (usedTips.indexOf(tip) !== -1 && tries < 50);
        usedTips.push(tip);
        return tip;
    }

    function createClippy() {
        var clippy = document.createElement('div');
        clippy.id = 'clippy';
        clippy.innerHTML =
            '<div id="clippy-bubble">' +
                '<button id="clippy-close">&times;</button>' +
                '<p id="clippy-tip"></p>' +
            '</div>' +
            '<div id="clippy-body">' +
                '<svg viewBox="0 0 50 80" width="50" height="80">' +
                    '<path d="M25 5 C10 5 8 15 8 25 L8 55 C8 68 15 75 25 75 C35 75 42 68 42 55 L42 25 C42 18 38 12 30 12 C22 12 18 18 18 25 L18 50 C18 56 21 60 25 60 C29 60 32 56 32 50 L32 25" fill="none" stroke="#808080" stroke-width="3.5" stroke-linecap="round"/>' +
                    '<circle cx="22" cy="28" r="3" fill="white"/>' +
                    '<circle id="clippy-pupil-l" cx="23" cy="28" r="1.5" fill="black"/>' +
                    '<circle cx="32" cy="28" r="3" fill="white"/>' +
                    '<circle id="clippy-pupil-r" cx="33" cy="28" r="1.5" fill="black"/>' +
                '</svg>' +
            '</div>';
        document.body.appendChild(clippy);

        var bubble = document.getElementById('clippy-bubble');
        var tipEl = document.getElementById('clippy-tip');
        var closeBtn = document.getElementById('clippy-close');
        var body = document.getElementById('clippy-body');
        var leftPupil = document.getElementById('clippy-pupil-l');
        var rightPupil = document.getElementById('clippy-pupil-r');

        // --- Eye tracking ---
        var lastTrack = 0;
        function trackEyes(e) {
            var now = Date.now();
            if (now - lastTrack < 60) return;
            lastTrack = now;
            var rect = body.getBoundingClientRect();
            var cx = rect.left + rect.width / 2;
            var cy = rect.top + rect.height / 2;
            var dx = e.clientX - cx;
            var dy = e.clientY - cy;
            var angle = Math.atan2(dy, dx);
            var dist = 1.5;
            var ox = Math.cos(angle) * dist;
            var oy = Math.sin(angle) * dist;
            leftPupil.setAttribute('cx', 23 + ox);
            leftPupil.setAttribute('cy', 28 + oy);
            rightPupil.setAttribute('cx', 33 + ox);
            rightPupil.setAttribute('cy', 28 + oy);
        }
        document.addEventListener('mousemove', trackEyes, {passive: true});

        // --- Fidget animations ---
        var fidgetClasses = ['clippy-wiggle', 'clippy-look-around', 'clippy-tap'];
        var fidgetTimer = null;
        var lastInteraction = Date.now();

        function scheduleFidget() {
            clearTimeout(fidgetTimer);
            var delay = 15000 + Math.random() * 10000; // 15-25s
            fidgetTimer = setTimeout(function() {
                if (Date.now() - lastInteraction < 15000) {
                    scheduleFidget();
                    return;
                }
                var cls = fidgetClasses[Math.floor(Math.random() * fidgetClasses.length)];
                clippy.classList.add(cls);
                clippy.addEventListener('animationend', function handler() {
                    clippy.removeEventListener('animationend', handler);
                    clippy.classList.remove(cls);
                    scheduleFidget();
                });
            }, delay);
        }

        function resetFidgetTimer() {
            lastInteraction = Date.now();
            scheduleFidget();
        }

        // --- Draggable ---
        var isDragging = false;
        var didDrag = false;
        var dragStartX, dragStartY, clippyStartX, clippyStartY;

        function onDragStart(e) {
            var ev = e.touches ? e.touches[0] : e;
            var rect = clippy.getBoundingClientRect();
            // Convert to left/top positioning on first drag
            clippy.style.left = rect.left + 'px';
            clippy.style.top = rect.top + 'px';
            clippy.style.right = 'auto';
            clippy.style.bottom = 'auto';
            dragStartX = ev.clientX;
            dragStartY = ev.clientY;
            clippyStartX = rect.left;
            clippyStartY = rect.top;
            isDragging = true;
            didDrag = false;
            clippy.classList.add('clippy-dragging');
            e.preventDefault();
        }

        function onDragMove(e) {
            if (!isDragging) return;
            var ev = e.touches ? e.touches[0] : e;
            var dx = ev.clientX - dragStartX;
            var dy = ev.clientY - dragStartY;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) didDrag = true;
            clippy.style.left = (clippyStartX + dx) + 'px';
            clippy.style.top = (clippyStartY + dy) + 'px';
        }

        function onDragEnd() {
            if (!isDragging) return;
            isDragging = false;
            clippy.classList.remove('clippy-dragging');
        }

        body.addEventListener('mousedown', onDragStart);
        body.addEventListener('touchstart', onDragStart, {passive: false});
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('touchmove', onDragMove, {passive: true});
        document.addEventListener('mouseup', onDragEnd);
        document.addEventListener('touchend', onDragEnd);

        // --- Show/hide bubble ---
        function showBubble() {
            var tip = (Math.random() < 0.3) ? getContextTip() : null;
            tipEl.textContent = tip || getRandomTip();
            bubble.classList.add('clippy-bubble-visible');
            resetFidgetTimer();
        }

        function hideBubble() {
            bubble.classList.remove('clippy-bubble-visible');
            dismissCount++;
            resetFidgetTimer();
            if (dismissCount >= 3) {
                tipEl.textContent = "Fine, I can tell when I'm not wanted...";
                bubble.classList.add('clippy-bubble-visible');
                setTimeout(function() {
                    clippy.classList.add('clippy-leaving');
                    clearTimeout(fidgetTimer);
                    document.removeEventListener('mousemove', trackEyes);
                    setTimeout(function() { clippy.remove(); }, 1000);
                }, 2000);
            }
        }

        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            hideBubble();
        });

        body.addEventListener('click', function() {
            if (didDrag) { didDrag = false; return; }
            if (dismissCount < 3) showBubble();
        });

        // Show first tip after a short delay
        setTimeout(showBubble, 800);
        scheduleFidget();
    }

    // --- Idle detection ---
    var idleTimer = null;
    var clippyCreated = false;
    var pageReady = false;
    var IDLE_DELAY = 30000; // 30 seconds

    function resetIdleTimer() {
        clearTimeout(idleTimer);
        if (clippyCreated || !pageReady) return;
        idleTimer = setTimeout(function() {
            if (clippyCreated || window._breakoutActive) return;
            clippyCreated = true;
            removeIdleListeners();
            createClippy();
        }, IDLE_DELAY);
    }

    var idleEvents = ['mousemove', 'scroll', 'keydown', 'touchstart'];

    function addIdleListeners() {
        for (var i = 0; i < idleEvents.length; i++) {
            document.addEventListener(idleEvents[i], resetIdleTimer, {passive: true});
        }
    }

    function removeIdleListeners() {
        for (var i = 0; i < idleEvents.length; i++) {
            document.removeEventListener(idleEvents[i], resetIdleTimer);
        }
    }

    // Wait 10s for the page to settle, then start idle detection
    setTimeout(function() {
        pageReady = true;
        addIdleListeners();
        resetIdleTimer();
    }, 10000);
})();
