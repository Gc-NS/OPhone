const GalleryApp = {
    photos: [],
    viewingIdx: -1,

    onEnter() {
        this.photos = (App.data && App.data.screenshots) || [];
        this.viewingIdx = -1;
        this.renderGrid();
    },

    renderGrid() {
        const c = document.getElementById('appContent');
        const h = document.getElementById('appHeader');
        h.querySelector('.app-back').onclick = () => App.goBack();
        document.getElementById('appTitle').textContent = 'Gallery';
        document.getElementById('appHeaderRight').innerHTML = '';
        let html = '';
        if (this.photos.length === 0) {
            html = '<div class="empty-state"><div class="empty-state-icon">🖼️</div><div class="empty-state-text">No photos yet.<br>Take some with the Camera app!</div></div>';
        } else {
            html += '<div class="gallery-grid">';
            this.photos.forEach((photo, i) => {
                const src = photo.path ? ('http://mta/local/' + photo.path) : '';
                html += '<div class="gallery-item" onclick="GalleryApp.viewPhoto(' + i + ')">';
                if (src) html += '<img src="' + src + '" loading="lazy">';
                else html += '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text3)">📷</div>';
                html += '</div>';
            });
            html += '</div>';
        }
        c.innerHTML = html;
    },

    viewPhoto(idx) {
        this.viewingIdx = idx;
        const photo = this.photos[idx];
        if (!photo) return;
        const c = document.getElementById('appContent');
        const h = document.getElementById('appHeader');
        h.querySelector('.app-back').onclick = () => this.renderGrid();
        document.getElementById('appTitle').textContent = 'Photo';
        document.getElementById('appHeaderRight').innerHTML = '';
        const src = photo.path ? ('http://mta/local/' + photo.path) : '';
        let html = '<div class="gallery-fullscreen">';
        if (src) html += '<img src="' + src + '">';
        html += '<div class="gallery-fullscreen-actions">';
        html += '<button class="btn btn-primary" style="width:auto;padding:10px 20px" onclick="GalleryApp.setAsWallpaper()">Wallpaper</button>';
        html += '<button class="btn btn-outline" style="width:auto;padding:10px 20px" onclick="GalleryApp.shareToInstagram()">Share</button>';
        html += '<button class="btn btn-red" style="width:auto;padding:10px 20px" onclick="GalleryApp.deletePhoto()">Delete</button>';
        html += '</div></div>';
        c.innerHTML = html;
    },

    setAsWallpaper() {
        const photo = this.photos[this.viewingIdx];
        if (!photo) return;
        Modal.show({
            title: 'Set Wallpaper',
            buttons: [
                { text: 'Lock Screen', onClick: () => { Api.setWallpaper('lock', photo.path); Notification.show('Lock wallpaper set!', 'success'); }},
                { text: 'Home Screen', onClick: () => { Api.setWallpaper('home', photo.path); Notification.show('Home wallpaper set!', 'success'); }},
                { text: 'Both', onClick: () => { Api.setWallpaper('both', photo.path); Notification.show('Wallpaper set!', 'success'); }}
            ]
        });
    },

    shareToInstagram() {
        const photo = this.photos[this.viewingIdx];
        if (!photo) return;
        if (!App.isInstalled('instagram')) { Notification.show('Install Instagram first!', 'info'); return; }
        App.pushScreen('instagram', { sharePhoto: photo });
    },

    deletePhoto() {
        const photo = this.photos[this.viewingIdx];
        if (!photo) return;
        Modal.show({
            title: 'Delete Photo',
            desc: 'Are you sure?',
            buttons: [
                { text: 'Cancel', onClick: () => {} },
                { text: 'Delete', danger: true, onClick: () => {
                    Api.deleteScreenshot(photo.id);
                    this.photos.splice(this.viewingIdx, 1);
                    this.renderGrid();
                    Notification.show('Photo deleted', 'info');
                }}
            ]
        });
    }
};
