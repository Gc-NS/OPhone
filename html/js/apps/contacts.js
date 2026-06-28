const ContactsApp = {
    contacts: [],
    onEnter() {
        this.contacts = (App.data && App.data.contacts) || [];
        this.render();
    },

    render() {
        const c = document.getElementById('appContent');
        const h = document.getElementById('appHeader');
        h.querySelector('.app-back').onclick = () => App.goBack();
        document.getElementById('appTitle').textContent = 'Contacts';
        document.getElementById('appHeaderRight').innerHTML = '<span onclick="ContactsApp.showAdd()">+</span>';
        let html = '';
        if (this.contacts.length === 0) {
            html = '<div class="empty-state"><div class="empty-state-icon">👥</div><div class="empty-state-text">No contacts yet.<br>Tap + to add one.</div></div>';
        } else {
            const sorted = [...this.contacts].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            sorted.forEach((ct, i) => {
                const emergency = ['192','190','185','000'].includes(ct.number);
                html += '<div class="list-item" onclick="ContactsApp.viewContact(' + i + ')">';
                html += '<div class="list-item-icon" style="background:' + (emergency ? 'var(--red)' : 'var(--accent)') + ';color:#fff;border-radius:50%">' + (ct.name || '?').charAt(0).toUpperCase() + '</div>';
                html += '<div class="list-item-content"><div class="list-item-title">' + Utils.escapeHtml(ct.name) + '</div><div class="list-item-sub">' + Utils.escapeHtml(ct.number) + '</div></div>';
                html += '</div>';
            });
        }
        c.innerHTML = html;
    },

    showAdd() {
        Modal.show({
            title: 'New Contact',
            inputs: [
                { id: 'name', label: 'Name', placeholder: 'Enter name' },
                { id: 'number', label: 'Phone Number', placeholder: 'Enter number', type: 'tel' }
            ],
            buttons: [
                { text: 'Cancel', onClick: () => {} },
                { text: 'Save', onClick: (vals) => {
                    if (!vals.name || !vals.number) { Notification.show('Fill all fields', 'error'); return; }
                    Api.addContact(vals.name, vals.number);
                }}
            ]
        });
    },

    viewContact(idx) {
        const ct = this.contacts[idx];
        if (!ct) return;
        const emergency = ['192','190','185','000'].includes(ct.number);
        Modal.show({
            title: ct.name,
            text: ct.number,
            buttons: [
                { text: 'Call', onClick: () => {
                    if (App.signal <= 0) { Notification.show('No signal!', 'error'); return; }
                    Api.dialNumber(ct.number);
                }},
                { text: 'Message', onClick: () => {
                    App.pushScreen('messages', { to: ct.number, name: ct.name });
                }},
                { text: 'Delete', danger: true, onClick: () => {
                    Api.deleteContact(ct.id || idx);
                }}
            ]
        });
    }
};
