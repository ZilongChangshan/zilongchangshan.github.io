import { renderStats } from "./stats.js";
import { state, loadGame, saveGame } from './state.js';
import { elements, showToast, updateStatsUI } from './ui.js';
import { CROPS, ITEMS, MAX_ORDERS } from './data.js';
import { renderAchievements, checkAchievements } from './achievements.js';
import { renderStorage, updateStorageUI } from './storage.js';
import { renderOrders, updateOrdersUI, initOrdersDeps, checkOrders } from './orders.js';
import { initPetUI, updatePetUI, initPetDeps } from './pet.js';
import { renderFactory, updateFactoryUI, initFactoryDeps } from './factory.js';
import { renderShop, selectShopItem, initShopDeps } from './shop.js';
import {
    getMaxPlots, getLandCost, harvestCrop, harvestAll,
    plantCrop, plantAll, useFertilizer, fertilizeAll,
    cleanPlot, cleanAll, buyLand, buyDog, buyPetFood, initFarmDeps
} from './farm.js';
import { startLoop, checkOfflineProgress, updateEnvironment, initEngineDeps } from './engine.js';

function renderGrid() {
    elements.farmGrid.innerHTML = '';
    const ownedPlots = state.plots.filter(p => p.unlocked).length;
    const maxPlots = getMaxPlots();

    state.plots.forEach((plot, index) => {
        const card = document.createElement('div');
        card.className = 'plot-card';
        card.dataset.index = index;
        card.dataset.status = plot.status;

        card.onclick = () => handlePlotClick(index);

        if (!plot.unlocked) {
            card.classList.add('locked');
            if (ownedPlots < maxPlots) {
                card.innerHTML = '<div class="lock-icon">🔒</div><div class="lock-text">点击解锁</div>';
            } else {
                const nextUnlockLevel = (Math.floor((ownedPlots - 6)) + 1) * 3;
                card.innerHTML = `<div class="lock-icon" style="opacity:0.5">🔒</div><div class="lock-text" style="color:#666">Lv.${nextUnlockLevel}<br>解锁</div>`;
                card.style.cursor = 'not-allowed';
            }
            elements.farmGrid.appendChild(card);
            return;
        }

        const lvlBadge = document.createElement('div');
        lvlBadge.className = 'plot-level';
        lvlBadge.textContent = `Lv${plot.level}`;
        card.appendChild(lvlBadge);

        const emojiDiv = document.createElement('div');
        emojiDiv.className = 'crop-emoji';

        const statusText = document.createElement('div');
        statusText.className = 'status-text';

        const progressBar = document.createElement('div');
        progressBar.className = 'plot-progress-bar';
        const progressFill = document.createElement('div');
        progressFill.className = 'plot-progress-fill';
        progressBar.appendChild(progressFill);

        card.appendChild(emojiDiv);
        card.appendChild(progressBar);
        card.appendChild(statusText);
        elements.farmGrid.appendChild(card);
    });

    // Update all plots visual state
    state.plots.forEach((_, i) => updatePlotUI(i));
}

