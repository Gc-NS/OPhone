const App = {
    currentScreen: 'lock',
    currentApp: null,
    screenHistory: [],
    data: null,
    battery: 100,
    signal: 100,
    isCharging: false,

    screens: {},

    registerScreen(name, handler) {
        this.screens[name] = handler;
    },

    init(data) {
        this.data = data;
        this.showScreen('lock');
        StatusBar.init();
        LockScreen.init();
        HomeScreen.init();
    },

    showScreen(name, opts) {
        if (this.currentApp && this.screens[this.currentApp] && this.screens[this.currentApp].onLeave) {
            this.screens[this.currentApp].onLeave();
        }
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        if (name === 'lock') {
            document.getElementById('screenLock').classList.add('active');
            this.currentScreen = 'lock';
            this.currentApp = null;
            LockScreen.refresh();
        } else if (name === 'home') {
            document.getElementById('screenHome').classList.add('active');
            this.currentScreen = 'home';
            this.currentApp = null;
            HomeScreen.refresh();
        } else if (name === 'call') {
            document.getElementById('screenCall').classList.add('active');
            this.currentScreen = 'call';
        } else {
            const screen = document.getElementById('screenApp');
            screen.classList.add('active');
            this.currentScreen = 'app';
            this.currentApp = name;
            if (this.screens[name] && this.screens[name].onEnter) {
                this.screens[name].onEnter(opts);
            }
        }
    },

    goBack() {
        if (this.currentScreen === 'call') return;
        if (this.currentApp && this.screens[this.currentApp] && this.screens[this.currentApp].onBack) {
            this.screens[this.currentApp].onBack();
            return;
        }
        if (this.screenHistory.length > 0) {
            const prev = this.screenHistory.pop();
            this.showScreen(prev.name, prev.opts);
        } else {
            this.showScreen('home');
        }
    },

    pushScreen(name, opts) {
        this.screenHistory.push({ name: this.currentApp || this.currentScreen, opts: {} });
        this.showScreen(name, opts);
    },

    openApp(name, opts) {
        if (!this.data || !this.data.installed_apps) return;
        const coreApps = ['phone','contacts','messages','settings','sim','camera','gallery'];
        if (!coreApps.includes(name) && !this.data.installed_apps.includes(name)) {
            Notification.show('Install this app from the App Store', 'info');
            return;
        }
        this.screenHistory = [];
        this.pushScreen(name, opts);
    },

    updateBattery(level) {
        this.battery = level;
        StatusBar.updateBattery(level);
    },

    updateSignal(level) {
        this.signal = level;
        StatusBar.updateSignal(level);
    },

    isInstalled(appId) {
        return this.data && this.data.installed_apps && this.data.installed_apps.includes(appId);
    }
};
