const MessagesApp = {
    conversations: [],
    currentChat: null,
    onEnter(opts) {
        if (opts && opts.to) {
            this.openChat(opts.to, opts.name);
            return;
        }
        this.conversations = (App.data && App.data.conversations) || [];
        this.renderList();
    },

    renderList() {
        const c = document.getElementById('appContent');
        const h = document.getElementById('appHeader');
        h.querySelector('.app-back').onclick = () => App.goBack();
        document.getElementById('appTitle').textContent = 'Messages';
        document.getElementById('appHeaderRight').innerHTML = '<span onclick="MessagesApp.showNew()">+</span>';
        let html = '';
        if (this.conversations.length === 0) {
            html = '<div class="empty-state"><div class="empty-state-icon">💬</div><div class="empty-state-text">No messages yet.</div></div>';
        } else {
            this.conversations.forEach((conv, i) => {
                const last = conv.last_message || '';
                html += '<div class="list-item" onclick="MessagesApp.openChat(\'' + Utils.escapeHtml(conv.number) + '\',\'' + Utils.escapeHtml(conv.name || conv.number) + '\')">';
                html += '<div class="list-item-icon" style="background:var(--green);color:#fff;border-radius:50%">' + (conv.name || conv.number).charAt(0).toUpperCase() + '</div>';
                html += '<div class="list-item-content"><div class="list-item-title">' + Utils.escapeHtml(conv.name || conv.number) + '</div>';
                html += '<div class="list-item-sub">' + Utils.escapeHtml(last.substring(0, 50)) + '</div></div>';
                if (conv.unread > 0) html += '<div class="app-badge">' + conv.unread + '</div>';
                html += '</div>';
            });
        }
        c.innerHTML = html;
    },

    showNew() {
        Modal.show({
            title: 'New Message',
            inputs: [
                { id: 'number', label: 'Phone Number', placeholder: 'Enter number', type: 'tel' }
            ],
            buttons: [
                { text: 'Cancel', onClick: () => {} },
                { text: 'Start', onClick: (vals) => {
                    if (!vals.number) return;
                    this.openChat(vals.number, vals.number);
                }}
            ]
        });
    },

    openChat(number, name) {
        this.currentChat = { number, name };
        if (App.signal <= 0) { Notification.show('No signal!', 'error'); return; }
        if (App.data && App.data.sim_active === false) { Notification.show('No SIM active!', 'error'); return; }
        const c = document.getElementById('appContent');
        const h = document.getElementById('appHeader');
        h.querySelector('.app-back').onclick = () => { this.currentChat = null; this.renderList(); };
        document.getElementById('appTitle').textContent = name || number;
        document.getElementById('appHeaderRight').innerHTML = '';
        const messages = (App.data && App.data.messages && App.data.messages[number]) || [];
        let html = '<div style="padding:16px;display:flex;flex-direction:column;gap:6px;min-height:100%">';
        messages.forEach(msg => {
            const cls = msg.from === 'me' ? 'sent' : 'received';
            html += '<div class="chat-bubble ' + cls + '">' + Utils.escapeHtml(msg.content) + '</div>';
        });
        html += '</div>';
        html += '<div style="position:sticky;bottom:0;display:flex;gap:8px;padding:10px 12px;background:var(--bg);border-top:1px solid var(--sep)">';
        html += '<input class="input-field" id="msgInput" placeholder="Message..." style="flex:1;padding:10px 14px;font-size:15px">';
        html += '<button class="btn btn-primary" style="width:auto;padding:10px 16px;font-size:14px" onclick="MessagesApp.send()">Send</button>';
        html += '</div>';
        c.innerHTML = html;
        c.scrollTop = c.scrollHeight;
        setTimeout(() => { const el = document.getElementById('msgInput'); if (el) el.focus(); }, 100);
    },

    send() {
        const el = document.getElementById('msgInput');
        if (!el || !el.value.trim() || !this.currentChat) return;
        const content = el.value.trim();
        Api.sendMessage(this.currentChat.number, content);
        el.value = '';
        if (!App.data.messages) App.data.messages = {};
        if (!App.data.messages[this.currentChat.number]) App.data.messages[this.currentChat.number] = [];
        App.data.messages[this.currentChat.number].push({ from: 'me', content, time: new Date().toISOString() });
        this.openChat(this.currentChat.number, this.currentChat.name);
    }
};
