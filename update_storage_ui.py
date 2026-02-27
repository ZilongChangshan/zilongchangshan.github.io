import re

css_content = """
        /* Storage Tab Styles */
        .storage-tab-content {
            display: none;
            flex-direction: column;
            height: 100%;
        }

        .storage-header {
            padding: 10px;
            text-align: center;
            border-bottom: 1px solid var(--border-color);
            background-color: rgba(0,0,0,0.2);
        }

        .storage-total-value {
            font-size: 0.9rem;
            color: #aaa;
        }

        .storage-list {
            flex-grow: 1;
            overflow-y: auto;
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .storage-item {
            display: flex;
            align-items: center;
            background-color: var(--card-bg);
            padding: 10px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }

        .storage-icon {
            font-size: 1.5rem;
            width: 40px;
            text-align: center;
        }

        .storage-info {
            flex-grow: 1;
        }

        .storage-name {
            font-weight: bold;
            font-size: 0.9rem;
            display: block;
        }

        .storage-qty {
            font-size: 0.8rem;
            color: #aaa;
        }

        .storage-price {
            text-align: right;
            margin-right: 10px;
            min-width: 60px;
        }

        .price-val {
            font-weight: bold;
            display: block;
        }

        .price-trend {
            font-size: 0.7rem;
        }
        .trend-up { color: #4CAF50; }
        .trend-down { color: #f44336; }
        .trend-flat { color: #aaa; }

        .storage-actions {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .sell-btn {
            background-color: #333;
            color: #fff;
            border: 1px solid #555;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 0.75rem;
            cursor: pointer;
        }

        .sell-all-btn {
            background-color: var(--accent-color);
            border-color: var(--accent-color);
            color: #fff;
        }

        .sell-global-btn {
            width: 100%;
            padding: 15px;
            background-color: var(--accent-color);
            color: #fff;
            border: none;
            font-weight: bold;
            font-size: 1rem;
            cursor: pointer;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.3);
        }
"""

with open('nongchang/index.html', 'r') as f:
    content = f.read()

# Insert CSS
new_content = content.replace('</style>', css_content + '\n    </style>')

# Insert Tab Button
tab_button_html = '                <button class="tab-btn" data-tab="storage">仓库</button>'
new_content = new_content.replace('<button class="tab-btn" data-tab="achievements">成就</button>', '<button class="tab-btn" data-tab="achievements">成就</button>\n' + tab_button_html)

# Insert Tab Content
tab_content_html = """
                <!-- Storage Tab -->
                <div id="storage-tab" class="tab-pane">
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
"""
# Append after achievements tab (using previous logic or regex)
pattern = r'(<div id="achievements-tab" class="tab-pane">[\s\S]*?</div>)'
replacement = r'\1' + '\n' + tab_content_html
new_content = re.sub(pattern, replacement, new_content)

with open('nongchang/index.html', 'w') as f:
    f.write(new_content)

print("Updated index.html with Storage UI.")
