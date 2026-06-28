const CameraApp = {
    onEnter() {
        const c = document.getElementById('appContent');
        const h = document.getElementById('appHeader');
        h.querySelector('.app-back').onclick = () => App.goBack();
        document.getElementById('appTitle').textContent = 'Camera';
        document.getElementById('appHeaderRight').innerHTML = '';
        c.innerHTML = '<div class="camera-screen" style="height:100%">' +
            '<div class="camera-viewfinder" id="cameraViewfinder">' +
            '<div style="text-align:center"><div style="font-size:48px;margin-bottom:12px">📷</div>' +
            '<div style="color:var(--text2);font-size:14px">Portrait Mode</div>' +
            '<div style="color:var(--text3);font-size:12px;margin-top:4px">480 × 640</div></div>' +
            '</div>' +
            '<div class="camera-controls">' +
            '<div class="camera-gallery-thumb" onclick="App.openApp(\'gallery\')"></div>' +
            '<button class="camera-shutter" onclick="CameraApp.capture()"></button>' +
            '<div style="width:44px"></div>' +
            '</div></div>';
    },

    capture() {
        Api.takeScreenshot();
        Notification.show('Photo captured!', 'success');
    }
};
