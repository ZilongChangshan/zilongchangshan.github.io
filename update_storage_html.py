import re

file_path = 'nongchang/index.html'

with open(file_path, 'r') as f:
    html = f.read()

# We need to replace the content of #storage-tab
# The current #storage-tab looks something like this:
# <div id="storage-tab" class="tab-pane">
#    <div class="storage-header"><h3>我的仓库</h3>...</div>
#    <div class="storage-header"><h3>📜 订单需求</h3><div id="orders-list">...</div></div>
#    <div id="storage-list">...</div>
#    <button id="sell-all-global-btn">...</button>
# </div>

# Let's extract the block and rewrite it cleanly.
pattern = r'(<div id="storage-tab" class="tab-pane">)(.*?)(<!-- Pet Tab -->)'
match = re.search(pattern, html, re.DOTALL)

if match:
    old_content = match.group(2)

    new_content = """
                    <!-- Secondary Tabs for Storage -->
                    <div class="secondary-tabs" style="margin-top: 5px;">
                        <button class="secondary-tab-btn active" data-storage-tab="inventory">库存</button>
                        <button class="secondary-tab-btn" data-storage-tab="orders">订单</button>
                    </div>

                    <!-- Inventory View -->
                    <div id="storage-inventory-view" style="display:flex; flex-direction:column; flex-grow:1; overflow:hidden;">
                        <div class="storage-header">
                            <h3>我的仓库</h3>
                            <div class="storage-total-value">预估总价值: <span id="storage-total-val" style="color: gold;">0</span> 💰</div>
                        </div>
                        <div id="storage-list" class="storage-list">
                            <!-- Items go here -->
                            <p style="text-align:center; color:#666; margin-top:20px;">仓库是空的</p>
                        </div>
                        <button id="sell-all-global-btn" class="sell-global-btn">💰 一键卖出所有 (0)</button>
                    </div>

                    <!-- Orders View -->
                    <div id="storage-orders-view" style="display:none; flex-direction:column; flex-grow:1; overflow:hidden;">
                        <div class="storage-header" style="background:rgba(50,50,0,0.3); border-bottom:1px solid #444;">
                            <h3 style="color:#FFD700">📜 市场订单</h3>
                            <p style="font-size:0.75rem; color:#aaa; margin-top:4px;">完成订单可获得高额报酬与经验</p>
                        </div>
                        <div id="orders-list" style="flex-grow:1; overflow-y:auto; padding:10px; display:flex; flex-direction:column; gap:8px;">
                            <!-- Orders go here -->
                        </div>
                    </div>
                """

    html = html.replace(match.group(0), match.group(1) + new_content + "\n\n                " + match.group(3))

    with open(file_path, 'w') as f:
        f.write(html)
    print("Storage Tab HTML updated with secondary tabs.")
else:
    print("Could not find #storage-tab block.")
