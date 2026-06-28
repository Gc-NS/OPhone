const AppStoreApp = {
    onEnter() { this.render(); },

    render() {
        const c = document.getElementById('appContent');
        const h = document.getElementById('appHeader');
        h.querySelector('.app-back').onclick = () => App.goBack();
        document.getElementById('appTitle').textContent = 'App Store';
        document.getElementById('appHeaderRight').innerHTML = '';
        const apps = [
            { id: 'instagram', name: 'Instagram', icon: '📸', color: 'linear-gradient(135deg,#f58529,#dd2a7b,#8134af)', desc: 'Photo sharing & social network' },
            { id: 'shorts', name: 'Shorts', icon: '🎬', color: 'linear-gradient(135deg,#ff0050,#ff0000)', desc: 'Short-form video content' },
            { id: 'onion', name: 'Onion Browser', icon: '🧅', color: 'linear-gradient(135deg,#1a1a1a,#0a3d0a)', desc: 'Anonymous dark web browser' },
            { id: 'mail', name: 'Mail', icon: '✉️', color: 'linear-gradient(135deg,#0a84ff,#007aff)', desc: 'Email messaging' },
        ];
        let html = '<div class="section-header"><h2>Essential Apps</h2></div>';
        apps.forEach(app => {
            const installed = App.isInstalled(app.id);
            html += '<div class="store-card">';
            html += '<div class="store-card-icon" style="background:' + app.color + '">' + app.icon + '</div>';
            html += '<div class="store-card-info"><div class="store-card-name">' + app.name + '</div><div class="store-card-desc">' + app.desc + '</div></div>';
            if (installed) html += '<button class="store-card-btn installed">Open</button>';
            else html += '<button class="store-card-btn" onclick="AppStoreApp.install(\'' + app.id + '\')">Get</button>';
            html += '</div>';
        });
        c.innerHTML = html;
    },

    install(appId) {
        Api.installApp(appId);
        if (!App.data.installed_apps) App.data.installed_apps = [];
        if (!App.data.installed_apps.includes(appId)) App.data.installed_apps.push(appId);
        Notification.show('App installed!', 'success');
        this.render();
    }
};
