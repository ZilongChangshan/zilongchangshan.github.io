document.addEventListener('DOMContentLoaded', () => {
    // Game Data
    const CROPS = {
        rice: { id: 'rice', name: '水稻', emoji: '🌾', seedEmoji: '🌱', cost: 15, sellPrice: 20, growthTime: 4000, exp: 3, minLevel: 2, desc: '雨天生长极快' },
        rose: { id: 'rose', name: '玫瑰', emoji: '🌹', seedEmoji: '🌱', cost: 500, sellPrice: 1200, growthTime: 60000, exp: 60, minLevel: 7, desc: '美丽的爱情象征' },

        wheat: { id: 'wheat', name: '小麦', emoji: '🌾', seedEmoji: '🌱', cost: 10, sellPrice: 15, growthTime: 3000, exp: 2, minLevel: 1 },
        corn: { id: 'corn', name: '玉米', emoji: '🌽', seedEmoji: '🌱', cost: 20, sellPrice: 35, growthTime: 5000, exp: 4, minLevel: 2 },
        carrot: { id: 'carrot', name: '胡萝卜', emoji: '🥕', seedEmoji: '🌱', cost: 30, sellPrice: 55, growthTime: 8000, exp: 6, minLevel: 3 },
        potato: { id: 'potato', name: '土豆', emoji: '🥔', seedEmoji: '🌱', cost: 50, sellPrice: 90, growthTime: 12000, exp: 10, minLevel: 4 },
        tomato: { id: 'tomato', name: '番茄', emoji: '🍅', seedEmoji: '🌱', cost: 100, sellPrice: 180, growthTime: 20000, exp: 15, minLevel: 5 },
        strawberry: { id: 'strawberry', name: '草莓', emoji: '🍓', seedEmoji: '🌱', cost: 200, sellPrice: 380, growthTime: 45000, exp: 25, minLevel: 6 },
        pumpkin: { id: 'pumpkin', name: '南瓜', emoji: '🎃', seedEmoji: '🌱', cost: 500, sellPrice: 1000, growthTime: 90000, exp: 50, minLevel: 8 },
        sunflower: { id: 'sunflower', name: '向日葵', emoji: '🌻', seedEmoji: '🌱', cost: 1000, sellPrice: 2500, growthTime: 300000, exp: 100, minLevel: 10 },
        grapes: { id: 'grapes', name: '葡萄', emoji: '🍇', seedEmoji: '🌱', cost: 2000, sellPrice: 4500, growthTime: 120000, exp: 80, minLevel: 12 },
        melon: { id: 'melon', name: '甜瓜', emoji: '🍈', seedEmoji: '🌱', cost: 5000, sellPrice: 12000, growthTime: 300000, exp: 200, minLevel: 15 },
        clover: { id: 'clover', name: '幸运草', emoji: '🍀', seedEmoji: '🌱', cost: 300, sellPrice: 10, growthTime: 60000, exp: 50, minLevel: 5, desc: '低售价，高几率掉落宝物' },
        magic_bean: { id: 'magic_bean', name: '魔豆', emoji: '🫘', seedEmoji: '✨', cost: 10000, sellPrice: 0, growthTime: 600000, exp: 5000, minLevel: 20, desc: '不值钱，但蕴含巨量经验' }
    ,
        apple_tree: { id: 'apple_tree', name: '苹果树', emoji: '🍎', seedEmoji: '🌳', cost: 2000, sellPrice: 500, growthTime: 180000, exp: 100, minLevel: 10, desc: '多次收获，无需重种', isTree: true }
    };



    const PRODUCTS = {
        bread: { id: 'bread', name: '面包', emoji: '🍞', sellPrice: 60, exp: 15, craftTime: 10000 },
        fries: { id: 'fries', name: '薯条', emoji: '🍟', sellPrice: 200, exp: 40, craftTime: 20000 },
        ketchup: { id: 'ketchup', name: '番茄酱', emoji: '🥫', sellPrice: 400, exp: 80, craftTime: 30000 },
        wine: { id: 'wine', name: '葡萄酒', emoji: '🍷', sellPrice: 10000, exp: 500, craftTime: 120000 }
    };

    const RECIPES = {
        bread: { wheat: 3 },
        fries: { potato: 2 },
        ketchup: { tomato: 2 },
        wine: { grapes: 2 }
    };

    const ITEMS = {
        fertilizer: { id: 'fertilizer', name: '强力化肥', emoji: '⚡', cost: 50, desc: '立刻成熟', type: 'item' },
        dog: { id: 'dog', name: '看门狗', emoji: '🐕', cost: 1000, desc: '自动捡钱 & 防虫', type: 'pet', max: 1 },
        pet_food: { id: 'pet_food', name: '高级狗粮', emoji: '🍖', cost: 50, desc: '恢复 50 体力', type: 'item' }
    };

    const ACHIEVEMENTS = [
        { id: 'first_harvest', name: '初次收获', desc: '收获第一个作物', check: (s) => s.stats.cropsHarvested >= 1, reward: 50 },
        { id: 'novice_farmer', name: '新手农夫', desc: '收获 50 个作物', check: (s) => s.stats.cropsHarvested >= 50, reward: 200 },
        { id: 'expert_farmer', name: '种植专家', desc: '收获 500 个作物', check: (s) => s.stats.cropsHarvested >= 500, reward: 1000 },
        { id: 'wealthy', name: '小有资产', desc: '累计获得 1,000 金币', check: (s) => s.stats.totalGold >= 1000, reward: 500 },
        { id: 'millionaire', name: '百万富翁', desc: '累计获得 10,000 金币', check: (s) => s.stats.totalGold >= 10000, reward: 5000 },
        { id: 'land_owner', name: '大地主', desc: '解锁 15 块土地', check: (s) => s.plots.filter(p => p.unlocked).length >= 15, reward: 1000 },
        { id: 'master_level', name: '大师等级', desc: '达到等级 5', check: (s) => s.level >= 5, reward: 800 },
        { id: 'grand_master', name: '传奇农场主', desc: '达到等级 10', check: (s) => s.level >= 10, reward: 2000 }
    ];

    const LAND_COST_BASE = 100;
    const LAND_COST_MULTIPLIER = 1.3;
    const GAME_VERSION = "2026.02.26.1";

    // Game State
    let state = {
        gold: 100,
        storage: {},
        orders: [],
        factory: [], // list of active crafting tasks // cropId -> quantity

        pet: {
            unlocked: false,
            energy: 100,
            mood: 100,
            level: 1,
            exp: 0,
            adventureEndTime: 0,
            adventureStatus: 'idle', // 'idle', 'exploring'
            logs: []
        },
        startTime: Date.now(),
        lastSaveTime: Date.now(),
        level: 1,
        exp: 0,
        nextLevelExp: 100,
        selectedItemId: 'wheat', // Renamed from selectedCropId, keeps backwards compatibility logic below
        selectedItemType: 'crop', // 'crop' or 'item'
        stats: {
            cropsHarvested: 0,
            totalGold: 0,
            adsWatched: 0
        },
        combo: 0,
        lastHarvestTime: 0,
        lastDailyReward: 0,
        weather: 'sunny', // sunny, rainy, rainbow
        market: 'normal', // normal, boom, crash
        hasDog: false,
        achievements: [], // List of unlocked achievement IDs
        plots: Array(25).fill(null).map((_, i) => {
            const row = Math.floor(i / 5);
            const col = i % 5;
            const isCenter = row >= 1 && row <= 2 && col >= 1 && col <= 3; // Initial 6 plots (2x3)
            return {
                id: i,
                status: 'empty',
                cropId: null,
                plantTime: 0,
                level: 1,
                unlocked: isCenter
            };
        })
    };

    // DOM Elements
    const elements = {
        gold: document.getElementById('gold'),
        level: document.getElementById('level'),
        exp: document.getElementById('exp'),
        expFill: document.getElementById('exp-fill'),
        maxExp: document.getElementById('max-exp'),
        farmGrid: document.getElementById('farm-grid'),
        shopItems: document.getElementById('shop-items'),
        tabs: document.querySelectorAll('.tab-btn'),
        tabPanes: document.querySelectorAll('.tab-pane'),
        shopTabs: document.querySelectorAll('.secondary-tab-btn'),
        weatherDisplay: document.getElementById('weather-display'), // New
        marketDisplay: document.getElementById('market-display'),   // New
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


        modal: document.getElementById('plot-modal'),
        backdrop: document.getElementById('modal-backdrop'),
        modalContent: {
            icon: document.getElementById('modal-crop-icon'),
            name: document.getElementById('modal-crop-name'),
            // status: document.getElementById('modal-status'), // Removed in compact view
            timer: document.getElementById('modal-timer'),
            progress: document.getElementById('modal-progress-bar'),
            actionBtn: document.getElementById('modal-action-btn')
        },
        harvestAllBtn: null,
        plantAllBtn: null
    };

    const ENV_CONFIG = {
        sunny: { name: '晴朗', emoji: '☀️', effect: '作物生长正常' },
        rainy: { name: '小雨', emoji: '🌧️', effect: '生长速度 +30%' },
        rainbow: { name: '彩虹', emoji: '🌈', effect: '收获奖励 x2' },
        normal: { name: '平稳', emoji: '⚖️', effect: '物价正常' },
        boom: { name: '繁荣', emoji: '📈', effect: '售价 +50%' },
        crash: { name: '萧条', emoji: '📉', effect: '售价 -20%' }
    };

    // UI State
    let currentShopTab = 'seeds';
    let currentStorageTab = 'inventory'; // 'seeds' or 'items'

    // Save/Load
    function saveGame() {
        state.lastSaveTime = Date.now();
        localStorage.setItem('nongchang_save_v3', JSON.stringify(state));
    }

    function loadGame() {
        const saved = localStorage.getItem('nongchang_save_v3');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Migration: selectedCropId -> selectedItemId
                if (parsed.selectedCropId && !parsed.selectedItemId) {
                    parsed.selectedItemId = parsed.selectedCropId;
                    parsed.selectedItemType = 'crop';
                    delete parsed.selectedCropId;
                }

                state = { ...state, ...parsed };
                // Ensure defaults
                if (!state.selectedItemType) state.selectedItemType = 'crop';
                if (!state.stats) state.stats = { cropsHarvested: 0, totalGold: 0, adsWatched: 0 };
                if (!state.achievements) state.achievements = [];
                if (!state.startTime) state.startTime = Date.now();
                if (!state.lastSaveTime) state.lastSaveTime = Date.now();

                if (state.plots.length !== 25) {
                     const newPlots = Array(25).fill(null).map((_, i) => {
                         const row = Math.floor(i / 5);
                         const col = i % 5;
                         const isCenter = row >= 1 && row <= 2 && col >= 1 && col <= 3;
                         return { id: i, status: 'empty', cropId: null, plantTime: 0, level: 1, unlocked: isCenter };
                     });
                     // Try to migrate old plots if possible, or just reset
                     state.plots = newPlots;
                }
            } catch (e) { console.error("Save error", e); }
        }
    }

    // Initialization
    function init() {
        loadGame();
        checkDailyReward();
        checkOfflineProgress();
        setupControlButtons();
        setupModal();
        updateEnvironment();
            checkOrders(); // Deterministic check
        renderGrid();
        // Refresh UI for all plots to show loaded weeds/bugs
        state.plots.forEach((_, i) => updatePlotUI(i));

        renderShop();
        renderStats();
        renderAchievements();
        updateStatsUI();
        setupTabs();
        setupShopTabs();
        setupStorageTabs();
        initPetUI();
        startLoop();

        // Select initial item
        const initialId = state.selectedItemId || 'wheat';
        const type = CROPS[initialId] ? 'crop' : 'item';
        // Auto switch tab if item selected
        if (type === 'item') switchShopTab('items');
        selectShopItem(initialId, type);
    }

    function checkDailyReward() {
        const now = Date.now();
        const lastReward = state.lastDailyReward || 0;
        const oneDay = 24 * 60 * 60 * 1000;

        // Simple day check (midnight UTC-ish or just 24h)
        // Let's use local date string to be more user-friendly
        const lastDate = new Date(lastReward).toDateString();
        const todayDate = new Date(now).toDateString();

        if (lastDate !== todayDate) {
            const reward = 100 + (state.level * 20);
            state.gold += reward;
            state.lastDailyReward = now;
            showToast(`📅 每日签到！获得 ${reward} 💰`);
            saveGame();
        }
    }


    function checkOfflineProgress() {
        const now = Date.now();
        const lastSave = state.lastSaveTime || now;
        const elapsed = now - lastSave;

        let offlineMsgs = [];
        let readyCount = 0;

        // 1. Crops
        state.plots.forEach(plot => {
            if (plot.status === 'growing') {
                const crop = CROPS[plot.cropId];
                if (crop && (now - plot.plantTime >= (plot.growthDuration || crop.growthTime))) {
                    plot.status = 'ready';
                    updatePlotUI(plot.id);
                    readyCount++;
                }
            }
        });
        if (readyCount > 0) offlineMsgs.push(`🌾 ${readyCount} 个作物已成熟`);

        // 2. Pet Energy
        if (state.pet && state.pet.unlocked && state.pet.energy < PET_CONFIG.maxEnergy) {
            const ticks = Math.floor(elapsed / 100); // Because loop runs every 100ms
            const recovered = (ticks * (PET_CONFIG.energyRegen * 0.5));
            state.pet.energy = Math.min(PET_CONFIG.maxEnergy, state.pet.energy + recovered);
            if (recovered >= 10) offlineMsgs.push(`🐕 旺财恢复了体力`);
        }

        // 3. Factory Queue (Simulated rapid processing)
        if (state.factory && state.factory.length > 0) {
            let remainingOfflineTime = elapsed;
            let craftedCount = 0;

            while (state.factory.length > 0 && remainingOfflineTime > 0) {
                const task = state.factory[0];
                const taskElapsed = now - task.startTime; // Time since task started

                // If the time since the task started is greater than its duration
                if (taskElapsed >= task.duration) {
                    addToStorage(task.productId, task.qty);
                    state.exp += task.exp * task.qty;
                    craftedCount++;

                    // Deduct the time spent on this task
                    remainingOfflineTime -= task.duration;

                    state.factory.shift(); // Remove task

                    if (state.factory.length > 0) {
                        // Next task theoretically started when the previous one finished
                        state.factory[0].startTime = now - remainingOfflineTime;
                    }
                } else {
                    break; // Current task isn't finished yet
                }
            }
            if (craftedCount > 0) offlineMsgs.push(`👨‍🍳 加工坊完成了 ${craftedCount} 个订单`);
        }

        if (offlineMsgs.length > 0) {
            setTimeout(() => {
                showToast(`离线收益:\n` + offlineMsgs.join('\n'));
            }, 1000);
        }
    }

    function setupControlButtons() {
        // Harvest All
        let hBtn = document.getElementById('harvest-all-btn');
        if (hBtn) {
            hBtn.onclick = harvestAll;
            elements.harvestAllBtn = hBtn;
        }

        // Plant All
        let pBtn = document.getElementById('plant-all-btn');
        if (pBtn) {
            pBtn.onclick = plantAll;
            elements.plantAllBtn = pBtn;
        }

        checkControlButtonsUnlock();
    }

    // Tabs
    function setupTabs() {
        elements.tabs.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                elements.tabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                elements.tabPanes.forEach(p => p.classList.remove('active'));
                document.getElementById(`${tabName}-tab`).classList.add('active');


                if (tabName === 'stats') renderStats();
                if (tabName === 'achievements') renderAchievements();
                if (tabName === 'pet') updatePetUI();
                if (tabName === 'shop') switchShopTab('seeds');
                if (tabName === 'storage') switchStorageTab('inventory');
                if (tabName === 'factory') updateFactoryUI();

            });
        });
    }


    function setupStorageTabs() {
        const storageTabsBtn = document.querySelectorAll('.secondary-tab-btn[data-storage-tab]');
        storageTabsBtn.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.storageTab;
                switchStorageTab(tabName);
            });
        });
    }

    function switchStorageTab(tabName) {
        currentStorageTab = tabName;
        const storageTabsBtn = document.querySelectorAll('.secondary-tab-btn[data-storage-tab]');
        storageTabsBtn.forEach(b => {
            if (b.dataset.storageTab === tabName) b.classList.add('active');
            else b.classList.remove('active');
        });

        document.getElementById('storage-inventory-view').style.display = tabName === 'inventory' ? 'flex' : 'none';
        document.getElementById('storage-orders-view').style.display = tabName === 'orders' ? 'flex' : 'none';

        if (tabName === 'inventory') renderStorage();
        if (tabName === 'orders') renderOrders();
    }

    function setupShopTabs() {
        elements.shopTabs.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.shopTab;
                switchShopTab(tabName);
            });
        });
    }

    function switchShopTab(tabName) {
        currentShopTab = tabName;
        elements.shopTabs.forEach(b => {
            if (b.dataset.shopTab === tabName) b.classList.add('active');
            else b.classList.remove('active');
        });
        renderShop();
    }

    function setupModal() {
        elements.backdrop.onclick = () => {
            closeModal();
        };
    }

    function closeModal() {
        elements.modal.style.display = 'none';
        elements.backdrop.style.display = 'none';
        state.openModalIndex = undefined;
    }

    function openPlotModal(index) {
        const plot = state.plots[index];
        const crop = CROPS[plot.cropId];
        if (!crop) return;

        // Populate Info
        elements.modalContent.icon.textContent = crop.emoji;
        elements.modalContent.name.textContent = `${crop.name} (Lv.${plot.level})`;

        const updateModal = () => {
            if (plot.status !== 'growing') {
                closeModal();
                return;
            }

            const elapsed = Date.now() - plot.plantTime;
            const duration = plot.growthDuration || crop.growthTime;
            const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
            const progress = Math.min(100, (elapsed / duration) * 100);

            // Rich Info Text
            let projectedGold = Math.floor(crop.sellPrice * (state.market === 'boom' ? 1.5 : (state.market === 'crash' ? 0.8 : 1)));
            if (state.weather === 'rainbow') projectedGold *= 2;

            const totalTime = Math.ceil(duration / 1000);
            const statusText = plot.hasBugs || plot.hasWeeds ? '<span style="color:#ff9800">需照料</span>' : '<span style="color:#4CAF50">生长中</span>';

            elements.modalContent.timer.innerHTML = `
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#ccc; margin-bottom:4px;">
                    <span>${statusText}</span>
                    <span>${remaining}s / ${totalTime}s</span>
                </div>
                <div style="font-size:0.75rem; color:#aaa;">
                    预计: <span style="color:#FFD700">${projectedGold}💰</span> <span style="color:#00BCD4">+${crop.exp}⭐</span>
                </div>
            `;
            elements.modalContent.progress.style.width = `${progress}%`;

            // Action Button Logic
            const fertilizer = ITEMS['fertilizer'];
            elements.modalContent.actionBtn.textContent = `⚡ 加速 (${fertilizer.cost}💰)`;
            elements.modalContent.actionBtn.onclick = () => {
                useFertilizer(index);
                closeModal();
            };
        };

        // Render content first to measure size
        updateModal();

        // Show temporarily to measure (opacity 0 to avoid jump)
        elements.modal.style.opacity = '0';
        elements.modal.style.display = 'block';

        // Dynamic Measurement
        const modalWidth = elements.modal.offsetWidth;
        const modalHeight = elements.modal.offsetHeight;

        const card = elements.farmGrid.children[index];
        const rect = card.getBoundingClientRect();
        const windowWidth = window.innerWidth;

        // Horizontal Positioning
        let left = rect.left + (rect.width / 2) - (modalWidth / 2);

        // Clamp Left
        if (left < 10) left = 10;
        if (left + modalWidth > windowWidth - 10) left = windowWidth - modalWidth - 10;

        // Calculate Arrow Position
        // Arrow should point to the center of the card
        const cardCenterX = rect.left + (rect.width / 2);
        const modalLeftX = left;
        const arrowOffsetX = cardCenterX - modalLeftX;
        let arrowLeft = (arrowOffsetX / modalWidth) * 100;

        // Arrow Clamp
        arrowLeft = Math.max(10, Math.min(90, arrowLeft));

        // Vertical Positioning
        let top = rect.top - modalHeight - 10; // 10px spacing
        let isTop = true; // Modal is ABOVE the slot (arrow at bottom)

        // If too close to top (header area approx 60px + margin)
        if (top < 80) {
            top = rect.bottom + 10;
            isTop = false; // Modal is BELOW the slot (arrow at top)
        }

        // Apply Styles
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

        // Make visible
        elements.modal.style.opacity = '1';
        elements.backdrop.style.display = 'block';
        state.openModalIndex = index; // Track open modal
    }

    // Stats & Achievements
    function formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m ${s}s`;
    }

    function renderStats() {
        const playTime = formatTime(Date.now() - state.startTime);
        const landCount = state.plots.filter(p => p.unlocked).length;

        const statsData = [
            { icon: '🌾', label: '收获作物', value: state.stats.cropsHarvested },
            { icon: '💰', label: '累计金币', value: state.stats.totalGold },
            { icon: '🏞️', label: '拥有土地', value: `${landCount} / 25` },
            { icon: '⏳', label: '游玩时间', value: playTime },
            { icon: '⭐', label: '当前等级', value: `Lv.${state.level}` },
            { icon: 'ℹ️', label: '游戏版本', value: GAME_VERSION }
        ];

        let html = '<div class="stats-list">';
        statsData.forEach(item => {
            html += `
                <div class="stats-item">
                    <div class="stats-icon">${item.icon}</div>
                    <div class="stats-info">
                        <div class="stats-label">${item.label}</div>
                        <div class="stats-value">${item.value}</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        elements.statsTab.innerHTML = html;
    }

    function renderAchievements() {
        elements.achievementsTab.innerHTML = '';
        const list = document.createElement('div');
        list.className = 'achievement-list';

        ACHIEVEMENTS.forEach(ach => {
            const isUnlocked = state.achievements.includes(ach.id);
            const item = document.createElement('div');
            item.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;

            item.innerHTML = `
                <div class="ach-icon">${isUnlocked ? '🏆' : '🔒'}</div>
                <div class="ach-info">
                    <div class="ach-name">${ach.name}</div>
                    <div class="ach-desc">${ach.desc}</div>
                    ${!isUnlocked ? `<div class="ach-reward">奖励: ${ach.reward}💰</div>` : '<div class="ach-reward">已领取</div>'}
                </div>
            `;
            list.appendChild(item);
        });
        elements.achievementsTab.appendChild(list);
    }

    function checkAchievements() {
        let changed = false;
        ACHIEVEMENTS.forEach(ach => {
            if (!state.achievements.includes(ach.id)) {
                if (ach.check(state)) {
                    state.achievements.push(ach.id);
                    state.gold += ach.reward;
                    showToast(`🏆 解锁成就: ${ach.name} (+${ach.reward}💰)`);
                    changed = true;
                }
            }
        });
        if (changed) {
            updateStatsUI();
            saveGame();
        }
    }

    // Core Gameplay Modifications
        function harvestCrop(index) {
        if (navigator.vibrate) navigator.vibrate(50);
        const plot = state.plots[index];
        const crop = CROPS[plot.cropId];

        // Events & Bonus Gold (Direct)
        let bonusGold = 0;

        // Random Event: Golden Crop (5% chance)
        let isGolden = Math.random() < 0.05;
        if (isGolden) {
            bonusGold += crop.sellPrice; // Bonus equal to base price
            showToast("✨ 发现金灿灿的作物！获得额外金币奖励！");
        }

        // Combo Logic
        const now = Date.now();
        if (now - state.lastHarvestTime < 2000) {
            state.combo++;
        } else {
            state.combo = 1;
        }
        state.lastHarvestTime = now;

        if (state.combo >= 5) {
            const comboBonus = Math.floor(crop.sellPrice * 0.1 * Math.min(state.combo, 20));
            bonusGold += comboBonus;
            showFloatingText(index, 'COMB!', 'purple');
        }

        // Special Crop Effects
        if (crop.id === 'clover') {
            if (Math.random() < 0.3) {
                bonusGold += 500;
                showToast('🍀 幸运草带来了额外的好运! (+500 💰)');
            }
        }
        if (crop.id === 'magic_bean') {
             if (Math.random() < 0.01) {
                 bonusGold += 100000;
                 showToast('🫘 魔豆通往了巨人的宝库! (+10w 💰)');
             }
        }

        // Apply Results
        addToStorage(crop.id, 1);
        if (bonusGold > 0) {
            state.gold += bonusGold;
            state.stats.totalGold += bonusGold;
            showFloatingText(index, '+' + bonusGold, 'gold');
        } else {
            showFloatingText(index, '+' + crop.exp + ' Exp', 'white');
        }

        state.exp += crop.exp;
        state.stats.cropsHarvested++;


        if (crop.isTree) {
            plot.status = 'growing';
            plot.plantTime = Date.now();
                    plot.hasWeeds = false;
                    plot.hasBugs = false;
            plot.hasWeeds = false;
            plot.hasBugs = false;
        } else {
            plot.status = 'empty';
            plot.cropId = null;
            plot.plantTime = 0;
                    plot.hasWeeds = false;
                    plot.hasBugs = false;
            plot.hasWeeds = false;
            plot.hasBugs = false;
        }


        checkLevelUp();
        checkAchievements();
        updateStatsUI();
        updatePlotUI(index);
        saveGame();
    }


    function harvestAll() {
        let harvestedCount = 0;
        let totalBonusGold = 0;
        let specialMsgs = [];

        state.plots.forEach((plot, index) => {
            if (plot.unlocked && plot.status === 'ready') {
                const crop = CROPS[plot.cropId];

                // --- Event Logic from single harvest ---
                let bonusGold = 0;

                // Golden Crop (5%)
                if (Math.random() < 0.05) {
                    bonusGold += crop.sellPrice;
                    if (harvestedCount === 0) specialMsgs.push("✨ 发现金灿灿的作物！"); // Only add msg once
                }

                // Special Crops
                if (crop.id === 'clover' && Math.random() < 0.3) {
                    bonusGold += 500;
                    specialMsgs.push('🍀 幸运草好运!');
                }
                if (crop.id === 'magic_bean' && Math.random() < 0.01) {
                    bonusGold += 100000;
                    specialMsgs.push('🫘 魔豆爆发巨量财富!');
                }

                // Apply
                addToStorage(crop.id, 1);
                state.exp += crop.exp;
                state.stats.cropsHarvested++;

                if (bonusGold > 0) {
                    totalBonusGold += bonusGold;
                    showFloatingText(index, `+${bonusGold}💰`, 'gold');
                } else {
                    showFloatingText(index, `+${crop.exp}⭐`, 'white');
                }

                // Reset or Regrow (Tree Logic)
                if (crop.isTree) {
                    plot.status = 'growing';
                    plot.plantTime = Date.now();
                    plot.hasWeeds = false;
                    plot.hasBugs = false;
            plot.hasWeeds = false;
            plot.hasBugs = false;
                } else {
                    plot.status = 'empty';
                    plot.cropId = null;
                    plot.plantTime = 0;
                    plot.hasWeeds = false;
                    plot.hasBugs = false;
            plot.hasWeeds = false;
            plot.hasBugs = false;
                }

                updatePlotUI(index);
                harvestedCount++;
            }
        });

        if (harvestedCount > 0) {
            if (navigator.vibrate) navigator.vibrate(100);

            if (totalBonusGold > 0) {
                state.gold += totalBonusGold;
                state.stats.totalGold += totalBonusGold;
                showToast(`一键收获 ${harvestedCount} 棵作物. 额外奖励: ${totalBonusGold} 💰\n${specialMsgs.join(' ')}`);
            } else {
                showToast(`一键收获了 ${harvestedCount} 棵作物 🌾`);
            }

            checkLevelUp();
            checkAchievements();
            updateStatsUI();
            saveGame();
        } else {
            showToast("没有可收获的作物 💤");
        }
    }


    function fertilizeAll() {
        if (state.selectedItemId !== 'fertilizer') {
            showToast("请先选择化肥 ⚡");
            return;
        }

        const item = ITEMS['fertilizer'];
        let fertilizedCount = 0;
        let totalCost = 0;
        let plotsToFertilize = [];

        state.plots.forEach((plot, index) => {
            if (plot.unlocked && plot.status === 'growing') {
                plotsToFertilize.push(index);
            }
        });

        if (plotsToFertilize.length === 0) {
            showToast("没有正在生长的作物");
            return;
        }

        const maxAffordable = Math.floor(state.gold / item.cost);
        const countToFertilize = Math.min(plotsToFertilize.length, maxAffordable);

        if (countToFertilize === 0) {
            showToast("金币不足！");
            return;
        }

        for (let i = 0; i < countToFertilize; i++) {
            const index = plotsToFertilize[i];
            const plot = state.plots[index];
            const crop = CROPS[plot.cropId];

            state.gold -= item.cost;
            plot.plantTime = Date.now() - crop.growthTime - 1000;
            plot.status = 'ready';

            fertilizedCount++;
            totalCost += item.cost;

            showFloatingText(index, `⚡加速!`, 'yellow');
            updatePlotUI(index);
        }

        if (fertilizedCount > 0) {
            if (navigator.vibrate) navigator.vibrate(50);
            showToast(`一键施肥: ${fertilizedCount} 个作物, 花费 ${totalCost} 💰`);
            updateStatsUI();
            saveGame();
        }
    }

    function plantAll() {
        if (state.selectedItemType !== 'crop') {
            showToast("请先选择要种植的种子 🌱");
            return;
        }

        const crop = CROPS[state.selectedItemId];
        if (!crop) return;

        // Locked crop check
        if (state.level < crop.minLevel) {
            showToast(`等级不足，无法种植 ${crop.name}`);
            return;
        }

        let plantedCount = 0;
        let totalCost = 0;
        let plotsToPlant = [];

        // Identify plots
        state.plots.forEach((plot, index) => {
            if (plot.unlocked && plot.status === 'empty') {
                plotsToPlant.push(index);
            }
        });

        if (plotsToPlant.length === 0) {
            showToast("没有空闲土地");
            return;
        }

        // Calculate how many we can afford
        const maxAffordable = Math.floor(state.gold / crop.cost);
        const countToPlant = Math.min(plotsToPlant.length, maxAffordable);

        if (countToPlant === 0) {
            showToast("金币不足！");
            return;
        }

        for (let i = 0; i < countToPlant; i++) {
            const index = plotsToPlant[i];
            const plot = state.plots[index];

            state.gold -= crop.cost;
            plot.status = 'growing';
            plot.cropId = crop.id;
            plot.plantTime = Date.now();

            plantedCount++;
            totalCost += crop.cost;

            // Visuals
            const card = elements.farmGrid.children[index];
            // Don't float text for every single one if too many? Maybe just summary.
            // Or minimal visual update
            updatePlotUI(index);
        }

        if (plantedCount > 0) {
            if (navigator.vibrate) navigator.vibrate(50);
            showToast(`一键播种: ${plantedCount} 个 ${crop.name}, 花费 ${totalCost} 💰`);
            updateStatsUI();
            saveGame();
        }
    }

    function getMaxPlots() {
        // Base 6 + 1 every 3 levels
        return 6 + Math.floor(state.level / 3);
    }

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

            if (plot.status === 'empty') {
                emojiDiv.textContent = '🕳️';
                statusText.textContent = '点击种植';
                progressBar.style.display = 'none';
            } else if (plot.status === 'growing') {
            const crop = CROPS[plot.cropId];
            emojiDiv.textContent = crop ? crop.seedEmoji : '🌱';

            if (plot.hasWeeds) {
                statusText.textContent = '🌿 除草';
                statusText.style.color = '#ff9800';
                card.style.borderColor = '#ff9800';
            } else if (plot.hasBugs) {
                statusText.textContent = '🐛 杀虫';
                statusText.style.color = '#ff9800';
                card.style.borderColor = '#ff9800';
            } else {
                statusText.textContent = '生长中...';
                statusText.style.color = '#aaa';
                card.style.borderColor = '#333';
            }

            progressBar.style.display = 'block';

            const elapsed = Date.now() - plot.plantTime;
            const duration = plot.growthDuration || crop.growthTime; // Use correct duration
            const progress = Math.min(100, (elapsed / duration) * 100);
            progressFill.style.width = `${progress}%`;


                } else if (plot.status === 'ready') {
const crop = CROPS[plot.cropId];
                emojiDiv.textContent = crop ? crop.emoji : '❓';
                statusText.textContent = '点击收获';
                progressFill.style.width = '100%';
                progressBar.style.display = 'none';
                statusText.style.color = '#4CAF50';
                statusText.style.fontWeight = 'bold';
            }

            card.appendChild(emojiDiv);
            card.appendChild(progressBar);
            card.appendChild(statusText);
            elements.farmGrid.appendChild(card);
        });
    }

    function updatePlotUI(index) {
        const plot = state.plots[index];
        const card = elements.farmGrid.children[index];
        if (!card) return;

        if (!plot.unlocked) {
             renderGrid();
             return;
        } else {
             if (card.classList.contains('locked')) {
                 renderGrid();
                 return;
             }
        }

        const emojiDiv = card.querySelector('.crop-emoji');
        const statusText = card.querySelector('.status-text');
        const progressBar = card.querySelector('.plot-progress-bar');
        const progressFill = card.querySelector('.plot-progress-fill');
        card.dataset.status = plot.status;

        if (plot.status === 'empty') {
            emojiDiv.textContent = '🕳️';
            statusText.textContent = '点击种植';
            statusText.style.color = '#aaa';
            progressBar.style.display = 'none';
            card.style.borderColor = '#333';
        } else if (plot.status === 'growing') {
            const crop = CROPS[plot.cropId];
            emojiDiv.textContent = crop ? crop.seedEmoji : '🌱';

            if (plot.hasWeeds) {
                statusText.textContent = '🌿 除草';
                statusText.style.color = '#ff9800';
                card.style.borderColor = '#ff9800';
            } else if (plot.hasBugs) {
                statusText.textContent = '🐛 杀虫';
                statusText.style.color = '#ff9800';
                card.style.borderColor = '#ff9800';
            } else {
                statusText.textContent = '生长中...';
                statusText.style.color = '#aaa';
                card.style.borderColor = '#333';
            }

            progressBar.style.display = 'block';

            const elapsed = Date.now() - plot.plantTime;
            const duration = plot.growthDuration || crop.growthTime; // Use correct duration
            const progress = Math.min(100, (elapsed / duration) * 100);
            progressFill.style.width = `${progress}%`;


            } else if (plot.status === 'ready') {
const crop = CROPS[plot.cropId];
            emojiDiv.textContent = crop ? crop.emoji : '❓';
            statusText.textContent = '点击收获';
            statusText.style.color = '#4CAF50';
            progressBar.style.display = 'none';
            card.style.borderColor = '#4CAF50';
        }
    }

    function renderShop() {
        elements.shopItems.innerHTML = '';

        if (currentShopTab === 'seeds') {
            Object.values(CROPS)
                  .sort((a, b) => a.minLevel - b.minLevel)
                  .forEach(crop => {
                const item = createShopItemElement(crop, 'crop');
                elements.shopItems.appendChild(item);
            });
        } else if (currentShopTab === 'items') {
            Object.values(ITEMS).forEach(itm => {
                const item = createShopItemElement(itm, 'item');
                elements.shopItems.appendChild(item);
            });
        }
    }

    function createShopItemElement(obj, type) {
        const item = document.createElement('div');
        item.className = 'shop-item';
        item.dataset.id = obj.id;
        item.dataset.type = type;

        const isSelected = state.selectedItemId === obj.id && state.selectedItemType === type;
        if (isSelected) item.classList.add('selected');

        let isLocked = false;
        if (type === 'crop') {
            isLocked = state.level < obj.minLevel;
            if (isLocked) item.classList.add('locked');
        }

        item.onclick = () => {
            if (!isLocked) selectShopItem(obj.id, type);
        };

        const icon = document.createElement('div');
        icon.className = 'shop-icon';
        icon.textContent = obj.emoji;

        const info = document.createElement('div');
        info.className = 'shop-info';
        const name = document.createElement('span');
        name.className = 'shop-name';

        if (type === 'crop') {
            name.textContent = isLocked ? `??? (Lv.${obj.minLevel})` : obj.name;
            const cost = document.createElement('div');
            cost.className = 'shop-cost';
            cost.textContent = `💰 ${obj.cost}  ⏳ ${obj.growthTime/1000}s`;
            info.appendChild(name);
            info.appendChild(cost);
        } else if (type === 'item') {
            name.textContent = obj.name;
            const cost = document.createElement('div');
            cost.className = 'shop-cost';

            // Special handling for Pet
            if (obj.id === 'dog' && state.hasDog) {
                cost.textContent = '已拥有';
                item.classList.add('owned');
            } else {
                cost.textContent = `💰 ${obj.cost}  ${obj.desc}`;
            }

            info.appendChild(name);
            info.appendChild(cost);
        }

        item.appendChild(icon);
        item.appendChild(info);
        return item;
    }

    function selectShopItem(id, type) {
        // Direct Action Items (Don't equip, just use/buy)
        if (id === 'pet_food') {
            if (confirm("购买高级狗粮 (50💰) 并喂食旺财?")) buyPetFood();
            return;
        }
        if (id === 'dog') {
            if (confirm(`购买看门狗 (${ITEMS['dog'].cost}💰)? 它会自动为你捡钱并驱赶害虫。`)) buyDog();
            return;
        }

        if (navigator.vibrate) navigator.vibrate(10);

        state.selectedItemId = id;
        state.selectedItemType = type;
        saveGame();

        // Update Active Tool UI
        const toolIcon = document.getElementById('active-tool-icon');
        const toolName = document.getElementById('active-tool-name');
        if (toolIcon && toolName) {
            const data = type === 'crop' ? CROPS[id] : ITEMS[id];
            toolIcon.textContent = data.emoji || data.seedEmoji;
            toolName.textContent = data.name;
        }

        // Update Action Button Dynamically
        if (elements.plantAllBtn) {
            const span = elements.plantAllBtn.querySelector('span');
            if (type === 'crop') {
                span.textContent = '一键播种';
                elements.plantAllBtn.style.backgroundColor = '#2196F3'; // Blue
                elements.plantAllBtn.onclick = plantAll;
            } else if (id === 'fertilizer') {
                span.textContent = '一键施肥';
                elements.plantAllBtn.style.backgroundColor = '#FF9800'; // Orange
                elements.plantAllBtn.onclick = fertilizeAll;
            }
        }

        // Apply Grid Highlighting Modes
        elements.farmGrid.classList.remove('mode-planting', 'mode-fertilizer');
        if (type === 'crop') {
            elements.farmGrid.classList.add('mode-planting');
        } else if (id === 'fertilizer') {
            elements.farmGrid.classList.add('mode-fertilizer');
        }

        const items = document.querySelectorAll('.shop-item');
        items.forEach(item => {
            if (item.dataset.id === id && item.dataset.type === type) item.classList.add('selected');
            else item.classList.remove('selected');
        });
    }

    function getLandCost() {
        const ownedPlots = state.plots.filter(p => p.unlocked).length;
        return Math.floor(LAND_COST_BASE * Math.pow(LAND_COST_MULTIPLIER, Math.max(0, ownedPlots - 6)));
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

        if (plot.status === 'empty') {
            if (state.selectedItemType === 'crop') {
                plantCrop(index);
            } else if (state.selectedItemId === 'dog') {
                buyDog();
            } else {
                showToast("请选择种子进行种植 🌱");
            }
        } else if (plot.status === 'ready') {
            harvestCrop(index);
        } else if (plot.status === 'growing') {
            if (state.selectedItemType === 'item' && state.selectedItemId === 'fertilizer') {
                useFertilizer(index);
            } else if (state.selectedItemId === 'dog') {
                buyDog();
            } else {
                openPlotModal(index);
            }
        }
    }

    function buyDog() {
        if (state.hasDog) {
            showToast("你已经有一只看门狗了 🐕");
            return;
        }
        const dogItem = ITEMS['dog'];
        if (state.gold >= dogItem.cost) {
            state.gold -= dogItem.cost;
            state.hasDog = true;
            showToast("🐕 看门狗已购买！它会帮你捡金币！");
            updateStatsUI();
            renderShop(); // Update shop UI to show 'owned'
            saveGame();
        } else {
            showToast("金币不足！需要 💰" + dogItem.cost);
        }
    }

    function useFertilizer(index) {
        const item = ITEMS['fertilizer'];
        if (state.gold >= item.cost) {
            if (navigator.vibrate) navigator.vibrate(20);
            state.gold -= item.cost;

            const plot = state.plots[index];
            // Instant grow: set plantTime to satisfy growthTime
            const crop = CROPS[plot.cropId];
            plot.plantTime = Date.now() - crop.growthTime - 1000; // Force ready
            plot.status = 'ready';

            showFloatingText(index, `⚡加速!`, 'yellow');
            updateStatsUI();
            updatePlotUI(index);
            saveGame();
        } else {
            showToast("金币不足！需要 💰" + item.cost);
        }
    }

    function buyLand(index) {
        const cost = getLandCost();
        if (confirm(`解锁这块土地需要 💰 ${cost}，确定购买吗？`)) {
            if (state.gold >= cost) {
                state.gold -= cost;
                state.plots[index].unlocked = true;
                showToast("🎉 土地解锁成功！");
                updateStatsUI();
                checkAchievements();
                updatePlotUI(index);
                saveGame();
            } else {
                showToast("金币不足！💸");
            }
        }
    }

    function plantCrop(index) {
        const crop = CROPS[state.selectedItemId];
        if (state.gold >= crop.cost) {
            if (navigator.vibrate) navigator.vibrate(20);
            state.gold -= crop.cost;

            // Calculate growth time based on weather
            let growthTime = crop.growthTime;
            if (state.weather === 'rainy') {

            if (crop.id === 'rice') growthTime = Math.floor(growthTime * 0.4);
            else growthTime = Math.floor(growthTime * 0.7);
 // 30% faster
            }

            const plot = state.plots[index];
            plot.status = 'growing';
            plot.cropId = crop.id;
            plot.plantTime = Date.now();
            plot.growthDuration = growthTime; // Store specific duration for this planting instance

            showFloatingText(index, `-${crop.cost}`, 'red');
            updateStatsUI();
            updatePlotUI(index);
            saveGame();
        } else {
            showToast("金币不足！");
        }
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
        // Harvest All Unlock: Lv.5
        if (elements.harvestAllBtn) {
            elements.harvestAllBtn.style.display = 'flex'; // Use flex to center content
            if (state.level < 5) {
                elements.harvestAllBtn.style.opacity = '0.5';
                elements.harvestAllBtn.style.filter = 'grayscale(100%)';
                elements.harvestAllBtn.onclick = () => {
                    showToast("等级达到 Lv.5 解锁一键收获 🔒");
                };
            } else {
                elements.harvestAllBtn.style.opacity = '1';
                elements.harvestAllBtn.style.filter = 'none';
                elements.harvestAllBtn.onclick = harvestAll;
            }
        }

        // Plant All Unlock: Lv.8 (Let's make it slightly higher or same? Let's say Lv.5 for now to match)
        // Or Lv.3? Let's stick to 5 for simplicity or maybe 3 for early helper.
        // User didn't specify, but usually Plant All comes with Harvest All.
        if (elements.plantAllBtn) {
            elements.plantAllBtn.style.display = 'flex';
             if (state.level < 5) {
                elements.plantAllBtn.style.opacity = '0.5';
                elements.plantAllBtn.style.filter = 'grayscale(100%)';
                elements.plantAllBtn.onclick = () => {
                    showToast("等级达到 Lv.5 解锁一键播种 🔒");
                };
            } else {
                elements.plantAllBtn.style.opacity = '1';
                elements.plantAllBtn.style.filter = 'none';
                elements.plantAllBtn.onclick = state.selectedItemId === 'fertilizer' ? fertilizeAll : plantAll;
            }
        }
    }

    function updateStatsUI() {
        elements.gold.textContent = state.gold;
        elements.level.textContent = state.level;
        elements.exp.textContent = state.exp;
        const percentage = Math.min(100, (state.exp / state.nextLevelExp) * 100);
        elements.expFill.style.width = `${percentage}%`;
        elements.maxExp.textContent = state.nextLevelExp;
        checkControlButtonsUnlock();
    }

    function showToast(msg) {
        elements.toast.textContent = msg;
        elements.toast.classList.add('show');
        setTimeout(() => { elements.toast.classList.remove('show'); }, 2000);
    }

    function showFloatingText(index, text, color) {
        const card = elements.farmGrid.children[index];
        const el = document.createElement('div');
        el.className = 'floating-text';
        el.textContent = text;
        if (color === 'red') el.style.color = '#ff4444';
        if (color === 'yellow') el.style.color = '#FFD700';
        card.appendChild(el);
        setTimeout(() => el.remove(), 1000);
    }

    function updateEnvironment() {
        const now = Date.now();
        // Change environment every hour (3600000 ms)
        // Use the current hour timestamp as seed
        const timeBlock = Math.floor(now / 3600000);

        // Simple seeded random
        const seedW = (timeBlock * 9301 + 49297) % 233280;
        const rW = seedW / 233280.0;

        const seedM = (timeBlock * 49297 + 9301) % 233280;
        const rM = seedM / 233280.0;

        // Determine Weather (Weights: Sunny 60%, Rainy 30%, Rainbow 10%)
        let newWeather = 'sunny';
        if (rW < 0.6) newWeather = 'sunny';
        else if (rW < 0.9) newWeather = 'rainy';
        else newWeather = 'rainbow';

        // Determine Market (Weights: Normal 60%, Boom 20%, Crash 20%)
        let newMarket = 'normal';
        if (rM < 0.6) newMarket = 'normal';
        else if (rM < 0.8) newMarket = 'boom';
        else newMarket = 'crash';

        // Update state if changed
        if (state.weather !== newWeather || state.market !== newMarket) {
            state.weather = newWeather;
            state.market = newMarket;
            showToast(`环境变化: ${ENV_CONFIG[state.weather].emoji} / 市场: ${ENV_CONFIG[state.market].emoji}`);
            saveGame();
        }

        updateEnvUI();
    }

    function updateEnvUI() {
        if (elements.weatherDisplay) {
            const w = ENV_CONFIG[state.weather];
            elements.weatherDisplay.textContent = `${w.emoji} ${w.name}`;
            elements.weatherDisplay.title = w.effect;
        }
        if (elements.marketDisplay) {
            const m = ENV_CONFIG[state.market];
            elements.marketDisplay.textContent = `${m.emoji} 市场${m.name} (${m.effect})`;
            elements.marketDisplay.className = `market-status ${state.market}`;
        }
    }

    function startLoop() {
        setInterval(() => {
            const now = Date.now();
            // Process Factory Queue
            if (state.factory && state.factory.length > 0) {
                const task = state.factory[0]; // Process one at a time sequentially
                const elapsed = now - task.startTime;

                if (elapsed >= task.duration) {
                    addToStorage(task.productId, task.qty);
                    state.exp += task.exp * task.qty;

                    showToast(`👨‍🍳 加工完成: ${task.name} x${task.qty}`);
                    if (navigator.vibrate) navigator.vibrate(50);

                    state.factory.shift(); // Remove completed task

                    if (state.factory.length > 0) {
                        state.factory[0].startTime = Date.now(); // Start next task
                    }

                    checkLevelUp();
                    updateStatsUI();
                    updateStorageUI();
                    updateFactoryUI();
                    saveGame();
                } else {
                    updateFactoryUI(); // Update progress bar
                }
            }


            // Check Environment
            updateEnvironment();
            checkOrders();


            // Pet Regen & Update
            regenPet();
            if (document.getElementById('pet-tab').classList.contains('active')) {
                updatePetUI();
            }

            // Update Modal if open
            if (state.openModalIndex !== undefined && elements.modal.style.display === 'block') {
                const plot = state.plots[state.openModalIndex];
                if (plot && plot.status === 'growing') {
                    const crop = CROPS[plot.cropId];
                    const elapsed = Date.now() - plot.plantTime;
                    const duration = plot.growthDuration || crop.growthTime;
                    const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
                    const progress = Math.min(100, (elapsed / duration) * 100);

                    elements.modalContent.timer.textContent = `${remaining}s`;
                    elements.modalContent.progress.style.width = `${progress}%`;
                } else {
                    closeModal();
                }
            }

            // Dog Logic (Every 10 seconds approx, low chance)
            if (state.hasDog) {
                // Find gold
                if (Math.random() < 0.02) {
                    const foundGold = Math.floor(Math.random() * 20) + 10;
                    state.gold += foundGold;
                    showToast(`🐕 狗狗捡到了 ${foundGold} 金币!`);
                    updateStatsUI();
                    saveGame();
                }
                // Auto-catch bugs (Preventative or Reactive?)
                state.plots.forEach((p, idx) => {
                    if (p.hasBugs && Math.random() < 0.02) {
                        p.hasBugs = false;
                        showToast("🐕 狗狗抓住了害虫!");
                        updatePlotUI(idx);
                        saveGame();
                    }
                });
            }

            // Random Weeds/Bugs Spawning (Low chance)
            if (Math.random() < 0.01) { // 1% chance per tick to try spawning something
                const randomIdx = Math.floor(Math.random() * 25);
                const p = state.plots[randomIdx];
                if (p.unlocked) {
                    if (!p.hasWeeds && Math.random() < 0.5) {
                        p.hasWeeds = true;
                        updatePlotUI(randomIdx);
                    } else if (!p.hasBugs && p.status === 'growing') {
                        // Bugs only on growing crops
                        p.hasBugs = true;
                        updatePlotUI(randomIdx);
                    }
                }
            }

            state.plots.forEach((plot, index) => {
                if (plot.status === 'growing') {
                    const crop = CROPS[plot.cropId];
                    // Use stored duration or fallback to default
                    const duration = plot.growthDuration || crop.growthTime;

                    // Weeds/Bugs slow down growth
                    if (plot.hasWeeds || plot.hasBugs) {
                        plot.plantTime += 100; // Delay by tick interval
                    }

                    if (now - plot.plantTime >= duration) {
                        plot.status = 'ready';
                        updatePlotUI(index);
                    } else {
                        updatePlotUI(index);
                    }
                }
            });
        }, 100);
    }


    // Pet System
    const PET_CONFIG = {
        adventureCost: 20,
        adventureTime: 180000, // 3 minutes
        maxEnergy: 100,
        energyRegen: 1, // per tick (10s)
        maxLogs: 10
    };

    function initPetUI() {
        if (!state.pet) {
            state.pet = {
                unlocked: state.hasDog || false,
                energy: 100,
                mood: 100,
                level: 1,
                exp: 0,
                adventureEndTime: 0,
                adventureStatus: 'idle',
                logs: []
            };
        }

        // Sync old boolean
        if (state.hasDog && !state.pet.unlocked) state.pet.unlocked = true;

        updatePetUI();

        // Bind Adventure Button
        if (elements.adventureBtn) {
            elements.adventureBtn.onclick = startAdventure;
        }
    }

    function updatePetUI() {
        if (!elements.petTab) return;

        if (!state.pet.unlocked) {
            elements.petUnlockMsg.style.display = 'block';
            elements.petContent.style.display = 'none';
            return;
        }

        elements.petUnlockMsg.style.display = 'none';
        elements.petContent.style.display = 'flex';

        // Energy Bar
        const energyPercent = (state.pet.energy / PET_CONFIG.maxEnergy) * 100;
        elements.petEnergyFill.style.width = `${energyPercent}%`;
        elements.petEnergyText.textContent = `${Math.floor(state.pet.energy)}/${PET_CONFIG.maxEnergy}`;

        // Mood (Placeholder for now)
        elements.petMoodFill.style.width = `${state.pet.mood}%`;

        // Adventure Status
        const now = Date.now();
        if (state.pet.adventureStatus === 'exploring') {
            const remaining = Math.max(0, state.pet.adventureEndTime - now);
            if (remaining > 0) {
                elements.adventureBtn.disabled = true;
                elements.adventureBtn.textContent = '🐕 探险中...';
                elements.adventureTimer.textContent = formatTime(remaining);
                elements.adventureStatus.textContent = '正在森林深处探索...';
            } else {
                completeAdventure();
            }
        } else {
            elements.adventureBtn.disabled = state.pet.energy < PET_CONFIG.adventureCost;
            elements.adventureBtn.textContent = `🌲 开始探险 (消耗 ${PET_CONFIG.adventureCost} ⚡)`;
            elements.adventureTimer.textContent = '--:--';
            elements.adventureStatus.textContent = '准备出发';
        }

        // Render Logs
        renderAdventureLogs();
    }

    function startAdventure() {
        if (state.pet.energy >= PET_CONFIG.adventureCost) {
            state.pet.energy -= PET_CONFIG.adventureCost;
            state.pet.adventureStatus = 'exploring';
            state.pet.adventureEndTime = Date.now() + PET_CONFIG.adventureTime;
            showToast('🐕 旺财出发去探险了！');
            updatePetUI();
            saveGame();
        } else {
            showToast('体力不足，休息一会儿吧 💤');
        }
    }

    function completeAdventure() {
        state.pet.adventureStatus = 'idle';

        // Rewards Logic
        const rewards = [];
        const roll = Math.random();

        // Gold (Guaranteed)
        const goldAmt = Math.floor(50 + Math.random() * 100 + (state.level * 10));
        state.gold += goldAmt;
        rewards.push({ icon: '💰', text: `获得了 ${goldAmt} 金币` });

        // Rare Item (Chance)
        if (roll < 0.3) {
            const fertilizerAmt = Math.floor(Math.random() * 3) + 1;
            // We don't track inventory count for fertilizer yet, usually buying uses gold directly.
            // Let's just give gold equivalent or implement inventory later.
            // For now, let's just give extra gold as "sold found item".
            // OR unlock a special crop?
            // Let's give a "Shiny Stone" (Gold)
            const bonusGold = 500;
            state.gold += bonusGold;
            rewards.push({ icon: '💎', text: `发现稀有宝石! (+${bonusGold} 💰)` });
        } else if (roll < 0.5) {
             // Experience
             const expAmt = 50;
             state.exp += expAmt;
             rewards.push({ icon: '⭐', text: `获得了 ${expAmt} 经验` });
        }

        // Log
        const logEntry = {
            time: Date.now(),
            rewards: rewards
        };
        state.pet.logs.unshift(logEntry);
        if (state.pet.logs.length > PET_CONFIG.maxLogs) state.pet.logs.pop();

        showToast('🐕 旺财探险归来！收获满满！');
        checkLevelUp();
        updateStatsUI();
        updatePetUI();
        saveGame();
    }

    function renderAdventureLogs() {
        if (!elements.adventureLog) return;
        elements.adventureLog.innerHTML = '';

        if (state.pet.logs.length === 0) {
            elements.adventureLog.innerHTML = '<li class="log-item" style="color:#666; justify-content:center;">暂无记录</li>';
            return;
        }

        state.pet.logs.forEach(log => {
            const li = document.createElement('li');
            li.className = 'log-item';

            const timeStr = new Date(log.time).toLocaleTimeString();

            let rewardsHtml = '';
            log.rewards.forEach(r => {
                rewardsHtml += `<div>${r.icon} ${r.text}</div>`;
            });

            li.innerHTML = `
                <div class="log-icon">📍</div>
                <div class="log-content">
                    <div class="log-msg">${rewardsHtml}</div>
                    <span class="log-time">${timeStr}</span>
                </div>
            `;
            elements.adventureLog.appendChild(li);
        });
    }

    // Regen Pet Energy
    function regenPet() {
        if (state.pet && state.pet.unlocked && state.pet.energy < PET_CONFIG.maxEnergy) {
            state.pet.energy = Math.min(PET_CONFIG.maxEnergy, state.pet.energy + (PET_CONFIG.energyRegen * 0.5)); // Slower regen
            // Only update UI if tab is active to save perf?
            // Actually updatePetUI checks for element existence but not visibility.
            // Let's just call it.
            if (currentShopTab === 'pet') updatePetUI(); // Logic reuse: I should track active main tab
        }
    }


    // Storage System
    function addToStorage(cropId, qty) {
        if (!state.storage) state.storage = {};
        if (!state.storage[cropId]) state.storage[cropId] = 0;
        state.storage[cropId] += qty;
        updateStorageUI();
        saveGame();
    }

    function renderStorage() {
        if (!elements.storageList) return;
        elements.storageList.innerHTML = '';

        let totalVal = 0;
        let hasItems = false;

        Object.keys(state.storage).forEach(cropId => {
            const qty = state.storage[cropId];
            if (qty <= 0) return;
            hasItems = true;

            const crop = CROPS[cropId];
            if (!crop) return;

            // Calculate Price
            let unitPrice = crop.sellPrice;
            // Apply Market Multiplier
            if (state.market === 'boom') unitPrice = Math.floor(unitPrice * 1.5);
            if (state.market === 'crash') unitPrice = Math.floor(unitPrice * 0.8);

            totalVal += unitPrice * qty;

            const item = document.createElement('div');
            item.className = 'storage-item';

            let trendIcon = '➖';
            let trendClass = 'trend-flat';
            if (state.market === 'boom') { trendIcon = '⬆️'; trendClass = 'trend-up'; }
            if (state.market === 'crash') { trendIcon = '⬇️'; trendClass = 'trend-down'; }

            item.innerHTML = `
                <div class="storage-icon">${crop.emoji}</div>
                <div class="storage-info">
                    <span class="storage-name">${crop.name}</span>
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

            // Bind events
            item.querySelector('.sell-one-btn').onclick = () => sellItem(cropId, 1);
            item.querySelector('.sell-all-btn').onclick = () => sellItem(cropId, qty);

            elements.storageList.appendChild(item);
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

    function updateStorageUI() {
        // Only render if tab is active to save perf
        if (elements.storageTab && elements.storageTab.classList.contains('active')) {
            renderStorage();
        }
    }

    function sellItem(cropId, qty) {
        if (!state.storage[cropId] || state.storage[cropId] < qty) return;

        const crop = CROPS[cropId];
        let unitPrice = crop.sellPrice;
        if (state.market === 'boom') unitPrice = Math.floor(unitPrice * 1.5);
        if (state.market === 'crash') unitPrice = Math.floor(unitPrice * 0.8);

        const totalGain = unitPrice * qty;

        state.storage[cropId] -= qty;
        state.gold += totalGain;
        state.stats.totalGold += totalGain; // Track earnings on sell

        showToast(`卖出 ${qty} 个 ${crop.name}, 获得 ${totalGain} 💰`);
        updateStatsUI();
        updateStorageUI();
        saveGame();
    }

    function sellAllGlobal() {
        let totalGain = 0;
        let count = 0;

        Object.keys(state.storage).forEach(cropId => {
            const qty = state.storage[cropId];
            if (qty > 0) {
                const crop = CROPS[cropId];
                let unitPrice = crop.sellPrice;
                if (state.market === 'boom') unitPrice = Math.floor(unitPrice * 1.5);
                if (state.market === 'crash') unitPrice = Math.floor(unitPrice * 0.8);

                totalGain += unitPrice * qty;
                state.storage[cropId] = 0;
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



    // --- Order System ---
    const MAX_ORDERS = 3;

    function generateOrder() {
        if (state.orders.length >= MAX_ORDERS) return;

        const unlockedCrops = Object.values(CROPS).filter(c => state.level >= c.minLevel);
        if (unlockedCrops.length === 0) return;

        const crop = unlockedCrops[Math.floor(Math.random() * unlockedCrops.length)];
        const qty = Math.floor(Math.random() * 5) + 3 + Math.floor(state.level / 2); // 3-8 base + level scaling

        // Reward calculation: Base Price * Qty * 1.5 (Premium)
        const reward = Math.floor(crop.sellPrice * qty * 1.5);

        const order = {
            id: Date.now() + Math.random(),
            cropId: crop.id,
            qty: qty,
            reward: reward,
            time: Date.now(),
            expires: Date.now() + 300000 // 5 minutes
        };

        state.orders.push(order);
        showToast(`📜 新订单: ${crop.name} x${qty}`);
        updateOrdersUI();
        saveGame();
    }

    function checkOrders() {
        // Expire old orders
        const now = Date.now();
        const initialLen = state.orders.length;
        state.orders = state.orders.filter(o => now < o.expires);

        if (state.orders.length < initialLen) {
            updateOrdersUI();
        }

        // Generate new order occasionally
        if (state.orders.length < MAX_ORDERS && Math.random() < 0.02) { // Low chance per tick
            generateOrder();
        }
    }


    function rejectOrder(orderId) {
        const orderIndex = state.orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;

        state.orders.splice(orderIndex, 1);
        showToast("🗑️ 订单已拒绝");
        updateOrdersUI();
        saveGame();
    }

    function fulfillOrder(orderId) {
        const orderIndex = state.orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;

        const order = state.orders[orderIndex];

        if ((state.storage[order.cropId] || 0) >= order.qty) {
            state.storage[order.cropId] -= order.qty;
            state.gold += order.reward;
            state.stats.totalGold += order.reward;

            // Bonus Exp for orders
            state.exp += Math.floor(order.reward / 10);

            state.orders.splice(orderIndex, 1);

            showToast(`✅ 订单完成! 获得 ${order.reward} 💰`);
            if (navigator.vibrate) navigator.vibrate(100);

            checkLevelUp();
            updateStatsUI();
            updateStorageUI(); // Refresh storage list
            updateOrdersUI();
            saveGame();
        } else {
            showToast("库存不足! 📦");
        }
    }

    function renderOrders() {
        const container = document.getElementById('orders-list');
        if (!container) return;

        container.innerHTML = '';
        if (state.orders.length === 0) {
            container.innerHTML = '<div style="color:#666; font-size:0.8rem; text-align:center; padding:10px;">暂无订单 (等待刷新...)</div>';
            return;
        }

        state.orders.forEach(order => {
            const crop = CROPS[order.cropId];
            const hasEnough = (state.storage[order.cropId] || 0) >= order.qty;

            const div = document.createElement('div');
            div.className = 'order-card';
            div.style.cssText = 'background:#252525; padding:8px; margin-bottom:5px; border-radius:6px; display:flex; justify-content:space-between; align-items:center; border:1px solid #444;';

            const timeLeft = Math.max(0, Math.ceil((order.expires - Date.now()) / 1000));

            div.innerHTML = `
                <div>
                    <div style="font-weight:bold; font-size:0.9rem;">${crop.emoji} ${crop.name} x${order.qty}</div>
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
                div.querySelector('.action-btn-order').onclick = () => fulfillOrder(order.id);
            }


            container.appendChild(div);
        });
    }

    function updateOrdersUI() {
        if (document.getElementById('storage-tab').classList.contains('active')) {
            renderOrders();
        }
    }

    // --- Pet Food Logic ---
    function buyPetFood() {
        const cost = 50;
        if (state.gold >= cost) {
            if (state.pet.energy >= 100) {
                showToast("旺财已经吃饱了! 🐕");
                return;
            }
            state.gold -= cost;
            state.pet.energy = Math.min(100, state.pet.energy + 50);
            state.pet.mood = Math.min(100, state.pet.mood + 10);
            showToast("🍖 喂食成功! 体力 +50");
            updateStatsUI();
            updatePetUI();
            saveGame();
        } else {
             showToast(`金币不足! (${cost}💰)`);
        }
    }




    // --- Factory System ---
    function renderFactory() {
        const recipeList = document.getElementById('recipe-list');
        if (!recipeList) return;

        recipeList.innerHTML = '';

        Object.values(PRODUCTS).forEach(prod => {
            const recipe = RECIPES[prod.id];

            // Check if player has enough materials
            let canCraft = true;
            let reqHtml = '';
            for (const [matId, reqQty] of Object.entries(recipe)) {
                const matQty = state.storage[matId] || 0;
                if (matQty < reqQty) canCraft = false;

                const crop = CROPS[matId];
                reqHtml += `<span style="color:${matQty >= reqQty ? '#4CAF50' : '#ff4444'}; margin-right:8px;">${crop.emoji} ${matQty}/${reqQty}</span>`;
            }

            const item = document.createElement('div');
            item.className = 'shop-item';
            item.style.marginBottom = '8px';

            item.innerHTML = `
                <div class="shop-icon" style="font-size:1.8rem;">${prod.emoji}</div>
                <div class="shop-info">
                    <div style="display:flex; justify-content:space-between;">
                        <span class="shop-name">${prod.name} <span style="font-size:0.7rem; color:#FFD700; margin-left:5px;">${prod.sellPrice}💰</span></span>
                        <span style="font-size:0.75rem; color:#aaa;">⏳${prod.craftTime / 1000}s</span>
                    </div>
                    <div style="font-size:0.75rem; margin-top:2px;">
                        需求: ${reqHtml}
                    </div>
                </div>
                <button class="action-btn" style="width:auto; padding:6px 12px; margin-left:10px; background-color:${canCraft ? '#2196F3' : '#555'};" ${canCraft ? '' : 'disabled'}>
                    加工
                </button>
            `;

            if (canCraft) {
                item.querySelector('button').onclick = () => startCrafting(prod.id);
            } else {
                item.style.opacity = '0.7';
            }

            recipeList.appendChild(item);
        });
    }

    function startCrafting(productId) {
        const prod = PRODUCTS[productId];
        const recipe = RECIPES[productId];

        // Deduct materials
        for (const [matId, reqQty] of Object.entries(recipe)) {
            if ((state.storage[matId] || 0) < reqQty) {
                showToast("材料不足!");
                return;
            }
        }

        for (const [matId, reqQty] of Object.entries(recipe)) {
            state.storage[matId] -= reqQty;
        }

        // Add to queue
        const task = {
            id: Date.now() + Math.random(),
            productId: productId,
            name: prod.name,
            emoji: prod.emoji,
            qty: 1,
            exp: prod.exp,
            duration: prod.craftTime,
            startTime: state.factory.length === 0 ? Date.now() : 0 // Start timer only if it's first in queue
        };

        state.factory.push(task);
        showToast(`👨‍🍳 开始制作: ${prod.name}`);

        updateStorageUI();
        updateFactoryUI();
        saveGame();
    }

    function updateFactoryUI() {
        if (!document.getElementById('factory-tab').classList.contains('active')) return;

        renderFactory(); // Update recipe buttons (materials might have changed)

        const queueContainer = document.getElementById('factory-queue');
        if (!queueContainer) return;

        if (state.factory.length === 0) {
            queueContainer.innerHTML = '<div style="text-align:center; color:#666; font-size:0.8rem; line-height:40px;">暂无加工任务</div>';
            return;
        }

        let html = '';
        state.factory.forEach((task, index) => {
            if (index === 0) {
                // Active task
                const elapsed = Date.now() - task.startTime;
                const progress = Math.min(100, (elapsed / task.duration) * 100);
                const remaining = Math.max(0, Math.ceil((task.duration - elapsed) / 1000));

                html += `
                    <div style="display:flex; align-items:center; margin-bottom:5px;">
                        <span style="font-size:1.5rem; margin-right:10px;">${task.emoji}</span>
                        <div style="flex-grow:1;">
                            <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:2px;">
                                <span>制作中: ${task.name}</span>
                                <span>${remaining}s</span>
                            </div>
                            <div style="height:6px; background:#444; border-radius:3px; overflow:hidden;">
                                <div style="height:100%; width:${progress}%; background:#FF9800; transition:width 0.5s linear;"></div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // Queued tasks
                html += `
                    <div style="display:flex; align-items:center; margin-bottom:2px; opacity:0.6;">
                        <span style="font-size:1.2rem; margin-right:10px;">⏳</span>
                        <span style="font-size:0.8rem;">等待中: ${task.name}</span>
                    </div>
                `;
            }
        });

        queueContainer.innerHTML = html;
    }

    init();
});
