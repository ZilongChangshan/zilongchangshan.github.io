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
        sunflower: { id: 'sunflower', name: '向日葵', emoji: '🌻', seedEmoji: '🌱', cost: 1000, sellPrice: 2500, growthTime: 300000, exp: 100, minLevel: 10 }
    };

    const ACHIEVEMENTS = [
        { id: 'first_harvest', name: '初次收获', desc: '收获第一个作物', check: (s) => s.stats.cropsHarvested >= 1, reward: 50 },
        { id: 'novice_farmer', name: '新手农夫', desc: '收获 50 个作物', check: (s) => s.stats.cropsHarvested >= 50, reward: 200 },
        { id: 'expert_farmer', name: '种植专家', desc: '收获 500 个作物', check: (s) => s.stats.cropsHarvested >= 500, reward: 1000 },
        { id: 'wealthy', name: '小有资产', desc: '累计获得 1,000 金币', check: (s) => s.stats.totalGold >= 1000, reward: 500 },
        { id: 'millionaire', name: '百万富翁', desc: '累计获得 10,000 金币', check: (s) => s.stats.totalGold >= 10000, reward: 5000 },
        { id: 'land_owner', name: '大地主', desc: '解锁 15 块土地', check: (s) => s.plots.filter(p => p.unlocked).length >= 15, reward: 1000 },
        { id: 'master_level', name: '大师等级', desc: '达到等级 5', check: (s) => s.level >= 5, reward: 800 },
        { id: 'grand_master', name: '传奇农场主', desc: '达到等级 10', check: (s) => s.level >= 10, reward: 2000 },
        { id: 'ad_lover', name: '广告达人', desc: '观看 10 次广告', check: (s) => s.stats.adsWatched >= 10, reward: 500 }
    ];

    const LAND_COST_BASE = 100;
    const LAND_COST_MULTIPLIER = 1.3;

    // Game State
    let state = {
        gold: 100,
        startTime: Date.now(),
        level: 1,
        exp: 0,
        nextLevelExp: 100,
        selectedCropId: 'wheat',
        stats: {
            cropsHarvested: 0,
            totalGold: 0,
            adsWatched: 0
        },
        achievements: [], // List of unlocked achievement IDs
        plots: Array(25).fill(null).map((_, i) => {
            const row = Math.floor(i / 5);
            const col = i % 5;
            const isCenter = row >= 1 && row <= 3 && col >= 1 && col <= 3;
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
        toast: document.getElementById('message-toast'),
        statsTab: document.getElementById('stats-tab'),
        achievementsTab: document.getElementById('achievements-tab'),
        btnAd: document.getElementById('btn-ad')
    };

    // Save/Load
    function saveGame() {
        localStorage.setItem('nongchang_save_v2', JSON.stringify(state));
    }

    function loadGame() {
        const saved = localStorage.getItem('nongchang_save_v2');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                state = { ...state, ...parsed };
                // Ensure stats object exists
                if (!state.stats) state.stats = { cropsHarvested: 0, totalGold: 0, adsWatched: 0 };
                if (!state.achievements) state.achievements = [];
                if (!state.startTime) state.startTime = Date.now();

                // Plot migration logic (simplified)
                if (state.plots.length !== 25) {
                    // Reset if mismatch for now, or use migration logic from previous step
                     const newPlots = Array(25).fill(null).map((_, i) => {
                         const row = Math.floor(i / 5);
                         const col = i % 5;
                         const isCenter = row >= 1 && row <= 3 && col >= 1 && col <= 3;
                         return { id: i, status: 'empty', cropId: null, plantTime: 0, level: 1, unlocked: isCenter };
                     });
                     // Try to preserve center 9
                     parsed.plots.forEach((p, i) => { if(i < 9) newPlots[i] = p; });
                     state.plots = newPlots;
                }
            } catch (e) { console.error("Save error", e); }
        }
    }

    // Initialization
    function init() {
        loadGame();
        renderGrid();
        renderShop();
        renderStats();
        renderAchievements();
        updateStatsUI();
        setupTabs();
        setupAd();
        startLoop();
        selectShopItem(state.selectedCropId || 'wheat');
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
            { icon: '📺', label: '观看广告', value: state.stats.adsWatched },
            { icon: '🏞️', label: '拥有土地', value: `${landCount} / 25` },
            { icon: '⏳', label: '游玩时间', value: playTime },
            { icon: '⭐', label: '当前等级', value: `Lv.${state.level}` }
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

    // Ad Feature
    function setupAd() {
        elements.btnAd.onclick = () => {
            if (elements.btnAd.disabled) return;

            elements.btnAd.disabled = true;
            elements.btnAd.textContent = "📺 观看广告中... (3s)";

            setTimeout(() => {
                const reward = state.level * 50;
                state.gold += reward;
                state.stats.adsWatched++;
                state.stats.totalGold += reward; // Count ad gold towards total? Sure.

                showToast(`观看结束！获得 ${reward} 金币`);
                updateStatsUI();
                checkAchievements();
                saveGame();

                elements.btnAd.textContent = "看广告领补贴";
                elements.btnAd.disabled = false;
            }, 3000);
        };
    }

    // Core Gameplay Modifications
    function harvestCrop(index) {
        if (navigator.vibrate) navigator.vibrate(50);
        const plot = state.plots[index];
        const crop = CROPS[plot.cropId];

        state.gold += crop.sellPrice;
        state.exp += crop.exp;

        // Update Stats
        state.stats.cropsHarvested++;
        state.stats.totalGold += crop.sellPrice;

        showFloatingText(index, `+${crop.sellPrice}`, 'gold');

        plot.status = 'empty';
        plot.cropId = null;
        plot.plantTime = 0;

        checkLevelUp();
        checkAchievements();
        updateStatsUI();
        updatePlotUI(index);
        saveGame();
    }

    // ... (Existing Render Functions: renderGrid, updatePlotUI, renderShop, selectShopItem) ...
    // Note: Copied from previous step, ensuring integrity.

    function renderGrid() {
        elements.farmGrid.innerHTML = '';
        state.plots.forEach((plot, index) => {
            const card = document.createElement('div');
            card.className = 'plot-card';
            card.dataset.index = index;
            card.onclick = () => handlePlotClick(index);

            if (!plot.unlocked) {
                card.classList.add('locked');
                card.innerHTML = '<div class="lock-icon">🔒</div><div class="lock-text">点击解锁</div>';
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
                emojiDiv.textContent = crop.seedEmoji;
                statusText.textContent = '生长中...';
            } else if (plot.status === 'ready') {
                const crop = CROPS[plot.cropId];
                emojiDiv.textContent = crop.emoji;
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
             card.className = 'plot-card locked';
             card.innerHTML = '<div class="lock-icon">🔒</div><div class="lock-text">点击解锁</div>';
             return;
        } else {
             if (card.classList.contains('locked')) {
                 renderGrid(); // Re-render if state changed from locked
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
            emojiDiv.textContent = crop.seedEmoji;
            statusText.textContent = '生长中...';
            progressBar.style.display = 'block';

            const elapsed = Date.now() - plot.plantTime;
            const progress = Math.min(100, (elapsed / crop.growthTime) * 100);
            progressFill.style.width = `${progress}%`;

        } else if (plot.status === 'ready') {
            const crop = CROPS[plot.cropId];
            emojiDiv.textContent = crop.emoji;
            statusText.textContent = '点击收获';
            statusText.style.color = '#4CAF50';
            progressBar.style.display = 'none';
            card.style.borderColor = '#4CAF50';
        }
    }

    function renderShop() {
        elements.shopItems.innerHTML = '';
        Object.values(CROPS).forEach(crop => {
            const item = document.createElement('div');
            item.className = 'shop-item';
            item.dataset.id = crop.id;

            const isLocked = state.level < crop.minLevel;
            if (isLocked) item.classList.add('locked');
            if (state.selectedCropId === crop.id) item.classList.add('selected');

            item.onclick = () => {
                if (!isLocked) selectShopItem(crop.id);
            };

            const icon = document.createElement('div');
            icon.className = 'shop-icon';
            icon.textContent = crop.emoji;

            const info = document.createElement('div');
            info.className = 'shop-info';
            const name = document.createElement('span');
            name.className = 'shop-name';
            name.textContent = isLocked ? `??? (Lv.${crop.minLevel})` : crop.name;
            const cost = document.createElement('div');
            cost.className = 'shop-cost';
            cost.textContent = `💰 ${crop.cost}  ⏳ ${crop.growthTime/1000}s`;

            info.appendChild(name);
            info.appendChild(cost);
            item.appendChild(icon);
            item.appendChild(info);
            elements.shopItems.appendChild(item);
        });
    }

    function selectShopItem(id) {
        if (navigator.vibrate) navigator.vibrate(10);
        state.selectedCropId = id;
        saveGame();
        const items = document.querySelectorAll('.shop-item');
        items.forEach(item => {
            if (item.dataset.id === id) item.classList.add('selected');
            else item.classList.remove('selected');
        });
    }

    function getLandCost() {
        const ownedPlots = state.plots.filter(p => p.unlocked).length;
        return Math.floor(LAND_COST_BASE * Math.pow(LAND_COST_MULTIPLIER, ownedPlots - 9));
    }

    function handlePlotClick(index) {
        const plot = state.plots[index];
        if (!plot.unlocked) {
            buyLand(index);
            return;
        }
        if (plot.status === 'empty') {
            plantCrop(index);
        } else if (plot.status === 'ready') {
            harvestCrop(index);
        } else if (plot.status === 'growing') {
            const crop = CROPS[plot.cropId];
            const remaining = Math.ceil((crop.growthTime - (Date.now() - plot.plantTime)) / 1000);
            showToast(`还需 ${remaining} 秒成熟`);
        }
    }

    function buyLand(index) {
        const cost = getLandCost();
        // Check adjacency (optional, but good for gameplay) - simplifying to allow any
        if (confirm(`解锁这块土地需要 💰 ${cost}，确定购买吗？`)) {
            if (state.gold >= cost) {
                state.gold -= cost;
                state.plots[index].unlocked = true;
                showToast("🎉 土地解锁成功！");
                updateStatsUI();
                checkAchievements(); // Check "Land Owner"
                updatePlotUI(index);
                saveGame();
            } else {
                showToast("金币不足！💸");
            }
        }
    }

    function plantCrop(index) {
        const crop = CROPS[state.selectedCropId];
        if (state.gold >= crop.cost) {
            if (navigator.vibrate) navigator.vibrate(20);
            state.gold -= crop.cost;
            const plot = state.plots[index];
            plot.status = 'growing';
            plot.cropId = crop.id;
            plot.plantTime = Date.now();
            showFloatingText(index, `-${crop.cost}`, 'red');
            updateStatsUI();
            updatePlotUI(index);
            saveGame();
        } else {
            showToast("金币不足！看广告赚点吧？");
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
        }
    }

    function updateStatsUI() {
        elements.gold.textContent = state.gold;
        elements.level.textContent = state.level;
        elements.exp.textContent = state.exp;
        const percentage = Math.min(100, (state.exp / state.nextLevelExp) * 100);
        elements.expFill.style.width = `${percentage}%`;
        elements.maxExp.textContent = state.nextLevelExp;
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
        card.appendChild(el);
        setTimeout(() => el.remove(), 1000);
    }

    function startLoop() {
        setInterval(() => {
            const now = Date.now();
            state.plots.forEach((plot, index) => {
                if (plot.status === 'growing') {
                    const crop = CROPS[plot.cropId];
                    if (now - plot.plantTime >= crop.growthTime) {
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
