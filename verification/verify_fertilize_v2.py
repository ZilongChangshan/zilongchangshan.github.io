import os
import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 375, "height": 812})
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/nongchang/index.html")

        # We can't access  directly from page.evaluate because it's wrapped in DOMContentLoaded.
        # We can simulate by clicking to level up via a fast trick or just test the selection mechanism itself visually.
        # Let's just click shop items and see the UI.
        # The button might be hidden (display: none) if level < 5, but we can still check text and color.

        page.click('button[data-tab="shop"]')
        page.wait_for_timeout(200)
        page.click('button[data-shop-tab="items"]')
        page.wait_for_timeout(200)
        page.click('.shop-item[data-id="fertilizer"]')
        page.wait_for_timeout(200)

        btn = page.locator('#plant-all-btn span')
        print(f"Button Text: {btn.text_content()}")

        btn_container = page.locator('#plant-all-btn')
        color = btn_container.evaluate("element => getComputedStyle(element).backgroundColor")
        print(f"Button Color: {color}")

        browser.close()

if __name__ == "__main__":
    run()
