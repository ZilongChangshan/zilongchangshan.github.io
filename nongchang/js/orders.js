import { state, saveGame } from './state.js';
import { elements, showToast, updateStatsUI } from './ui.js';
import { getItemData } from './utils.js';
import { CROPS, PRODUCTS, MAX_ORDERS } from './data.js';
import { updateStorageUI } from './storage.js';

export function generateOrder() {
    if (state.orders.length >= MAX_ORDERS) return;

    let possibleItems = Object.values(CROPS).filter(c => state.level >= c.minLevel);
    if (state.level >= 5) {
        possibleItems = possibleItems.concat(Object.values(PRODUCTS));
    }
    if (possibleItems.length === 0) return;

    const itemData = possibleItems[Math.floor(Math.random() * possibleItems.length)];
    const qty = Math.floor(Math.random() * 5) + 3 + Math.floor(state.level / 2);

    const reward = Math.floor(itemData.sellPrice * qty * 1.5);

    const order = {
        id: Date.now() + Math.random(),
        cropId: itemData.id, // Keeping cropId name for backward compatibility
        qty: qty,
        reward: reward,
        time: Date.now(),
        expires: Date.now() + 300000
    };

    state.orders.push(order);
    showToast(`📜 新订单: ${itemData.name} x${qty}`);
    updateOrdersUI();
    saveGame();
}

export function checkOrders() {
    const now = Date.now();
    const initialLen = state.orders.length;
    state.orders = state.orders.filter(o => now < o.expires);

    if (state.orders.length < initialLen) {
        updateOrdersUI();
    }

    if (state.orders.length < MAX_ORDERS && Math.random() < 0.02) {
        generateOrder();
    }
}

export function rejectOrder(orderId) {
    const orderIndex = state.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;

    state.orders.splice(orderIndex, 1);
    showToast("🗑️ 订单已拒绝");
    updateOrdersUI();
    saveGame();
}

export function fulfillOrder(orderId, checkLevelUp) { // Pass checkLevelUp to avoid circular dep for now
    const orderIndex = state.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;

    const order = state.orders[orderIndex];

    if ((state.storage[order.cropId] || 0) >= order.qty) {
        state.storage[order.cropId] -= order.qty;
        state.gold += order.reward;
        state.stats.totalGold += order.reward;

        state.exp += Math.floor(order.reward / 10);

        state.orders.splice(orderIndex, 1);

        showToast(`✅ 订单完成! 获得 ${order.reward} 💰`);
        if (navigator.vibrate) navigator.vibrate(100);

        if(checkLevelUp) checkLevelUp();
        updateStatsUI();
        updateStorageUI();
        updateOrdersUI();
        saveGame();
    } else {
        showToast("库存不足! 📦");
    }
}

export function renderOrders(checkLevelUp) {
    const container = elements.ordersList;
    if (!container) return;

    container.innerHTML = '';
    if (state.orders.length === 0) {
        container.innerHTML = '<div style="color:#666; font-size:0.8rem; text-align:center; padding:10px;">暂无订单 (等待刷新...)</div>';
        return;
    }

    state.orders.forEach(order => {
        const itemData = getItemData(order.cropId);
        if(!itemData) return;
        const hasEnough = (state.storage[order.cropId] || 0) >= order.qty;

        const div = document.createElement('div');
        div.className = 'order-card';
        div.style.cssText = 'background:#252525; padding:8px; margin-bottom:5px; border-radius:6px; display:flex; justify-content:space-between; align-items:center; border:1px solid #444;';

        const timeLeft = Math.max(0, Math.ceil((order.expires - Date.now()) / 1000));

        div.innerHTML = `
            <div>
                <div style="font-weight:bold; font-size:0.9rem;">${itemData.emoji} ${itemData.name} x${order.qty}</div>
                <div style="font-size:0.75rem; color:#aaa;">奖励: <span style="color:#FFD700">${order.reward}💰</span> ⏳${timeLeft}s</div>
            </div>
            <div style="display:flex; gap:5px;">
                <button class="action-btn-reject" data-id="${order.id}" style="padding:4px 8px; font-size:0.8rem; background-color:#ff4444; color:white; border:none; border-radius:4px; cursor:pointer;">
                    🗑️
                </button>
                <button class="action-btn-order" data-id="${order.id}" style="width:auto; padding:4px 8px; font-size:0.8rem; background-color:${hasEnough ? '#4CAF50' : '#555'}; color:white; border:none; border-radius:4px; cursor:pointer;" ${hasEnough ? '' : 'disabled'}>
                    ${hasEnough ? '提交' : '缺货'}
                </button>
            </div>
        `;

        div.querySelector('.action-btn-reject').onclick = () => rejectOrder(order.id);
        if (hasEnough) {
            div.querySelector('.action-btn-order').onclick = () => fulfillOrder(order.id, checkLevelUp);
        }

        container.appendChild(div);
    });
}

// We need a global var or parameter trick to break circular dep with main.js `checkLevelUp`
let _checkLevelUp = null;
export function initOrdersDeps(checkLevelUpFn) {
    _checkLevelUp = checkLevelUpFn;
}

export function updateOrdersUI() {
    if (elements.storageTab && elements.storageTab.classList.contains('active') && state.currentStorageTab === 'orders') {
        renderOrders(_checkLevelUp);
    }
}
