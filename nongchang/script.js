document.addEventListener('DOMContentLoaded', () => {
    // Game Data
    const CROPS = {
        wheat: {
            id: 'wheat',
            name: '小麦',
            emoji: '🌾',
            seedEmoji: '🌱',
            cost: 10,
            sellPrice: 15,
            growthTime: 3000,
            exp: 2,
            minLevel: 1
        },
        corn: {
            id: 'corn',
            name: '玉米',
            emoji: '🌽',
            seedEmoji: '🌱',
            cost: 20,
            sellPrice: 35,
            growthTime: 5000,
            exp: 4,
            minLevel: 2
        },
        carrot: {
            id: 'carrot',
            name: '胡萝卜',
            emoji: '🥕',
            seedEmoji: '🌱',
            cost: 30,
            sellPrice: 55,
            growthTime: 8000,
            exp: 6,
            minLevel: 3
        }
    };

    // Game State
    let state = {
        gold: 100,
        level: 1,
        exp: 0,
        nextLevelExp: 100,
        selectedCropId: 'wheat',
        plots: Array(25).fill(null).map((_, i) => ({
            id: i,
            status: 'empty', // empty, growing, ready
            cropId: null,
            plantTime: 0,
            level: 1 // Plot level (decorative for now)
        }))
    };

    // DOM Elements
    const elements = {
        gold: document.getElementById('gold'),
        level: document.getElementById('level'),
        exp: document.getElementById('exp'),
        expFill: document.getElementById('exp-fill'),
        farmGrid: document.getElementById('farm-grid'),
        shopItems: document.getElementById('shop-items'),
        tabs: document.querySelectorAll('.tab-btn'),
        tabPanes: document.querySelectorAll('.tab-pane'),
        toast: document.getElementById('message-toast')
    };

    // Initialization
    function init() {
        renderGrid();
        renderShop();
        updateStats();
        setupTabs();
        startLoop();

        // Initial selection
        selectShopItem('wheat');
    }

    // Tabs Logic
    function setupTabs() {
        elements.tabs.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;

                // Update buttons
                elements.tabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update panes
                elements.tabPanes.forEach(p => p.classList.remove('active'));
                document.getElementById(`${tabName}-tab`).classList.add('active');
            });
        });
    }

    // Render Grid
    function renderGrid() {
        elements.farmGrid.innerHTML = '';
        state.plots.forEach((plot, index) => {
            const card = document.createElement('div');
            card.className = 'plot-card';
            card.dataset.index = index;
            card.onclick = () => handlePlotClick(index);

            // Level Badge
            const lvlBadge = document.createElement('div');
            lvlBadge.className = 'plot-level';
            lvlBadge.textContent = `Lv${plot.level}`;
            card.appendChild(lvlBadge);

            // Content
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
                emojiDiv.textContent = '🕳️'; // Hole/Empty
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
                progressBar.style.display = 'none'; // Or keep it full
                statusText.style.color = '#4CAF50';
                statusText.style.fontWeight = 'bold';
            }

            card.appendChild(emojiDiv);
            card.appendChild(progressBar);
            card.appendChild(statusText);

            elements.farmGrid.appendChild(card);
        });
    }

    // Update specific plot UI (for efficiency)
    function updatePlotUI(index) {
        const plot = state.plots[index];
        const card = elements.farmGrid.children[index];
        if (!card) return;

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

            // Calculate progress
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

    // Render Shop
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
        state.selectedCropId = id;

        // Update visual selection
        const items = document.querySelectorAll('.shop-item');
        items.forEach(item => {
            if (item.dataset.id === id) item.classList.add('selected');
            else item.classList.remove('selected');
        });
    }

    // Gameplay Actions
    function handlePlotClick(index) {
        const plot = state.plots[index];

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

    function plantCrop(index) {
        const crop = CROPS[state.selectedCropId];
        if (state.gold >= crop.cost) {
            state.gold -= crop.cost;

            const plot = state.plots[index];
            plot.status = 'growing';
            plot.cropId = crop.id;
            plot.plantTime = Date.now();

            showFloatingText(index, `-${crop.cost}`, 'red');
            updateStats();
            updatePlotUI(index);
        } else {
            showToast("金币不足！看广告赚点吧？");
        }
    }

    function harvestCrop(index) {
        const plot = state.plots[index];
        const crop = CROPS[plot.cropId];

        state.gold += crop.sellPrice;
        state.exp += crop.exp;

        showFloatingText(index, `+${crop.sellPrice}`, 'gold');

        // Reset plot
        plot.status = 'empty';
        plot.cropId = null;
        plot.plantTime = 0;

        checkLevelUp();
        updateStats();
        updatePlotUI(index);
    }

    function checkLevelUp() {
        if (state.exp >= state.nextLevelExp) {
            state.level++;
            state.exp -= state.nextLevelExp;
            state.nextLevelExp = Math.floor(state.nextLevelExp * 1.5);

            showToast(`🎉 升级了！当前等级 Lv.${state.level}`);
            renderShop(); // Update unlocked items
        }
    }

    function updateStats() {
        elements.gold.textContent = state.gold;
        elements.level.textContent = state.level;
        elements.exp.textContent = state.exp;

        // Update exp bar
        const percentage = Math.min(100, (state.exp / state.nextLevelExp) * 100);
        elements.expFill.style.width = `${percentage}%`;
        document.getElementById('max-exp').textContent = state.nextLevelExp;
    }

    // Utilities
    function showToast(msg) {
        elements.toast.textContent = msg;
        elements.toast.classList.add('show');
        setTimeout(() => {
            elements.toast.classList.remove('show');
        }, 2000);
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
            let needsRender = false;

            state.plots.forEach((plot, index) => {
                if (plot.status === 'growing') {
                    const crop = CROPS[plot.cropId];
                    if (now - plot.plantTime >= crop.growthTime) {
                        plot.status = 'ready';
                        updatePlotUI(index);
                    } else {
                        // Update progress bar
                        updatePlotUI(index);
                    }
                }
            });
        }, 100); // 10fps for smooth progress bars
    }

    // Start Game
    init();
});
