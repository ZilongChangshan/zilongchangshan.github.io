import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# Debug: Is renderOrders called?
# We have  called in  and .
# But is it called when switching tabs?
# In :
# if (tabName === 'storage') updateStorageUI();
# We should also call  or merge them.

if "if (tabName === 'storage') updateStorageUI();" in js:
    print("Found storage tab switch, adding updateOrdersUI...")
    js = js.replace(
        "if (tabName === 'storage') updateStorageUI();",
        "if (tabName === 'storage') { updateStorageUI(); updateOrdersUI(); }"
    )
else:
    print("Could not find storage tab switch line to patch.")

# Also, check if  is actually running.
# We added it to ?
if "checkOrders();" not in js:
    print("checkOrders() not found in loop. Injecting...")
    # Inject into startLoop
    js = js.replace('updateEnvironment();', 'updateEnvironment();\n            checkOrders();')

# Ensure  is called at least once or  triggers it.
#  has
# This is very low chance (0.5% per 100ms = 5% per second? No, 0.5% per tick).
# Let's increase it for testing or ensure one is generated on init if empty.

# In :
# We should probably call  immediately?
# Add  to ?

if "checkOrders();" not in js.split('init() {')[1]: # Very rough check
    print("Injecting checkOrders() into init()...")
    js = js.replace('initPetUI();', 'initPetUI();\n        checkOrders();')

# Let's also modify  to force generation if empty initially?
# Or just wait. 0.5% is low.
# Let's change 0.005 to 0.02 (2% per tick -> ~20% per second) for better UX.
js = js.replace("Math.random() < 0.005", "Math.random() < 0.02")

with open(file_path, 'w') as f:
    f.write(js)

print("Fix applied.")
