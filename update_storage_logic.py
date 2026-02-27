import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js_content = f.read()

# 1. Update State with Storage
js_content = js_content.replace('gold: 100,', 'gold: 100,\n        storage: {}, // cropId -> quantity')

# 2. Add DOM Elements
dom_additions = """
        storageTab: document.getElementById('storage-tab'),
        storageList: document.getElementById('storage-list'),
        storageTotalVal: document.getElementById('storage-total-val'),
        sellAllGlobalBtn: document.getElementById('sell-all-global-btn'),
"""
js_content = js_content.replace('adventureLog: document.getElementById(\'adventure-log\'),', 'adventureLog: document.getElementById(\'adventure-log\'),\n' + dom_additions)

# 3. Update harvestCrop to store instead of sell
# Find harvestCrop function body
# Replace 'state.gold += goldGain;' with storage logic
# But wait, logic was:
# state.gold += goldGain;
# state.exp += expGain;
# ...
# We need to change this.
# "state.gold += goldGain;" -> "addToStorage(crop.id, 1); state.exp += expGain;"
# AND we need to remove the Gold visual feedback or change it to "+1 [Icon]"

# Finding the harvest logic block again.
# It currently has the special crop logic we added.
# Let's write a targeted replacement for the gold addition line.

# New Logic:
# Always add to storage.
# Gold is NOT added.
# Exp IS added.
# Floating text shows "+1" instead of "+Money".

harvest_replacement = """
        // Storage Logic
        addToStorage(crop.id, 1);

        // Exp is immediate
        state.exp += expGain;

        showFloatingText(index, , 'white');
"""

# We need to remove "state.gold += goldGain;" and the previous floating text line.
# Previous code block around there:
#         if (crop.id === 'magic_bean') {
#              ...
#         }
#
#         state.gold += goldGain;
#         state.exp += expGain;
#
#         // Update Stats
#         state.stats.cropsHarvested++;
#         state.stats.totalGold += goldGain; // This tracks lifetime earnings, maybe still track value?
#         // Actually "totalGold" usually means "gold collected". If we store it, we haven't collected gold yet.
#         // Let's update totalGold only when selling.
#
#         showFloatingText(index, , isGolden ? 'yellow' : 'gold');

# Let's replace the whole block from  down to

# Constructing regex to match the block
# Because indentation varies, it's tricky.
# Let's append the storage functions first, then modify harvestCrop using string replace on specific lines if unique.

storage_functions = """
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
"""

js_content = js_content.replace('init();', storage_functions + '\n    init();')

# Update Harvest Logic
# Replace  with
# Replace  with comment (moved to sell)
# Replace

# We need to be careful.  variable is still calculated above (for potential estimated value display or Special Crop logic).
# Special crop clover logic adds to goldGain.
# If we change system to Storage, Clover bonus gold should probably still be direct gold?
# Or Clover drops a "Gold Nugget" item?
# Let's keep Clover bonus as direct Gold (it says "Extra luck +500 Gold").
# But the crop itself goes to storage.

# Revised Harvest Logic Injection
# Find the block where gold is added.
# We will use Regex to replace the specific lines.

# Old: state.gold += goldGain;
# New: addToStorage(crop.id, 1); state.gold += (goldGain - (crop.sellPrice * marketMod)); // Only add EXTRA gold (from clover/events)
# Actually easier: Recalculate base sell price, subtract from goldGain, the remainder is bonus.
# Or just separate them.

# Let's rewrite harvestCrop completely using regex replacement for the whole function body if possible, or just the end part.
# The end part is consistent.

start_marker = "state.gold += goldGain;"
end_marker = "saveGame();"

# We need to match everything between them to replace correctly.
# But  line varies.

# Let's replace line by line.
js_content = js_content.replace("state.gold += goldGain;", "// state.gold += goldGain; // Moved to Storage")
js_content = js_content.replace("state.stats.totalGold += goldGain;", "// state.stats.totalGold += goldGain; // Moved to Storage")

# Now insert  before
js_content = js_content.replace("state.exp += expGain;", "addToStorage(crop.id, 1);\n        state.exp += expGain;")

# Fix floating text
# We want to show "+1 🌾" instead of "+15" (unless bonus)
# This is hard to regex cleanly without breaking the "Golden Crop" or "Combo" text logic which relies on goldGain.
# Let's just modify  call to show crop emoji if goldGain corresponds to sellPrice.
# This is getting messy.

# Alternative:
# Just replace the whole  function with the new version.
# Since I have the full content in memory, I can construct the new function.

new_harvest_crop = """    function harvestCrop(index) {
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
            showFloatingText(index, , 'purple');
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
            showFloatingText(index, , 'gold');
        } else {
            showFloatingText(index, , 'white');
        }

        state.exp += crop.exp;
        state.stats.cropsHarvested++;

        plot.status = 'empty';
        plot.cropId = null;
        plot.plantTime = 0;

        checkLevelUp();
        checkAchievements();
        updateStatsUI();
        updatePlotUI(index);
        saveGame();
    }"""

# Regex to replace existing harvestCrop function
# Matches
# We need to match braces carefully.
# Since I used  earlier, I know the exact structure.
# I will find the start index and end index of the function manually in python.

start_idx = js_content.find("function harvestCrop(index) {")
if start_idx != -1:
    brace_count = 0
    end_idx = -1
    for i in range(start_idx, len(js_content)):
        if js_content[i] == '{':
            brace_count += 1
        elif js_content[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                end_idx = i + 1
                break

    if end_idx != -1:
        js_content = js_content[:start_idx] + new_harvest_crop + js_content[end_idx:]

# Also update harvestAll to use storage
# Similar replace or manual update
new_harvest_all = """    function harvestAll() {
        let harvestedCount = 0;

        state.plots.forEach((plot, index) => {
            if (plot.unlocked && plot.status === 'ready') {
                const crop = CROPS[plot.cropId];

                // Simplified harvest all logic (no combos/events for bulk for simplicity, or we add them?)
                // Let's keep it simple: just storage + exp
                addToStorage(crop.id, 1);
                state.exp += crop.exp;
                state.stats.cropsHarvested++;

                plot.status = 'empty';
                plot.cropId = null;
                plot.plantTime = 0;

                updatePlotUI(index);
                harvestedCount++;
            }
        });

        if (harvestedCount > 0) {
            if (navigator.vibrate) navigator.vibrate(100);
            showToast();
            checkLevelUp();
            checkAchievements();
            updateStatsUI();
            saveGame();
        } else {
            showToast("没有可收获的作物");
        }
    }"""

start_idx = js_content.find("function harvestAll() {")
if start_idx != -1:
    brace_count = 0
    end_idx = -1
    for i in range(start_idx, len(js_content)):
        if js_content[i] == '{':
            brace_count += 1
        elif js_content[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                end_idx = i + 1
                break

    if end_idx != -1:
        js_content = js_content[:start_idx] + new_harvest_all + js_content[end_idx:]

# Add Hooks
# Hook tab update
js_content = js_content.replace("if (tabName === 'pet') updatePetUI();", "if (tabName === 'pet') updatePetUI();\n                if (tabName === 'storage') updateStorageUI();")

with open(file_path, 'w') as f:
    f.write(js_content)

print("Updated script.js with Storage Logic.")
