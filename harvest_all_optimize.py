import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# Enhance harvestAll
harvest_all_pattern = r"function harvestAll\(\) \{[\s\S]*?(?=\n    function plantAll\(\))"

optimized_harvest = """
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
                } else {
                    plot.status = 'empty';
                    plot.cropId = null;
                    plot.plantTime = 0;
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
"""

if "totalBonusGold" not in js:
    js = re.sub(harvest_all_pattern, optimized_harvest, js)

with open(file_path, 'w') as f:
    f.write(js)

print("Harvest All logic optimized to include events and aggregate messages.")
