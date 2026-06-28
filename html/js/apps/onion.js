const OnionApp = {
    posts: [],
    _warned: false,

    onEnter() {
        this.posts = (App.data && App.data.onion_posts) || [];
        if (!this._warned) {
            this._warned = true;
            this.showWarning();
            return;
        }
        this.renderFeed();
    },

    showWarning() {
        const c = document.getElementById('appContent');
        const h = document.getElementById('appHeader');
        h.querySelector('.app-back').onclick = () => App.goBack();
        document.getElementById('appTitle').textContent = 'Onion Browser';
        document.getElementById('appHeaderRight').innerHTML = '';
        c.innerHTML = '<div style="padding:40px 20px;text-align:center">' +
            '<div style="font-size:64px;margin-bottom:16px">🧅</div>' +
            '<div style="font-size:20px;font-weight:700;color:#0f0;margin-bottom:12px">WARNING</div>' +
            '<div class="onion-warning">This is an anonymous browser. All posts are untraceable. Do not share personal information.</div>' +
            '<button class="btn btn-green" style="margin:16px" onclick="OnionApp.renderFeed()">Enter</button>' +
            '<button class="btn btn-outline" onclick="App.goBack()">Go Back</button></div>';
    },

    renderFeed() {
        const c = document.getElementById('appContent');
        const h = document.getElementById('appHeader');
        h.querySelector('.app-back').onclick = () => App.goBack();
        document.getElementById('appTitle').textContent = 'Onion Browser';
        document.getElementById('appHeaderRight').innerHTML = '<span onclick="OnionApp.showCreate()" style="color:#0f0">+</span>';
        let html = '<div class="onion-warning" style="margin:8px 12px;padding:10px;font-size:11px">⚠️ Anonymous Network - Posts expire in 24h</div>';
        if (this.posts.length === 0) {
            html += '<div class="empty-state" style="color:#0a3d0a"><div class="empty-state-icon" style="opacity:.3">🧅</div><div class="empty-state-text">The network is quiet...</div></div>';
        } else {
            this.posts.forEach(p => {
                const liked = App.data.onion_likes && App.data.onion_likes.includes(p.id);
                html += '<div class="onion-post">';
                html += '<div class="onion-post-content">' + Utils.escapeHtml(p.content) + '</div>';
                html += '<div class="onion-post-meta">';
                html += '<span onclick="OnionApp.toggleLike(' + p.id + ')" style="cursor:pointer">' + (liked ? '❤️' : '🤍') + ' ' + (p.likes || 0) + '</span>';
                html += '<span>' + Utils.timeAgo(p.created_at) + '</span>';
                html += '</div></div>';
            });
        }
        c.innerHTML = html;
    },

    showCreate() {
        const c = document.getElementById('appContent');
        const h = document.getElementById('appHeader');
        h.querySelector('.app-back').onclick = () => this.renderFeed();
        document.getElementById('appTitle').textContent = 'New Anonymous Post';
        document.getElementById('appHeaderRight').innerHTML = '';
        c.innerHTML = '<div class="input-group" style="padding-top:16px"><div class="input-label" style="color:#0f0">Message</div>' +
            '<textarea class="input-field" id="onionContent" placeholder="Type your anonymous message..." style="min-height:200px;font-family:\'Courier New\',monospace;color:#0f0;background:#0a0a0a;border-color:#0a3d0a"></textarea></div>' +
            '<div class="p-16"><button class="btn btn-green" onclick="OnionApp.createPost()" style="background:#0a3d0a;color:#0f0">Post Anonymously</button></div>';
    },

    createPost() {
        const el = document.getElementById('onionContent');
        if (!el || !el.value.trim()) return;
        Api.onionPost(el.value.trim());
        Notification.show('Posted anonymously!', 'success');
        this.renderFeed();
    },

    toggleLike(postId) {
        const liked = App.data.onion_likes && App.data.onion_likes.includes(postId);
        if (liked) { if (App.data.onion_likes) App.data.onion_likes = App.data.onion_likes.filter(x => x !== postId); }
        else { if (!App.data.onion_likes) App.data.onion_likes = []; App.data.onion_likes.push(postId); }
        Api.onionLike(postId);
        const p = this.posts.find(x => x.id === postId);
        if (p) p.likes = Math.max(0, (p.likes || 0) + (liked ? -1 : 1));
        this.renderFeed();
    },

    onLeave() { this._warned = false; }
};
