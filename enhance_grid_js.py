import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# Add data-status to renderGrid and updatePlotUI
# renderGrid
render_grid_pattern = r"(card\.dataset\.index = index;)"
js = re.sub(render_grid_pattern, r"\1\n            card.dataset.status = plot.status;", js)

# updatePlotUI
update_plot_pattern = r"(const progressFill = card\.querySelector\('\.plot-progress-fill'\);)"
js = re.sub(update_plot_pattern, r"\1\n        card.dataset.status = plot.status;", js)

# Also fix the initial load of active tool
init_pattern = r"(selectShopItem\(initialId, type\);)"
init_highlight = """
        selectShopItem(initialId, type);
        // Ensure UI updates properly on load
        if (type === 'crop') elements.farmGrid.classList.add('mode-planting');
        else if (initialId === 'fertilizer') elements.farmGrid.classList.add('mode-fertilizer');
"""

if "elements.farmGrid.classList.add('mode-planting')" not in js.split("init() {")[1]:
    js = re.sub(init_pattern, init_highlight, js)

with open(file_path, 'w') as f:
    f.write(js)

print("Grid logic updated with data-status tags.")
