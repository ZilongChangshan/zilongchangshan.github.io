import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

errors = []

# Check if tree harvest logic is in harvestCrop
if "if (crop.isTree) {" not in js:
    errors.append("Tree harvest logic missing")

# Check if factory loop is in startLoop
if "state.factory && state.factory.length > 0" not in js:
    errors.append("Factory loop missing")

if errors:
    print("FAIL:", errors)
else:
    print("PASS: Core logic verified.")
