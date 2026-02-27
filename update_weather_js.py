import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js_content = f.read()

# 1. Add weatherOverlay to elements
js_content = js_content.replace("marketDisplay: document.getElementById('market-display'),   // New", "marketDisplay: document.getElementById('market-display'),   // New\n        weatherOverlay: document.getElementById('weather-overlay'),")

# 2. Update updateEnvUI to toggle classes
old_env_ui = """    function updateEnvUI() {
        if (elements.weatherDisplay) {
            const w = ENV_CONFIG[state.weather];
            elements.weatherDisplay.textContent = ;
            elements.weatherDisplay.title = w.effect;
        }
        if (elements.marketDisplay) {
            const m = ENV_CONFIG[state.market];
            elements.marketDisplay.textContent = ;
            elements.marketDisplay.className = ;
        }
    }"""

new_env_ui = """    function updateEnvUI() {
        if (elements.weatherDisplay) {
            const w = ENV_CONFIG[state.weather];
            elements.weatherDisplay.textContent = ;
            elements.weatherDisplay.title = w.effect;

            // Visual Update
            if (elements.weatherOverlay) {
                elements.weatherOverlay.className = 'weather-overlay'; // reset
                if (state.weather === 'rainy') elements.weatherOverlay.classList.add('weather-rainy');
                if (state.weather === 'sunny') elements.weatherOverlay.classList.add('weather-sunny');
                if (state.weather === 'rainbow') elements.weatherOverlay.classList.add('weather-rainbow');
            }
        }
        if (elements.marketDisplay) {
            const m = ENV_CONFIG[state.market];
            elements.marketDisplay.textContent = ;
            elements.marketDisplay.className = ;
        }
    }"""

# Replace logic (careful with exact string match due to formatting, I'll use a simpler replace if possible)
# The string looks clean.
js_content = js_content.replace(old_env_ui, new_env_ui)

with open(file_path, 'w') as f:
    f.write(js_content)

print("Updated script.js with Weather Visual Logic.")
