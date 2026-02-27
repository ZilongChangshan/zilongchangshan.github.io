import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js_content = f.read()

# 1. Update Initial State
pet_state_additions = """
        pet: {
            unlocked: false,
            energy: 100,
            mood: 100,
            level: 1,
            exp: 0,
            adventureEndTime: 0,
            adventureStatus: 'idle', // 'idle', 'exploring'
            logs: []
        },"""

# Insert into state definition (after gold)
js_content = js_content.replace('gold: 100,', 'gold: 100,\n' + pet_state_additions)

# 2. Add new DOM elements for Pet
dom_additions = """
        petTab: document.getElementById('pet-tab'),
        petContent: document.getElementById('pet-content'),
        petUnlockMsg: document.getElementById('pet-unlock-msg'),
        petEnergyFill: document.getElementById('pet-energy-fill'),
        petMoodFill: document.getElementById('pet-mood-fill'),
        petEnergyText: document.getElementById('pet-energy-text'),
        petMoodText: document.getElementById('pet-mood-text'),
        adventureStatus: document.getElementById('adventure-status'),
        adventureTimer: document.getElementById('adventure-timer'),
        adventureBtn: document.getElementById('adventure-btn'),
        adventureLog: document.getElementById('adventure-log'),
"""
js_content = js_content.replace('achievementsTab: document.getElementById(\'achievements-tab\'),', 'achievementsTab: document.getElementById(\'achievements-tab\'),\n' + dom_additions)

# 3. Add Pet Functions

