import { state, saveGame } from './state.js';
import { elements } from './ui.js';
import { CROPS, ITEMS } from './data.js';
import { buyDog, buyPetFood } from './farm.js'; // imported actions

let _plantAllFn = null;
let _fertilizeAllFn = null;
export function initShopDeps(plantAll, fertilizeAll) {
    _plantAllFn = plantAll;
    _fertilizeAllFn = fertilizeAll;
}

export function renderShop() {
    elements.shopItems.innerHTML = '';

    if (state.currentShopTab === 'seeds') {
        Object.values(CROPS)
            .sort((a, b) => a.minLevel - b.minLevel)
            .forEach(crop => {
                const item = createShopItemElement(crop, 'crop');
                elements.shopItems.appendChild(item);
            });
    } else if (state.currentShopTab === 'items') {
        Object.values(ITEMS).forEach(itm => {
            const item = createShopItemElement(itm, 'item');
            elements.shopItems.appendChild(item);
        });
    }
}

function createShopItemElement(obj, type) {
    const item = document.createElement('div');
    item.className = 'shop-item';
    item.dataset.id = obj.id;
    item.dataset.type = type;

    const isSelected = state.selectedItemId === obj.id && state.selectedItemType === type;
    if (isSelected) item.classList.add('selected');

    let isLocked = false;
    if (type === 'crop') {
        isLocked = state.level < obj.minLevel;
        if (isLocked) item.classList.add('locked');
    }

    item.onclick = () => {
        if (!isLocked) selectShopItem(obj.id, type);
    };

    const icon = document.createElement('div');
    icon.className = 'shop-icon';
    icon.textContent = obj.emoji;

    const info = document.createElement('div');
    info.className = 'shop-info';
    const name = document.createElement('span');
    name.className = 'shop-name';

    if (type === 'crop') {
        name.textContent = isLocked ? `??? (Lv.${obj.minLevel})` : obj.name;
        const cost = document.createElement('div');
        cost.className = 'shop-cost';
        cost.textContent = `💰 ${obj.cost}  ⏳ ${obj.growthTime/1000}s`;
        info.appendChild(name);
        info.appendChild(cost);
    } else if (type === 'item') {
        name.textContent = obj.name;
        const cost = document.createElement('div');
        cost.className = 'shop-cost';

        if (obj.id === 'dog' && state.hasDog) {
            cost.textContent = '已拥有';
            item.classList.add('owned');
        } else {
            cost.textContent = `💰 ${obj.cost}  ${obj.desc}`;
        }

        info.appendChild(name);
        info.appendChild(cost);
    }

    item.appendChild(icon);
    item.appendChild(info);
    return item;
}

export function selectShopItem(id, type) {
    if (id === 'pet_food') {
        if (confirm("购买高级狗粮 (50💰) 并喂食旺财?")) buyPetFood();
        return;
    }
    if (id === 'dog') {
        if (confirm(`购买看门狗 (${ITEMS['dog'].cost}💰)? 它会自动为你捡钱并驱赶害虫。`)) buyDog();
        return;
    }

    if (navigator.vibrate) navigator.vibrate(10);

    state.selectedItemId = id;
    state.selectedItemType = type;
    saveGame();

    const items = document.querySelectorAll('.shop-item');
    items.forEach(item => {
        if (item.dataset.id === id && item.dataset.type === type) item.classList.add('selected');
        else item.classList.remove('selected');
    });

    const toolIcon = document.getElementById('active-tool-icon');
    const toolName = document.getElementById('active-tool-name');
    if (toolIcon && toolName) {
        const data = type === 'crop' ? CROPS[id] : ITEMS[id];
        toolIcon.textContent = data.emoji || data.seedEmoji;
        toolName.textContent = data.name;
    }

    if (elements.plantAllBtn) {
        const span = elements.plantAllBtn.querySelector('span');
        if (type === 'crop') {
            span.textContent = '一键播种';
            elements.plantAllBtn.style.backgroundColor = '#2196F3';
            elements.plantAllBtn.onclick = _plantAllFn;
        } else if (id === 'fertilizer') {
            span.textContent = '一键施肥';
            elements.plantAllBtn.style.backgroundColor = '#FF9800';
            elements.plantAllBtn.onclick = _fertilizeAllFn;
        }
    }

    elements.farmGrid.classList.remove('mode-planting', 'mode-fertilizer');
    if (type === 'crop') {
        elements.farmGrid.classList.add('mode-planting');
    } else if (id === 'fertilizer') {
        elements.farmGrid.classList.add('mode-fertilizer');
    }
}
