import re

file_path = 'nongchang/index.html'

with open(file_path, 'r') as f:
    html = f.read()

# Enhance control-bar UI
control_bar_pattern = r"(<div class=\"control-bar\">)([\s\S]*?)(</div>)"

new_control_bar = """
        <!-- Control Bar -->
        <div class="control-bar" style="justify-content: space-between; padding: 8px;">
            <div id="active-tool-display" style="display:flex; flex-direction:column; align-items:center; justify-content:center; background:#222; border-radius:6px; padding:4px 10px; min-width:80px; border:1px solid #444; box-shadow:inset 0 2px 4px rgba(0,0,0,0.5);">
                <span id="active-tool-icon" style="font-size:1.2rem; line-height:1;">🌾</span>
                <span id="active-tool-name" style="font-size:0.65rem; color:#aaa; margin-top:2px;">小麦</span>
            </div>

            <div style="display:flex; gap:8px; flex-grow:1; justify-content:flex-end;">
                <button id="plant-all-btn" class="action-btn plant-btn" style="display: none; max-width:100px;">
                    <span>播种全部</span>
                </button>
                <button id="harvest-all-btn" class="action-btn harvest-btn" style="display: none; max-width:100px;">
                    <span>收获全部</span>
                </button>
            </div>
        </div>
"""

if "active-tool-display" not in html:
    html = re.sub(control_bar_pattern, new_control_bar, html, count=1)

with open(file_path, 'w') as f:
    f.write(html)

print("Control bar UI enhanced.")
