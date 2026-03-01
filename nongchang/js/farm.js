import { state, saveGame } from './state.js';
import { elements, showToast, showFloatingText, updateStatsUI } from './ui.js';
import { CROPS, ITEMS, LAND_COST_BASE, LAND_COST_MULTIPLIER } from './data.js';
import { addToStorage } from './storage.js';
import { checkAchievements } from './achievements.js';

let _checkLevelUp = null;
let _renderShop = null;
let _checkControlButtonsUnlock = null;
let _updatePlotUI = null;
let _renderGrid = null;

export function initFarmDeps(checkLevelUpFn, renderShopFn, checkControlButtonsUnlockFn, updatePlotUIFn, renderGridFn) {
    _checkLevelUp = checkLevelUpFn;
    _renderShop = renderShopFn;
    _checkControlButtonsUnlock = checkControlButtonsUnlockFn;
    _updatePlotUI = updatePlotUIFn;
    _renderGrid = renderGridFn;
}

export function getMaxPlots() {
    return 6 + Math.floor(state.level / 3);
}

export function getLandCost() {
    const ownedPlots = state.plots.filter(p => p.unlocked).length;
    return Math.floor(LAND_COST_BASE * Math.pow(LAND_COST_MULTIPLIER, Math.max(0, ownedPlots - 6)));
}

export function harvestCrop(index) {
    if (navigator.vibrate) navigator.vibrate(50);
    const plot = state.plots[index];
    const crop = CROPS[plot.cropId];

    let bonusGold = 0;

    if (Math.random() < 0.05) {
        bonusGold += crop.sellPrice;
        showToast("✨ 发现金灿灿的作物！获得额外金币奖励！");
    }

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
        showFloatingText(index, 'COMB!', 'purple');
    }

    if (crop.id === 'clover' && Math.random() < 0.3) {
        bonusGold += 500;
        showToast('🍀 幸运草带来了额外的好运! (+500 💰)');
    }
    if (crop.id === 'magic_bean' && Math.random() < 0.01) {
        bonusGold += 100000;
        showToast('🫘 魔豆通往了巨人的宝库! (+10w 💰)');
    }

    addToStorage(crop.id, 1);
    if (bonusGold > 0) {
        state.gold += bonusGold;
        state.stats.totalGold += bonusGold;
        showFloatingText(index, '+' + bonusGold, 'gold');
    } else {
        showFloatingText(index, '+' + crop.exp + ' Exp', 'white');
    }

    state.exp += crop.exp;
    state.stats.cropsHarvested++;

    if (crop.isTree) {
        plot.status = 'growing';
        plot.plantTime = Date.now();
        plot.hasWeeds = false;
        plot.hasBugs = false;
    } else {
        plot.status = 'empty';
        plot.cropId = null;
        plot.plantTime = 0;
        plot.hasWeeds = false;
        plot.hasBugs = false;
    }

    if(_checkLevelUp) _checkLevelUp();
    checkAchievements();
    updateStatsUI();
    if(_updatePlotUI) _updatePlotUI(index);
    saveGame();
}

