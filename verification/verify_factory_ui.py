import os
import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/nongchang/index.html")

        # Click Factory Tab
        factory_btn = page.locator('button[data-tab="factory"]')
        if factory_btn.count() > 0:
            print("Factory tab found, clicking...")
            factory_btn.click()
            page.wait_for_timeout(500)

            # Check recipes
            recipes = page.locator('#recipe-list .shop-item')
            print(f"Found {recipes.count()} recipes.")

            # Take screenshot
            page.screenshot(path="verification/factory_tab_view.png")
            print("Captured verification/factory_tab_view.png")
        else:
            print("ERROR: Factory tab button NOT found.")

        browser.close()

if __name__ == "__main__":
    run()
