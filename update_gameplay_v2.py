import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# 1. Add Orders to Initial State
if 'orders: []' not in js:
    js = js.replace('storage: {},', 'storage: {},\n        orders: [],')

# 2. Add Pet Food Item
if 'pet_food' not in js:
    # Find ITEMS object end
    # We look for `ITEMS = {` and insert after the first brace, or append to end of list.
    # The list ends with `};`.
    # Let's find `const ITEMS = {` and iterate to find closing `};`.
    # Easier: Replace `dog: { ... }` with `dog: { ... },\n        pet_food: { ... }`
    dog_entry = "dog: { id: 'dog', name: '看门狗', emoji: '🐕', cost: 1000, desc: '自动捡钱 & 防虫', type: 'pet', max: 1 }"
    new_entry = dog_entry + ",\n        pet_food: { id: 'pet_food', name: '高级狗粮', emoji: '🍖', cost: 50, desc: '恢复 50 体力', type: 'item' }"
    js = js.replace(dog_entry, new_entry)

# 3. Add Orders UI Logic and Functions
new_code = r"""

    // --- Order System ---
    const MAX_ORDERS = 3;

    function generateOrder() {
        if (state.orders.length >= MAX_ORDERS) return;

        const unlockedCrops = Object.values(CROPS).filter(c => state.level >= c.minLevel);
        if (unlockedCrops.length === 0) return;

        const crop = unlockedCrops[Math.floor(Math.random() * unlockedCrops.length)];
        const qty = Math.floor(Math.random() * 5) + 3 + Math.floor(state.level / 2); // 3-8 base + level scaling

        // Reward calculation: Base Price * Qty * 1.5 (Premium)
        const reward = Math.floor(crop.sellPrice * qty * 1.5);

        const order = {
            id: Date.now() + Math.random(),
            cropId: crop.id,
            qty: qty,
            reward: reward,
            time: Date.now(),
            expires: Date.now() + 300000 // 5 minutes
        };

        state.orders.push(order);
        showToast(`📜 新订单: ${crop.name} x${qty}`);
        updateOrdersUI();
        saveGame();
    }

    function checkOrders() {
        // Expire old orders
        const now = Date.now();
        const initialLen = state.orders.length;
        state.orders = state.orders.filter(o => now < o.expires);

        if (state.orders.length < initialLen) {
            updateOrdersUI();
        }

        // Generate new order occasionally
        if (state.orders.length < MAX_ORDERS && Math.random() < 0.005) { // Low chance per tick
            generateOrder();
        }
    }

    function fulfillOrder(orderId) {
        const orderIndex = state.orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;

        const order = state.orders[orderIndex];

        if ((state.storage[order.cropId] || 0) >= order.qty) {
            state.storage[order.cropId] -= order.qty;
            state.gold += order.reward;
            state.stats.totalGold += order.reward;

            // Bonus Exp for orders
            state.exp += Math.floor(order.reward / 10);

            state.orders.splice(orderIndex, 1);

            showToast(`✅ 订单完成! 获得 ${order.reward} 💰`);
            if (navigator.vibrate) navigator.vibrate(100);

            checkLevelUp();
            updateStatsUI();
            updateStorageUI(); // Refresh storage list
            updateOrdersUI();
            saveGame();
        } else {
            showToast("库存不足! 📦");
        }
    }

    function renderOrders() {
        const container = document.getElementById('orders-list');
        if (!container) return;

        container.innerHTML = '';
        if (state.orders.length === 0) {
            container.innerHTML = '<div style="color:#666; font-size:0.8rem; text-align:center; padding:10px;">暂无订单 (等待刷新...)</div>';
            return;
        }

        state.orders.forEach(order => {
            const crop = CROPS[order.cropId];
            const hasEnough = (state.storage[order.cropId] || 0) >= order.qty;

            const div = document.createElement('div');
            div.className = 'order-card';
            div.style.cssText = 'background:#252525; padding:8px; margin-bottom:5px; border-radius:6px; display:flex; justify-content:space-between; align-items:center; border:1px solid #444;';

            const timeLeft = Math.max(0, Math.ceil((order.expires - Date.now()) / 1000));

            div.innerHTML = `
                <div>
                    <div style="font-weight:bold; font-size:0.9rem;">${crop.emoji} ${crop.name} x${order.qty}</div>
                    <div style="font-size:0.75rem; color:#aaa;">奖励: <span style="color:#FFD700">${order.reward}💰</span> ⏳${timeLeft}s</div>
                </div>
                <button class="action-btn-order" data-id="${order.id}" style="width:auto; padding:4px 8px; font-size:0.8rem; background-color:${hasEnough ? '#4CAF50' : '#555'}; color:white; border:none; border-radius:4px; cursor:pointer;">
                    ${hasEnough ? '提交' : '缺货'}
                </button>
            `;

            if (hasEnough) {
                div.querySelector('.action-btn-order').onclick = () => fulfillOrder(order.id);
            }

            container.appendChild(div);
        });
    }

    function updateOrdersUI() {
        if (document.getElementById('storage-tab').classList.contains('active')) {
            renderOrders();
        }
    }

    // --- Pet Food Logic ---
    function buyPetFood() {
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
            updatePetUI();
            saveGame();
        } else {
             showToast(`金币不足! (${cost}💰)`);
        }
    }

"""

