import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# Modify `setupTabs` to explicitly select default secondary tabs
setup_tabs_pattern = r"(if \(tabName === 'storage'\) updateStorageUI\(\);\s*if \(tabName === 'factory'\) updateFactoryUI\(\);)"
new_setup_tabs = """
                if (tabName === 'shop') switchShopTab('seeds');
                if (tabName === 'storage') switchStorageTab('inventory');
                if (tabName === 'factory') updateFactoryUI();
"""

if "switchShopTab('seeds')" not in js.split("setupTabs() {")[1]:
    js = re.sub(setup_tabs_pattern, new_setup_tabs, js)

with open(file_path, 'w') as f:
    f.write(js)

print("Secondary tab selection fixed.")
