import re

file_path = 'nongchang/index.html'

with open(file_path, 'r') as f:
    html = f.read()

# Optimize #storage-orders-view header
orders_header_pattern = r"(<div id=\"storage-orders-view\"[\s\S]*?<div class=\"storage-header\")([\s\S]*?)(</div>)"
optimized_header = """ style="background:rgba(50,50,0,0.3); border-bottom:1px solid #444; padding:6px 10px; display:flex; justify-content:space-between; align-items:center;">
                            <h3 style="color:#FFD700; font-size:1rem; margin:0;">📜 市场订单</h3>
                            <span style="font-size:0.7rem; color:#aaa;">完成获高额报酬</span>
                        </div>"""

html = re.sub(orders_header_pattern, r"\1" + optimized_header, html)

with open(file_path, 'w') as f:
    f.write(html)

print("Storage Orders UI optimized.")
