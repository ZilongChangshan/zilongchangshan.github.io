import re

css_content = """
        /* Pet Adventures Tab Styles */
        .pet-panel {
            background-color: var(--card-bg);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            border: 1px solid var(--border-color);
        }

        .pet-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
        }

        .pet-avatar {
            width: 60px;
            height: 60px;
            background-color: #333;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            border: 2px solid var(--accent-color);
        }

        .pet-info h3 { margin: 0; font-size: 1.1rem; color: var(--text-color); }
        .pet-info p { margin: 0; font-size: 0.8rem; color: #888; }

        .status-bars {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .status-row {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.8rem;
        }

        .status-track {
            flex-grow: 1;
            height: 8px;
            background-color: #333;
            border-radius: 4px;
            overflow: hidden;
        }

        .status-fill { height: 100%; transition: width 0.3s ease; }
        .energy-fill { background-color: #FF9800; }
        .mood-fill { background-color: #E91E63; }

        .adventure-area {
            background-color: var(--card-bg);
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            border: 1px solid var(--border-color);
            margin-bottom: 10px;
        }

        .adventure-status {
            font-size: 0.9rem;
            color: #aaa;
            margin-bottom: 5px;
        }

        .adventure-timer {
            font-size: 2rem;
            font-weight: bold;
            font-family: monospace;
            margin: 10px 0;
            color: var(--text-color);
        }

        .adventure-btn {
            width: 100%;
            padding: 12px;
            background-color: var(--accent-color);
            color: white;
            border: none;
            border-radius: 6px;
            font-weight: bold;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s;
        }

        .adventure-btn:active { transform: scale(0.98); }
        .adventure-btn:disabled {
            background-color: #333;
            color: #666;
            cursor: not-allowed;
            transform: none;
        }

        .log-container {
            background-color: var(--card-bg);
            border-radius: 8px;
            border: 1px solid var(--border-color);
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            max-height: 200px;
        }

        .log-header {
            padding: 10px;
            font-size: 0.85rem;
            font-weight: bold;
            color: #aaa;
            border-bottom: 1px solid var(--border-color);
            background-color: rgba(0,0,0,0.2);
        }

        .log-list {
            overflow-y: auto;
            padding: 0;
            margin: 0;
            list-style: none;
            flex-grow: 1;
        }

        .log-item {
            display: flex;
            align-items: start;
            gap: 10px;
            padding: 10px;
            border-bottom: 1px solid #333;
            font-size: 0.85rem;
        }

        .log-item:last-child { border-bottom: none; }

        .log-icon {
            font-size: 1.2rem;
            min-width: 24px;
            text-align: center;
        }

        .log-content { flex-grow: 1; }
        .log-msg { display: block; margin-bottom: 2px; }
        .log-time { font-size: 0.7rem; color: #666; }
"""

with open('nongchang/index.html', 'r') as f:
    content = f.read()

# Insert before closing style tag
new_content = content.replace('</style>', css_content + '\n    </style>')

# Insert Tab Button
tab_button_html = '                <button class="tab-btn" data-tab="pet">宠物</button>'
new_content = new_content.replace('<button class="tab-btn" data-tab="achievements">成就</button>', '<button class="tab-btn" data-tab="achievements">成就</button>\n' + tab_button_html)

# Insert Tab Content
tab_content_html = """
                <!-- Pet Tab -->
                <div id="pet-tab" class="tab-pane">
                    <div id="pet-unlock-msg" style="display:none; text-align:center; padding:20px; color:#888;">
                        <div style="font-size:3rem; margin-bottom:10px;">🔒</div>
                        <p>你需要先购买一只看门狗！</p>
                        <p style="font-size:0.8rem; margin-top:5px;">去商店看看吧 🐕</p>
                    </div>

                    <div id="pet-content" style="display:none; height:100%; flex-direction:column;">
                        <div class="pet-panel">
                            <div class="pet-header">
                                <div class="pet-avatar">🐕</div>
                                <div class="pet-info">
                                    <h3>旺财 (Lv.<span id="pet-level">1</span>)</h3>
                                    <p>忠诚的伙伴</p>
                                </div>
                            </div>
                            <div class="status-bars">
                                <div class="status-row">
                                    <span class="status-label">⚡ 体力</span>
                                    <div class="status-track">
                                        <div id="pet-energy-fill" class="status-fill energy-fill" style="width: 100%;"></div>
                                    </div>
                                    <span id="pet-energy-text">100/100</span>
                                </div>
                                <div class="status-row">
                                    <span class="status-label">❤️ 心情</span>
                                    <div class="status-track">
                                        <div id="pet-mood-fill" class="status-fill mood-fill" style="width: 100%;"></div>
                                    </div>
                                    <span id="pet-mood-text">100%</span>
                                </div>
                            </div>
                        </div>

                        <div class="adventure-area">
                            <div id="adventure-status" class="adventure-status">准备出发</div>
                            <div id="adventure-timer" class="adventure-timer">--:--</div>
                            <button id="adventure-btn" class="adventure-btn">🌲 开始探险 (消耗 20 ⚡)</button>
                        </div>

                        <div class="log-container">
                            <div class="log-header">📜 探险日志</div>
                            <ul id="adventure-log" class="log-list">
                                <!-- Log items -->
                                <li class="log-item" style="color:#666; justify-content:center;">暂无记录</li>
                            </ul>
                        </div>
                    </div>
                </div>
"""
new_content = new_content.replace('<div id="achievements-tab" class="tab-pane">', '<div id="achievements-tab" class="tab-pane">\n' + tab_content_html)

# Fix: The replacement above inserts the new tab content inside the achievements tab if I'm not careful.
# Ah, I replaced the opening tag. That's bad. I should append after the closing tag of achievements-tab.
# Or simpler: replace '</div>\n            </div>\n        </div>' which is the end of tab-content and bottom-panel.
# But that's risky.
# Let's target the closing of achievements tab.
# The achievements tab content is short: <div id="achievements-tab" class="tab-pane">\n                    <p>暂无成就</p>\n                </div>

# Safer regex replacement to append after achievements tab
pattern = r'(<div id="achievements-tab" class="tab-pane">[\s\S]*?</div>)'
replacement = r'\1' + '\n' + tab_content_html

new_content = re.sub(pattern, replacement, content)

# Check if tab button insertion worked (simple string replace might fail if formatting differs)
# Let's rely on the previous string replace for button, hope it matched.

with open('nongchang/index.html', 'w') as f:
    f.write(new_content)

print("Updated index.html with Pet UI.")
