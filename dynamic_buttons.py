import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# 1. Update selectShopItem to modify the plantAll button text and color
select_shop_pattern = r"(// Apply Grid Highlighting Modes)"
dynamic_button_logic = """
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
"""

if "elements.plantAllBtn.style.backgroundColor =" not in js:
    js = js.replace("// Apply Grid Highlighting Modes", dynamic_button_logic.strip())

# 2. Add fertilizeAll function
fertilize_logic = """
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
"""

if "function fertilizeAll()" not in js:
    js = js.replace("function plantAll() {", fertilize_logic + "\n    function plantAll() {")

# 3. Fix initial load state in checkControlButtonsUnlock
unlock_pattern = r"(elements\.plantAllBtn\.style\.filter = 'none';\n\s*elements\.plantAllBtn\.onclick = plantAll;)"
unlock_replacement = """elements.plantAllBtn.style.filter = 'none';
                elements.plantAllBtn.onclick = state.selectedItemId === 'fertilizer' ? fertilizeAll : plantAll;"""

if "state.selectedItemId === 'fertilizer' ? fertilizeAll : plantAll" not in js:
    js = re.sub(unlock_pattern, unlock_replacement, js)

with open(file_path, 'w') as f:
    f.write(js)

print("Dynamic buttons and fertilizeAll added.")
