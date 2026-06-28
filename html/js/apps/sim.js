const SimApp = {
    onEnter() { this.render(); },

    render() {
        const c = document.getElementById('appContent');
        const h = document.getElementById('appHeader');
        h.querySelector('.app-back').onclick = () => App.goBack();
        document.getElementById('appTitle').textContent = 'SIM Card';
        document.getElementById('appHeaderRight').innerHTML = '';
        const d = App.data || {};
        let html = '';

        if (!d.sim_active) {
            html += '<div style="padding:40px 20px;text-align:center">';
            html += '<div style="font-size:64px;margin-bottom:16px">💳</div>';
            html += '<div style="font-size:20px;font-weight:600;margin-bottom:8px">No SIM Card</div>';
            html += '<div style="color:var(--text2);margin-bottom:24px;font-size:14px">Insert a SIM card to make calls and send messages.</div>';
            html += '<button class="btn btn-primary" onclick="SimApp.activate()">Activate SIM</button>';
            html += '</div>';
        } else {
            html += '<div class="sim-card">';
            html += '<div class="sim-card-label">OPHONE</div>';
            html += '<div class="sim-card-number">' + Utils.escapeHtml(d.phone_number || '---') + '</div>';
            html += '<div class="sim-card-label">' + Utils.escapeHtml(d.sim_plan_name || 'No Plan') + '</div>';
            html += '</div>';

            if (d.sim_plan_name) {
                html += '<div class="sim-plan">';
                html += '<div class="sim-plan-name">' + Utils.escapeHtml(d.sim_plan_name) + '</div>';
                if (d.data_per_day > 0) {
                    const used = d.data_used || 0;
                    const total = d.data_per_day;
                    const pct = Math.min(100, (used / total) * 100);
                    html += '<div class="sim-plan-detail">Data: ' + used.toFixed(1) + 'GB / ' + total + 'GB/day</div>';
                    html += '<div style="background:var(--bg4);height:6px;border-radius:3px;margin-top:6px"><div style="background:var(--accent);height:100%;width:' + pct + '%;border-radius:3px;transition:width .3s"></div></div>';
                } else {
                    html += '<div class="sim-plan-detail">Data: Unlimited</div>';
                }
                if (d.max_calls_week > 0) {
                    const callsUsed = d.calls_used || 0;
                    html += '<div class="sim-plan-detail">Calls: ' + callsUsed + ' / ' + d.max_calls_week + ' this week</div>';
                } else {
                    html += '<div class="sim-plan-detail">Calls: Unlimited</div>';
                }
                if (d.sim_expiry) {
                    html += '<div class="sim-plan-expiry">Expires: ' + new Date(d.sim_expiry).toLocaleDateString() + '</div>';
                }
                html += '</div>';
            }

            html += '<div class="section-title">Recharge Plans</div>';
            const plans = [
                { id: 'starter', name: 'Starter', price: 0, desc: '1GB/day, 500 calls/week, 7 days' },
                { id: 'basic', name: 'Basic', price: 500, desc: '2GB/day, 1000 calls/week, 7 days' },
                { id: 'premium', name: 'Premium', price: 1500, desc: '5GB/day, Unlimited calls, 30 days' },
                { id: 'ultimate', name: 'Ultimate', price: 3000, desc: 'Unlimited data & calls, 30 days' }
            ];
            plans.forEach(plan => {
                html += '<div class="sim-plan" style="cursor:pointer" onclick="SimApp.buyPlan(\'' + plan.id + '\')">';
                html += '<div style="display:flex;justify-content:space-between;align-items:center">';
                html += '<div><div class="sim-plan-name">' + plan.name + '</div><div class="sim-plan-detail">' + plan.desc + '</div></div>';
                html += '<div style="font-size:18px;font-weight:600;color:var(--green)">' + (plan.price === 0 ? 'Free' : '$' + plan.price) + '</div>';
                html += '</div></div>';
            });
        }
        c.innerHTML = html;
    },

    activate() {
        if (!App.data.has_phone) { Notification.show('You need a phone first!', 'error'); return; }
        Api.activateSim();
    },

    buyPlan(planId) {
        Modal.show({
            title: 'Buy Plan',
            text: 'Purchase this recharge plan?',
            buttons: [
                { text: 'Cancel', onClick: () => {} },
                { text: 'Buy', onClick: () => { Api.rechargePlan(planId); }}
            ]
        });
    }
};
