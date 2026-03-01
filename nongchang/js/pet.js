import { state, saveGame } from './state.js';
import { elements, showToast, updateStatsUI, formatTime } from './ui.js';
import { PET_CONFIG } from './data.js';

let _checkLevelUp = null;
export function initPetDeps(checkLevelUpFn) {
    _checkLevelUp = checkLevelUpFn;
}

export function initPetUI() {
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

    if (state.hasDog && !state.pet.unlocked) state.pet.unlocked = true;

    updatePetUI();

    if (elements.adventureBtn) {
        elements.adventureBtn.onclick = startAdventure;
    }
}

export function updatePetUI() {
    if (!elements.petTab) return;

    if (!state.pet.unlocked) {
        elements.petUnlockMsg.style.display = 'block';
        elements.petContent.style.display = 'none';
        return;
    }

    elements.petUnlockMsg.style.display = 'none';
    elements.petContent.style.display = 'flex';

    const energyPercent = (state.pet.energy / PET_CONFIG.maxEnergy) * 100;
    elements.petEnergyFill.style.width = `${energyPercent}%`;
    elements.petEnergyText.textContent = `${Math.floor(state.pet.energy)}/${PET_CONFIG.maxEnergy}`;

    elements.petMoodFill.style.width = `${state.pet.mood}%`;

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

    const rewards = [];
    const roll = Math.random();

    const goldAmt = Math.floor(50 + Math.random() * 100 + (state.level * 10));
    state.gold += goldAmt;
    rewards.push({ icon: '💰', text: `获得了 ${goldAmt} 金币` });

    if (roll < 0.3) {
        const bonusGold = 500;
        state.gold += bonusGold;
        rewards.push({ icon: '💎', text: `发现稀有宝石! (+${bonusGold} 💰)` });
    } else if (roll < 0.5) {
         const expAmt = 50;
         state.exp += expAmt;
         rewards.push({ icon: '⭐', text: `获得了 ${expAmt} 经验` });
    }

    const logEntry = {
        time: Date.now(),
        rewards: rewards
    };
    state.pet.logs.unshift(logEntry);
    if (state.pet.logs.length > PET_CONFIG.maxLogs) state.pet.logs.pop();

    showToast('🐕 旺财探险归来！收获满满！');
    if(_checkLevelUp) _checkLevelUp();
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

export function regenPet() {
    if (state.pet && state.pet.unlocked && state.pet.energy < PET_CONFIG.maxEnergy) {
        state.pet.energy = Math.min(PET_CONFIG.maxEnergy, state.pet.energy + (PET_CONFIG.energyRegen * 0.5));
        if (state.currentShopTab === 'pet') updatePetUI(); // Keep old check for now, though it should be elements.petTab.classList.contains active
    }
}
