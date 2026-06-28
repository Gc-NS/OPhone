const StatusBar = {
    init() {
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    },
    updateTime() {
        const el = document.getElementById('statusTime');
        if (el) el.textContent = Utils.formatTime(new Date());
    },
    updateBattery(level) {
        const fill = document.getElementById('batteryFill');
        const text = document.getElementById('batteryText');
        if (fill) {
            fill.style.width = Math.max(0, Math.min(100, level)) + '%';
            fill.className = 'battery-fill' + (level <= 5 ? ' critical' : level <= 20 ? ' low' : '');
        }
        if (text) text.textContent = Math.round(level) + '%';
    },
    updateSignal(level) {
        const bars = document.getElementById('signalBars');
        if (!bars) return;
        const barsEls = bars.querySelectorAll('.bar');
        const active = level <= 0 ? 0 : level <= 25 ? 1 : level <= 50 ? 2 : level <= 75 ? 3 : 4;
        barsEls.forEach((b, i) => {
            b.style.opacity = i < active ? '1' : '0.2';
        });
        bars.className = 'signal-bars' + (active === 0 ? ' no-signal' : '');
    }
};
