import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# Check if Pet Food logic is correctly inserted
if "function buyPetFood()" not in js:
    print("Warning: buyPetFood function not found. Retrying injection.")

    # Define the function
    pet_food_func = """
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
             showToast();
        }
    }
    """

    # Insert before init()
    js = js.replace('init();', pet_food_func + '\n    init();')

# Check if Pet Food item exists in ITEMS
if "pet_food: {" not in js:
    print("Adding Pet Food to ITEMS dictionary...")
    # Find closing of ITEMS object
    # It ends with  usually
    # Or
    # Let's use regex to find the end of dog entry and append.

    dog_pattern = r"(dog: \{[^}]+\})"
    pet_food_entry = ",\n        pet_food: { id: 'pet_food', name: '高级狗粮', emoji: '🍖', cost: 50, desc: '恢复 50 体力', type: 'item' }"

    match = re.search(dog_pattern, js)
    if match:
        js = js.replace(match.group(0), match.group(0) + pet_food_entry)
    else:
        print("Could not find dog entry to append pet food.")

# Check if selectShopItem handles pet_food
# We rely on the generic select logic but override click behavior?
# The previous script attempted to modify .
# Let's verify if  is inside .

select_pattern = r"function selectShopItem\(id, type\) \{[\s\S]*?if \(id === 'pet_food'\)"
if not re.search(select_pattern, js):
    print("Injecting Pet Food click handler into selectShopItem...")
    # Find start of function
    func_start = "function selectShopItem(id, type) {"
    injection = """
        if (id === 'pet_food') {
            if (confirm("购买高级狗粮 (50💰) 并喂食旺财?")) {
                buyPetFood();
            }
            return;
        }
    """
    js = js.replace(func_start, func_start + injection)

with open(file_path, 'w') as f:
    f.write(js)

print("Pet System enhancement verified/updated.")
