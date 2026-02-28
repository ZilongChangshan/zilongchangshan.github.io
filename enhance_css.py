import re

file_path = 'nongchang/index.html'

with open(file_path, 'r') as f:
    html = f.read()

# Add CSS classes for active tool targeting
css_additions = """
        /* Active Tool Highlighting */
        .farm-grid.mode-planting .plot-card[data-status="empty"] {
            animation: pulsePlant 2s infinite alternate;
            cursor: cell;
        }

        .farm-grid.mode-fertilizer .plot-card[data-status="growing"] {
            animation: pulseFertilize 2s infinite alternate;
            cursor: pointer;
        }

        @keyframes pulsePlant {
            0% { box-shadow: inset 0 0 5px rgba(76, 175, 80, 0.2), 0 0 5px rgba(76, 175, 80, 0.2); border-color: #4CAF50; }
            100% { box-shadow: inset 0 0 15px rgba(76, 175, 80, 0.6), 0 0 10px rgba(76, 175, 80, 0.4); border-color: #81C784; }
        }

        @keyframes pulseFertilize {
            0% { box-shadow: inset 0 0 5px rgba(255, 215, 0, 0.2), 0 0 5px rgba(255, 215, 0, 0.2); border-color: #FFD700; }
            100% { box-shadow: inset 0 0 15px rgba(255, 215, 0, 0.6), 0 0 10px rgba(255, 215, 0, 0.4); border-color: #FFEB3B; }
        }
"""

if "mode-planting" not in html:
    html = html.replace('</style>', css_additions + '\n</style>')

with open(file_path, 'w') as f:
    f.write(html)

print("CSS highlighting enhanced.")
