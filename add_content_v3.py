import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# 1. Add Apple Tree to CROPS
apple_tree = ",\n        apple_tree: { id: 'apple_tree', name: '苹果树', emoji: '🍎', seedEmoji: '🌳', cost: 2000, sellPrice: 500, growthTime: 180000, exp: 100, minLevel: 10, desc: '多次收获，无需重种', isTree: true }"
if "apple_tree: {" not in js:
    # Append to the end of CROPS list
    pattern = r"(const CROPS = \{[\s\S]*?)(};)"
    match = re.search(pattern, js)
    if match:
        js = js.replace(match.group(0), match.group(1).rstrip(',') + apple_tree + "\n    };")

# 2. Define Products & Recipes
products_def = """

    const PRODUCTS = {
        bread: { id: 'bread', name: '面包', emoji: '🍞', sellPrice: 60, exp: 15, craftTime: 10000 },
        fries: { id: 'fries', name: '薯条', emoji: '🍟', sellPrice: 200, exp: 40, craftTime: 20000 },
        ketchup: { id: 'ketchup', name: '番茄酱', emoji: '🥫', sellPrice: 400, exp: 80, craftTime: 30000 },
        wine: { id: 'wine', name: '葡萄酒', emoji: '🍷', sellPrice: 10000, exp: 500, craftTime: 120000 }
    };

    const RECIPES = {
        bread: { wheat: 3 },
        fries: { potato: 2 },
        ketchup: { tomato: 2 },
        wine: { grapes: 2 }
    };
"""

if "const PRODUCTS =" not in js:
    js = js.replace("const ITEMS = {", products_def + "\n    const ITEMS = {")

# 3. Add factory state to initial state
if "factory: []" not in js:
    js = js.replace("orders: [],", "orders: [],\n        factory: [], // list of active crafting tasks")

# 4. Modify Orders to occasionally request products
# Find generateOrder function
order_logic = r"const unlockedCrops = Object\.values\(CROPS\)\.filter\(c => state\.level >= c\.minLevel\);"
new_order_logic = """
        let possibleItems = Object.values(CROPS).filter(c => state.level >= c.minLevel);

        // At level 5+, start requesting products
        if (state.level >= 5) {
            possibleItems = possibleItems.concat(Object.values(PRODUCTS));
        }

        const crop = possibleItems[Math.floor(Math.random() * possibleItems.length)];
"""

if "possibleItems" not in js:
    js = js.replace(order_logic, new_order_logic)

with open(file_path, 'w') as f:
    f.write(js)

print("Data & State for Crafting/Trees added.")
