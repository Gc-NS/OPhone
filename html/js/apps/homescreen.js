const HomeScreen = {
    apps: [
        { id: 'phone', name: 'Phone', icon: '📱', color: 'linear-gradient(135deg,#30d158,#34c759)', dock: true },
        { id: 'messages', name: 'Messages', icon: '💬', color: 'linear-gradient(135deg,#30d158,#28a745)', dock: true },
        { id: 'mail', name: 'Mail', icon: '✉️', color: 'linear-gradient(135deg,#0a84ff,#007aff)', dock: true, app: true },
        { id: 'settings', name: 'Settings', icon: '⚙️', color: 'linear-gradient(135deg,#8e8e93,#636366)', dock: true },
        { id: 'contacts', name: 'Contacts', icon: '👥', color: 'linear-gradient(135deg,#5856d6,#4a4adb)' },
        { id: 'camera', name: 'Camera', icon: '📷', color: 'linear-gradient(135deg,#1c1c1e,#3a3a3c)' },
        { id: 'gallery', name: 'Gallery', icon: '🖼️', color: 'linear-gradient(135deg,#ff9f0a,#ff6b00)' },
        { id: 'sim', name: 'SIM Card', icon: '💳', color: 'linear-gradient(135deg,#ff9500,#ff6b00)' },
        { id: 'instagram', name: 'Instagram', icon: '📸', color: 'linear-gradient(135deg,#f58529,#dd2a7b,#8134af,#515bd4)', app: true },
        { id: 'shorts', name: 'Shorts', icon: '🎬', color: 'linear-gradient(135deg,#ff0050,#ff0000)', app: true },
        { id: 'onion', name: 'Onion', icon: '🧅', color: 'linear-gradient(135deg,#1a1a1a,#0a3d0a)', app: true },
        { id: 'appstore', name: 'App Store', icon: '🏪', color: 'linear-gradient(135deg,#0a84ff,#5856d6)' },
    ],

    init() {},

    refresh() {
        const grid = document.getElementById('appGrid');
        const dock = document.getElementById('appDock');
        if (!grid || !dock) return;
        const wp = document.getElementById('homeWallpaper');
        if (wp && App.data && App.data.wallpaper_home && App.data.wallpaper_home.startsWith('http')) {
            wp.style.backgroundImage = 'url(' + App.data.wallpaper_home + ')';
        }
        grid.innerHTML = '';
        dock.innerHTML = '';
        this.apps.forEach(app => {
            const isCore = !app.app;
            const installed = isCore || App.isInstalled(app.id);
            if (!installed && app.app) return;
            const el = document.createElement('div');
            el.className = 'app-icon';
            el.onclick = () => App.openApp(app.id);
            let badge = '';
            if (app.id === 'messages' && App.data && App.data.unread_messages > 0) {
                badge = '<div class="app-badge">' + App.data.unread_messages + '</div>';
            } else if (app.id === 'mail' && App.data && App.data.unread_mail > 0) {
                badge = '<div class="app-badge">' + App.data.unread_mail + '</div>';
            }
            el.innerHTML = '<div class="app-icon-img" style="background:' + app.color + '">' + app.icon + badge + '</div><div class="app-icon-name">' + app.name + '</div>';
            if (app.dock) {
                dock.appendChild(el);
            } else {
                grid.appendChild(el);
            }
        });
    }
};
