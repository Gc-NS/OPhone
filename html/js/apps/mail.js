const MailApp = {
    mails: [],
    onEnter(opts) {
        if (opts && opts.compose) { this.showCompose(); return; }
        this.mails = (App.data && App.data.mails) || [];
        this.renderList();
    },

    renderList() {
        const c = document.getElementById('appContent');
        const h = document.getElementById('appHeader');
        h.querySelector('.app-back').onclick = () => App.goBack();
        document.getElementById('appTitle').textContent = 'Mail';
        document.getElementById('appHeaderRight').innerHTML = '<span onclick="MailApp.showCompose()">✎</span>';
        let html = '';
        if (this.mails.length === 0) {
            html = '<div class="empty-state"><div class="empty-state-icon">✉️</div><div class="empty-state-text">No mail yet.</div></div>';
        } else {
            this.mails.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            this.mails.forEach((mail, i) => {
                const unread = !mail.read;
                html += '<div class="mail-item' + (unread ? ' mail-item-unread' : '') + '" onclick="MailApp.viewMail(' + i + ')">';
                if (unread) html += '<div class="mail-item-dot"></div>';
                html += '<div class="mail-item-content">';
                html += '<div class="mail-item-from">' + Utils.escapeHtml(mail.sender_name || mail.sender_number) + '</div>';
                html += '<div class="mail-item-subject">' + Utils.escapeHtml(mail.subject || '(No subject)') + '</div>';
                html += '<div class="mail-item-time">' + Utils.timeAgo(mail.created_at) + '</div>';
                html += '</div></div>';
            });
        }
        c.innerHTML = html;
    },

    showCompose() {
        const c = document.getElementById('appContent');
        const h = document.getElementById('appHeader');
        h.querySelector('.app-back').onclick = () => this.renderList();
        document.getElementById('appTitle').textContent = 'New Mail';
        document.getElementById('appHeaderRight').innerHTML = '';
        let html = '<div class="input-group"><div class="input-label">To (Phone Number)</div><input class="input-field" id="mailTo" placeholder="Enter number" type="tel"></div>';
        html += '<div class="input-group"><div class="input-label">Subject</div><input class="input-field" id="mailSubject" placeholder="Subject"></div>';
        html += '<div class="input-group"><div class="input-label">Body</div><textarea class="input-field" id="mailBody" placeholder="Write your message..." style="min-height:200px"></textarea></div>';
        html += '<div class="p-16"><button class="btn btn-primary" onclick="MailApp.sendMail()">Send</button></div>';
        c.innerHTML = html;
    },

    sendMail() {
        const to = document.getElementById('mailTo').value.trim();
        const subject = document.getElementById('mailSubject').value.trim();
        const body = document.getElementById('mailBody').value.trim();
        if (!to || !body) { Notification.show('Recipient and body required', 'error'); return; }
        if (App.signal <= 0) { Notification.show('No signal!', 'error'); return; }
        Api.sendMail(to, subject, body);
        Notification.show('Mail sent!', 'success');
        this.renderList();
    },

    viewMail(idx) {
        const mail = this.mails[idx];
        if (!mail) return;
        mail.read = true;
        const c = document.getElementById('appContent');
        const h = document.getElementById('appHeader');
        h.querySelector('.app-back').onclick = () => this.renderList();
        document.getElementById('appTitle').textContent = mail.subject || '(No subject)';
        document.getElementById('appHeaderRight').innerHTML = '<span onclick="MailApp.deleteMail(' + idx + ')" style="color:var(--red)">Delete</span>';
        let html = '<div style="padding:16px">';
        html += '<div style="display:flex;justify-content:space-between;margin-bottom:12px"><div><div class="font-bold">' + Utils.escapeHtml(mail.sender_name || mail.sender_number) + '</div><div class="text-sm text-muted">' + Utils.escapeHtml(mail.sender_number) + '</div></div><div class="text-sm text-muted">' + Utils.timeAgo(mail.created_at) + '</div></div>';
        html += '<div style="font-size:15px;line-height:1.6;white-space:pre-wrap">' + Utils.escapeHtml(mail.content) + '</div>';
        html += '</div>';
        c.innerHTML = html;
    },

    deleteMail(idx) {
        const mail = this.mails[idx];
        if (mail) Api.deleteMail(mail.id || idx);
        this.mails.splice(idx, 1);
        this.renderList();
    }
};