export function harvestAll() {
    let harvestedCount = 0;
    let totalBonusGold = 0;
    let specialMsgs = [];

    state.plots.forEach((plot, index) => {
        if (plot.unlocked && plot.status === 'ready' && !plot.hasWeeds && !plot.hasBugs) {
            const crop = CROPS[plot.cropId];
            let bonusGold = 0;

            if (Math.random() < 0.05) {
                bonusGold += crop.sellPrice;
                if (harvestedCount === 0) specialMsgs.push("✨ 发现金灿灿的作物！");
            }

            if (crop.id === 'clover' && Math.random() < 0.3) {
                bonusGold += 500;
                specialMsgs.push('🍀 幸运草好运!');
            }
            if (crop.id === 'magic_bean' && Math.random() < 0.01) {
                bonusGold += 100000;
                specialMsgs.push('🫘 魔豆爆发巨量财富!');
            }

            addToStorage(crop.id, 1);
            state.exp += crop.exp;
            state.stats.cropsHarvested++;

            if (bonusGold > 0) {
                totalBonusGold += bonusGold;
                showFloatingText(index, `+${bonusGold}💰`, 'gold');
            } else {
                showFloatingText(index, `+${crop.exp}⭐`, 'white');
            }

            if (crop.isTree) {
                plot.status = 'growing';
                plot.plantTime = Date.now();
                plot.hasWeeds = false;
                plot.hasBugs = false;
            } else {
                plot.status = 'empty';
                plot.cropId = null;
                plot.plantTime = 0;
                plot.hasWeeds = false;
                plot.hasBugs = false;
            }

            if(_updatePlotUI) _updatePlotUI(index);
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

        if(_checkLevelUp) _checkLevelUp();
        checkAchievements();
        updateStatsUI();
        saveGame();
    } else {
        showToast("没有可收获的作物 💤");
    }
}

export function plantCrop(index) {
    const crop = CROPS[state.selectedItemId];
    if (state.gold >= crop.cost) {
        if (navigator.vibrate) navigator.vibrate(20);
        state.gold -= crop.cost;

        let growthTime = crop.growthTime;
        if (state.weather === 'rainy') {
            if (crop.id === 'rice') growthTime = Math.floor(growthTime * 0.4);
            else growthTime = Math.floor(growthTime * 0.7);
        }

        const plot = state.plots[index];
        plot.status = 'growing';
        plot.cropId = crop.id;
        plot.plantTime = Date.now();
        plot.growthDuration = growthTime;

        showFloatingText(index, `-${crop.cost}`, 'red');
        updateStatsUI();
        if(_updatePlotUI) _updatePlotUI(index);
        saveGame();
    } else {
        showToast("金币不足！");
    }
}

export function plantAll() {
    if (state.selectedItemType !== 'crop') {
        showToast("请先选择要种植的种子 🌱");
        return;
    }

    const crop = CROPS[state.selectedItemId];
    if (!crop) return;

    if (state.level < crop.minLevel) {
        showToast(`等级不足，无法种植 ${crop.name}`);
        return;
    }

    let plantedCount = 0;
    let totalCost = 0;
    let plotsToPlant = [];

    state.plots.forEach((plot, index) => {
        if (plot.unlocked && plot.status === 'empty') {
            plotsToPlant.push(index);
        }
    });

    if (plotsToPlant.length === 0) {
        showToast("没有空闲土地");
        return;
    }

    const maxAffordable = Math.floor(state.gold / crop.cost);
    const countToPlant = Math.min(plotsToPlant.length, maxAffordable);

    if (countToPlant === 0) {
        showToast("金币不足！");
        return;
    }

    for (let i = 0; i < countToPlant; i++) {
        const index = plotsToPlant[i];
        const plot = state.plots[index];

        state.gold -= crop.cost;
        plot.status = 'growing';
        plot.cropId = crop.id;
        plot.plantTime = Date.now();

        // Wait, weather is not properly tracked here. Let's fix that.
        let growthTime = crop.growthTime;
        if (state.weather === 'rainy') {
            if (crop.id === 'rice') growthTime = Math.floor(growthTime * 0.4);
            else growthTime = Math.floor(growthTime * 0.7);
        }
        plot.growthDuration = growthTime;

        plantedCount++;
        totalCost += crop.cost;

        if(_updatePlotUI) _updatePlotUI(index);
    }

    if (plantedCount > 0) {
        if (navigator.vibrate) navigator.vibrate(50);
        showToast(`一键播种: ${plantedCount} 个 ${crop.name}, 花费 ${totalCost} 💰`);
        updateStatsUI();
        saveGame();
    }
}

export function useFertilizer(index) {
    const item = ITEMS['fertilizer'];
    if (state.gold >= item.cost) {
        if (navigator.vibrate) navigator.vibrate(20);
        state.gold -= item.cost;

        const plot = state.plots[index];
        const crop = CROPS[plot.cropId];
        plot.plantTime = Date.now() - (plot.growthDuration || crop.growthTime) - 1000;
        plot.status = 'ready';

        showFloatingText(index, `⚡加速!`, 'yellow');
        updateStatsUI();
        if(_updatePlotUI) _updatePlotUI(index);
        saveGame();
    } else {
        showToast("金币不足！需要 💰" + item.cost);
    }
}

export function fertilizeAll() {
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
        plot.plantTime = Date.now() - (plot.growthDuration || crop.growthTime) - 1000;
        plot.status = 'ready';

        fertilizedCount++;
        totalCost += item.cost;

        showFloatingText(index, `⚡加速!`, 'yellow');
        if(_updatePlotUI) _updatePlotUI(index);
    }

    if (fertilizedCount > 0) {
        if (navigator.vibrate) navigator.vibrate(50);
        showToast(`一键施肥: ${fertilizedCount} 个作物, 花费 ${totalCost} 💰`);
        updateStatsUI();
        saveGame();
    }
}

export function cleanAll() {
    let cleanCount = 0;
    let gainedExp = 0;

    state.plots.forEach((plot, index) => {
        if (plot.unlocked && (plot.hasWeeds || plot.hasBugs)) {
            plot.hasWeeds = false;
            plot.hasBugs = false;
            cleanCount++;
            gainedExp += 5;
            if(_updatePlotUI) _updatePlotUI(index);
            showFloatingText(index, '+5⭐', 'white');
        }
    });

    if (cleanCount > 0) {
        if (navigator.vibrate) navigator.vibrate(50);
        state.exp += gainedExp;
        showToast(`一键清理了 ${cleanCount} 个隐患，获得 ${gainedExp} ⭐`);
        updateStatsUI();
        if(_checkLevelUp) _checkLevelUp();
        saveGame();
    } else {
        showToast("没有需要清理的田块 🌟");
    }
}

export function buyLand(index) {
    const cost = getLandCost();
    if (confirm(`解锁这块土地需要 💰 ${cost}，确定购买吗？`)) {
        if (state.gold >= cost) {
            state.gold -= cost;
            state.plots[index].unlocked = true;
            showToast("🎉 土地解锁成功！");
            updateStatsUI();
            checkAchievements();
            if(_updatePlotUI) _updatePlotUI(index);
            saveGame();
        } else {
            showToast("金币不足！💸");
        }
    }
}

export function buyDog() {
    if (state.hasDog) {
        showToast("你已经有一只看门狗了 🐕");
        return;
    }
    const dogItem = ITEMS['dog'];
    if (state.gold >= dogItem.cost) {
        state.gold -= dogItem.cost;
        state.hasDog = true;
        showToast("🐕 看门狗已购买！它会帮你捡金币！");
        updateStatsUI();
        if(_renderShop) _renderShop();
        saveGame();
    } else {
        showToast("金币不足！需要 💰" + dogItem.cost);
    }
}

export function buyPetFood() {
    const cost = 50;
    if (state.gold >= cost) {
        if (state.pet.energy >= 100) {
            showToast("旺财已经吃饱了! 🐕");
            return;
        }
        state.gold -= cost;
        state.pet.energy = Math.min(100, state.pet.energy + 50);
        state.pet.mood = Math.min(100, state.pet.mood + 10);
        showToast("🍖 喂食成功! 体力 +50");
        updateStatsUI();
        // UI updates handled by loop or shop
        saveGame();
    } else {
         showToast(`金币不足! (${cost}💰)`);
    }
}

export function cleanPlot(index, type) {
    const plot = state.plots[index];
    if (type === 'weed') {
        plot.hasWeeds = false;
        showFloatingText(index, '🌿清理 +5⭐', 'white');
    } else if (type === 'bug') {
        plot.hasBugs = false;
        showFloatingText(index, '🐛清理 +5⭐', 'white');
    }
    state.exp += 5;
    if(_checkLevelUp) _checkLevelUp();
    updateStatsUI();
    if(_updatePlotUI) _updatePlotUI(index);
    saveGame();
}
