const ShortsApp = {
    posts: [],
    currentIdx: 0,

    onEnter(opts) {
        this.posts = (App.data && App.data.shorts_posts) || [];
        this.currentIdx = 0;
        if (opts && opts.sharePhoto) {
            this.showCreate('image', opts.sharePhoto.path);
            return;
        }
        this.render();
    },

    render() {
        if (this._creating) { this.renderCreate(); return; }
        const c = document.getElementById('appContent');
        const h = document.getElementById('appHeader');
        h.style.display = 'none';
        document.getElementById('appHeaderRight').innerHTML = '';
        if (this.posts.length === 0) {
            h.style.display = 'flex';
            h.querySelector('.app-back').onclick = () => App.goBack();
            document.getElementById('appTitle').textContent = 'Shorts';
            c.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎬</div><div class="empty-state-text">No shorts yet.<br>Create the first one!</div></div>';
            return;
        }
        let html = '<div class="shorts-container" id="shortsContainer">';
        this.posts.forEach((p, i) => {
            const src = p.media_path ? ('http://mta/local/' + p.media_path) : '';
            const liked = App.data.shorts_likes && App.data.shorts_likes.includes(p.id);
            html += '<div class="shorts-item">';
            html += '<div class="shorts-bg">';
            if (p.post_type === 'text') {
                html += '<div style="width:100%;height:100%;background:' + (p.bg_gradient || p.bg_color || Utils.randomGradient()) + ';display:flex;align-items:center;justify-content:center"><div class="shorts-text-content" style="' + (p.font_style || '') + '">' + Utils.escapeHtml(p.caption || '') + '</div></div>';
            } else if (src) {
                html += '<img src="' + src + '" loading="lazy">';
            } else {
                html += '<div style="width:100%;height:100%;background:var(--bg2)"></div>';
            }
            html += '</div>';
            html += '<div class="shorts-overlay"></div>';
            html += '<div class="shorts-content">';
            html += '<div class="shorts-username">@' + Utils.escapeHtml(p.author || 'unknown') + '</div>';
            if (p.post_type !== 'text' && p.caption) html += '<div class="shorts-caption">' + Utils.escapeHtml(p.caption) + '</div>';
            html += '</div>';
            html += '<div class="shorts-actions">';
            html += '<div class="shorts-action" onclick="ShortsApp.toggleLike(' + p.id + ')">';
            html += '<svg width="28" height="28" viewBox="0 0 24 24" fill="' + (liked ? 'var(--red)' : 'none') + '" stroke="' + (liked ? 'var(--red)' : 'white') + '" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
            html += '<span>' + (p.likes_count || 0) + '</span></div>';
            html += '<div class="shorts-action"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg><span>' + (p.views_count || 0) + '</span></div>';
            html += '</div>';
            html += '</div>';
        });
        html += '</div>';
        html += '<div style="position:fixed;bottom:40px;left:50%;transform:translateX(-50%);z-index:10;display:flex;gap:12px">';
        html += '<button onclick="ShortsApp.goBack()" style="background:rgba(0,0,0,.5);border:none;color:#fff;padding:10px 20px;border-radius:20px;cursor:pointer;font-size:14px">← Back</button>';
        html += '<button onclick="ShortsApp.showCreate()" style="background:var(--accent);border:none;color:#fff;padding:10px 20px;border-radius:20px;cursor:pointer;font-size:14px">+ Create</button>';
        html += '</div>';
        c.innerHTML = html;
        c.scrollTop = this.currentIdx * c.clientHeight;
    },

    renderCreate() {
        const h = document.getElementById('appHeader');
        h.style.display = 'flex';
        h.querySelector('.app-back').onclick = () => { this._creating = false; this.render(); };
        document.getElementById('appTitle').textContent = 'New Short';
        document.getElementById('appHeaderRight').innerHTML = '';
        const c = document.getElementById('appContent');
        let html = '<div class="input-group"><div class="input-label">Type</div><div style="display:flex;gap:8px">';
        ['text', 'image'].forEach(t => {
            html += '<button class="btn ' + (t === (this._createType || 'text') ? 'btn-primary' : 'btn-outline') + '" style="width:auto;padding:8px 16px;font-size:13px" onclick="ShortsApp._createType=\'' + t + '\';ShortsApp._creating=true;ShortsApp.render()">' + t + '</button>';
        });
        html += '</div></div>';
        this._createType = this._createType || 'text';
        if (this._createType === 'text') {
            html += '<div class="input-group"><div class="input-label">Your text</div><textarea class="input-field" id="shortsCaption" placeholder="Say something..." style="min-height:120px;font-size:18px"></textarea></div>';
            html += '<div class="input-group"><div class="input-label">Background</div><div style="display:flex;gap:8px;flex-wrap:wrap">';
            Utils.gradientPairs.forEach((p, i) => {
                html += '<div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,' + p[0] + ',' + p[1] + ');cursor:pointer;border:2px solid transparent" onclick="ShortsApp._bgGrad=\'' + i + '\';this.parentElement.querySelectorAll(\'div\').forEach(d=>d.style.borderColor=\'transparent\');this.style.borderColor=\'#fff\'"></div>';
            });
            html += '</div></div>';
        } else {
            html += '<div class="input-group"><div class="input-label">Caption</div><input class="input-field" id="shortsCaption" placeholder="Add a caption..."></div>';
            html += '<div class="input-group"><div class="input-label">Image URL (optional)</div><input class="input-field" id="shortsImageUrl" placeholder="https://..."></div>';
            if (this._sharePath) html += '<div style="padding:0 16px;margin-bottom:12px"><img src="http://mta/local/' + this._sharePath + '" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px"></div>';
        }
        html += '<div class="p-16"><button class="btn btn-primary" onclick="ShortsApp.createPost()">Post Short</button></div>';
        c.innerHTML = html;
    },

    showCreate(type, mediaPath) {
        this._creating = true;
        this._createType = type || 'text';
        this._sharePath = mediaPath || '';
        this.render();
    },

    createPost() {
        const caption = (document.getElementById('shortsCaption') || {}).value || '';
        const url = (document.getElementById('shortsImageUrl') || {}).value || '';
        const type = this._createType || 'text';
        const gradIdx = this._bgGrad || 0;
        const grad = Utils.gradientPairs[gradIdx];
        const bgGradient = 'linear-gradient(135deg,' + grad[0] + ',' + grad[1] + ')';
        Api.shortsCreatePost(type, this._sharePath || '', url, caption, '', bgGradient, '');
        Notification.show('Short posted!', 'success');
        this._creating = false;
        this.render();
    },

    toggleLike(postId) {
        const liked = App.data.shorts_likes && App.data.shorts_likes.includes(postId);
        if (liked) { Api.shortsUnlike(postId); if (App.data.shorts_likes) App.data.shorts_likes = App.data.shorts_likes.filter(x => x !== postId); }
        else { Api.shortsLike(postId); if (!App.data.shorts_likes) App.data.shorts_likes = []; App.data.shorts_likes.push(postId); }
        const p = this.posts.find(x => x.id === postId);
        if (p) p.likes_count = Math.max(0, (p.likes_count || 0) + (liked ? -1 : 1));
        this.render();
    },

    goBack() {
        const h = document.getElementById('appHeader');
        h.style.display = 'flex';
        App.goBack();
    },

    onLeave() {
        const h = document.getElementById('appHeader');
        h.style.display = 'flex';
        this._creating = false;
    }
};
