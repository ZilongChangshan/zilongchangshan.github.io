import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# Enhance checkOfflineProgress()
offline_logic = """
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
"""

if "function checkOfflineProgress() {" in js:
    # Replace existing function
    pattern = r"function checkOfflineProgress\(\) \{[\s\S]*?(?=\n    function setupControlButtons)"
    js = re.sub(pattern, offline_logic, js)

with open(file_path, 'w') as f:
    f.write(js)

print("Offline progress enhanced.")
