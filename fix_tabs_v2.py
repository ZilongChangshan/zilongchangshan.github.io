import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# Let's inspect `setupTabs` in the current JS
match = re.search(r"function setupTabs\(\) \{[\s\S]*?\}\);", js)
if match:
    print("Found setupTabs:")
    print(match.group(0))
