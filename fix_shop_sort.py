import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# Update renderShop to sort crops by minLevel
pattern = r"Object\.values\(CROPS\)\.forEach\(crop => \{"
replacement = """
            Object.values(CROPS)
                  .sort((a, b) => a.minLevel - b.minLevel)
                  .forEach(crop => {
"""

if "sort((a, b) => a.minLevel - b.minLevel)" not in js:
    js = js.replace("Object.values(CROPS).forEach(crop => {", replacement.strip())

with open(file_path, 'w') as f:
    f.write(js)

print("Shop sorting fixed.")
