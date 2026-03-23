// Sitewide secrets counter
window.SecretTracker = (function() {
    const STORAGE_KEY = 'secrets-found';
    const TOTAL = 6;
    const found = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    function getCount() {
        return Object.keys(found).length;
    }

    function updateUI() {
        const el = document.getElementById('secrets-counter');
        if (el) el.textContent = 'SECRETS: ' + getCount() + '/' + TOTAL;
    }

    function showToast(id) {
        const toast = document.createElement('div');
        toast.id = 'secret-toast';
        toast.textContent = 'SECRET FOUND (' + getCount() + '/' + TOTAL + ')';
        document.body.appendChild(toast);
        // Trigger reflow then add visible class
        toast.offsetHeight;
        toast.classList.add('secret-toast-visible');
        setTimeout(function() {
            toast.classList.remove('secret-toast-visible');
            setTimeout(function() { toast.remove(); }, 500);
        }, 2000);
    }

    function discover(id) {
        if (found[id]) return;
        found[id] = true;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
        updateUI();
        showToast(id);
        if (getCount() === TOTAL) {
            setTimeout(celebrate, 2500);
        }
    }

    function celebrate() {
        // Play doom secret sound
        try {
            var audio = new Audio('fun/doom_secret.mp3');
            audio.volume = 0.5;
            audio.play();
        } catch(e) {}

        // Confetti burst
        if (typeof confetti === 'function') {
            confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
            setTimeout(function() {
                confetti({ particleCount: 100, spread: 120, origin: { y: 0.5 } });
            }, 500);
        }

        // Achievement overlay — built entirely with inline styles for reliability
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;' +
            'background:rgba(0,0,0,0.92);z-index:100001;display:flex;align-items:center;' +
            'justify-content:center;opacity:0;transition:opacity 0.8s ease;';

        var secretNames = {
            konami: { name: 'Konami Code', trigger: '\u2191\u2191\u2193\u2193\u2190\u2192\u2190\u2192BA' },
            iddqd: { name: 'God Mode', trigger: 'Type IDDQD' },
            crt: { name: 'CRT Mode', trigger: 'Type CRT' },
            breakout: { name: 'Breakout', trigger: 'Type BREAKOUT' },
            flappy: { name: 'Flappy Glider', trigger: 'Type FLAPPY' },
            secrets_await: { name: 'Secrets Await', trigger: 'Click the banner' }
        };

        var listHTML = '';
        var keys = Object.keys(secretNames);
        for (var i = 0; i < keys.length; i++) {
            var s = secretNames[keys[i]];
            listHTML += '<div style="display:flex;justify-content:space-between;padding:8px 0;' +
                'border-bottom:1px solid #33aa33;font-family:Pixel,monospace;font-size:1.2rem;">' +
                '<span style="color:#ffaa33;">' + s.name + '</span>' +
                '<span style="color:#559955;font-size:1rem;">' + s.trigger + '</span>' +
                '</div>';
        }

        overlay.innerHTML =
            '<div style="text-align:center;max-width:500px;padding:40px;">' +
                '<h1 style="font-family:Pixel,monospace;font-size:3rem;color:#77ff77;' +
                    'margin:0 0 30px 0;text-shadow:0 0 20px rgba(119,255,119,0.6);">ALL SECRETS FOUND</h1>' +
                '<div style="text-align:left;margin:0 auto 30px;">' + listHTML + '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        // Force reflow then fade in
        overlay.offsetHeight;
        setTimeout(function() {
            overlay.style.opacity = '1';
        }, 50);

        // Fade out after 8 seconds
        setTimeout(function() {
            overlay.style.opacity = '0';
            setTimeout(function() {
                overlay.remove();
            }, 1000);
        }, 8000);
    }

    // Init counter text on load
    document.addEventListener('DOMContentLoaded', updateUI);
    // Also try immediately in case DOM is already ready
    if (document.readyState !== 'loading') updateUI();

    return { discover: discover, getCount: getCount, updateUI: updateUI };
})();
