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
    }

    // Init counter text on load
    document.addEventListener('DOMContentLoaded', updateUI);
    // Also try immediately in case DOM is already ready
    if (document.readyState !== 'loading') updateUI();

    return { discover: discover, getCount: getCount, updateUI: updateUI };
})();
