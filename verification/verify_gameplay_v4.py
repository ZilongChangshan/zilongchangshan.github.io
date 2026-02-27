import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# Verify everything
missing = []

if "rice: {" not in js:
    missing.append("Rice")
else:
    print("PASS: Rice present")

if "rose: {" not in js:
    missing.append("Rose")
else:
    print("PASS: Rose present")

if "orders: []" not in js:
    missing.append("Orders state")
else:
    print("PASS: Orders state present")

if "checkOrders" not in js:
    missing.append("checkOrders function")
else:
    print("PASS: checkOrders function present")

if "pet_food: {" not in js:
    missing.append("Pet Food")
else:
    print("PASS: Pet Food present")

if missing:
    print("FAIL: Missing: ", missing)
else:
    print("PASS: All systems go.")
