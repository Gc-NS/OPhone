const SettingsApp = {
    onEnter() {
        this.render();
    },

    render() {
        const c = document.getElementById('appContent');
        const h = document.getElementById('appHeader');
        h.querySelector('.app-back').onclick = () => App.goBack();
        document.getElementById('appTitle').textContent = 'Settings';
        document.getElementById('appHeaderRight').innerHTML = '';
        const d = App.data || {};
        let html = '';

        html += '<div class="section-title">Wallpaper</div>';
        html += '<div class="settings-group">';
        html += '<div class="settings-item" onclick="SettingsApp.changeWallpaper(\'lock\')"><div class="settings-item-icon" style="background:var(--accent)">🔒</div><div class="settings-item-label">Lock Screen Wallpaper</div><div class="settings-item-value">Change</div></div>';
        html += '<div class="settings-item" onclick="SettingsApp.changeWallpaper(\'home\')"><div class="settings-item-icon" style="background:var(--purple)">🏠</div><div class="settings-item-label">Home Screen Wallpaper</div><div class="settings-item-value">Change</div></div>';
        html += '</div>';

        html += '<div class="section-title">Sounds</div>';
        html += '<div class="settings-group">';
        html += '<div class="settings-item" onclick="SettingsApp.changeRingtone()"><div class="settings-item-icon" style="background:var(--green)">🎵</div><div class="settings-item-label">Ringtone</div><div class="settings-item-value">' + Utils.escapeHtml(d.ringtone || 'Default') + '</div></div>';
        html += '<div class="settings-item" onclick="SettingsApp.changeNotifSound()"><div class="settings-item-icon" style="background:var(--orange)">🔔</div><div class="settings-item-label">Notification Sound</div><div class="settings-item-value">' + Utils.escapeHtml(d.notification_sound || 'Default') + '</div></div>';
        html += '</div>';

        html += '<div class="section-title">Notifications</div>';
        html += '<div class="settings-group">';
        html += '<div class="settings-item"><div class="settings-item-icon" style="background:var(--red)">📞</div><div class="settings-item-label">Receive Calls</div><div class="toggle' + (d.receive_calls !== false ? ' active' : '') + '" onclick="SettingsApp.toggleCalls(this)"></div></div>';
        html += '<div class="settings-item"><div class="settings-item-icon" style="background:var(--green)">💬</div><div class="settings-item-label">Message Notifications</div><div class="toggle' + (d.notify_messages !== false ? ' active' : '') + '" onclick="SettingsApp.toggleMessages(this)"></div></div>';
        html += '</div>';

        html += '<div class="section-title">About</div>';
        html += '<div class="settings-group">';
        html += '<div class="settings-item"><div class="settings-item-icon" style="background:var(--bg4)">📱</div><div class="settings-item-label">About Phone</div><div class="settings-item-value">Orange OS 26</div></div>';
        html += '<div class="settings-item"><div class="settings-item-icon" style="background:var(--teal)">📞</div><div class="settings-item-label">Phone Number</div><div class="settings-item-value">' + Utils.escapeHtml(d.phone_number || 'No SIM') + '</div></div>';
        html += '<div class="settings-item"><div class="settings-item-icon" style="background:var(--yellow)">🔋</div><div class="settings-item-label">Battery</div><div class="settings-item-value">' + Math.round(App.battery) + '%</div></div>';
        html += '<div class="settings-item"><div class="settings-item-icon" style="background:var(--pink)">📶</div><div class="settings-item-label">Signal</div><div class="settings-item-value">' + Math.round(App.signal) + '%</div></div>';
        html += '</div>';

        html += '<div class="section-title">Account</div>';
        html += '<div class="settings-group">';
        html += '<div class="settings-item" onclick="SettingsApp.changeDisplayName()"><div class="settings-item-icon" style="background:var(--accent)">👤</div><div class="settings-item-label">Display Name</div><div class="settings-item-value">' + Utils.escapeHtml(d.display_name || 'Player') + '</div></div>';
        html += '</div>';

        html += '<div class="section-title">Danger Zone</div>';
        html += '<div class="settings-group">';
        html += '<div class="settings-item" onclick="SettingsApp.factoryReset()"><div class="settings-item-icon" style="background:var(--red)">⚠️</div><div class="settings-item-label" style="color:var(--red)">Factory Reset</div></div>';
        html += '</div>';

        html += '<div style="text-align:center;padding:20px;color:var(--text3);font-size:12px">Orange OS 26 v1.0</div>';
        c.innerHTML = html;
    },

    changeWallpaper(type) {
        Modal.show({
            title: 'Set Wallpaper',
            text: 'Enter an image URL',
            inputs: [{ id: 'url', label: 'Image URL', placeholder: 'https://example.com/image.jpg' }],
            buttons: [
                { text: 'Cancel', onClick: () => {} },
                { text: 'Set', onClick: (vals) => {
                    if (!vals.url) return;
                    Api.setWallpaperUrl(type, vals.url);
                    if (type === 'lock') App.data.wallpaper_lock = vals.url;
                    else App.data.wallpaper_home = vals.url;
                    Notification.show('Wallpaper updated!', 'success');
                }}
            ]
        });
    },

    changeRingtone() {
        Modal.show({
            title: 'Ringtone',
            buttons: [
                { text: 'Default 1', onClick: () => { Api.setRingtone('chamada_01'); App.data.ringtone = 'chamada_01'; }},
                { text: 'Default 2', onClick: () => { Api.setRingtone('chamada_02'); App.data.ringtone = 'chamada_02'; }},
                { text: 'Default 3', onClick: () => { Api.setRingtone('chamada_03'); App.data.ringtone = 'chamada_03'; }}
            ]
        });
    },

    changeNotifSound() {
        Modal.show({
            title: 'Notification Sound',
            buttons: [
                { text: 'Default 1', onClick: () => { Api.setNotificationSound('notify_01'); App.data.notification_sound = 'notify_01'; }},
                { text: 'Default 2', onClick: () => { Api.setNotificationSound('notify_02'); App.data.notification_sound = 'notify_02'; }},
                { text: 'Default 3', onClick: () => { Api.setNotificationSound('notify_03'); App.data.notification_sound = 'notify_03'; }}
            ]
        });
    },

    toggleCalls(el) {
        el.classList.toggle('active');
        Api.toggleReceiveCalls(el.classList.contains('active'));
    },

    toggleMessages(el) {
        el.classList.toggle('active');
        Api.toggleNotifyMessages(el.classList.contains('active'));
    },

    changeDisplayName() {
        Modal.show({
            title: 'Display Name',
            inputs: [{ id: 'name', label: 'Name', value: App.data.display_name || '' }],
            buttons: [
                { text: 'Cancel', onClick: () => {} },
                { text: 'Save', onClick: (vals) => {
                    if (!vals.name) return;
                    Api.setDisplayName(vals.name);
                    App.data.display_name = vals.name;
                    Notification.show('Name updated!', 'success');
                }}
            ]
        });
    },

    factoryReset() {
        Modal.show({
            title: 'Factory Reset',
            desc: 'This will erase all data. Are you sure?',
            buttons: [
                { text: 'Cancel', onClick: () => {} },
                { text: 'Reset', danger: true, onClick: () => {
                    Api.factoryReset();
                    Notification.show('Phone reset!', 'info');
                }}
            ]
        });
    }
};
