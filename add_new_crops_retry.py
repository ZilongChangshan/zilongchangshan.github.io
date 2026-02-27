import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# Try again to insert new crops
new_crops = """
        rice: { id: 'rice', name: '水稻', emoji: '🌾', seedEmoji: '🌱', cost: 15, sellPrice: 20, growthTime: 4000, exp: 3, minLevel: 2, desc: '雨天生长极快' },
        rose: { id: 'rose', name: '玫瑰', emoji: '🌹', seedEmoji: '🌱', cost: 500, sellPrice: 1200, growthTime: 60000, exp: 60, minLevel: 7, desc: '美丽的爱情象征' },
"""

# The previous attempt might have failed because regex didn't match perfectly.
# Let's find "wheat: { ... }," by just searching for the string start.
# Or simpler: Find  and insert after.

start_marker = "const CROPS = {"
if "rice: {" not in js:
    print("Inserting Rice and Rose after CROPS start...")
    js = js.replace(start_marker, start_marker + new_crops)

# Update weather logic
# Need to find  inside .
# But  isn't unique.
# Let's look for the specific block:
# growthTime = Math.floor(growthTime * 0.7);

target_logic = "growthTime = Math.floor(growthTime * 0.7);"
new_logic = """
            if (crop.id === 'rice') growthTime = Math.floor(growthTime * 0.4);
            else growthTime = Math.floor(growthTime * 0.7);
"""

if target_logic in js and "rice" in new_logic: # Check if we haven't replaced it yet
    # But wait, if we replaced it, the target string won't be there exactly.
    # So this is safe.
    print("Updating weather logic...")
    js = js.replace(target_logic, new_logic)

with open(file_path, 'w') as f:
    f.write(js)

print("Retry complete.")
