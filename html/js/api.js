const Api = {
    _callbacks: {},

    call(fnName) {
        const args = [];
        for (let i = 1; i < arguments.length; i++) args.push(arguments[i]);
        try {
            if (typeof mta !== 'undefined' && mta.triggerEvent) {
                mta.triggerEvent('Ophone.jsCall', fnName, JSON.stringify(args));
            }
        } catch(e) { console.error('Api.call error:', fnName, e); }
    },

    on(eventName, handler) {
        if (!this._callbacks[eventName]) this._callbacks[eventName] = [];
        this._callbacks[eventName].push(handler);
    },

    trigger(eventName, data) {
        const handlers = this._callbacks[eventName];
        if (handlers) {
            const parsed = typeof data === 'string' ? (() => { try { return JSON.parse(data); } catch(e) { return data; } })() : data;
            handlers.forEach(h => { try { h(parsed); } catch(e) { console.error('Api handler error:', eventName, e); } });
        }
    },

    dialNumber(num) { this.call('Ophone.dialNumber', num); },
    acceptCall() { this.call('Ophone.acceptCall'); },
    endCall() { this.call('Ophone.endCall'); },
    addContact(name, number) { this.call('Ophone.addContact', name, number); },
    deleteContact(id) { this.call('Ophone.deleteContact', id); },
    sendMessage(to, content) { this.call('Ophone.sendMessage', to, content); },
    sendMail(to, subject, content) { this.call('Ophone.sendMail', to, subject, content); },
    deleteMail(id) { this.call('Ophone.deleteMail', id); },
    activateSim() { this.call('Ophone.activateSim'); },
    rechargePlan(planId) { this.call('Ophone.rechargePlan', planId); },
    takeScreenshot() { this.call('Ophone.takeScreenshot'); },
    deleteScreenshot(id) { this.call('Ophone.deleteScreenshot', id); },
    setWallpaper(type, path) { this.call('Ophone.setWallpaper', type, path); },
    setWallpaperUrl(type, url) { this.call('Ophone.setWallpaperUrl', type, url); },
    igCreatePost(type, mediaPath, mediaUrl, caption, bgColor) { this.call('Ophone.igCreatePost', type, mediaPath, mediaUrl, caption, bgColor); },
    igLike(postId) { this.call('Ophone.igLike', postId); },
    igUnlike(postId) { this.call('Ophone.igUnlike', postId); },
    igDeletePost(postId) { this.call('Ophone.igDeletePost', postId); },
    igComment(postId, content) { this.call('Ophone.igComment', postId, content); },
    igFollow(username) { this.call('Ophone.igFollow', username); },
    igUnfollow(username) { this.call('Ophone.igUnfollow', username); },
    igUpdateProfile(username, displayName, bio) { this.call('Ophone.igUpdateProfile', username, displayName, bio); },
    shortsCreatePost(type, mediaPath, mediaUrl, caption, bgColor, bgGradient, fontStyle) { this.call('Ophone.shortsCreatePost', type, mediaPath, mediaUrl, caption, bgColor, bgGradient, fontStyle); },
    shortsLike(postId) { this.call('Ophone.shortsLike', postId); },
    shortsUnlike(postId) { this.call('Ophone.shortsUnlike', postId); },
    onionPost(content) { this.call('Ophone.onionPost', content); },
    onionLike(postId) { this.call('Ophone.onionLike', postId); },
    installApp(appId) { this.call('Ophone.installApp', appId); },
    setRingtone(id) { this.call('Ophone.setRingtone', id); },
    setNotificationSound(id) { this.call('Ophone.setNotificationSound', id); },
    toggleReceiveCalls(val) { this.call('Ophone.toggleReceiveCalls', val); },
    toggleNotifyMessages(val) { this.call('Ophone.toggleNotifyMessages', val); },
    factoryReset() { this.call('Ophone.factoryReset'); },
    setDisplayName(name) { this.call('Ophone.setDisplayName', name); },
    buyPhone() { this.call('Ophone.shopBuyPhone'); },
    buySim() { this.call('Ophone.shopBuySim'); },
};

function ophoneTrigger(event, data) {
    Api.trigger(event, data);
}
