const Navbar = {
    render() {
        const appContent = document.getElementById('appContent');
        if (!appContent) return;
        const existing = appContent.querySelector('.navbar-bottom');
        if (existing) existing.remove();
        const nav = document.createElement('div');
        nav.className = 'navbar-bottom';
        nav.style.cssText = 'position:sticky;bottom:0;left:0;right:0;display:flex;justify-content:center;gap:40px;padding:12px 0;background:var(--bg);border-top:1px solid var(--sep);flex-shrink:0;z-index:10;';
        nav.innerHTML = '<div class="home-indicator" style="width:134px;height:5px;background:rgba(255,255,255,.2);border-radius:3px"></div>';
        appContent.appendChild(nav);
    }
};
