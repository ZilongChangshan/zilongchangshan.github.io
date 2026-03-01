import { state } from './state.js';

export const elements = {
    gold: document.getElementById('gold'),
    level: document.getElementById('level'),
    exp: document.getElementById('exp'),
    expFill: document.getElementById('exp-fill'),
    maxExp: document.getElementById('max-exp'),
    farmGrid: document.getElementById('farm-grid'),
    shopItems: document.getElementById('shop-items'),
    tabs: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    shopTabs: document.querySelectorAll('.secondary-tab-btn[data-shop-tab]'),
    storageTabs: document.querySelectorAll('.secondary-tab-btn[data-storage-tab]'),
    weatherDisplay: document.getElementById('weather-display'),
    marketDisplay: document.getElementById('market-display'),
    weatherOverlay: document.getElementById('weather-overlay'),
    toast: document.getElementById('message-toast'),
    statsTab: document.getElementById('stats-tab'),
    achievementsTab: document.getElementById('achievements-tab'),

    petTab: document.getElementById('pet-tab'),
    petContent: document.getElementById('pet-content'),
    petUnlockMsg: document.getElementById('pet-unlock-msg'),
    petEnergyFill: document.getElementById('pet-energy-fill'),
    petMoodFill: document.getElementById('pet-mood-fill'),
    petEnergyText: document.getElementById('pet-energy-text'),
    petMoodText: document.getElementById('pet-mood-text'),
    adventureStatus: document.getElementById('adventure-status'),
    adventureTimer: document.getElementById('adventure-timer'),
    adventureBtn: document.getElementById('adventure-btn'),
    adventureLog: document.getElementById('adventure-log'),

    storageTab: document.getElementById('storage-tab'),
    storageList: document.getElementById('storage-list'),
    storageTotalVal: document.getElementById('storage-total-val'),
    sellAllGlobalBtn: document.getElementById('sell-all-global-btn'),
    ordersList: document.getElementById('orders-list'),

    factoryTab: document.getElementById('factory-tab'),
    factoryQueue: document.getElementById('factory-queue'),
    recipeList: document.getElementById('recipe-list'),

    modal: document.getElementById('plot-modal'),
    backdrop: document.getElementById('modal-backdrop'),
    modalContent: {
        icon: document.getElementById('modal-crop-icon'),
        name: document.getElementById('modal-crop-name'),
        timer: document.getElementById('modal-timer'),
        progress: document.getElementById('modal-progress-bar'),
        btnPlant: document.getElementById('modal-btn-plant'),
        btnFertilize: document.getElementById('modal-btn-fertilize'),
        btnWeed: document.getElementById('modal-btn-weed'),
        btnBug: document.getElementById('modal-btn-bug'),
        btnHarvest: document.getElementById('modal-btn-harvest'),
        progressWrapper: document.getElementById('modal-progress-wrapper'),
        infoText: document.getElementById('modal-info-text')
    },
    harvestAllBtn: document.getElementById('harvest-all-btn'),
    plantAllBtn: document.getElementById('plant-all-btn'),
    cleanAllBtn: document.getElementById('clean-all-btn')
};

export function showToast(msg) {
    elements.toast.textContent = msg;
    elements.toast.classList.add('show');
    setTimeout(() => { elements.toast.classList.remove('show'); }, 2000);
}

export function showFloatingText(index, text, color) {
    const card = elements.farmGrid.children[index];
    if (!card) return;
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.textContent = text;
    if (color === 'red') el.style.color = '#ff4444';
    if (color === 'yellow') el.style.color = '#FFD700';
    if (color === 'green') el.style.color = '#4CAF50';
    card.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

export function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s}s`;
}

export function updateStatsUI() {
    elements.gold.textContent = state.gold;
    elements.level.textContent = state.level;
    elements.exp.textContent = state.exp;
    const percentage = Math.min(100, (state.exp / state.nextLevelExp) * 100);
    elements.expFill.style.width = `${percentage}%`;
    elements.maxExp.textContent = state.nextLevelExp;
}
