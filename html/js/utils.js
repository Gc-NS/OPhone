const Utils = {
    escapeHtml(t) {
        if (!t) return '';
        const d = document.createElement('div');
        d.textContent = t;
        return d.innerHTML;
    },
    timeAgo(date) {
        const s = Math.floor((Date.now() - new Date(date)) / 1000);
        if (s < 60) return 'just now';
        if (s < 3600) return Math.floor(s / 60) + 'm';
        if (s < 86400) return Math.floor(s / 3600) + 'h';
        if (s < 604800) return Math.floor(s / 86400) + 'd';
        return new Date(date).toLocaleDateString();
    },
    formatTime(d) {
        return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    },
    formatDate(d) {
        const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        return days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate();
    },
    formatCallDuration(ms) {
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        const h = Math.floor(m / 60);
        if (h > 0) return String(h).padStart(2,'0') + ':' + String(m % 60).padStart(2,'0') + ':' + String(s % 60).padStart(2,'0');
        return String(m).padStart(2,'0') + ':' + String(s % 60).padStart(2,'0');
    },
    throttle(fn, ms) {
        let last = 0;
        return function(...args) {
            const now = Date.now();
            if (now - last >= ms) { last = now; fn.apply(this, args); }
        };
    },
    debounce(fn, ms) {
        let t;
        return function(...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
    },
    randomColor() {
        const colors = ['#ff6b6b','#feca57','#48dbfb','#ff9ff3','#54a0ff','#5f27cd','#01a3a4','#f368e0','#ff6348','#7bed9f','#70a1ff','#ffa502'];
        return colors[Math.floor(Math.random() * colors.length)];
    },
    gradientPairs: [
        ['#ff6b6b','#ee5a24'],['#feca57','#ff9f43'],['#48dbfb','#0abde3'],
        ['#ff9ff3','#f368e0'],['#54a0ff','#2e86de'],['#5f27cd','#341f97'],
        ['#01a3a4','#00b894'],['#ff6348','#eb4d4b'],['#7bed9f','#2ed573'],
        ['#6c5ce7','#a29bfe'],['#fd79a8','#e84393'],['#00cec9','#81ecec']
    ],
    randomGradient() {
        const p = this.gradientPairs[Math.floor(Math.random() * this.gradientPairs.length)];
        return 'linear-gradient(135deg,' + p[0] + ',' + p[1] + ')';
    }
};
