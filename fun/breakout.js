// Breakout game - type "BREAKOUT" to play
(function() {
    let seq = '';
    const CODE = 'BREAKOUT';
    let active = false;

    document.addEventListener('keydown', function(e) {
        if (active) return;
        seq += e.key.toUpperCase();
        if (seq.length > CODE.length) {
            seq = seq.slice(-CODE.length);
        }
        if (seq === CODE) {
            seq = '';
            window.SecretTracker.discover('breakout');
            startBreakout();
        }
    });

    function layoutTextBricks(text, W, startY, brickSize, gap, colours, colourOffset) {
        const letters = text.split('');
        const maxCols = Math.min(letters.length, Math.floor((W - gap) / (brickSize + gap)));
        const bricks = [];
        for (let i = 0; i < letters.length; i++) {
            const r = Math.floor(i / maxCols);
            const c = i % maxCols;
            const colsInRow = (r < Math.floor(letters.length / maxCols))
                ? maxCols : letters.length % maxCols || maxCols;
            const rowW = colsInRow * (brickSize + gap) - gap;
            const rowOffsetX = (W - rowW) / 2;
            bricks.push({
                x: rowOffsetX + c * (brickSize + gap),
                y: startY + r * (brickSize + gap),
                w: brickSize, h: brickSize,
                color: colours[(i + colourOffset) % colours.length],
                text: letters[i], alive: true
            });
        }
        return bricks;
    }

    const invader = [
        '..X.......X..',
        '...X.....X...',
        '..XXXXXXXXX..',
        '.XX.XXX.XX...',
        'XXXXXXXXXXXXX',
        'X.XXXXXXXXX.X',
        'X.X.......X.X',
        '...XX...XX...',
    ];

    function layoutInvaderBricks(W, startY, brickSize, gap, colours) {
        const bricks = [];
        const cols = invader[0].length;
        const totalW = cols * (brickSize + gap) - gap;
        const offsetX = (W - totalW) / 2;
        for (let r = 0; r < invader.length; r++) {
            for (let c = 0; c < cols; c++) {
                if (invader[r][c] === 'X') {
                    bricks.push({
                        x: offsetX + c * (brickSize + gap),
                        y: startY + r * (brickSize + gap),
                        w: brickSize, h: brickSize,
                        color: colours[(r + c) % colours.length],
                        text: '', alive: true
                    });
                }
            }
        }
        return bricks;
    }

    // Powerup types
    const POWERUPS = [
        { type: 'fireball',  src: 'fun/toast_opaque.png',          label: 'FIREBALL',    color: '#ff6961' },
        { type: 'multiball', src: 'fun/shoggoth_telescope_opaque.png',   label: 'MULTIBALL',   color: '#fc107f' },
        { type: 'widepaddle',src: 'fun/sunGlassesGalaxy_opaque.png',     label: 'WIDE PADDLE', color: 'aqua'    },
    ];

    function startBreakout() {
        active = true;
        window._breakoutActive = true;
        const colours = ['#77ff77', '#ff6961', '#fc107f', '#02897e', 'aqua', 'white'];
        const topText = 'email me at mike@mjjsmith.com';
        const bottomText = 'mjjsmith.com';
        const particles = [];
        const powerupDrops = []; // falling powerup items
        const notifications = []; // HUD popups

        // Preload powerup images
        const powerupImgs = {};
        POWERUPS.forEach(p => {
            const img = new Image();
            img.src = p.src;
            powerupImgs[p.type] = img;
        });

        // Active powerup state
        let fireballTimer = 0;
        let widePaddleTimer = 0;
        const FIREBALL_DURATION = 300;   // frames (~5 seconds)
        const WIDEPADDLE_DURATION = 480; // frames (~8 seconds)

        // Star layers
        const starLayers = [
            { count: 80, minR: 0.5, maxR: 1, minA: 0.3, maxA: 0.5 },
            { count: 40, minR: 1, maxR: 1.5, minA: 0.5, maxA: 0.7 },
            { count: 20, minR: 1.5, maxR: 2.5, minA: 0.7, maxA: 1.0 }
        ];
        let starData = null;

        // Hide Clippy
        const clippy = document.getElementById('clippy');
        if (clippy) clippy.style.display = 'none';

        document.fonts.ready.then(() => run());

        function run() {
            const canvas = document.createElement('canvas');
            canvas.id = 'breakout-canvas';
            const W = window.innerWidth;
            const H = window.innerHeight;
            canvas.width = W;
            canvas.height = H;
            document.body.appendChild(canvas);
            document.body.style.overflow = 'hidden';
            const ctx = canvas.getContext('2d');

            // Stars
            starData = starLayers.map(layer => {
                const arr = [];
                for (let i = 0; i < layer.count; i++) {
                    arr.push({
                        x: Math.random() * W, y: Math.random() * H,
                        r: layer.minR + Math.random() * (layer.maxR - layer.minR),
                        a: layer.minA + Math.random() * (layer.maxA - layer.minA),
                        phase: Math.random() * Math.PI * 2,
                        twinkleSpeed: 0.5 + Math.random() * 1.5
                    });
                }
                return arr;
            });

            const gap = 2;
            // Size invader bricks so the 13-column invader spans ~60% of screen width
            const invaderCols = invader[0].length;
            const invaderBrickSize = Math.floor((W * 0.6) / (invaderCols + (invaderCols - 1) * (gap / 28)));
            // Text bricks stay smaller so the text row fits
            const textBrickSize = Math.min(invaderBrickSize, Math.floor((W - gap * 30) / topText.length));

            const topBricks = layoutTextBricks(topText, W, 45, textBrickSize, gap, colours, 0);
            const topBottom = topBricks[topBricks.length - 1].y + textBrickSize + 20;
            const invaderBricks = layoutInvaderBricks(W, topBottom, invaderBrickSize, gap, colours);
            const invaderBottom = invaderBricks[invaderBricks.length - 1].y + invaderBrickSize + 20;
            const bottomBricks = layoutTextBricks(bottomText, W, invaderBottom, textBrickSize, gap, colours, 3);
            const bricks = topBricks.concat(invaderBricks, bottomBricks);

            // Paddle
            const basePaddleW = 100;
            let currentPaddleW = basePaddleW;
            const paddleH = 10;
            let paddleX = W / 2 - currentPaddleW / 2;
            const paddleY = H - 40;

            // Balls array for multiball
            let balls = [];
            let launched = false;
            let lives = 3;
            let score = 0;
            let gameOver = false;
            let won = false;
            let animId;
            let speedMult = 1;

            function makeBall(x, y, dx, dy) {
                return { x, y, dx, dy, r: 5, fireball: false };
            }

            function resetBall() {
                launched = false;
                balls = [makeBall(paddleX + currentPaddleW / 2, paddleY - 7, 0, 0)];
            }
            resetBall();

            function spawnParticles(x, y, color, count) {
                for (let i = 0; i < (count || 8); i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 1 + Math.random() * 3;
                    particles.push({
                        x, y,
                        dx: Math.cos(angle) * speed,
                        dy: Math.sin(angle) * speed,
                        life: 1, color,
                        size: 2 + Math.random() * 3
                    });
                }
            }

            function maybeDropPowerup(bx, by) {
                if (Math.random() > 0.12) return; // 12% chance
                const p = POWERUPS[Math.floor(Math.random() * POWERUPS.length)];
                powerupDrops.push({
                    type: p.type,
                    img: powerupImgs[p.type],
                    label: p.label,
                    color: p.color,
                    x: bx - 15,
                    y: by,
                    w: 30, h: 30,
                    dy: 1.5
                });
            }

            function activatePowerup(type, label, color) {
                notifications.push({ text: label, color, life: 90 });

                if (type === 'fireball') {
                    fireballTimer = FIREBALL_DURATION;
                    balls.forEach(b => b.fireball = true);
                } else if (type === 'multiball') {
                    const newBalls = [];
                    for (const b of balls) {
                        if (b.dx === 0 && b.dy === 0) continue;
                        const speed = Math.sqrt(b.dx * b.dx + b.dy * b.dy);
                        for (let a = -0.4; a <= 0.4; a += 0.4) {
                            const angle = Math.atan2(b.dy, b.dx) + a;
                            newBalls.push(makeBall(b.x, b.y, Math.cos(angle) * speed, Math.sin(angle) * speed));
                        }
                    }
                    if (newBalls.length > 0) balls = newBalls;
                    if (fireballTimer > 0) balls.forEach(b => b.fireball = true);
                } else if (type === 'widepaddle') {
                    widePaddleTimer = WIDEPADDLE_DURATION;
                }
            }

            function onMouseMove(e) {
                paddleX = e.clientX - currentPaddleW / 2;
                if (paddleX < 0) paddleX = 0;
                if (paddleX > W - currentPaddleW) paddleX = W - currentPaddleW;
                if (!launched) {
                    balls[0].x = paddleX + currentPaddleW / 2;
                }
            }
            canvas.addEventListener('mousemove', onMouseMove);

            function onClick() {
                if (!launched && !gameOver) {
                    launched = true;
                    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
                    balls[0].dx = Math.cos(angle) * 5;
                    balls[0].dy = Math.sin(angle) * 5;
                }
            }
            canvas.addEventListener('click', onClick);

            function onKey(e) {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    e.stopPropagation();
                    endGame();
                }
            }
            document.addEventListener('keydown', onKey, true);

            function endGame() {
                cancelAnimationFrame(animId);
                canvas.remove();
                document.body.style.overflow = '';
                canvas.removeEventListener('mousemove', onMouseMove);
                canvas.removeEventListener('click', onClick);
                document.removeEventListener('keydown', onKey, true);
                active = false;
                window._breakoutActive = false;
                const clippy = document.getElementById('clippy');
                if (clippy) clippy.style.display = '';
            }

            function drawStars(time) {
                const t = time * 0.001;
                for (const layer of starData) {
                    for (const star of layer) {
                        const twinkle = Math.sin(t * star.twinkleSpeed + star.phase) * 0.15;
                        const alpha = Math.max(0, Math.min(1, star.a + twinkle));
                        ctx.beginPath();
                        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                        ctx.fill();
                    }
                }
            }

            function loop(time) {
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, W, H);
                drawStars(time);

                ctx.strokeStyle = '#02897e';
                ctx.lineWidth = 2;
                ctx.strokeRect(0, 0, W, H);

                // Powerup timers
                if (fireballTimer > 0) {
                    fireballTimer--;
                    if (fireballTimer <= 0) balls.forEach(b => b.fireball = false);
                }
                if (widePaddleTimer > 0) {
                    widePaddleTimer--;
                    currentPaddleW = basePaddleW * 2;
                } else {
                    currentPaddleW = basePaddleW;
                }

                if (gameOver) {
                    ctx.fillStyle = '#02897e';
                    ctx.font = '48px Pixel, monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(won ? 'YOU WIN!' : 'GAME OVER', W / 2, H / 2);
                    ctx.fillStyle = 'white';
                    ctx.font = '20px Pixel, monospace';
                    ctx.fillText('Score: ' + score, W / 2, H / 2 + 45);
                    ctx.fillStyle = '#555';
                    ctx.fillText('ESC to exit', W / 2, H / 2 + 80);
                    animId = requestAnimationFrame(loop);
                    return;
                }

                // Update powerup drops
                for (let i = powerupDrops.length - 1; i >= 0; i--) {
                    const p = powerupDrops[i];
                    p.y += p.dy;
                    // Caught by paddle?
                    if (p.y + p.h >= paddleY && p.y <= paddleY + paddleH &&
                        p.x + p.w >= paddleX && p.x <= paddleX + currentPaddleW) {
                        activatePowerup(p.type, p.label, p.color);
                        spawnParticles(p.x + p.w / 2, p.y + p.h / 2, p.color, 12);
                        powerupDrops.splice(i, 1);
                        continue;
                    }
                    // Off screen
                    if (p.y > H) {
                        powerupDrops.splice(i, 1);
                        continue;
                    }
                }

                if (launched) {
                    // Update all balls
                    for (let bi = balls.length - 1; bi >= 0; bi--) {
                        const b = balls[bi];
                        b.x += b.dx * speedMult;
                        b.y += b.dy * speedMult;

                        // Walls
                        if (b.x - b.r <= 0) { b.x = b.r; b.dx = Math.abs(b.dx); }
                        if (b.x + b.r >= W) { b.x = W - b.r; b.dx = -Math.abs(b.dx); }
                        if (b.y - b.r <= 0) { b.y = b.r; b.dy = Math.abs(b.dy); }

                        // Lost
                        if (b.y + b.r > H) {
                            balls.splice(bi, 1);
                            continue;
                        }

                        // Paddle
                        if (b.dy > 0 &&
                            b.y + b.r >= paddleY &&
                            b.y + b.r <= paddleY + paddleH + 8 &&
                            b.x >= paddleX - b.r &&
                            b.x <= paddleX + currentPaddleW + b.r) {
                            const hitPos = (b.x - paddleX) / currentPaddleW;
                            const angle = -Math.PI / 2 + (hitPos - 0.5) * 1.2;
                            const speed = Math.sqrt(b.dx * b.dx + b.dy * b.dy);
                            b.dx = Math.cos(angle) * speed;
                            b.dy = Math.sin(angle) * speed;
                            b.y = paddleY - b.r;
                        }

                        // Bricks
                        for (const brick of bricks) {
                            if (!brick.alive) continue;
                            if (b.x + b.r > brick.x &&
                                b.x - b.r < brick.x + brick.w &&
                                b.y + b.r > brick.y &&
                                b.y - b.r < brick.y + brick.h) {
                                brick.alive = false;
                                score++;
                                speedMult = 1 + score * 0.005;
                                spawnParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color);
                                maybeDropPowerup(brick.x + brick.w / 2, brick.y + brick.h / 2);

                                // Fireball: don't bounce, just plow through
                                if (!b.fireball) {
                                    const oL = (b.x + b.r) - brick.x;
                                    const oR = (brick.x + brick.w) - (b.x - b.r);
                                    const oT = (b.y + b.r) - brick.y;
                                    const oB = (brick.y + brick.h) - (b.y - b.r);
                                    if (Math.min(oL, oR) < Math.min(oT, oB)) {
                                        b.dx *= -1;
                                    } else {
                                        b.dy *= -1;
                                    }
                                    break;
                                }
                                // Fireball: continue through, no break
                            }
                        }
                    }

                    // All balls lost
                    if (balls.length === 0) {
                        lives--;
                        fireballTimer = 0;
                        if (lives <= 0) {
                            gameOver = true;
                            won = false;
                        } else {
                            resetBall();
                            launched = false;
                        }
                        animId = requestAnimationFrame(loop);
                        return;
                    }

                    // Win
                    if (bricks.every(b => !b.alive)) {
                        gameOver = true;
                        won = true;
                    }
                }

                // Update particles
                for (let i = particles.length - 1; i >= 0; i--) {
                    const p = particles[i];
                    p.x += p.dx;
                    p.y += p.dy;
                    p.life -= 0.025;
                    if (p.life <= 0) particles.splice(i, 1);
                }

                // Update notifications
                for (let i = notifications.length - 1; i >= 0; i--) {
                    notifications[i].life--;
                    if (notifications[i].life <= 0) notifications.splice(i, 1);
                }

                // Draw bricks
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                for (const brick of bricks) {
                    if (!brick.alive) continue;
                    ctx.fillStyle = brick.color;
                    ctx.globalAlpha = 0.2;
                    ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
                    ctx.globalAlpha = 1;
                    ctx.strokeStyle = brick.color;
                    ctx.lineWidth = 1;
                    ctx.strokeRect(brick.x, brick.y, brick.w, brick.h);
                    if (brick.text) {
                        ctx.fillStyle = brick.color;
                        ctx.font = Math.floor(brick.w * 0.65) + 'px Pixel, monospace';
                        ctx.fillText(brick.text, brick.x + brick.w / 2, brick.y + brick.h / 2 + 1);
                    }
                }

                // Draw powerup drops
                for (const p of powerupDrops) {
                    ctx.save();
                    ctx.shadowColor = p.color;
                    ctx.shadowBlur = 10;
                    ctx.drawImage(p.img, p.x, p.y, p.w, p.h);
                    ctx.restore();
                }

                // Draw particles
                for (const p of particles) {
                    ctx.globalAlpha = p.life;
                    ctx.fillStyle = p.color;
                    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
                }
                ctx.globalAlpha = 1;

                // Paddle
                const paddleColor = widePaddleTimer > 0 ? 'aqua' : '#02897e';
                ctx.fillStyle = paddleColor;
                ctx.shadowColor = paddleColor;
                ctx.shadowBlur = widePaddleTimer > 0 ? 15 : 10;
                ctx.fillRect(paddleX, paddleY, currentPaddleW, paddleH);
                ctx.shadowBlur = 0;

                // Balls
                for (const b of balls) {
                    if (b.fireball) {
                        ctx.shadowColor = '#ff6961';
                        ctx.shadowBlur = 20;
                        ctx.fillStyle = '#ff6961';
                    } else {
                        ctx.shadowColor = colours[score % colours.length];
                        ctx.shadowBlur = 12;
                        ctx.fillStyle = 'white';
                    }
                    ctx.beginPath();
                    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                    ctx.fill();

                    // Fireball trail
                    if (b.fireball) {
                        for (let t = 1; t <= 3; t++) {
                            ctx.globalAlpha = 0.3 / t;
                            ctx.beginPath();
                            ctx.arc(b.x - b.dx * t * 2, b.y - b.dy * t * 2, b.r * (1 - t * 0.15), 0, Math.PI * 2);
                            ctx.fill();
                        }
                        ctx.globalAlpha = 1;
                    }
                }
                ctx.shadowBlur = 0;

                // HUD
                ctx.font = '18px Pixel, monospace';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillStyle = '#02897e';
                ctx.fillText('Score: ' + score, 10, 10);

                ctx.textAlign = 'right';
                ctx.fillStyle = '#ff6961';
                let livesStr = '';
                for (let i = 0; i < lives; i++) livesStr += '\u2665 ';
                ctx.fillText(livesStr, W - 10, 10);

                ctx.textAlign = 'center';
                ctx.fillStyle = 'white';
                ctx.font = '14px Pixel, monospace';
                ctx.fillText('B R E A K O U T', W / 2, 15);

                // Active powerup indicators
                let indicatorY = 35;
                if (fireballTimer > 0) {
                    const pct = fireballTimer / FIREBALL_DURATION;
                    ctx.fillStyle = '#ff6961';
                    ctx.font = '12px Pixel, monospace';
                    ctx.textAlign = 'left';
                    ctx.fillText('FIREBALL', 10, indicatorY);
                    ctx.strokeStyle = '#ff6961';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(90, indicatorY + 2, 60, 8);
                    ctx.fillRect(90, indicatorY + 2, 60 * pct, 8);
                    indicatorY += 18;
                }
                if (widePaddleTimer > 0) {
                    const pct = widePaddleTimer / WIDEPADDLE_DURATION;
                    ctx.fillStyle = 'aqua';
                    ctx.font = '12px Pixel, monospace';
                    ctx.textAlign = 'left';
                    ctx.fillText('WIDE', 10, indicatorY);
                    ctx.strokeStyle = 'aqua';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(90, indicatorY + 2, 60, 8);
                    ctx.fillRect(90, indicatorY + 2, 60 * pct, 8);
                    indicatorY += 18;
                }
                if (balls.length > 1) {
                    ctx.fillStyle = '#fc107f';
                    ctx.font = '12px Pixel, monospace';
                    ctx.textAlign = 'left';
                    ctx.fillText('BALLS: ' + balls.length, 10, indicatorY);
                }

                // Notifications (powerup pickup text)
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                for (const n of notifications) {
                    ctx.globalAlpha = Math.min(1, n.life / 30);
                    ctx.fillStyle = n.color;
                    ctx.font = '24px Pixel, monospace';
                    const ny = H / 2 - 40 + (90 - n.life) * 0.5;
                    ctx.fillText(n.text, W / 2, ny);
                }
                ctx.globalAlpha = 1;

                if (!launched) {
                    ctx.fillStyle = '#02897e';
                    ctx.font = '18px Pixel, monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('Click to launch', W / 2, H / 2);
                }

                ctx.textAlign = 'right';
                ctx.fillStyle = '#333';
                ctx.font = '12px Pixel, monospace';
                ctx.fillText('ESC to exit', W - 10, H - 20);

                animId = requestAnimationFrame(loop);
            }

            animId = requestAnimationFrame(loop);
        }
    }
})();
