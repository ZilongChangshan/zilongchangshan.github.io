import re

css_content = """
        /* Weather Visuals */
        .weather-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 50; /* Below UI but above grid if possible, actually needs to be behind everything or specific overlay */
            /* Actually, let's put it on top of everything with pointer-events: none, but z-index below modals */
            opacity: 0.3;
            transition: opacity 1s ease;
        }

        .weather-rainy {
            background-image: linear-gradient(to bottom, rgba(0,0,50,0.2), transparent),
                              url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><text x="0" y="15" font-size="10" fill="white">💧</text></svg>');
            animation: rainFall 1s linear infinite;
        }

        .weather-sunny {
            background: radial-gradient(circle at 50% 20%, rgba(255, 255, 0, 0.2), transparent 70%);
        }

        .weather-rainbow {
            background: linear-gradient(45deg, rgba(255,0,0,0.1), rgba(255,165,0,0.1), rgba(255,255,0,0.1), rgba(0,128,0,0.1), rgba(0,0,255,0.1), rgba(75,0,130,0.1), rgba(238,130,238,0.1));
            animation: rainbowShift 5s ease infinite;
        }

        @keyframes rainFall {
            from { background-position: 0 0; }
            to { background-position: 0 20px; }
        }

        @keyframes rainbowShift {
            0% { opacity: 0.2; }
            50% { opacity: 0.4; }
            100% { opacity: 0.2; }
        }
"""

with open('nongchang/index.html', 'r') as f:
    content = f.read()

# Insert before closing style tag
new_content = content.replace('</style>', css_content + '\n    </style>')

# Add the overlay div inside app-container, preferably at the top or bottom
# Let's put it right after <div class="app-container">
new_content = new_content.replace('<div class="app-container">', '<div class="app-container">\n        <div id="weather-overlay" class="weather-overlay"></div>')

with open('nongchang/index.html', 'w') as f:
    f.write(new_content)

print("Updated index.html with Weather CSS.")
