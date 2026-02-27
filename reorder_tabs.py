import re

file_path = 'nongchang/index.html'

with open(file_path, 'r') as f:
    content = f.read()

# Define the new order of tabs
new_tabs = '''<div class="tabs">
                <button class="tab-btn active" data-tab="shop">商店</button>
                <button class="tab-btn" data-tab="storage">仓库</button>
                <button class="tab-btn" data-tab="pet">宠物</button>
                <button class="tab-btn" data-tab="achievements">成就</button>
                <button class="tab-btn" data-tab="stats">统计</button>
            </div>'''

# Find the old <div class="tabs"> block
# Since we modified it before with sed/python, it might be messy or clean.
# Let's match from <div class="tabs"> to the closing </div>
# But there might be new lines.
# Regex with DOTALL is best.

pattern = r'<div class="tabs">.*?</div>'
match = re.search(pattern, content, re.DOTALL)

if match:
    print("Found tabs block, replacing...")
    content = re.sub(pattern, new_tabs, content, count=1, flags=re.DOTALL)
else:
    print("Could not find tabs block.")

with open(file_path, 'w') as f:
    f.write(content)

print("Tabs reordered.")
