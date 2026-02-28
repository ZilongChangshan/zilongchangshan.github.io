import re

with open('nongchang/script.js', 'r') as f:
    js = f.read()

# Check Reject Order Logic
if "rejectOrder" in js:
    print("PASS: rejectOrder exists.")
else:
    print("FAIL: rejectOrder missing.")

# Check Offline Progress Logic
if "PET_CONFIG.energyRegen * 0.5" in js:
    print("PASS: Offline Pet Energy logic exists.")
else:
    print("FAIL: Offline Pet Energy logic missing.")

if "state.factory[0]" in js.split("function checkOfflineProgress() {")[1].split("function setupControlButtons()")[0]:
    print("PASS: Offline Factory logic exists.")
else:
    print("FAIL: Offline Factory logic missing.")

# Check Harvest All Logic
if "totalBonusGold" in js.split("function harvestAll() {")[1]:
    print("PASS: Harvest All Optimization exists.")
else:
    print("FAIL: Harvest All Optimization missing.")
