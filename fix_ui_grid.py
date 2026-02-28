import re

file_path = 'nongchang/index.html'

with open(file_path, 'r') as f:
    html = f.read()

# 1. Adjust `.plot-card` padding (was padding: 1px)
html = html.replace('padding: 1px;', 'padding: 2px;')

# 2. Adjust `.crop-emoji` font-size (was 1.8rem) and margins
emoji_pattern = r"(\.crop-emoji \{[\s\S]*?font-size: )1\.8rem;([\s\S]*?margin-bottom: )2px;"
html = re.sub(emoji_pattern, r"\g<1>1.5rem;\g<2>0;", html)

# 3. Adjust `.status-text` font-size (was 0.6rem) and margins
status_pattern = r"(\.status-text \{[\s\S]*?font-size: )0\.6rem;([\s\S]*?margin-bottom: )2px;"
html = re.sub(status_pattern, r"\g<1>0.55rem;\g<2>0;", html)

# 4. Adjust `.plot-level` size
level_pattern = r"(\.plot-level \{[\s\S]*?font-size: )0\.6rem;([\s\S]*?padding: )1px 3px;"
html = re.sub(level_pattern, r"\g<1>0.5rem;\g<2>0px 2px;", html)

with open(file_path, 'w') as f:
    f.write(html)

print("Grid CSS adjusted.")
