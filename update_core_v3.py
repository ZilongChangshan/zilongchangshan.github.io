import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# 1. Update Harvest Logic for Trees
# Find: plot.status = 'empty'; plot.cropId = null; plot.plantTime = 0;
# And replace with tree check

harvest_reset = r"plot\.status = 'empty';\s*plot\.cropId = null;\s*plot\.plantTime = 0;"
new_harvest_reset = """
        if (crop.isTree) {
            plot.status = 'growing';
            plot.plantTime = Date.now();
        } else {
            plot.status = 'empty';
            plot.cropId = null;
            plot.plantTime = 0;
        }
"""

if "crop.isTree" not in js:
    js = re.sub(harvest_reset, new_harvest_reset, js, count=2) # Should match harvestCrop and harvestAll

# 2. Add Factory Loop Logic
# In `startLoop`, add processing logic

factory_loop = """
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
"""

if "Process Factory Queue" not in js:
    # Insert at the beginning of startLoop interval
    loop_start = r"setInterval\(\(\) => \{\s*const now = Date\.now\(\);"
    new_loop_start = "setInterval(() => {\n            const now = Date.now();" + factory_loop
    js = re.sub(loop_start, new_loop_start, js)

with open(file_path, 'w') as f:
    f.write(js)

print("Core logic updated for Trees and Factory loop.")
