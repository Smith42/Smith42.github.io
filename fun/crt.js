// CRT filter - type "CRT" to toggle
(function() {
    let seq = '';
    const code = 'CRT';
    let overlay = null;

    document.addEventListener('keydown', function(e) {
        seq += e.key.toUpperCase();
        if (seq.length > code.length) {
            seq = seq.substring(seq.length - code.length);
        }
        if (seq === code) {
            seq = '';
            window.SecretTracker.discover('crt');
            toggleCRT();
        }
    });

    function toggleCRT() {
        if (document.body.classList.contains('crt-on')) {
            document.body.classList.remove('crt-on');
            if (overlay) overlay.remove();
            overlay = null;
        } else {
            document.body.classList.add('crt-on');
            overlay = document.createElement('div');
            overlay.className = 'crt-overlay';
            document.body.appendChild(overlay);
        }
    }
})();
