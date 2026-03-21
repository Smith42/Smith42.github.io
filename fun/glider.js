// Flappy Bird - type "FLAPPY" to play
(function() {
    let seq = '';
    const CODE = 'FLAPPY';
    let active = false;

    document.addEventListener('keydown', function(e) {
        if (active) return;
        seq += e.key.toUpperCase();
        if (seq.length > CODE.length) {
            seq = seq.slice(-CODE.length);
        }
        if (seq === CODE) {
            seq = '';
            active = true;
            window.open('fun/floppybird/index.html', 'FLAPPY', 'width=400,height=600');
            active = false;
        }
    });
})();
