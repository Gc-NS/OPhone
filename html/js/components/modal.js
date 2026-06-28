const Modal = {
    _el: null,

    show(opts) {
        this.hide();
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.onclick = (e) => { if (e.target === overlay) this.hide(); };
        let bodyHtml = '';
        if (opts.inputs) {
            opts.inputs.forEach(inp => {
                bodyHtml += '<div class="input-group" style="padding:0;margin-bottom:10px">';
                if (inp.label) bodyHtml += '<div class="input-label">' + Utils.escapeHtml(inp.label) + '</div>';
                bodyHtml += '<input class="input-field" id="modal_' + inp.id + '" placeholder="' + Utils.escapeHtml(inp.placeholder || '') + '" value="' + Utils.escapeHtml(inp.value || '') + '" type="' + (inp.type || 'text') + '">';
                bodyHtml += '</div>';
            });
        }
        if (opts.text) bodyHtml += '<p style="font-size:14px;color:var(--text2);text-align:center;padding:0 4px">' + Utils.escapeHtml(opts.text) + '</p>';
        let actionsHtml = '';
        if (opts.buttons) {
            opts.buttons.forEach((btn, i) => {
                const cls = btn.danger ? ' modal-btn danger' : ' modal-btn';
                actionsHtml += '<button class="' + cls + '" data-idx="' + i + '">' + Utils.escapeHtml(btn.text) + '</button>';
            });
        }
        overlay.innerHTML = '<div class="modal">' +
            (opts.title ? '<div class="modal-header"><div class="modal-title">' + Utils.escapeHtml(opts.title) + '</div>' + (opts.desc ? '<div class="modal-desc">' + Utils.escapeHtml(opts.desc) + '</div>' : '') + '</div>' : '') +
            (bodyHtml ? '<div class="modal-body">' + bodyHtml + '</div>' : '') +
            (actionsHtml ? '<div class="modal-actions">' + actionsHtml + '</div>' : '') +
            '</div>';
        document.getElementById('screenContainer').appendChild(overlay);
        this._el = overlay;
        if (opts.inputs && opts.inputs.length > 0) {
            const first = overlay.querySelector('input');
            if (first) setTimeout(() => first.focus(), 100);
        }
        overlay.querySelectorAll('.modal-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.idx);
                if (opts.buttons[idx] && opts.buttons[idx].onClick) {
                    const vals = {};
                    if (opts.inputs) {
                        opts.inputs.forEach(inp => {
                            const el = overlay.querySelector('#modal_' + inp.id);
                            if (el) vals[inp.id] = el.value;
                        });
                    }
                    opts.buttons[idx].onClick(vals);
                }
                this.hide();
            };
        });
    },

    getInputValue(id) {
        if (!this._el) return '';
        const el = this._el.querySelector('#modal_' + id);
        return el ? el.value : '';
    },

    hide() {
        if (this._el) { this._el.remove(); this._el = null; }
    }
};
