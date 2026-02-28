import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# I need to check if the logic injected correctly and fix any syntax/reference errors.
# In `updateFactoryUI`, I used `html += ...` but where is the logic for iterating `state.factory`?
# Oh, I see: `state.factory.forEach((task, index) => { ... html += ... });` - that is correct.

# Let's verify `PRODUCTS` is defined. Yes.
# Let's verify `RECIPES` is defined. Yes.

# Let's check `startLoop` to ensure `state.factory` is processed.
if "Process Factory Queue" in js:
    print("Factory queue processor found in loop.")
else:
    print("Warning: Factory queue processor missing from loop!")

# Check tab switching logic.
if "if (tabName === 'factory') updateFactoryUI();" in js:
    print("Tab switch logic found.")
else:
    print("Warning: Tab switch logic missing!")

# Check if `factory-tab` exists in HTML.
with open('nongchang/index.html', 'r') as f:
    html = f.read()

if 'id="factory-tab"' in html:
    print("Factory tab HTML found.")
else:
    print("Warning: Factory tab HTML missing!")
