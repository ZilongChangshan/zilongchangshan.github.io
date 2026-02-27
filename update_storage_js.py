import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# 1. State for Storage Tab
if "currentStorageTab =" not in js:
    # Add variable after
    js = js.replace("let currentShopTab = 'seeds';", "let currentShopTab = 'seeds';\n    let currentStorageTab = 'inventory';")

# 2. Add Event Listeners for Storage Secondary Tabs
# In , or a new function
new_function = """
    function setupStorageTabs() {
        const storageTabsBtn = document.querySelectorAll('.secondary-tab-btn[data-storage-tab]');
        storageTabsBtn.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.storageTab;
                switchStorageTab(tabName);
            });
        });
    }

    function switchStorageTab(tabName) {
        currentStorageTab = tabName;
        const storageTabsBtn = document.querySelectorAll('.secondary-tab-btn[data-storage-tab]');
        storageTabsBtn.forEach(b => {
            if (b.dataset.storageTab === tabName) b.classList.add('active');
            else b.classList.remove('active');
        });

        document.getElementById('storage-inventory-view').style.display = tabName === 'inventory' ? 'flex' : 'none';
        document.getElementById('storage-orders-view').style.display = tabName === 'orders' ? 'flex' : 'none';

        if (tabName === 'inventory') renderStorage();
        if (tabName === 'orders') renderOrders();
    }
"""

if "setupStorageTabs()" not in js:
    # Insert function before
    js = js.replace("function setupShopTabs() {", new_function + "\n    function setupShopTabs() {")

    # Call  in
    js = js.replace("setupShopTabs();", "setupShopTabs();\n        setupStorageTabs();")

# 3. Modify renderStorage and renderOrders styling logic slightly if needed
# The HTML was updated to have flex-grow:1, so we should be good.

with open(file_path, 'w') as f:
    f.write(js)

print("Storage Tab JS logic updated.")