function updatePlotUI(index) {
    const plot = state.plots[index];
    const card = elements.farmGrid.children[index];
    if (!card) return;

    if (!plot.unlocked) return;
    if (card.classList.contains('locked')) {
        // Discrepancy: State says unlocked, but DOM says locked.
        // We shouldn't call renderGrid from inside updatePlotUI while renderGrid is looping over updatePlotUI.
        // Just let renderGrid handle it initially.
        return;
    }

    const emojiDiv = card.querySelector('.crop-emoji');
    const statusText = card.querySelector('.status-text');
    const progressBar = card.querySelector('.plot-progress-bar');
    const progressFill = card.querySelector('.plot-progress-fill');
    card.dataset.status = plot.status;

    const crop = plot.cropId ? CROPS[plot.cropId] : null;
    let isSick = plot.hasWeeds || plot.hasBugs;
    let sickColor = '#ff9800';

    if (plot.status === 'empty') {
        emojiDiv.textContent = '🕳️';
        statusText.textContent = '点击种植';
        statusText.style.color = '#aaa';
        card.style.borderColor = '#333';
        progressBar.style.display = 'none';
    } else if (plot.status === 'growing') {
        emojiDiv.textContent = crop ? crop.seedEmoji : '🌱';
        progressBar.style.display = 'block';

        const elapsed = Date.now() - plot.plantTime;
        const duration = plot.growthDuration || (crop ? crop.growthTime : 3000);
        const progress = Math.min(100, (elapsed / duration) * 100);
        progressFill.style.width = `${progress}%`;

        if (isSick) {
            statusText.textContent = plot.hasWeeds ? '🌿 除草' : '🐛 杀虫';
            statusText.style.color = sickColor;
            card.style.borderColor = sickColor;
        } else {
            statusText.textContent = '生长中...';
            statusText.style.color = '#aaa';
            card.style.borderColor = '#333';
        }
    } else if (plot.status === 'ready') {
        emojiDiv.textContent = crop ? crop.emoji : '❓';
        progressBar.style.display = 'none';

        if (isSick) {
            statusText.textContent = plot.hasWeeds ? '🌿 除草' : '🐛 杀虫';
            statusText.style.color = sickColor;
            card.style.borderColor = sickColor;
        } else {
            statusText.textContent = '点击收获';
            statusText.style.color = '#4CAF50';
            card.style.borderColor = '#4CAF50';
            statusText.style.fontWeight = 'bold';
        }
    }
}


