import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# Define New Crops
new_crops = """
        rice: { id: 'rice', name: '水稻', emoji: '🌾', seedEmoji: '🌱', cost: 15, sellPrice: 20, growthTime: 4000, exp: 3, minLevel: 2, desc: '雨天生长极快' },
        rose: { id: 'rose', name: '玫瑰', emoji: '🌹', seedEmoji: '🌱', cost: 500, sellPrice: 1200, growthTime: 60000, exp: 60, minLevel: 7, desc: '美丽的爱情象征' },
"""

# Insert into CROPS object
# We can append after Wheat (or any)
# Find
wheat_pattern = r"(wheat: \{[^}]+\},)"
if "rice" not in js:
    print("Adding Rice and Rose...")
    match = re.search(wheat_pattern, js)
    if match:
        js = js.replace(match.group(0), match.group(0) + new_crops)
    else:
        print("Could not find Wheat entry.")

# Weather Effect Logic for Rice
# We need to modify  or the growth loop.
# Currently  calculates  based on weather.
# "Rainy" -> 30% faster globally.
# Let's add specific logic for Rice: Rainy -> 60% faster?
# Find:
# The current code:
# let growthTime = crop.growthTime;
# if (state.weather === 'rainy') {
#    growthTime = Math.floor(growthTime * 0.7); // 30% faster
# }

# We want to change this to:
# if (state.weather === 'rainy') {
#    if (crop.id === 'rice') growthTime = Math.floor(growthTime * 0.4); // 60% faster!
#    else growthTime = Math.floor(growthTime * 0.7);
# }

logic_pattern = r"if \(state.weather === 'rainy'\) \{\s*growthTime = Math.floor\(growthTime \* 0.7\);"
new_logic = """if (state.weather === 'rainy') {
                if (crop.id === 'rice') growthTime = Math.floor(growthTime * 0.4);
                else growthTime = Math.floor(growthTime * 0.7);"""

if "rice" not in js and re.search(logic_pattern, js):
    print("Updating Weather Logic for Rice...")
    js = re.sub(logic_pattern, new_logic, js)

with open(file_path, 'w') as f:
    f.write(js)

print("New crops added.")
