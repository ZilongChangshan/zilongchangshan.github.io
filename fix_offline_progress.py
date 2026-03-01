import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# Fix `checkOfflineProgress` not setting plot status to ready
offline_pattern = r"(if \(crop && \(now - plot\.plantTime >= \(plot\.growthDuration \|\| crop\.growthTime\)\)\) \{)(\s*readyCount\+\+;)"
offline_replacement = r"\1\n                    plot.status = 'ready';\n                    updatePlotUI(plot.id);\2"

if "plot.status = 'ready';" not in js.split("function checkOfflineProgress() {")[1].split("function setupControlButtons()")[0]:
    js = re.sub(offline_pattern, offline_replacement, js)

with open(file_path, 'w') as f:
    f.write(js)

print("Offline progress bug fixed.")
