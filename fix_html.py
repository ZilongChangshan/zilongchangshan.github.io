import re

file_path = 'nongchang/index.html'

with open(file_path, 'r') as f:
    content = f.read()

# 1. Add Pet Tab Button if missing
if 'data-tab="pet"' not in content:
    # Find the closing div of tabs
    pattern = r'(<button class="tab-btn" data-tab="storage">仓库</button>)'
    replacement = r'\1\n                <button class="tab-btn" data-tab="pet">宠物</button>'
    content = re.sub(pattern, replacement, content)
    print("Added Pet tab button.")
else:
    print("Pet tab button already present.")

# 2. Fix misplaced CSS (appended after </html>)
if '</html>' in content:
    parts = content.split('</html>')
    if len(parts) > 1 and parts[1].strip():
        trailing_css = parts[1].strip()
        print("Found trailing CSS, moving to <style> block.")

        # Remove trailing part
        content = parts[0] + '</html>'

        # Inject into <style>
        # We'll append it before the closing </style> tag
        content = content.replace('</style>', f'\n{trailing_css}\n</style>')
    else:
        print("No trailing CSS found.")

with open(file_path, 'w') as f:
    f.write(content)

print("index.html fixed.")
