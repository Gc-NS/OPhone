const PhoneApp = {
    number: '',
    callState: 'idle',
    callTimer: null,
    callStart: 0,

    onEnter() {
        this.number = '';
        this.render();
    },

    render() {
        const c = document.getElementById('appContent');
        const h = document.getElementById('appHeader');
        const t = document.getElementById('appTitle');
        h.querySelector('.app-back').onclick = () => App.goBack();
        t.textContent = 'Phone';
        document.getElementById('appHeaderRight').innerHTML = '';
        const digits = [
            {n:'1',sub:''},{n:'2',sub:'ABC'},{n:'3',sub:'DEF'},
            {n:'4',sub:'GHI'},{n:'5',sub:'JKL'},{n:'6',sub:'MNO'},
            {n:'7',sub:'PQRS'},{n:'8',sub:'TUV'},{n:'9',sub:'WXYZ'},
            {n:'*',sub:''},{n:'0',sub:'+'},{n:'#',sub:''}
        ];
        let html = '<div class="dial-display" id="dialDisplay">' + (this.number || '&nbsp;') + '</div>';
        html += '<div class="dial-grid">';
        digits.forEach(d => {
            html += '<button class="dial-btn" onclick="PhoneApp.addDigit(\'' + d.n + '\')">' + d.n + (d.sub ? '<div class="dial-btn-sub">' + d.sub + '</div>' : '') + '</button>';
        });
        html += '</div>';
        html += '<div class="dial-actions">';
        html += '<button class="dial-delete" onclick="PhoneApp.deleteDigit()"><svg width="24" height="24" viewBox="0 0 24 24" fill="#8e8e93"><path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"/></svg></button>';
        html += '<button class="dial-call" onclick="PhoneApp.dial()"><svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg></button>';
        html += '<button class="dial-delete" style="visibility:hidden"><svg width="24" height="24"></svg></button>';
        html += '</div>';
        c.innerHTML = html;
    },

    addDigit(d) {
        if (this.number.length < 15) {
            this.number += d;
            const el = document.getElementById('dialDisplay');
            if (el) el.textContent = this.number;
        }
    },

    deleteDigit() {
        this.number = this.number.slice(0, -1);
        const el = document.getElementById('dialDisplay');
        if (el) el.textContent = this.number || '\u00A0';
    },

    dial() {
        if (!this.number) return;
        if (App.signal <= 0) { Notification.show('No signal!', 'error'); return; }
        if (App.data && App.data.sim_active && App.data.calls_remaining !== undefined && App.data.calls_remaining === 0) {
            Notification.show('No calls remaining! Recharge your plan.', 'error'); return;
        }
        Api.dialNumber(this.number);
    },

    showOutgoingCall(name, number) {
        this.callState = 'outgoing';
        App.showScreen('call');
        document.getElementById('callName').textContent = name || number;
        document.getElementById('callAvatar').textContent = (name || number).charAt(0).toUpperCase();
        document.getElementById('callStatus').textContent = 'Calling...';
        document.getElementById('callTimer').textContent = '';
        document.getElementById('callDecline').style.display = 'none';
        document.getElementById('callActions').style.display = 'flex';
        document.getElementById('callEnd').onclick = () => { Api.endCall(); };
        document.getElementById('callMute').style.display = 'none';
        document.getElementById('callSpeaker').style.display = 'none';
    },

    showIncomingCall(name, number) {
        this.callState = 'incoming';
        App.showScreen('call');
        document.getElementById('callName').textContent = name || number;
        document.getElementById('callAvatar').textContent = (name || number).charAt(0).toUpperCase();
        document.getElementById('callStatus').textContent = 'Incoming call...';
        document.getElementById('callTimer').textContent = '';
        document.getElementById('callDecline').style.display = 'flex';
        document.getElementById('callActions').style.display = 'none';
        document.getElementById('callAcceptBtn').onclick = () => { Api.acceptCall(); };
        document.getElementById('callDeclineBtn').onclick = () => { Api.endCall(); };
    },

    callAccepted() {
        this.callState = 'active';
        this.callStart = Date.now();
        document.getElementById('callStatus').textContent = '';
        document.getElementById('callDecline').style.display = 'none';
        document.getElementById('callActions').style.display = 'flex';
        document.getElementById('callMute').style.display = 'flex';
        document.getElementById('callSpeaker').style.display = 'flex';
        document.getElementById('callEnd').onclick = () => { Api.endCall(); };
        this.callTimer = setInterval(() => {
            const el = document.getElementById('callTimer');
            if (el) el.textContent = Utils.formatCallDuration(Date.now() - this.callStart);
        }, 1000);
    },

    callEnded() {
        this.callState = 'idle';
        if (this.callTimer) { clearInterval(this.callTimer); this.callTimer = null; }
        App.showScreen('home');
    }
};
