// Sparkle cursor trail
window.addEventListener('load', function() {
    const colours = ['#77ff77', '#ff6961', '#fc107f', '#02897e', 'aqua', 'white'];
    const chars = ['✦', '✧', '⭑', '·'];
    const container = document.createElement('div');
    container.id = 'cursor-trail-container';
    document.body.appendChild(container);

    let lastSpawn = 0;

    document.addEventListener('mousemove', function(e) {
        const now = Date.now();
        if (now - lastSpawn < 30) return;
        lastSpawn = now;

        const spark = document.createElement('span');
        spark.className = 'cursor-spark';
        spark.textContent = chars[Math.floor(Math.random() * chars.length)];
        spark.style.left = e.clientX + 'px';
        spark.style.top = e.clientY + 'px';
        spark.style.color = colours[Math.floor(Math.random() * colours.length)];
        spark.style.fontSize = (8 + Math.random() * 12) + 'px';
        container.appendChild(spark);

        setTimeout(() => spark.remove(), 600);
    });
});
