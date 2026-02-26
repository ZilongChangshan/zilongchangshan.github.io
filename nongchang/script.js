document.addEventListener('DOMContentLoaded', () => {
    // Game Data
    const CROPS = {
        wheat: {
            id: 'wheat',
            name: '小麦',
            emoji: '🌾',
            cost: 10,
            sellPrice: 15,
            growthTime: 3000,
            color: '#eecfa1',
            minLevel: 1
        },
        corn: {
            id: 'corn',
            name: '玉米',
            emoji: '🌽',
            cost: 20,
            sellPrice: 35,
            growthTime: 5000,
            color: '#ffeb3b',
            minLevel: 2
        },
        carrot: {
            id: 'carrot',
            name: '胡萝卜',
            emoji: '🥕',
            cost: 30,
            sellPrice: 55,
            growthTime: 8000,
            color: '#ff7043',
            minLevel: 3
        }
    };

    // Game State
    let state = {
        gold: 100,
        level: 1,
        exp: 0,
        plots: Array(16).fill(null).map((_, i) => ({
            id: i,
            crop: null,
            plantTime: 0,
            status: 'empty'
        })),
        selectedAction: null,
        selectedCropId: 'wheat'
    };

    // DOM Elements
    const elements = {
        gold: document.getElementById('gold'),
        level: document.getElementById('level'),
        exp: document.getElementById('exp'),
        farmGrid: document.getElementById('farm-grid'),
        btnPlant: document.getElementById('btn-plant'),
        btnHarvest: document.getElementById('btn-harvest'),
        btnShop: document.getElementById('btn-shop'),
        messageArea: document.getElementById('message-area'),
        shopModal: document.getElementById('shop-modal'),
        closeShopBtn: document.querySelector('.close-btn'),
        shopItems: document.getElementById('shop-items')
    };

    // Initialization
    function init() {
        renderGrid();
        updateStats();
        startLoop();
        bindEvents();
        showMessage("欢迎来到农场！请选择操作。");
    }

    function bindEvents() {
        elements.btnPlant.addEventListener('click', () => setAction('plant'));
        elements.btnHarvest.addEventListener('click', () => setAction('harvest'));
        elements.btnShop.addEventListener('click', openShop);

        elements.closeShopBtn.addEventListener('click', closeShop);
        window.addEventListener('click', (e) => {
            if (e.target === elements.shopModal) closeShop();
        });

        // Use event delegation for grid clicks
        elements.farmGrid.addEventListener('click', (e) => {
            const plotDiv = e.target.closest('.plot');
            if (plotDiv) {
                const index = parseInt(plotDiv.dataset.index);
                handlePlotClick(index);
            }
        });
    }

    function setAction(action) {
        state.selectedAction = action;

        elements.btnPlant.classList.toggle('active', action === 'plant');
        elements.btnHarvest.classList.toggle('active', action === 'harvest');

        if (action === 'plant') {
            const crop = CROPS[state.selectedCropId];
            showMessage(`种植模式: ${crop.emoji} ${crop.name} (花费 ${crop.cost})`);
        } else if (action === 'harvest') {
            showMessage("收获模式: 点击成熟作物 🧺");
        }
    }

    function openShop() {
        renderShop();
        elements.shopModal.classList.remove('hidden');
    }

    function closeShop() {
        elements.shopModal.classList.add('hidden');
    }

    function renderShop() {
        elements.shopItems.innerHTML = '';
        Object.values(CROPS).forEach(crop => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'shop-item';

            const infoSpan = document.createElement('span');
            infoSpan.textContent = `${crop.emoji} ${crop.name} - 💰 ${crop.cost} (Lv.${crop.minLevel})`;

            const selectBtn = document.createElement('button');
            const isSelected = state.selectedCropId === crop.id;
            selectBtn.textContent = isSelected ? '已选择' : '选择';
            selectBtn.disabled = isSelected || state.level < crop.minLevel;

            if (state.level < crop.minLevel) {
                selectBtn.textContent = '🔒 未解锁';
            } else if (isSelected) {
                selectBtn.textContent = '✔ 已选择';
            } else {
                selectBtn.onclick = () => {
                    state.selectedCropId = crop.id;
                    setAction('plant');
                    closeShop();
                };
            }

            itemDiv.appendChild(infoSpan);
            itemDiv.appendChild(selectBtn);
            elements.shopItems.appendChild(itemDiv);
        });
    }

    function handlePlotClick(index) {
        const plot = state.plots[index];

        if (state.selectedAction === 'plant') {
            if (plot.status !== 'empty') {
                showTemporaryMessage(index, "这里已经有作物了!");
                return;
            }
            const crop = CROPS[state.selectedCropId];
            if (state.gold >= crop.cost) {
                state.gold -= crop.cost;
                state.exp += 2;
                plot.status = 'growing';
                plot.crop = crop;
                plot.plantTime = Date.now();

                showTemporaryMessage(index, `-${crop.cost}💰`);
                updateStats();
                checkLevelUp();
                renderPlot(index);
            } else {
                showMessage("金币不足！ 💸");
            }
        } else if (state.selectedAction === 'harvest') {
            if (plot.status === 'ready') {
                const crop = plot.crop;
                const revenue = crop.sellPrice;
                state.gold += revenue;
                state.exp += 10;

                plot.status = 'empty';
                plot.crop = null;
                plot.plantTime = 0;

                showTemporaryMessage(index, `+${revenue}💰`);
                updateStats();
                renderPlot(index);
                checkLevelUp();
            } else if (plot.status === 'growing') {
                showTemporaryMessage(index, "还未成熟 ⏳");
            } else {
                showTemporaryMessage(index, "没有作物 ❌");
            }
        } else {
            showMessage("请先选择操作 (种植/收获)");
        }
    }

    function startLoop() {
        setInterval(() => {
            const now = Date.now();
            state.plots.forEach((plot, index) => {
                if (plot.status === 'growing') {
                    const elapsed = now - plot.plantTime;
                    if (elapsed >= plot.crop.growthTime) {
                        plot.status = 'ready';
                        renderPlot(index);
                    }
                }
            });
        }, 500);
    }

    function renderGrid() {
        elements.farmGrid.innerHTML = '';
        state.plots.forEach((plot, index) => {
            const div = document.createElement('div');
            div.className = 'plot';
            div.dataset.index = index;
            // Add a floating message container
            const msgDiv = document.createElement('div');
            msgDiv.className = 'floating-msg';
            div.appendChild(msgDiv);

            elements.farmGrid.appendChild(div);
            renderPlot(index);
        });
    }

    function renderPlot(index) {
        const plot = state.plots[index];
        const div = elements.farmGrid.children[index];

        // Preserve floating message container
        let msgDiv = div.querySelector('.floating-msg');
        if (!msgDiv) {
            msgDiv = document.createElement('div');
            msgDiv.className = 'floating-msg';
            div.appendChild(msgDiv);
        }

        // Reset classes but keep plot class
        div.className = 'plot';
        div.innerHTML = '';
        div.appendChild(msgDiv); // Re-append msgDiv

        if (plot.status === 'empty') {
            div.classList.add('empty');
            div.style.backgroundColor = '#f0f0f0';
            const span = document.createElement('span');
            span.textContent = '🕳️ 空闲';
            div.appendChild(span);
        } else if (plot.status === 'growing') {
            div.classList.add('growing');
            div.style.backgroundColor = '#a5d6a7';
            const span = document.createElement('span');
            span.textContent = `🌱 ${plot.crop.name}\n生长中...`;
            div.appendChild(span);
        } else if (plot.status === 'ready') {
            div.classList.add('ready');
            div.style.backgroundColor = plot.crop.color;
            const span = document.createElement('span');
            span.textContent = `${plot.crop.emoji} ${plot.crop.name}\n可收获!`;
            div.appendChild(span);
        }
    }

    function showTemporaryMessage(index, text) {
        const plotDiv = elements.farmGrid.children[index];
        const msgDiv = plotDiv.querySelector('.floating-msg');
        if (msgDiv) {
            msgDiv.textContent = text;
            msgDiv.style.opacity = 1;
            msgDiv.style.top = '0px';

            setTimeout(() => {
                msgDiv.style.opacity = 0;
                msgDiv.style.top = '-20px';
            }, 1000);
        }
    }

    function updateStats() {
        elements.gold.textContent = `💰 金币: ${state.gold}`;
        elements.level.textContent = `⭐ 等级: ${state.level}`;
        elements.exp.textContent = `📈 经验: ${state.exp}`;
    }

    function checkLevelUp() {
        const newLevel = Math.floor(state.exp / 100) + 1;
        if (newLevel > state.level) {
            state.level = newLevel;
            showMessage(`🎉 恭喜! 升级到了 Lv.${state.level}! 解锁新作物!`);
            updateStats();
        }
    }

    function showMessage(msg) {
        elements.messageArea.textContent = msg;
    }

    // Start
    init();
});