if "function checkOrders()" not in js:
    # Inject code block
    # We append it before `init();` at the end
    js = js.replace('init();', new_code + '\n    init();')

    # Add checkOrders to loop
    # We look for `updateEnvironment();` inside `startLoop`
    # and insert `checkOrders();` after it.
    if 'checkOrders();' not in js:
        js = js.replace('updateEnvironment();', 'updateEnvironment();\n            checkOrders();')

    # Modify selectShopItem for Pet Food
    # We need to ensure we don't break existing logic.
    # We'll wrap the original function logic or inject a check at the start of the function if possible.
    # But `selectShopItem` is defined inside `init` scope in `DOMContentLoaded`.

    # Let's find `function selectShopItem(id, type) {`
    # And insert our check.

    pet_food_logic = """
        if (id === 'pet_food') {
            if (confirm("购买高级狗粮 (50💰) 并喂食旺财?")) {
                buyPetFood();
            }
            return;
        }
    """

    pattern = r'(function selectShopItem\(id, type\) \{)'
    replacement = r'\1' + pet_food_logic
    js = re.sub(pattern, replacement, js)

with open(file_path, 'w') as f:
    f.write(js)


# HTML Updates
html_path = 'nongchang/index.html'
with open(html_path, 'r') as f:
    html = f.read()

if 'id="orders-list"' not in html:
    # Insert Orders UI in Storage Tab
    # We look for the storage header and insert after it, but before storage-list
    # Or replace `<h3>我的仓库</h3>...</div>` with header + orders + header for list?

    # The current HTML has:
    # <div class="storage-header">
    #    <h3>我的仓库</h3>
    #    <div class="storage-total-value">...</div>
    # </div>
    # <div id="storage-list" ...>

    # We want to insert Orders Block *before* the storage-list but *after* the header?
    # No, Orders should probably be at the top.

    new_orders_block = """
                    <div class="storage-header" style="margin-bottom:10px; background:rgba(50,50,0,0.3); border-bottom:1px solid #444;">
                        <h3 style="color:#FFD700">📜 订单需求</h3>
                        <div id="orders-list" style="max-height:150px; overflow-y:auto; margin-top:5px;">
                            <!-- Orders go here -->
                        </div>
                    </div>
    """

    # Let's insert it *after* the existing storage header div
    # Find the closing </div> of storage-header
    # It's tricky with regex if nested divs exist.
    # But storage-header structure is simple: <h3>...</h3> <div>...</div> </div>

    # Easier: Find `<div id="storage-list"` and insert *before* it.

    html = html.replace('<div id="storage-list"', new_orders_block + '\n                    <div id="storage-list"')

with open(html_path, 'w') as f:
    f.write(html)

print("Gameplay v2 updated successfully.")
