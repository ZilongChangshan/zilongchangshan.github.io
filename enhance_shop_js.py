import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# Enhance `selectShopItem`
select_shop_pattern = r"(function selectShopItem\(id, type\) \{)([\s\S]*?)(const items = document\.querySelectorAll\('\.shop-item'\);)"

enhanced_select = """function selectShopItem(id, type) {
        // Direct Action Items (Don't equip, just use/buy)
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

        // Update Active Tool UI
        const toolIcon = document.getElementById('active-tool-icon');
        const toolName = document.getElementById('active-tool-name');
        if (toolIcon && toolName) {
            const data = type === 'crop' ? CROPS[id] : ITEMS[id];
            toolIcon.textContent = data.emoji || data.seedEmoji;
            toolName.textContent = data.name;
        }

        // Apply Grid Highlighting Modes
        elements.farmGrid.classList.remove('mode-planting', 'mode-fertilizer');
        if (type === 'crop') {
            elements.farmGrid.classList.add('mode-planting');
        } else if (id === 'fertilizer') {
            elements.farmGrid.classList.add('mode-fertilizer');
        }

        """

if "active-tool-icon" not in js:
    js = re.sub(select_shop_pattern, enhanced_select + r"\3", js)

with open(file_path, 'w') as f:
    f.write(js)

print("Shop interactions enhanced.")
