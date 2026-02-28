import os
import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 375, "height": 812})
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/nongchang/index.html")

        # 1. Verify Active Tool UI exists
        tool = page.locator('#active-tool-display')
        print(f"Active Tool Name: {page.locator('#active-tool-name').text_content()}")

        # 2. Check initial highlight
        grid_class = page.locator('#farm-grid').get_attribute('class')
        print(f"Grid Classes on Load: {grid_class}")

        # 3. Take screenshot
        page.screenshot(path="verification/interaction_ui.png")
        print("Captured verification/interaction_ui.png")

        browser.close()

if __name__ == "__main__":
    run()
