import re

file_path = 'nongchang/index.html'

with open(file_path, 'r') as f:
    html = f.read()

# 1. Update .plot-card padding to 0
html = re.sub(r'(\.plot-card \{[\s\S]*?)padding: 2px;', r'\g<1>padding: 0px;', html)

# 2. Update .crop-emoji
emoji_pattern = r'(\.crop-emoji \{[\s\S]*?)font-size: 1\.5rem;([\s\S]*?margin-bottom: )0;'
emoji_replacement = r'\g<1>font-size: 1.3rem;\n            line-height: 1;\g<2>0;'
html = re.sub(emoji_pattern, emoji_replacement, html)

# 3. Update .status-text
status_pattern = r'(\.status-text \{[\s\S]*?)font-size: 0\.55rem;([\s\S]*?margin-bottom: )0;'
status_replacement = r'\g<1>font-size: 0.55rem;\n            line-height: 1;\n            transform: scale(0.9);\g<2>0;'
html = re.sub(status_pattern, status_replacement, html)

# 4. Update .plot-level
level_pattern = r'(\.plot-level \{[\s\S]*?top: )2px;([\s\S]*?left: )2px;'
level_replacement = r'\g<1>0px;\g<2>0px;'
html = re.sub(level_pattern, level_replacement, html)

with open(file_path, 'w') as f:
    f.write(html)

print("Plot UI CSS optimized.")
