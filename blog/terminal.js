(function () {
    'use strict';

    const WORD_POOL = [
        'GALAXY', 'NEURAL', 'PHOTON', 'QUASAR', 'TENSOR',
        'PLANET', 'NEBULA', 'SIGNAL', 'FUSION', 'PULSAR',
        'BINARY', 'CIPHER', 'PROTON', 'MATRIX', 'COSMIC',
        'PLASMA', 'RADIAL', 'VECTOR', 'PRIMAL', 'HAZARD'
    ];

    const GARBAGE_CHARS = '!@#$%^&*(){}[]<>.,;:?\'/\\|=-+_~`"';
    const CHARS_PER_LINE = 10;
    const LINES_PER_COL = 16;
    const TOTAL_CHARS = CHARS_PER_LINE * LINES_PER_COL;
    const NUM_WORDS = 8;
    const WORD_LEN = 6;
    const MAX_ATTEMPTS = 6;

    let content;
    let state = 'BOOT';
    let attempts = MAX_ATTEMPTS;
    let password = '';
    let words = [];
    let blogPosts = [];
    let selectedIdx = -1;

    // Configure marked with highlight.js for syntax highlighting
    marked.setOptions({
        highlight: function(code, lang) {
            if (typeof hljs !== 'undefined') {
                if (lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, {language: lang}).value;
                }
                return hljs.highlightAuto(code).value;
            }
            return code;
        }
    });

    document.addEventListener('DOMContentLoaded', init);
    document.addEventListener('keydown', handleKeyboard);

    function init() {
        content = document.getElementById('terminal-content');

        if (localStorage.getItem('terminal-hacked')) {
            quickBoot();
        } else {
            bootSequence();
        }
    }

    // --- Typewriter ---
    function typeText(text, cb, speed) {
        let i = 0;
        const base = speed || 15;
        const node = document.createTextNode('');
        content.appendChild(node);
        function next() {
            if (i < text.length) {
                node.textContent += text[i];
                i++;
                setTimeout(next, base + Math.random() * 20);
            } else if (cb) {
                cb();
            }
        }
        next();
    }

    function clearScreen() {
        content.innerHTML = '';
        selectedIdx = -1;
    }

    // --- Boot Sequence ---
    function bootSequence() {
        state = 'BOOT';
        clearScreen();
        content.style.overflow = 'hidden';
        const lines = [
            'MIKECO INDUSTRIES (TM) TERMLINK PROTOCOL',
            'ENTER PASSWORD NOW',
            '',
            attempts + ' ATTEMPT(S) LEFT: ' + attemptIndicators(),
            ''
        ];
        typeText(lines.join('\n'), function () {
            startHack();
        }, 25);
    }

    function quickBoot() {
        state = 'BOOT';
        clearScreen();
        content.style.overflow = 'auto';
        typeText('MIKECO INDUSTRIES (TM) TERMLINK PROTOCOL\nACCESS GRANTED\n\nLoading...', function () {
            setTimeout(function () {
                showMenu();
            }, 800);
        }, 20);
    }

    function attemptIndicators() {
        let s = '';
        for (let i = 0; i < MAX_ATTEMPTS; i++) {
            s += (i < attempts ? '\u25A0' : '\u25A1') + ' ';
        }
        return s.trim();
    }

    // --- Hacking Minigame ---
    function startHack() {
        state = 'HACK';

        // Pick words
        const shuffled = WORD_POOL.slice().sort(() => Math.random() - 0.5);
        words = shuffled.slice(0, NUM_WORDS);
        password = words[Math.floor(Math.random() * words.length)];

        // Build two columns of characters
        const col1Data = buildColumn(words.slice(0, Math.ceil(NUM_WORDS / 2)));
        const col2Data = buildColumn(words.slice(Math.ceil(NUM_WORDS / 2)));

        renderHackScreen(col1Data, col2Data);
    }

    function buildColumn(wordList) {
        // Create array of garbage characters
        const chars = [];
        for (let i = 0; i < TOTAL_CHARS; i++) {
            chars.push(GARBAGE_CHARS[Math.floor(Math.random() * GARBAGE_CHARS.length)]);
        }

        // Place words at random non-overlapping positions
        const placed = [];
        for (let w = 0; w < wordList.length; w++) {
            let pos;
            let tries = 0;
            let valid = false;
            do {
                pos = Math.floor(Math.random() * (TOTAL_CHARS - WORD_LEN));
                var lineStart = Math.floor(pos / CHARS_PER_LINE) * CHARS_PER_LINE;
                var lineEnd = lineStart + CHARS_PER_LINE;
                valid = (pos + WORD_LEN <= lineEnd) && !overlaps(pos, WORD_LEN, placed);
                tries++;
            } while (tries < 200 && !valid);

            if (valid) {
                for (let c = 0; c < WORD_LEN; c++) {
                    chars[pos + c] = wordList[w][c];
                }
                placed.push({ start: pos, end: pos + WORD_LEN, word: wordList[w] });
            }
        }

        return { chars: chars, words: placed };
    }

    function overlaps(pos, len, placed) {
        for (let i = 0; i < placed.length; i++) {
            if (pos < placed[i].end + 1 && pos + len > placed[i].start - 1) {
                return true;
            }
        }
        return false;
    }

    function renderHackScreen(col1Data, col2Data) {
        clearScreen();
        content.style.overflow = 'hidden';

        // Header
        const header = document.createElement('div');
        header.textContent = 'MIKECO INDUSTRIES (TM) TERMLINK PROTOCOL\nENTER PASSWORD NOW\n\n' +
            attemptsLine() + '\n';
        content.appendChild(header);

        // Hack container (3-column: grid col1, grid col2, output)
        const container = document.createElement('div');
        container.className = 'hack-container';

        // Grid container
        const grid = document.createElement('div');
        grid.className = 'hack-grid';

        // Starting hex address
        let addr = 0xF4A0;

        grid.appendChild(buildColumnEl(col1Data, addr));
        addr += LINES_PER_COL * CHARS_PER_LINE;
        grid.appendChild(buildColumnEl(col2Data, addr));

        container.appendChild(grid);

        // Output area (third column)
        const output = document.createElement('div');
        output.className = 'hack-output';
        output.id = 'hack-output';

        // Cursor inside output column
        const cur = document.createElement('span');
        cur.className = 'cursor';
        cur.textContent = '\u2588';
        output.appendChild(cur);

        container.appendChild(output);

        content.appendChild(container);
    }

    function buildColumnEl(colData, startAddr) {
        const wrapper = document.createElement('div');
        wrapper.className = 'hack-column';

        const addrCol = document.createElement('div');
        addrCol.className = 'hack-addresses';

        const charCol = document.createElement('div');
        charCol.className = 'hack-chars';

        for (let row = 0; row < LINES_PER_COL; row++) {
            // Address
            const addr = '0x' + (startAddr + row * CHARS_PER_LINE).toString(16).toUpperCase();
            addrCol.textContent += addr + '\n';

            // Characters for this line
            const lineStart = row * CHARS_PER_LINE;
            const lineChars = colData.chars.slice(lineStart, lineStart + CHARS_PER_LINE);

            const lineEl = document.createElement('div');

            let i = 0;
            while (i < lineChars.length) {
                // Check if a word starts at this position in the full column
                const globalPos = lineStart + i;
                const wordEntry = findWordAt(colData.words, globalPos);

                if (wordEntry && globalPos === wordEntry.start) {
                    // Render entire word as clickable span
                    const span = document.createElement('span');
                    span.className = 'hack-word';
                    span.textContent = wordEntry.word;
                    span.addEventListener('click', handleWordClick(wordEntry.word));
                    lineEl.appendChild(span);
                    i += WORD_LEN;
                } else {
                    // Check for bracket pairs
                    const bracketMatch = findBracketPair(colData.chars, globalPos, colData.words);
                    if (bracketMatch) {
                        const span = document.createElement('span');
                        span.className = 'hack-bracket';
                        const bracketLen = Math.min(bracketMatch.end - globalPos + 1, lineChars.length - i);
                        span.textContent = lineChars.slice(i, i + bracketLen).join('');
                        span.addEventListener('click', handleBracketClick(colData, bracketMatch));
                        lineEl.appendChild(span);
                        i += bracketLen;
                    } else {
                        lineEl.appendChild(document.createTextNode(lineChars[i]));
                        i++;
                    }
                }
            }

            charCol.appendChild(lineEl);
        }

        wrapper.appendChild(addrCol);
        wrapper.appendChild(charCol);
        return wrapper;
    }

    function findWordAt(wordList, pos) {
        for (let i = 0; i < wordList.length; i++) {
            if (pos >= wordList[i].start && pos < wordList[i].end) {
                return wordList[i];
            }
        }
        return null;
    }

    var OPEN_BRACKETS = '([{<';
    var CLOSE_BRACKETS = ')]}>';

    function findBracketPair(chars, pos, wordList) {
        var openIdx = OPEN_BRACKETS.indexOf(chars[pos]);
        if (openIdx === -1) return null;
        var close = CLOSE_BRACKETS[openIdx];
        // Look forward for matching close bracket (max 10 chars)
        for (var j = pos + 1; j < Math.min(pos + 10, chars.length); j++) {
            // If this position falls within a word, abort — don't swallow words
            if (wordList) {
                for (var w = 0; w < wordList.length; w++) {
                    if (j >= wordList[w].start && j < wordList[w].end) {
                        return null;
                    }
                }
            }
            if (chars[j] === close) {
                return { start: pos, end: j };
            }
            // If we hit another open bracket of same type, stop
            if (OPEN_BRACKETS.indexOf(chars[j]) !== -1) break;
        }
        return null;
    }

    function handleWordClick(word) {
        return function () {
            if (state !== 'HACK') return;
            if (this.dataset.used) return;
            this.dataset.used = '1';
            this.textContent = '.'.repeat(WORD_LEN);
            this.classList.remove('hack-word');
            this.style.cursor = 'default';

            var output = document.getElementById('hack-output');
            var likeness = 0;
            for (var i = 0; i < WORD_LEN; i++) {
                if (word[i] === password[i]) likeness++;
            }

            var line1 = document.createElement('div');
            line1.textContent = '>' + word;
            output.appendChild(line1);

            if (likeness === WORD_LEN) {
                // Success
                var line2 = document.createElement('div');
                line2.textContent = '>EXACT MATCH!';
                output.appendChild(line2);
                state = 'TRANSITION';
                localStorage.setItem('terminal-hacked', '1');

                setTimeout(function () {
                    var line3 = document.createElement('div');
                    line3.textContent = '>Please wait while system is accessed...';
                    output.appendChild(line3);
                    setTimeout(function () {
                        showMenu();
                    }, 1500);
                }, 1000);
            } else {
                // Wrong
                attempts--;
                var line2 = document.createElement('div');
                line2.textContent = '>Entry denied';
                output.appendChild(line2);
                var line3 = document.createElement('div');
                line3.textContent = '>' + likeness + '/' + WORD_LEN + ' correct';
                output.appendChild(line3);

                if (attempts <= 0) {
                    lockout();
                } else {
                    updateAttempts();
                }
            }

            output.scrollTop = output.scrollHeight;
        };
    }

    function handleBracketClick(colData, bracketMatch) {
        return function () {
            if (state !== 'HACK') return;
            if (this.dataset.used) return;
            this.dataset.used = '1';
            this.classList.remove('hack-bracket');
            this.style.cursor = 'default';
            var output = document.getElementById('hack-output');
            var line = document.createElement('div');

            // 50% chance: remove a dud, 50% chance: reset attempts
            if (Math.random() < 0.5 && words.length > 1) {
                // Remove a dud (wrong word)
                var duds = words.filter(function (w) { return w !== password; });
                if (duds.length > 0) {
                    var dud = duds[Math.floor(Math.random() * duds.length)];
                    line.textContent = '>Dud removed.';
                    // Visually — find and grey out the word spans
                    var wordSpans = content.querySelectorAll('.hack-word');
                    for (var i = 0; i < wordSpans.length; i++) {
                        if (wordSpans[i].textContent === dud) {
                            wordSpans[i].textContent = '.'.repeat(WORD_LEN);
                            wordSpans[i].className = '';
                            wordSpans[i].style.cursor = 'default';
                        }
                    }
                    words = words.filter(function (w) { return w !== dud; });
                } else {
                    line.textContent = '>Error';
                }
            } else {
                // Reset attempts
                attempts = MAX_ATTEMPTS;
                line.textContent = '>Tries reset.';
                updateAttempts();
            }

            output.appendChild(line);

            output.scrollTop = output.scrollHeight;
        };
    }

    function attemptsLine() {
        return attempts + ' ATTEMPT(S) LEFT: ' + attemptIndicators();
    }

    function updateHeader() {
        var headerDiv = content.querySelector('div');
        if (headerDiv) {
            var text = headerDiv.textContent;
            var lines = text.split('\n');
            for (var i = 0; i < lines.length; i++) {
                if (lines[i].indexOf('ATTEMPT') !== -1) {
                    lines[i] = attemptsLine();
                }
            }
            headerDiv.textContent = lines.join('\n');
        }
    }

    function updateAttempts() {
        updateHeader();
    }

    function lockout() {
        state = 'LOCKED';
        var output = document.getElementById('hack-output');
        var line = document.createElement('div');
        line.textContent = '>TERMINAL LOCKED';
        output.appendChild(line);

        document.getElementById('terminal').classList.add('terminal-locked');

        setTimeout(function () {
            document.getElementById('terminal').classList.remove('terminal-locked');
            attempts = MAX_ATTEMPTS;
            bootSequence();
        }, 3000);
    }

    // --- Menu ---
    function showMenu() {
        state = 'MENU';
        clearScreen();
        content.style.overflow = 'auto';

        var header = 'WELCOME TO MIKECO INDUSTRIES (TM) TERMLINK\n\n';

        typeText(header, function () {
            fetchPosts(function () {
                renderMenu();
            });
        }, 20);
    }

    function fetchPosts(cb) {
        if (blogPosts.length > 0) {
            cb();
            return;
        }

        fetch('blog.json')
            .then(function (r) { return r.json(); })
            .then(function (data) {
                blogPosts = data.sort(function (a, b) {
                    return new Date(b.date) - new Date(a.date);
                });
                cb();
            })
            .catch(function () {
                blogPosts = [];
                cb();
            });
    }

    function renderMenu() {
        var menuBlock = document.createElement('div');
        menuBlock.style.whiteSpace = 'pre';

        // Section header
        var sectionHeader = document.createElement('div');
        sectionHeader.textContent = '> BLOG ENTRIES\n';
        menuBlock.appendChild(sectionHeader);

        // Entries
        for (var i = 0; i < blogPosts.length; i++) {
            var post = blogPosts[i];
            var entry = document.createElement('a');
            entry.className = 'menu-entry';
            entry.href = '#';

            var num = '  [' + (i + 1) + '] ';
            var title = post.title;
            var dateParts = post.date.split('-');
            var dateStr = dateParts[1] + '.' + dateParts[2] + '.' + dateParts[0];
            // Pad title to align dates
            var padding = Math.max(2, 42 - num.length - title.length);
            entry.textContent = num + title + ' '.repeat(padding) + dateStr;

            entry.addEventListener('click', showPost(post.slug));
            menuBlock.appendChild(entry);
            menuBlock.appendChild(document.createTextNode('\n'));
        }

        if (blogPosts.length === 0) {
            var empty = document.createElement('div');
            empty.textContent = '  [NO ENTRIES FOUND]';
            menuBlock.appendChild(empty);
        }

        menuBlock.appendChild(document.createTextNode('\n'));

        // Navigation options
        var hackAgain = document.createElement('a');
        hackAgain.className = 'menu-entry';
        hackAgain.href = '#';
        hackAgain.textContent = '> HACK AGAIN';
        hackAgain.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('terminal-hacked');
            attempts = MAX_ATTEMPTS;
            bootSequence();
        });
        menuBlock.appendChild(hackAgain);
        menuBlock.appendChild(document.createTextNode('\n'));

        var secretsData = JSON.parse(localStorage.getItem('secrets-found') || '{}');
        var secretCount = Object.keys(secretsData).length;
        var secretLine = document.createElement('div');
        secretLine.style.color = secretCount >= 6 ? '#77ff77' : '#02897e';
        secretLine.textContent = '\n> EASTER EGGS FOUND: ' + secretCount + '/6' +
            (secretCount >= 6 ? '  [ALL SECRETS DISCOVERED]' : '') + '\n';
        menuBlock.appendChild(secretLine);

        var backLink = document.createElement('a');
        backLink.className = 'menu-entry';
        backLink.href = '/';
        backLink.textContent = '> BACK TO MAIN SITE';
        menuBlock.appendChild(backLink);
        menuBlock.appendChild(document.createTextNode('\n\n'));

        // Cursor
        var cur = document.createElement('span');
        cur.className = 'cursor';
        cur.textContent = '\u2588';
        menuBlock.appendChild(cur);

        content.appendChild(menuBlock);
    }

    // --- Post View ---
    function showPost(slug) {
        return function (e) {
            e.preventDefault();
            state = 'POST';
            clearScreen();
            content.style.overflow = 'auto';
            content.textContent = 'Loading...';

            fetch('posts/' + slug + '.md')
                .then(function (r) { return r.text(); })
                .then(function (md) {
                    var post = blogPosts.find(function (p) { return p.slug === slug; });
                    renderPost(post, md);
                })
                .catch(function () {
                    clearScreen();
                    content.textContent = 'ERROR: FILE NOT FOUND\n\n';
                    var back = document.createElement('a');
                    back.className = 'menu-entry';
                    back.href = '#';
                    back.textContent = '> BACK';
                    back.addEventListener('click', function (e) {
                        e.preventDefault();
                        showMenu();
                    });
                    content.appendChild(back);
                });
        };
    }

    function renderPost(post, md) {
        clearScreen();
        content.style.overflow = 'auto';

        var postEl = document.createElement('div');

        // Header
        var header = document.createElement('div');
        var dateParts = post.date.split('-');
        var dateStr = dateParts[1] + '.' + dateParts[2] + '.' + dateParts[0];
        header.textContent = '> ' + post.title.toUpperCase() + '\n  DATE: ' + dateStr + '\n';
        header.style.marginBottom = '20px';
        postEl.appendChild(header);

        // Separator
        var sep = document.createElement('div');
        sep.textContent = '='.repeat(50);
        sep.style.marginBottom = '20px';
        postEl.appendChild(sep);

        // Markdown content
        var postContent = document.createElement('div');
        postContent.className = 'post-content';
        postContent.innerHTML = marked.parse(md);
        postEl.appendChild(postContent);

        // Back link
        var sep2 = document.createElement('div');
        sep2.textContent = '\n' + '='.repeat(50) + '\n';
        postEl.appendChild(sep2);

        var back = document.createElement('a');
        back.className = 'menu-entry';
        back.href = '#';
        back.textContent = '> BACK';
        back.addEventListener('click', function (e) {
            e.preventDefault();
            showMenu();
        });
        postEl.appendChild(back);

        var cur = document.createElement('span');
        cur.className = 'cursor';
        cur.textContent = '\u2588';
        postEl.appendChild(document.createTextNode(' '));
        postEl.appendChild(cur);

        content.appendChild(postEl);

        content.scrollTop = 0;
    }

    // --- Keyboard Navigation ---
    function getSelectables() {
        if (state === 'HACK') {
            return content.querySelectorAll('.hack-word, .hack-bracket');
        }
        if (state === 'MENU' || state === 'POST') {
            return content.querySelectorAll('.menu-entry');
        }
        return [];
    }

    function updateSelection(newIdx) {
        var items = getSelectables();
        if (items.length === 0) return;

        // Remove old highlight
        if (selectedIdx >= 0 && selectedIdx < items.length) {
            items[selectedIdx].classList.remove('kb-selected');
        }

        // Wrap around
        if (newIdx < 0) newIdx = items.length - 1;
        if (newIdx >= items.length) newIdx = 0;

        selectedIdx = newIdx;
        items[selectedIdx].classList.add('kb-selected');
        items[selectedIdx].scrollIntoView({ block: 'nearest' });
    }

    function clearSelection() {
        var old = content.querySelector('.kb-selected');
        if (old) old.classList.remove('kb-selected');
        selectedIdx = -1;
    }

    function handleKeyboard(e) {
        if (state === 'BOOT' || state === 'LOCKED' || state === 'TRANSITION') return;

        var items = getSelectables();
        if (items.length === 0) return;

        if (e.key === 'ArrowUp' || e.key === 'k') {
            e.preventDefault();
            updateSelection(selectedIdx <= 0 ? items.length - 1 : selectedIdx - 1);
        } else if (e.key === 'ArrowDown' || e.key === 'j') {
            e.preventDefault();
            updateSelection(selectedIdx < 0 ? 0 : selectedIdx + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'h') {
            e.preventDefault();
            var jump = Math.floor(items.length / 2);
            updateSelection(selectedIdx < 0 ? 0 : selectedIdx - jump);
        } else if (e.key === 'ArrowRight' || e.key === 'l') {
            e.preventDefault();
            var jump = Math.floor(items.length / 2);
            updateSelection(selectedIdx < 0 ? jump : selectedIdx + jump);
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (selectedIdx >= 0 && selectedIdx < items.length) {
                items[selectedIdx].click();
            }
        }
    }

})();
