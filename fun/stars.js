// Parallax star field
window.addEventListener('load', function() {
    const canvas = document.createElement('canvas');
    canvas.id = 'star-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Generate star layers
    const layers = [
        { count: 120, minR: 0.5, maxR: 1,   minA: 0.3, maxA: 0.5, speed: 0.02 },
        { count: 60,  minR: 1,   maxR: 1.5, minA: 0.5, maxA: 0.7, speed: 0.05 },
        { count: 30,  minR: 1.5, maxR: 2.5, minA: 0.7, maxA: 1.0, speed: 0.1  }
    ];

    const stars = layers.map(layer => {
        const arr = [];
        for (let i = 0; i < layer.count; i++) {
            arr.push({
                x: Math.random(),
                y: Math.random() * 3,
                r: layer.minR + Math.random() * (layer.maxR - layer.minR),
                a: layer.minA + Math.random() * (layer.maxA - layer.minA),
                phase: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.5 + Math.random() * 1.5
            });
        }
        return { stars: arr, speed: layer.speed };
    });

    let animId;
    function draw(time) {
        const t = time * 0.001;
        const scroll = window.scrollY;
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        for (const layer of stars) {
            const offset = scroll * layer.speed;
            for (const star of layer.stars) {
                const x = star.x * w;
                const rawY = (star.y * h - offset) % (h * 3);
                const y = rawY < 0 ? rawY + h * 3 : rawY;
                if (y > h) continue;

                const twinkle = Math.sin(t * star.twinkleSpeed + star.phase) * 0.15;
                const alpha = Math.max(0, Math.min(1, star.a + twinkle));

                ctx.beginPath();
                ctx.arc(x, y, star.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.fill();
            }
        }

        animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
});
