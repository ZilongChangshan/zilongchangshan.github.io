import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# Check for Orders System
if "orders: []" not in js:
    print("FAIL: Orders state missing")
else:
    print("PASS: Orders state present")

if "generateOrder" not in js:
    print("FAIL: generateOrder function missing")
else:
    print("PASS: generateOrder function present")

# Check for Pet Food
if "pet_food: {" not in js:
    print("FAIL: Pet Food item missing")
else:
    print("PASS: Pet Food item present")

# Check for New Crops
if "rice: {" not in js:
    print("FAIL: Rice crop missing")
else:
    print("PASS: Rice crop present")

if "rose: {" not in js:
    print("FAIL: Rose crop missing")
else:
    print("PASS: Rose crop present")

# Check for HTML UI
with open('nongchang/index.html', 'r') as f:
    html = f.read()

if 'id="orders-list"' not in html:
    print("FAIL: Orders UI container missing in HTML")
else:
    print("PASS: Orders UI container present")

if 'data-tab="pet"' not in html:
    print("FAIL: Pet Tab button missing")
else:
    print("PASS: Pet Tab button present")

print("Verification complete.")
