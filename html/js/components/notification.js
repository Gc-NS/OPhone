const Notification = {
    show(msg, type, duration) {
        type = type || 'info';
        duration = duration || 3000;
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            toast.style.transition = 'all .3s';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};
