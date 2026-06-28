const InstagramApp = {
    tab: 'feed',
    posts: [],
    profile: null,
    profileUser: null,

    onEnter(opts) {
        this.tab = (opts && opts.tab) || 'feed';
        this.posts = (App.data && App.data.ig_posts) || [];
        if (opts && opts.sharePhoto) {
            this.showCreate('image', opts.sharePhoto.path);
            return;
        }
        if (opts && opts.profileUser) {
            this.profileUser = opts.profileUser;
            this.tab = 'profile';
        }
        this.render();
    },

    render() {
        if (this.tab === 'feed') this.renderFeed();
        else if (this.tab === 'explore') this.renderExplore();
        else if (this.tab === 'create') this.renderCreate();
        else if (this.tab === 'profile') this.renderProfile();
        else if (this.tab === 'post') this.renderPostDetail();
    },

    renderFeed() {
        const c = document.getElementById('appContent');
        const h = document.getElementById('appHeader');
        h.querySelector('.app-back').onclick = () => App.goBack();
        document.getElementById('appTitle').textContent = 'Instagram';
        document.getElementById('appHeaderRight').innerHTML = '<span onclick="InstagramApp.tab=\'create\';InstagramApp.render()">✦</span>';
        let html = '<div class="tab-bar"><div class="tab-bar-item active" onclick="InstagramApp.tab=\'feed\';InstagramApp.render()">Feed</div><div class="tab-bar-item" onclick="InstagramApp.tab=\'explore\';InstagramApp.render()">Explore</div><div class="tab-bar-item" onclick="InstagramApp.tab=\'profile\';InstagramApp.profileUser=null;InstagramApp.render()">Profile</div></div>';
        const feedPosts = this.posts.filter(p => {
            if (p.author === App.data.username) return true;
            return App.data.following && App.data.following.includes(p.author);
        });
        if (feedPosts.length === 0) {
            html += '<div class="empty-state"><div class="empty-state-icon">📸</div><div class="empty-state-text">No posts yet.<br>Follow people or create a post!</div></div>';
        } else {
            feedPosts.forEach(p => { html += this.renderPost(p); });
        }
        c.innerHTML = html;
        c.scrollTop = 0;
    },

    renderExplore() {
        const c = document.getElementById('appContent');
        const h = document.getElementById('appHeader');
        h.querySelector('.app-back').onclick = () => App.goBack();
        document.getElementById('appTitle').textContent = 'Explore';
        document.getElementById('appHeaderRight').innerHTML = '';
        let html = '<div class="tab-bar"><div class="tab-bar-item" onclick="InstagramApp.tab=\'feed\';InstagramApp.render()">Feed</div><div class="tab-bar-item active" onclick="InstagramApp.tab=\'explore\';InstagramApp.render()">Explore</div><div class="tab-bar-item" onclick="InstagramApp.tab=\'profile\';InstagramApp.profileUser=null;InstagramApp.render()">Profile</div></div>';
        html += '<div class="input-group" style="padding:12px 16px"><input class="input-field" id="igSearch" placeholder="Search users..." oninput="InstagramApp.searchUsers(this.value)"></div>';
        html += '<div id="igSearchResults"></div>';
        html += '<div class="grid-3" style="padding:2px">';
        this.posts.forEach(p => {
            const src = p.media_path ? ('http://mta/local/' + p.media_path) : '';
            html += '<div class="grid-item" onclick="InstagramApp.viewPost(' + p.id + ')" style="position:relative">';
            if (src) html += '<img src="' + src + '" loading="lazy" style="width:100%;height:100%;object-fit:cover">';
            else html += '<div style="width:100%;height:100%;background:' + (p.bg_color || 'var(--bg3)') + ';display:flex;align-items:center;justify-content:center;padding:8px;font-size:10px;text-align:center">' + Utils.escapeHtml((p.caption || '').substring(0, 50)) + '</div>';
            html += '</div>';
        });
        html += '</div>';
        c.innerHTML = html;
        c.scrollTop = 0;
    },

    searchUsers: Utils.debounce(function(query) {
        const el = document.getElementById('igSearchResults');
        if (!el || !query) { if (el) el.innerHTML = ''; return; }
        const results = (App.data.ig_profiles || []).filter(p => p.username && p.username.toLowerCase().includes(query.toLowerCase()));
        let html = '';
        results.slice(0, 10).forEach(p => {
            html += '<div class="list-item" onclick="InstagramApp.profileUser=\'' + Utils.escapeHtml(p.username) + '\';InstagramApp.tab=\'profile\';InstagramApp.render()">';
            html += '<div class="list-item-icon" style="background:var(--pink);color:#fff;border-radius:50%;font-size:14px">' + (p.username || '?').charAt(0).toUpperCase() + '</div>';
            html += '<div class="list-item-content"><div class="list-item-title">' + Utils.escapeHtml(p.username) + '</div>';
            html += '<div class="list-item-sub">' + Utils.escapeHtml(p.display_name || '') + '</div></div></div>';
        });
        el.innerHTML = html;
    }, 300),

    renderPost(p) {
        const src = p.media_path ? ('http://mta/local/' + p.media_path) : '';
        const liked = App.data.ig_likes && App.data.ig_likes.includes(p.id);
        let html = '<div class="ig-post">';
        html += '<div class="ig-post-header">';
        html += '<div class="avatar avatar-sm" style="background:var(--pink);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;cursor:pointer" onclick="InstagramApp.profileUser=\'' + Utils.escapeHtml(p.author) + '\';InstagramApp.tab=\'profile\';InstagramApp.render()">' + (p.author || '?').charAt(0).toUpperCase() + '</div>';
        html += '<div class="ig-post-username" style="cursor:pointer" onclick="InstagramApp.profileUser=\'' + Utils.escapeHtml(p.author) + '\';InstagramApp.tab=\'profile\';InstagramApp.render()">' + Utils.escapeHtml(p.author) + '</div>';
        if (p.author === App.data.username) html += '<div class="ig-post-more" onclick="InstagramApp.deletePost(' + p.id + ')">⋯</div>';
        html += '</div>';
        if (p.post_type === 'image' && src) html += '<img class="ig-post-image" src="' + src + '" loading="lazy">';
        else if (p.post_type === 'text') html += '<div class="ig-post-image" style="background:' + (p.bg_color || Utils.randomGradient()) + ';display:flex;align-items:center;justify-content:center;padding:20px;font-size:18px;font-weight:600;text-align:center;line-height:1.4">' + Utils.escapeHtml(p.caption || '') + '</div>';
        else if (p.post_type === 'video' && src) html += '<video class="ig-post-image" src="' + src + '" controls playsinline></video>';
        if (p.post_type !== 'text' && p.caption) html += '<div class="ig-post-text"><span class="ig-cap-author">' + Utils.escapeHtml(p.author) + '</span>' + Utils.escapeHtml(p.caption) + '</div>';
        html += '<div class="ig-post-actions">';
        html += '<svg width="24" height="24" viewBox="0 0 24 24" fill="' + (liked ? 'var(--red)' : 'none') + '" stroke="' + (liked ? 'var(--red)' : 'white') + '" stroke-width="2" onclick="InstagramApp.toggleLike(' + p.id + ')"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
        html += '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" onclick="InstagramApp.viewPost(' + p.id + ')"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
        html += '</div>';
        html += '<div class="ig-post-likes">' + (p.likes_count || 0) + ' likes</div>';
        if (p.comments_count > 0) html += '<div class="ig-post-comments" onclick="InstagramApp.viewPost(' + p.id + ')">View all ' + p.comments_count + ' comments</div>';
        html += '<div style="padding:0 14px;font-size:11px;color:var(--text3)">' + Utils.timeAgo(p.created_at) + '</div>';
        html += '</div>';
        return html;
    },

    viewPost(postId) {
        const p = this.posts.find(x => x.id === postId);
        if (!p) return;
        this.tab = 'postDetail';
        this._currentPost = p;
        const c = document.getElementById('appContent');
        const h = document.getElementById('appHeader');
        h.querySelector('.app-back').onclick = () => { this.tab = 'feed'; this.render(); };
        document.getElementById('appTitle').textContent = 'Post';
        document.getElementById('appHeaderRight').innerHTML = '';
        let html = this.renderPost(p);
        html += '<div class="section-title">Comments</div>';
        const comments = (App.data.ig_comments && App.data.ig_comments[postId]) || [];
        comments.forEach(cm => {
            html += '<div class="ig-comment"><div><span class="ig-comment-user">' + Utils.escapeHtml(cm.username) + '</span>' + Utils.escapeHtml(cm.content) + '</div></div>';
        });
        if (comments.length === 0) html += '<div style="padding:12px 16px;color:var(--text3);font-size:13px">No comments yet.</div>';
        html += '<div style="display:flex;gap:8px;padding:12px 16px;border-top:1px solid var(--sep);margin-top:8px"><input class="input-field" id="igCommentInput" placeholder="Add a comment..." style="flex:1;padding:10px"><button class="btn btn-primary" style="width:auto;padding:10px 16px;font-size:14px" onclick="InstagramApp.postComment(' + postId + ')">Post</button></div>';
        c.innerHTML = html;
        c.scrollTop = c.scrollHeight;
    },

    postComment(postId) {
        const el = document.getElementById('igCommentInput');
        if (!el || !el.value.trim()) return;
        Api.igComment(postId, el.value.trim());
        if (!App.data.ig_comments) App.data.ig_comments = {};
        if (!App.data.ig_comments[postId]) App.data.ig_comments[postId] = [];
        App.data.ig_comments[postId].push({ username: App.data.username, content: el.value.trim() });
        this.viewPost(postId);
    },

    renderCreate(type, mediaPath) {
        const c = document.getElementById('appContent');
        const h = document.getElementById('appHeader');
        h.querySelector('.app-back').onclick = () => { this.tab = 'feed'; this.render(); };
        document.getElementById('appTitle').textContent = 'New Post';
        document.getElementById('appHeaderRight').innerHTML = '';
        let html = '<div class="input-group"><div class="input-label">Type</div><div style="display:flex;gap:8px">';
        ['text', 'image'].forEach(t => {
            html += '<button class="btn ' + (t === (type || 'text') ? 'btn-primary' : 'btn-outline') + '" style="width:auto;padding:8px 16px;font-size:13px" onclick="InstagramApp._createType=\'' + t + '\';InstagramApp.renderCreate(\'' + t + '\')">' + t + '</button>';
        });
        html += '</div></div>';
        this._createType = type || 'text';
        if (this._createType === 'text') {
            html += '<div class="input-group"><div class="input-label">Caption</div><textarea class="input-field" id="igCaption" placeholder="Write something..." style="min-height:120px"></textarea></div>';
            html += '<div class="input-group"><div class="input-label">Background Color</div><div style="display:flex;gap:8px;flex-wrap:wrap">';
            const colors = ['#ff6b6b','#feca57','#48dbfb','#ff9ff3','#54a0ff','#5f27cd','#01a3a4','#2ed573','#ffa502','#ff4757'];
            colors.forEach(cl => {
                html += '<div style="width:36px;height:36px;border-radius:8px;background:' + cl + ';cursor:pointer;border:2px solid transparent" onclick="InstagramApp._bgColor=\'' + cl + '\';this.parentElement.querySelectorAll(\'div\').forEach(d=>d.style.borderColor=\'transparent\');this.style.borderColor=\'#fff\'"></div>';
            });
            html += '</div></div>';
        } else {
            html += '<div class="input-group"><div class="input-label">Caption</div><input class="input-field" id="igCaption" placeholder="Add a caption..."></div>';
            html += '<div class="input-group"><div class="input-label">Image URL (optional)</div><input class="input-field" id="igImageUrl" placeholder="https://..."></div>';
            if (mediaPath) html += '<div style="padding:0 16px;margin-bottom:12px"><div style="font-size:13px;color:var(--text2);margin-bottom:4px">Selected from gallery:</div><img src="http://mta/local/' + mediaPath + '" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px"></div>';
            this._sharePath = mediaPath || '';
        }
        html += '<div class="p-16"><button class="btn btn-primary" onclick="InstagramApp.createPost()">Post</button></div>';
        c.innerHTML = html;
    },

    createPost() {
        const caption = (document.getElementById('igCaption') || {}).value || '';
        const url = (document.getElementById('igImageUrl') || {}).value || '';
        const type = this._createType || 'text';
        const bgColor = this._bgColor || Utils.randomGradient();
        const mediaPath = this._sharePath || '';
        Api.igCreatePost(type, mediaPath, url, caption, bgColor);
        Notification.show('Posted!', 'success');
        this.tab = 'feed';
        this.render();
    },

    renderProfile() {
        const c = document.getElementById('appContent');
        const h = document.getElementById('appHeader');
        h.querySelector('.app-back').onclick = () => { this.tab = 'feed'; this.render(); };
        document.getElementById('appHeaderRight').innerHTML = '';
        const username = this.profileUser || App.data.username;
        const isOwn = username === App.data.username;
        document.getElementById('appTitle').textContent = username;
        const profile = (App.data.ig_profiles || []).find(p => p.username === username) || { username, display_name: '', bio: '' };
        const userPosts = this.posts.filter(p => p.author === username);
        const followers = App.data.ig_followers_count && App.data.ig_followers_count[username] || 0;
        const following = App.data.ig_following_count && App.data.ig_following_count[username] || 0;
        const isFollowing = App.data.following && App.data.following.includes(username);
        let html = '<div class="ig-profile">';
        html += '<div class="ig-profile-top">';
        html += '<div class="avatar avatar-xl" style="background:var(--pink);display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:600">' + username.charAt(0).toUpperCase() + '</div>';
        html += '<div class="ig-profile-stats"><div class="ig-profile-stat"><div class="ig-profile-stat-num">' + userPosts.length + '</div><div class="ig-profile-stat-label">Posts</div></div>';
        html += '<div class="ig-profile-stat"><div class="ig-profile-stat-num">' + followers + '</div><div class="ig-profile-stat-label">Followers</div></div>';
        html += '<div class="ig-profile-stat"><div class="ig-profile-stat-num">' + following + '</div><div class="ig-profile-stat-label">Following</div></div></div></div>';
        html += '<div class="ig-profile-bio">' + Utils.escapeHtml(profile.bio || 'No bio') + '</div>';
        if (isOwn) html += '<div class="ig-profile-actions"><button class="btn btn-outline" style="width:auto;padding:8px 24px" onclick="InstagramApp.editProfile()">Edit Profile</button></div>';
        else html += '<div class="ig-profile-actions"><button class="btn ' + (isFollowing ? 'btn-outline' : 'btn-primary') + '" style="width:auto;padding:8px 24px" onclick="InstagramApp.toggleFollow(\'' + Utils.escapeHtml(username) + '\')">' + (isFollowing ? 'Unfollow' : 'Follow') + '</button></div>';
        html += '</div>';
        html += '<div class="grid-3" style="padding:2px">';
        userPosts.forEach(p => {
            const src = p.media_path ? ('http://mta/local/' + p.media_path) : '';
            html += '<div class="grid-item">';
            if (src) html += '<img src="' + src + '" loading="lazy" style="width:100%;height:100%;object-fit:cover">';
            else html += '<div style="width:100%;height:100%;background:' + (p.bg_color || 'var(--bg3)') + '"></div>';
            html += '</div>';
        });
        html += '</div>';
        c.innerHTML = html;
        c.scrollTop = 0;
    },

    editProfile() {
        const p = (App.data.ig_profiles || []).find(x => x.username === App.data.username) || {};
        Modal.show({
            title: 'Edit Profile',
            inputs: [
                { id: 'username', label: 'Username', value: p.username || App.data.username || '' },
                { id: 'displayname', label: 'Display Name', value: p.display_name || '' },
                { id: 'bio', label: 'Bio', value: p.bio || '' }
            ],
            buttons: [
                { text: 'Cancel', onClick: () => {} },
                { text: 'Save', onClick: (vals) => {
                    Api.igUpdateProfile(vals.username, vals.displayname, vals.bio);
                    Notification.show('Profile updated!', 'success');
                }}
            ]
        });
    },

    toggleLike(postId) {
        const liked = App.data.ig_likes && App.data.ig_likes.includes(postId);
        if (liked) { Api.igUnlike(postId); if (App.data.ig_likes) App.data.ig_likes = App.data.ig_likes.filter(x => x !== postId); }
        else { Api.igLike(postId); if (!App.data.ig_likes) App.data.ig_likes = []; App.data.ig_likes.push(postId); }
        const p = this.posts.find(x => x.id === postId);
        if (p) p.likes_count = Math.max(0, (p.likes_count || 0) + (liked ? -1 : 1));
        this.render();
    },

    toggleFollow(username) {
        const isFollowing = App.data.following && App.data.following.includes(username);
        if (isFollowing) { Api.igUnfollow(username); if (App.data.following) App.data.following = App.data.following.filter(x => x !== username); }
        else { Api.igFollow(username); if (!App.data.following) App.data.following = []; App.data.following.push(username); }
        this.render();
    },

    deletePost(postId) {
        Modal.show({
            title: 'Delete Post',
            desc: 'Are you sure?',
            buttons: [
                { text: 'Cancel', onClick: () => {} },
                { text: 'Delete', danger: true, onClick: () => {
                    Api.igDeletePost(postId);
                    this.posts = this.posts.filter(p => p.id !== postId);
                    this.render();
                }}
            ]
        });
    },

    onLeave() { this.tab = 'feed'; }
};