export function openActionMenu(index) {
    const plot = state.plots[index];
    const crop = plot.cropId ? CROPS[plot.cropId] : null;

    elements.modalContent.icon.textContent = crop ? crop.emoji : '🕳️';
    elements.modalContent.name.textContent = crop ? `${crop.name} (Lv.${plot.level})` : `空土地 (Lv.${plot.level})`;

    // Reset displays
    elements.modalContent.btnPlant.style.display = 'none';
    elements.modalContent.btnFertilize.style.display = 'none';
    elements.modalContent.btnWeed.style.display = 'none';
    elements.modalContent.btnBug.style.display = 'none';
    elements.modalContent.btnHarvest.style.display = 'none';
    elements.modalContent.progressWrapper.style.display = 'none';
    elements.modalContent.timer.style.display = 'none';
    elements.modalContent.infoText.innerHTML = '';

    const updateModalData = () => {
        if (plot.status === 'empty') {
            if (state.selectedItemType === 'crop') {
                const seed = CROPS[state.selectedItemId];
                elements.modalContent.infoText.innerHTML = `装备中: ${seed.name} (消耗: ${seed.cost}💰)`;
                elements.modalContent.btnPlant.style.display = 'block';
                elements.modalContent.btnPlant.onclick = () => { plantCrop(index); openActionMenu(index); }; // Re-render modal state
            } else {
                elements.modalContent.infoText.innerHTML = '请在商店装备种子';
            }
        }
        else if (plot.status === 'growing') {
            elements.modalContent.progressWrapper.style.display = 'block';
            elements.modalContent.timer.style.display = 'block';

            const elapsed = Date.now() - plot.plantTime;
            const duration = plot.growthDuration || crop.growthTime;
            const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
            const progress = Math.min(100, (elapsed / duration) * 100);
            const totalTime = Math.ceil(duration / 1000);

            elements.modalContent.timer.innerHTML = `
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#ccc;">
                    <span>${remaining}s / ${totalTime}s</span>
                </div>
            `;
            elements.modalContent.progress.style.width = `${progress}%`;

            if (plot.hasWeeds) {
                elements.modalContent.btnWeed.style.display = 'block';
                elements.modalContent.btnWeed.onclick = () => { cleanPlot(index, 'weed'); openActionMenu(index); };
            } else if (plot.hasBugs) {
                elements.modalContent.btnBug.style.display = 'block';
                elements.modalContent.btnBug.onclick = () => { cleanPlot(index, 'bug'); openActionMenu(index); };
            } else {
                elements.modalContent.btnFertilize.style.display = 'block';
                elements.modalContent.btnFertilize.onclick = () => { useFertilizer(index); openActionMenu(index); };
            }
        }
        else if (plot.status === 'ready') {
            let projectedGold = Math.floor(crop.sellPrice * (state.market === 'boom' ? 1.5 : (state.market === 'crash' ? 0.8 : 1)));
            if (state.weather === 'rainbow') projectedGold *= 2;
            elements.modalContent.infoText.innerHTML = `预计收益: <span style="color:#FFD700">${projectedGold}💰</span> <span style="color:#00BCD4">+${crop.exp}⭐</span>`;

            if (plot.hasWeeds) {
                elements.modalContent.btnWeed.style.display = 'block';
                elements.modalContent.btnWeed.onclick = () => { cleanPlot(index, 'weed'); openActionMenu(index); };
            } else if (plot.hasBugs) {
                elements.modalContent.btnBug.style.display = 'block';
                elements.modalContent.btnBug.onclick = () => { cleanPlot(index, 'bug'); openActionMenu(index); };
            } else {
                elements.modalContent.btnHarvest.style.display = 'block';
                elements.modalContent.btnHarvest.onclick = () => { harvestCrop(index); closeModal(); };
            }
        }
    };

    updateModalData();

    // Positioning logic (simplified from before)
    elements.modal.style.opacity = '0';
    elements.modal.style.display = 'block';

    const modalWidth = elements.modal.offsetWidth;
    const modalHeight = elements.modal.offsetHeight;
    const card = elements.farmGrid.children[index];
    const rect = card.getBoundingClientRect();
    const windowWidth = window.innerWidth;

    let left = rect.left + (rect.width / 2) - (modalWidth / 2);
    if (left < 10) left = 10;
    if (left + modalWidth > windowWidth - 10) left = windowWidth - modalWidth - 10;

    const cardCenterX = rect.left + (rect.width / 2);
    let arrowLeft = ((cardCenterX - left) / modalWidth) * 100;
    arrowLeft = Math.max(10, Math.min(90, arrowLeft));

    let top = rect.top - modalHeight - 10;
    let isTop = true;
    if (top < 80) {
        top = rect.bottom + 10;
        isTop = false;
    }

    elements.modal.style.left = `${left}px`;
    elements.modal.style.top = `${top}px`;

    const content = elements.modal.querySelector('.modal-content');
    content.style.setProperty('--arrow-left', `${arrowLeft}%`);

    if (isTop) {
        content.classList.remove('arrow-top');
        content.classList.add('arrow-bottom');
    } else {
        content.classList.remove('arrow-bottom');
        content.classList.add('arrow-top');
    }

    elements.modal.style.opacity = '1';
    elements.backdrop.style.display = 'block';
    state.openModalIndex = index;
}

export function closeModal() {
    elements.modal.style.display = 'none';
    elements.backdrop.style.display = 'none';
    state.openModalIndex = undefined;
}


function handlePlotClick(index) {
    const plot = state.plots[index];
    if (!plot.unlocked) {
        const ownedPlots = state.plots.filter(p => p.unlocked).length;
        const maxPlots = getMaxPlots();
        if (ownedPlots < maxPlots) {
            buyLand(index);
        } else {
            const nextUnlockLevel = (Math.floor((ownedPlots - 6)) + 1) * 3;
            showToast(`等级不足！需达到 Lv.${nextUnlockLevel} 解锁更多土地`);
        }
        return;
    }

    // Always open Action Menu for unlocked plots
    openActionMenu(index);
}

function checkLevelUp() {
    if (state.exp >= state.nextLevelExp) {
        state.level++;
        state.exp -= state.nextLevelExp;
        state.nextLevelExp = Math.floor(state.nextLevelExp * 1.5);
        showToast(`🎉 升级了！当前等级 Lv.${state.level}`);
        renderShop();
        checkAchievements();
        checkControlButtonsUnlock();
    }
}

