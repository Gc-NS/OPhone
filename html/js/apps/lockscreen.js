const LockScreen = {
    startY: 0,
    init() {
        const el = document.getElementById('screenLock');
        el.addEventListener('touchstart', e => { this.startY = e.touches[0].clientY; }, { passive: true });
        el.addEventListener('touchend', e => {
            if (this.startY - e.changedTouches[0].clientY > 80) this.unlock();
        }, { passive: true });
        el.addEventListener('click', () => this.unlock());
        this.refresh();
        setInterval(() => this.refresh(), 10000);
    },
    refresh() {
        const now = new Date();
        const lt = document.getElementById('lockTime');
        const ld = document.getElementById('lockDate');
        if (lt) lt.textContent = Utils.formatTime(now);
        if (ld) ld.textContent = Utils.formatDate(now);
        const wp = document.getElementById('lockWallpaper');
        if (wp && App.data && App.data.wallpaper_lock && App.data.wallpaper_lock.startsWith('http')) {
            wp.style.backgroundImage = 'url(' + App.data.wallpaper_lock + ')';
        }
    },
    unlock() {
        Api.call('Ophone.unlock');
    }
};
