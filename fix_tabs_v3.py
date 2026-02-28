import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# Replace the tab logic to properly reset sub-tabs
pattern = r"if \(tabName === 'stats'\) renderStats\(\);[\s\S]*?if \(tabName === 'factory'\) updateFactoryUI\(\);"

new_logic = """
                if (tabName === 'stats') renderStats();
                if (tabName === 'achievements') renderAchievements();
                if (tabName === 'pet') updatePetUI();
                if (tabName === 'shop') switchShopTab('seeds');
                if (tabName === 'storage') switchStorageTab('inventory');
                if (tabName === 'factory') updateFactoryUI();
"""

js = re.sub(pattern, new_logic, js)

with open(file_path, 'w') as f:
    f.write(js)

print("Tabs reset logic injected.")