function checkControlButtonsUnlock() {
    if (elements.harvestAllBtn) {
        elements.harvestAllBtn.style.display = 'flex';
        if (state.level < 5) {
            elements.harvestAllBtn.style.opacity = '0.5';
            elements.harvestAllBtn.style.filter = 'grayscale(100%)';
            elements.harvestAllBtn.onclick = () => showToast("等级达到 Lv.5 解锁一键收获 🔒");
        } else {
            elements.harvestAllBtn.style.opacity = '1';
            elements.harvestAllBtn.style.filter = 'none';
            elements.harvestAllBtn.onclick = harvestAll;
        }
    }

    if (elements.plantAllBtn) {
        elements.plantAllBtn.style.display = 'flex';
        if (state.level < 5) {
            elements.plantAllBtn.style.opacity = '0.5';
            elements.plantAllBtn.style.filter = 'grayscale(100%)';
            elements.plantAllBtn.onclick = () => showToast("等级达到 Lv.5 解锁一键播种/施肥 🔒");
        } else {
            elements.plantAllBtn.style.opacity = '1';
            elements.plantAllBtn.style.filter = 'none';
            elements.plantAllBtn.onclick = state.selectedItemId === 'fertilizer' ? fertilizeAll : plantAll;
        }
    }

    if (elements.cleanAllBtn) {
        elements.cleanAllBtn.onclick = cleanAll;
    }
}

function setupTabs() {
    elements.tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            elements.tabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            elements.tabPanes.forEach(p => p.classList.remove('active'));
            document.getElementById(`${tabName}-tab`).classList.add('active');

            if (tabName === 'stats') renderStats(); // Wait, renderStats is missing. I need to copy it here or create stats.js
            if (tabName === 'achievements') renderAchievements();
            if (tabName === 'pet') updatePetUI();
            if (tabName === 'shop') {
                state.currentShopTab = 'seeds';
                switchShopTab('seeds');
            }
            if (tabName === 'storage') {
                state.currentStorageTab = 'inventory';
                switchStorageTab('inventory');
            }
            if (tabName === 'factory') updateFactoryUI();
        });
    });
}

function switchShopTab(tabName) {
    state.currentShopTab = tabName;
    elements.shopTabs.forEach(b => {
        if (b.dataset.shopTab === tabName) b.classList.add('active');
        else b.classList.remove('active');
    });
    renderShop();
}

function switchStorageTab(tabName) {
    state.currentStorageTab = tabName;
    elements.storageTabs.forEach(b => {
        if (b.dataset.storageTab === tabName) b.classList.add('active');
        else b.classList.remove('active');
    });

    document.getElementById('storage-inventory-view').style.display = tabName === 'inventory' ? 'flex' : 'none';
    document.getElementById('storage-orders-view').style.display = tabName === 'orders' ? 'flex' : 'none';

    if (tabName === 'inventory') updateStorageUI();
    if (tabName === 'orders') updateOrdersUI();
}

function init() {
    elements.backdrop.onclick = closeModal;
    // Inject dependencies to avoid circular imports
    initFarmDeps(checkLevelUp, renderShop, checkControlButtonsUnlock, updatePlotUI, renderGrid);
    initShopDeps(plantAll, fertilizeAll);
    initOrdersDeps(checkLevelUp);
    initFactoryDeps(checkLevelUp);
    initPetDeps(checkLevelUp);
    initEngineDeps(updatePlotUI, checkLevelUp);

    loadGame();
    checkOfflineProgress();
    updateEnvironment();
    checkOrders();

    renderGrid();
    renderShop();
    renderAchievements();
    updateStatsUI();

    setupTabs();

    elements.shopTabs.forEach(btn => {
        btn.addEventListener('click', () => switchShopTab(btn.dataset.shopTab));
    });

    elements.storageTabs.forEach(btn => {
        btn.addEventListener('click', () => switchStorageTab(btn.dataset.storageTab));
    });

    initPetUI();
    checkControlButtonsUnlock();
    startLoop();

    const initialId = state.selectedItemId || 'wheat';
    const type = CROPS[initialId] ? 'crop' : 'item';
    if (type === 'item') switchShopTab('items');
    selectShopItem(initialId, type);
}

// Ensure game starts
document.addEventListener('DOMContentLoaded', init);
