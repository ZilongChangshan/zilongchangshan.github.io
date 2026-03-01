import { state, saveGame } from './state.js';
import { elements, showToast, updateStatsUI } from './ui.js';
import { ENV_CONFIG, CROPS, PET_CONFIG } from './data.js';
import { updateStorageUI, addToStorage } from './storage.js';
import { updateFactoryUI } from './factory.js';
import { checkOrders } from './orders.js';
import { regenPet, updatePetUI } from './pet.js';

let _updatePlotUI = null;
let _checkLevelUp = null;

export function initEngineDeps(updatePlotUIFn, checkLevelUpFn) {
    _updatePlotUI = updatePlotUIFn;
    _checkLevelUp = checkLevelUpFn;
}

export function updateEnvironment() {
    const now = Date.now();
    const timeBlock = Math.floor(now / 3600000);

    const seedW = (timeBlock * 9301 + 49297) % 233280;
    const rW = seedW / 233280.0;

    const seedM = (timeBlock * 49297 + 9301) % 233280;
    const rM = seedM / 233280.0;

    let newWeather = 'sunny';
    if (rW < 0.6) newWeather = 'sunny';
    else if (rW < 0.9) newWeather = 'rainy';
    else newWeather = 'rainbow';

    let newMarket = 'normal';
    if (rM < 0.6) newMarket = 'normal';
    else if (rM < 0.8) newMarket = 'boom';
    else newMarket = 'crash';

    if (state.weather !== newWeather || state.market !== newMarket) {
        state.weather = newWeather;
        state.market = newMarket;
        showToast(`环境变化: ${ENV_CONFIG[state.weather].emoji} / 市场: ${ENV_CONFIG[state.market].emoji}`);
        saveGame();
    }

    updateEnvUI();
}

function updateEnvUI() {
    if (elements.weatherDisplay) {
        const w = ENV_CONFIG[state.weather];
        elements.weatherDisplay.textContent = `${w.emoji} ${w.name}`;
        elements.weatherDisplay.title = w.effect;
    }
    if (elements.marketDisplay) {
        const m = ENV_CONFIG[state.market];
        elements.marketDisplay.textContent = `${m.emoji} 市场${m.name} (${m.effect})`;
        elements.marketDisplay.className = `market-status ${state.market}`;
    }
}

export function checkOfflineProgress() {
    const now = Date.now();
    const lastSave = state.lastSaveTime || now;
    const elapsed = now - lastSave;

    let offlineMsgs = [];
    let readyCount = 0;

    state.plots.forEach(plot => {
        if (plot.status === 'growing') {
            const crop = CROPS[plot.cropId];
            if (crop && (now - plot.plantTime >= (plot.growthDuration || crop.growthTime))) {
                readyCount++;
                plot.status = 'ready';
                if(_updatePlotUI) _updatePlotUI(plot.id);
            }
        }
    });
    if (readyCount > 0) offlineMsgs.push(`🌾 ${readyCount} 个作物已成熟`);

    if (state.pet && state.pet.unlocked && state.pet.energy < PET_CONFIG.maxEnergy) {
        const ticks = Math.floor(elapsed / 100);
        const recovered = (ticks * (PET_CONFIG.energyRegen * 0.5));
        state.pet.energy = Math.min(PET_CONFIG.maxEnergy, state.pet.energy + recovered);
        if (recovered >= 10) offlineMsgs.push(`🐕 旺财恢复了体力`);
    }

    if (state.factory && state.factory.length > 0) {
        let remainingOfflineTime = elapsed;
        let craftedCount = 0;

        while (state.factory.length > 0 && remainingOfflineTime > 0) {
            const task = state.factory[0];
            const taskElapsed = now - task.startTime;

            if (taskElapsed >= task.duration) {
                addToStorage(task.productId, task.qty);
                state.exp += task.exp * task.qty;
                craftedCount++;

                remainingOfflineTime -= task.duration;
                state.factory.shift();

                if (state.factory.length > 0) {
                    state.factory[0].startTime = now - remainingOfflineTime;
                }
            } else {
                break;
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

export function startLoop() {
    setInterval(() => {
        const now = Date.now();

        if (state.factory && state.factory.length > 0) {
            const task = state.factory[0];
            const elapsed = now - task.startTime;

            if (elapsed >= task.duration) {
                addToStorage(task.productId, task.qty);
                state.exp += task.exp * task.qty;

                showToast(`👨‍🍳 加工完成: ${task.name} x${task.qty}`);
                if (navigator.vibrate) navigator.vibrate(50);

                state.factory.shift();

                if (state.factory.length > 0) {
                    state.factory[0].startTime = Date.now();
                }

                if(_checkLevelUp) _checkLevelUp();
                updateStatsUI();
                updateStorageUI();
                updateFactoryUI();
                saveGame();
            } else {
                updateFactoryUI();
            }
        }

        updateEnvironment();
        checkOrders();
        regenPet();
        if (document.getElementById('pet-tab').classList.contains('active')) {
            updatePetUI();
        }

        if (state.hasDog) {
            if (Math.random() < 0.02) {
                const foundGold = Math.floor(Math.random() * 20) + 10;
                state.gold += foundGold;
                showToast(`🐕 狗狗捡到了 ${foundGold} 金币!`);
                updateStatsUI();
                saveGame();
            }
            state.plots.forEach((p, idx) => {
                if (p.hasBugs && Math.random() < 0.02) {
                    p.hasBugs = false;
                    showToast("🐕 狗狗抓住了害虫!");
                    if(_updatePlotUI) _updatePlotUI(idx);
                    saveGame();
                }
            });
        }

        if (Math.random() < 0.01) {
            const randomIdx = Math.floor(Math.random() * 25);
            const p = state.plots[randomIdx];
            if (p.unlocked && p.status === 'growing') {
                if (!p.hasWeeds && Math.random() < 0.5) {
                    p.hasWeeds = true;
                    if(_updatePlotUI) _updatePlotUI(randomIdx);
                } else if (!p.hasBugs) {
                    p.hasBugs = true;
                    if(_updatePlotUI) _updatePlotUI(randomIdx);
                }
            }
        }

        let needsCleaning = false;
        state.plots.forEach(p => { if (p.unlocked && (p.hasWeeds || p.hasBugs)) needsCleaning = true; });

        if (elements.cleanAllBtn) {
            elements.cleanAllBtn.style.display = (needsCleaning && state.level >= 5) ? 'block' : 'none';
        }

        state.plots.forEach((plot, index) => {
            if (plot.status === 'growing') {
                const crop = CROPS[plot.cropId];
                const duration = plot.growthDuration || (crop ? crop.growthTime : 3000);

                if (now - plot.plantTime >= duration) {
                    plot.status = 'ready';
                    if(_updatePlotUI) _updatePlotUI(index);
                } else {
                    const card = elements.farmGrid.children[index];
                    if (card) {
                        const progressFill = card.querySelector('.plot-progress-fill');
                        if (progressFill) {
                            const progress = Math.min(100, ((now - plot.plantTime) / duration) * 100);
                            progressFill.style.width = `${progress}%`;
                        }
                    }
                }
            }
        });
    }, 100);
}
