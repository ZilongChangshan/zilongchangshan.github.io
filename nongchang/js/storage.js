import { state, saveGame } from './state.js';
import { elements, showToast, updateStatsUI } from './ui.js';
import { getItemData } from './utils.js';

export function addToStorage(itemId, qty) {
    if (!state.storage) state.storage = {};
    if (!state.storage[itemId]) state.storage[itemId] = 0;
    state.storage[itemId] += qty;
    updateStorageUI();
    saveGame();
}

export function renderStorage() {
    if (!elements.storageList) return;
    elements.storageList.innerHTML = '';

    let totalVal = 0;
    let hasItems = false;

    Object.keys(state.storage).forEach(itemId => {
        const qty = state.storage[itemId];
        if (qty <= 0) return;
        hasItems = true;

        const itemData = getItemData(itemId);
        if (!itemData) return;

        let unitPrice = itemData.sellPrice;
        if (state.market === 'boom') unitPrice = Math.floor(unitPrice * 1.5);
        if (state.market === 'crash') unitPrice = Math.floor(unitPrice * 0.8);

        totalVal += unitPrice * qty;

        const itemNode = document.createElement('div');
        itemNode.className = 'storage-item';

        let trendIcon = '➖';
        let trendClass = 'trend-flat';
        if (state.market === 'boom') { trendIcon = '⬆️'; trendClass = 'trend-up'; }
        if (state.market === 'crash') { trendIcon = '⬇️'; trendClass = 'trend-down'; }

        itemNode.innerHTML = `
            <div class="storage-icon">${itemData.emoji}</div>
            <div class="storage-info">
                <span class="storage-name">${itemData.name}</span>
                <span class="storage-qty">库存: ${qty}</span>
            </div>
            <div class="storage-price">
                <span class="price-val">${unitPrice} 💰</span>
                <span class="price-trend ${trendClass}">${trendIcon}</span>
            </div>
            <div class="storage-actions">
                <button class="sell-btn sell-one-btn">卖 1</button>
                <button class="sell-btn sell-all-btn">卖全部</button>
            </div>
        `;

        itemNode.querySelector('.sell-one-btn').onclick = () => sellItem(itemId, 1);
        itemNode.querySelector('.sell-all-btn').onclick = () => sellItem(itemId, qty);

        elements.storageList.appendChild(itemNode);
    });

    if (!hasItems) {
        elements.storageList.innerHTML = '<p style="text-align:center; color:#666; margin-top:20px;">仓库是空的</p>';
        elements.sellAllGlobalBtn.textContent = '💰 一键卖出所有 (0)';
        elements.sellAllGlobalBtn.disabled = true;
        elements.sellAllGlobalBtn.style.opacity = '0.5';
    } else {
        elements.storageTotalVal.textContent = totalVal;
        elements.sellAllGlobalBtn.textContent = `💰 一键卖出所有 (${totalVal})`;
        elements.sellAllGlobalBtn.disabled = false;
        elements.sellAllGlobalBtn.style.opacity = '1';
        elements.sellAllGlobalBtn.onclick = sellAllGlobal;
    }
}

export function updateStorageUI() {
    if (elements.storageTab && elements.storageTab.classList.contains('active') && state.currentStorageTab === 'inventory') {
        renderStorage();
    }
}

export function sellItem(itemId, qty) {
    if (!state.storage[itemId] || state.storage[itemId] < qty) return;

    const itemData = getItemData(itemId);
    let unitPrice = itemData.sellPrice;
    if (state.market === 'boom') unitPrice = Math.floor(unitPrice * 1.5);
    if (state.market === 'crash') unitPrice = Math.floor(unitPrice * 0.8);

    const totalGain = unitPrice * qty;

    state.storage[itemId] -= qty;
    state.gold += totalGain;
    state.stats.totalGold += totalGain;

    showToast(`卖出 ${qty} 个 ${itemData.name}, 获得 ${totalGain} 💰`);
    updateStatsUI();
    updateStorageUI();
    saveGame();
}

export function sellAllGlobal() {
    let totalGain = 0;
    let count = 0;

    Object.keys(state.storage).forEach(itemId => {
        const qty = state.storage[itemId];
        if (qty > 0) {
            const itemData = getItemData(itemId);
            let unitPrice = itemData.sellPrice;
            if (state.market === 'boom') unitPrice = Math.floor(unitPrice * 1.5);
            if (state.market === 'crash') unitPrice = Math.floor(unitPrice * 0.8);

            totalGain += unitPrice * qty;
            state.storage[itemId] = 0;
            count += qty;
        }
    });

    if (count > 0) {
        state.gold += totalGain;
        state.stats.totalGold += totalGain;
        showToast(`一键卖出 ${count} 个物品, 获得 ${totalGain} 💰`);
        updateStatsUI();
        updateStorageUI();
        saveGame();
    }
}
