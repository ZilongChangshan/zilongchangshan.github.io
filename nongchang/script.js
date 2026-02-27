document.addEventListener('DOMContentLoaded', () => {
    // Game Data
    const CROPS = {
        wheat: { id: 'wheat', name: '小麦', emoji: '🌾', seedEmoji: '🌱', cost: 10, sellPrice: 15, growthTime: 3000, exp: 2, minLevel: 1 },
        corn: { id: 'corn', name: '玉米', emoji: '🌽', seedEmoji: '🌱', cost: 20, sellPrice: 35, growthTime: 5000, exp: 4, minLevel: 2 },
        carrot: { id: 'carrot', name: '胡萝卜', emoji: '🥕', seedEmoji: '🌱', cost: 30, sellPrice: 55, growthTime: 8000, exp: 6, minLevel: 3 },
        potato: { id: 'potato', name: '土豆', emoji: '🥔', seedEmoji: '🌱', cost: 50, sellPrice: 90, growthTime: 12000, exp: 10, minLevel: 4 },
        tomato: { id: 'tomato', name: '番茄', emoji: '🍅', seedEmoji: '🌱', cost: 100, sellPrice: 180, growthTime: 20000, exp: 15, minLevel: 5 },
        strawberry: { id: 'strawberry', name: '草莓', emoji: '🍓', seedEmoji: '🌱', cost: 200, sellPrice: 380, growthTime: 45000, exp: 25, minLevel: 6 },
        pumpkin: { id: 'pumpkin', name: '南瓜', emoji: '🎃', seedEmoji: '🌱', cost: 500, sellPrice: 1000, growthTime: 90000, exp: 50, minLevel: 8 },
        sunflower: { id: 'sunflower', name: '向日葵', emoji: '🌻', seedEmoji: '🌱', cost: 1000, sellPrice: 2500, growthTime: 300000, exp: 100, minLevel: 10 },
        grapes: { id: 'grapes', name: '葡萄', emoji: '🍇', seedEmoji: '🌱', cost: 2000, sellPrice: 4500, growthTime: 120000, exp: 80, minLevel: 12 },
        melon: { id: 'melon', name: '甜瓜', emoji: '🍈', seedEmoji: '🌱', cost: 5000, sellPrice: 12000, growthTime: 300000, exp: 200, minLevel: 15 }
    };

    const ITEMS = {
        fertilizer: { id: 'fertilizer', name: '强力化肥', emoji: '⚡', cost: 50, desc: '立刻成熟', type: 'item' },
        dog: { id: 'dog', name: '看门狗', emoji: '🐕', cost: 1000, desc: '自动捡钱 & 防虫', type: 'pet', max: 1 }
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
        toast: document.getElementById('message-toast'),
        statsTab: document.getElementById('stats-tab'),
        achievementsTab: document.getElementById('achievements-tab'),
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
    let currentShopTab = 'seeds'; // 'seeds' or 'items'

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
        updateEnvironment(); // Deterministic check
        renderGrid();
        // Refresh UI for all plots to show loaded weeds/bugs
        state.plots.forEach((_, i) => updatePlotUI(i));

        renderShop();
        renderStats();
        renderAchievements();
        updateStatsUI();
        setupTabs();
        setupShopTabs();
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
        let readyCount = 0;

        // Check crops that finished while we were away
        // Logic: if it was 'growing' in save, and now it is ready (time passed > growthTime)
        // Wait, if it was already 'ready' in save, we don't count it as "newly ready".
        // But we don't store "wasReadyAtSave". We rely on status.
        // If status is 'growing', and now it is ready, it finished offline.

        state.plots.forEach(plot => {
            if (plot.status === 'growing') {
                const crop = CROPS[plot.cropId];
                if (crop && (now - plot.plantTime >= crop.growthTime)) {
                    readyCount++;
                    // We don't change status here, the loop or render will handle it visually,
                    // but functionally it's ready.
                }
            }
        });

        if (readyCount > 0) {
            setTimeout(() => {
                showToast(`欢迎回来！离线期间有 ${readyCount} 个作物成熟了 🌾`);
            }, 500);
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
            });
        });
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

        const modalWidth = 180;
        const modalHeight = 120;

        const card = elements.farmGrid.children[index];
        const rect = card.getBoundingClientRect();
        const windowWidth = window.innerWidth;

        // Horizontal Positioning
        let left = rect.left + (rect.width / 2) - (modalWidth / 2);
        let arrowLeft = 50; // Percentage

        // Clamp Left
        if (left < 10) {
            const offset = 10 - left;
            left = 10;
            arrowLeft = 50 - (offset / modalWidth * 100);
        } else if (left + modalWidth > windowWidth - 10) {
            const offset = (left + modalWidth) - (windowWidth - 10);
            left = windowWidth - modalWidth - 10;
            arrowLeft = 50 + (offset / modalWidth * 100);
        }

        // Arrow Clamp
        arrowLeft = Math.max(15, Math.min(85, arrowLeft));

        // Vertical Positioning
        let top = rect.top - modalHeight - 15;
        let isTop = true; // Modal is ABOVE the slot (arrow at bottom)

        if (top < 60) { // Too close to top header
            top = rect.bottom + 15;
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

            elements.modalContent.timer.innerHTML = `
                <div style="font-size:0.7rem; color:#aaa; margin-bottom:2px;">预计收益: ${projectedGold}💰 (+${crop.exp} Exp)</div>
                <div style="font-size:0.9rem; font-weight:bold;">剩余: ${remaining}s</div>
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

        updateModal(); // Initial render
        elements.modal.style.display = 'block';
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

        // Base Gains
        let goldGain = crop.sellPrice;
        let expGain = crop.exp;

        // Market Effects
        if (state.market === 'boom') goldGain = Math.floor(goldGain * 1.5);
        if (state.market === 'crash') goldGain = Math.floor(goldGain * 0.8);

        // Weather Effects (Rainbow doubles gold)
        if (state.weather === 'rainbow') goldGain *= 2;

        // Random Event: Golden Crop (5% chance)
        let isGolden = Math.random() < 0.05;
        if (isGolden) {
            goldGain *= 2;
            showToast("✨ 发现金灿灿的作物！收益翻倍！");
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
            const comboBonus = Math.floor(goldGain * 0.1 * Math.min(state.combo, 20)); // Max 200% bonus cap
            goldGain += comboBonus;
            showFloatingText(index, `Combo x${state.combo}!`, 'purple');
        }

        state.gold += goldGain;
        state.exp += expGain;

        // Update Stats
        state.stats.cropsHarvested++;
        state.stats.totalGold += goldGain;

        showFloatingText(index, `+${goldGain}${isGolden ? '✨' : ''}`, isGolden ? 'yellow' : 'gold');

        plot.status = 'empty';
        plot.cropId = null;
        plot.plantTime = 0;

        checkLevelUp();
        checkAchievements();
        updateStatsUI();
        updatePlotUI(index);
        saveGame();
    }

    function harvestAll() {
        let harvestedCount = 0;
        let totalGain = 0;

        state.plots.forEach((plot, index) => {
            if (plot.unlocked && plot.status === 'ready') {
                const crop = CROPS[plot.cropId];
                state.gold += crop.sellPrice;
                state.exp += crop.exp;
                state.stats.cropsHarvested++;
                state.stats.totalGold += crop.sellPrice;
                totalGain += crop.sellPrice;

                plot.status = 'empty';
                plot.cropId = null;
                plot.plantTime = 0;

                updatePlotUI(index);
                harvestedCount++;
            }
        });

        if (harvestedCount > 0) {
            if (navigator.vibrate) navigator.vibrate(100);
            showToast(`一键收获: ${harvestedCount} 个作物, 获得 ${totalGain} 💰`);
            checkLevelUp();
            checkAchievements();
            updateStatsUI();
            saveGame();
        } else {
            showToast("没有可收获的作物");
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
                statusText.textContent = '生长中...';
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

        if (plot.status === 'empty') {
            emojiDiv.textContent = '🕳️';
            statusText.textContent = '点击种植';
            statusText.style.color = '#aaa';
            progressBar.style.display = 'none';
            card.style.borderColor = '#333';
        } else if (plot.status === 'growing') {
            const crop = CROPS[plot.cropId];
            emojiDiv.textContent = crop ? crop.seedEmoji : '🌱';
            statusText.textContent = '生长中...';
            progressBar.style.display = 'block';

            const elapsed = Date.now() - plot.plantTime;
            const progress = Math.min(100, (elapsed / crop.growthTime) * 100);
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
            Object.values(CROPS).forEach(crop => {
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
        if (navigator.vibrate) navigator.vibrate(10);
        state.selectedItemId = id;
        state.selectedItemType = type;
        saveGame();
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
                growthTime = Math.floor(growthTime * 0.7); // 30% faster
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
                elements.plantAllBtn.onclick = plantAll;
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

            // Check Environment
            updateEnvironment();

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
                if (Math.random() < 0.005) {
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

    init();
});