pet_functions = """
    // Pet System
    const PET_CONFIG = {
        adventureCost: 20,
        adventureTime: 180000, // 3 minutes
        maxEnergy: 100,
        energyRegen: 1, // per tick (10s)
        maxLogs: 10
    };

    function initPetUI() {
        if (!state.pet) {
            state.pet = {
                unlocked: state.hasDog || false,
                energy: 100,
                mood: 100,
                level: 1,
                exp: 0,
                adventureEndTime: 0,
                adventureStatus: 'idle',
                logs: []
            };
        }

        // Sync old boolean
        if (state.hasDog && !state.pet.unlocked) state.pet.unlocked = true;

        updatePetUI();

        // Bind Adventure Button
        if (elements.adventureBtn) {
            elements.adventureBtn.onclick = startAdventure;
        }
    }

    function updatePetUI() {
        if (!elements.petTab) return;

        if (!state.pet.unlocked) {
            elements.petUnlockMsg.style.display = 'block';
            elements.petContent.style.display = 'none';
            return;
        }

        elements.petUnlockMsg.style.display = 'none';
        elements.petContent.style.display = 'flex';

        // Energy Bar
        const energyPercent = (state.pet.energy / PET_CONFIG.maxEnergy) * 100;
        elements.petEnergyFill.style.width = `${energyPercent}%`;
        elements.petEnergyText.textContent = `${Math.floor(state.pet.energy)}/${PET_CONFIG.maxEnergy}`;

        // Mood (Placeholder for now)
        elements.petMoodFill.style.width = `${state.pet.mood}%`;

        // Adventure Status
        const now = Date.now();
        if (state.pet.adventureStatus === 'exploring') {
            const remaining = Math.max(0, state.pet.adventureEndTime - now);
            if (remaining > 0) {
                elements.adventureBtn.disabled = true;
                elements.adventureBtn.textContent = '🐕 探险中...';
                elements.adventureTimer.textContent = formatTime(remaining);
                elements.adventureStatus.textContent = '正在森林深处探索...';
            } else {
                completeAdventure();
            }
        } else {
            elements.adventureBtn.disabled = state.pet.energy < PET_CONFIG.adventureCost;
            elements.adventureBtn.textContent = `🌲 开始探险 (消耗 ${PET_CONFIG.adventureCost} ⚡)`;
            elements.adventureTimer.textContent = '--:--';
            elements.adventureStatus.textContent = '准备出发';
        }

        // Render Logs
        renderAdventureLogs();
    }

    function startAdventure() {
        if (state.pet.energy >= PET_CONFIG.adventureCost) {
            state.pet.energy -= PET_CONFIG.adventureCost;
            state.pet.adventureStatus = 'exploring';
            state.pet.adventureEndTime = Date.now() + PET_CONFIG.adventureTime;
            showToast('🐕 旺财出发去探险了！');
            updatePetUI();
            saveGame();
        } else {
            showToast('体力不足，休息一会儿吧 💤');
        }
    }

    function completeAdventure() {
        state.pet.adventureStatus = 'idle';

        // Rewards Logic
        const rewards = [];
        const roll = Math.random();

        // Gold (Guaranteed)
        const goldAmt = Math.floor(50 + Math.random() * 100 + (state.level * 10));
        state.gold += goldAmt;
        rewards.push({ icon: '💰', text: `获得了 ${goldAmt} 金币` });

        // Rare Item (Chance)
        if (roll < 0.3) {
            const fertilizerAmt = Math.floor(Math.random() * 3) + 1;
            // We don't track inventory count for fertilizer yet, usually buying uses gold directly.
            // Let's just give gold equivalent or implement inventory later.
            // For now, let's just give extra gold as "sold found item".
            // OR unlock a special crop?
            // Let's give a "Shiny Stone" (Gold)
            const bonusGold = 500;
            state.gold += bonusGold;
            rewards.push({ icon: '💎', text: `发现稀有宝石! (+${bonusGold} 💰)` });
        } else if (roll < 0.5) {
             // Experience
             const expAmt = 50;
             state.exp += expAmt;
             rewards.push({ icon: '⭐', text: `获得了 ${expAmt} 经验` });
        }

        // Log
        const logEntry = {
            time: Date.now(),
            rewards: rewards
        };
        state.pet.logs.unshift(logEntry);
        if (state.pet.logs.length > PET_CONFIG.maxLogs) state.pet.logs.pop();

        showToast('🐕 旺财探险归来！收获满满！');
        checkLevelUp();
        updateStatsUI();
        updatePetUI();
        saveGame();
    }

    function renderAdventureLogs() {
        if (!elements.adventureLog) return;
        elements.adventureLog.innerHTML = '';

        if (state.pet.logs.length === 0) {
            elements.adventureLog.innerHTML = '<li class="log-item" style="color:#666; justify-content:center;">暂无记录</li>';
            return;
        }

        state.pet.logs.forEach(log => {
            const li = document.createElement('li');
            li.className = 'log-item';

            const timeStr = new Date(log.time).toLocaleTimeString();

            let rewardsHtml = '';
            log.rewards.forEach(r => {
                rewardsHtml += `<div>${r.icon} ${r.text}</div>`;
            });

            li.innerHTML = `
                <div class="log-icon">📍</div>
                <div class="log-content">
                    <div class="log-msg">${rewardsHtml}</div>
                    <span class="log-time">${timeStr}</span>
                </div>
            `;
            elements.adventureLog.appendChild(li);
        });
    }

    // Regen Pet Energy
    function regenPet() {
        if (state.pet && state.pet.unlocked && state.pet.energy < PET_CONFIG.maxEnergy) {
            state.pet.energy = Math.min(PET_CONFIG.maxEnergy, state.pet.energy + (PET_CONFIG.energyRegen * 0.5)); // Slower regen
            // Only update UI if tab is active to save perf?
            // Actually updatePetUI checks for element existence but not visibility.
            // Let's just call it.
            if (currentShopTab === 'pet') updatePetUI(); // Logic reuse: I should track active main tab
        }
    }
"""

# Append functions to end of file, inside DOMContentLoaded but before end
# Actually, inserting before the last  call is safer.
js_content = js_content.replace('init();', pet_functions + '\n    init();')

# 4. Hook into Game Loop
# Inside startLoop interval
loop_hook = """
            // Pet Regen & Update
            regenPet();
            if (document.getElementById('pet-tab').classList.contains('active')) {
                updatePetUI();
            }
"""
js_content = js_content.replace('// Update Modal if open', loop_hook + '\n            // Update Modal if open')

# 5. Hook into Init
init_hook = "initPetUI();"
js_content = js_content.replace('setupShopTabs();', 'setupShopTabs();\n        ' + init_hook)

# 6. Hook into Tab Switching
# Inside setupTabs
tab_hook = "if (tabName === 'pet') updatePetUI();"
js_content = js_content.replace('if (tabName === \'achievements\') renderAchievements();', 'if (tabName === \'achievements\') renderAchievements();\n                ' + tab_hook)


with open(file_path, 'w') as f:
    f.write(js_content)

print("Updated script.js with Pet Logic.")
