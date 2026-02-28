import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# Fix tab switch logic
tab_switch = "if (tabName === 'factory') updateFactoryUI();"
if tab_switch not in js:
    # Look for `if (tabName === 'storage') { updateStorageUI(); updateOrdersUI(); }`
    # Or `if (tabName === 'storage') updateStorageUI();`
    storage_line = "if (tabName === 'storage') { updateStorageUI(); updateOrdersUI(); }"
    if storage_line in js:
        js = js.replace(storage_line, storage_line + "\n                " + tab_switch)
    else:
        print("Could not find storage tab switch line.")

# Verify `renderFactory` and `updateFactoryUI` exist
if "function renderFactory()" not in js:
    print("WARNING: renderFactory is missing!")

    factory_logic = """
    function renderFactory() {
        const recipeList = document.getElementById('recipe-list');
        if (!recipeList) return;

        recipeList.innerHTML = '';

        Object.values(PRODUCTS).forEach(prod => {
            const recipe = RECIPES[prod.id];
            let canCraft = true;
            let reqHtml = '';

            for (const [matId, reqQty] of Object.entries(recipe)) {
                const matQty = state.storage[matId] || 0;
                if (matQty < reqQty) canCraft = false;
                const crop = CROPS[matId];
                if(crop) reqHtml += `<span style="color:${matQty >= reqQty ? '#4CAF50' : '#ff4444'}; margin-right:8px;">${crop.emoji} ${matQty}/${reqQty}</span>`;
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
                <button class="action-btn" style="width:auto; padding:6px 12px; margin-left:10px; background-color:${canCraft ? '#2196F3' : '#555'}; border:none; border-radius:4px; color:white; font-size:0.8rem; cursor:pointer;" ${canCraft ? '' : 'disabled'}>
                    加工
                </button>
            `;

            if (canCraft) {
                item.querySelector('.action-btn').onclick = () => startCrafting(prod.id);
            } else {
                item.style.opacity = '0.7';
            }
            recipeList.appendChild(item);
        });
    }

    function startCrafting(productId) {
        const prod = PRODUCTS[productId];
        const recipe = RECIPES[productId];
        for (const [matId, reqQty] of Object.entries(recipe)) {
            if ((state.storage[matId] || 0) < reqQty) {
                showToast("材料不足!");
                return;
            }
        }
        for (const [matId, reqQty] of Object.entries(recipe)) {
            state.storage[matId] -= reqQty;
        }
        const task = {
            id: Date.now() + Math.random(),
            productId: productId,
            name: prod.name,
            emoji: prod.emoji,
            qty: 1,
            exp: prod.exp,
            duration: prod.craftTime,
            startTime: state.factory.length === 0 ? Date.now() : 0
        };
        state.factory.push(task);
        showToast(`👨‍🍳 开始制作: ${prod.name}`);
        updateStatsUI();
        updateStorageUI();
        updateFactoryUI();
        saveGame();
    }

    function updateFactoryUI() {
        const tab = document.getElementById('factory-tab');
        if (!tab || !tab.classList.contains('active')) return;

        renderFactory();

        const queueContainer = document.getElementById('factory-queue');
        if (!queueContainer) return;

        if (state.factory.length === 0) {
            queueContainer.innerHTML = '<div style="text-align:center; color:#666; font-size:0.8rem; line-height:40px;">暂无加工任务</div>';
            return;
        }

        let html = '';
        state.factory.forEach((task, index) => {
            if (index === 0) {
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
    """
    js = js.replace('init();', factory_logic + '\n    init();')

with open(file_path, 'w') as f:
    f.write(js)

print("Factory JS Logic fully patched.")
