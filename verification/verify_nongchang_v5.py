import os
import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        cwd = os.getcwd()
        url = f"file://{cwd}/nongchang/index.html"
        print(f"Loading {url}")
        page.goto(url)

        # 1. Verify Orders in Storage Tab
        print("Checking Storage Tab for Orders...")
        page.click('button[data-tab="storage"]')
        page.wait_for_selector("#orders-list", state="visible", timeout=2000)
        page.screenshot(path="verification/orders_tab.png")
        print("Captured verification/orders_tab.png")

        # 2. Verify Shop has Rice/Rose/Pet Food
        print("Checking Shop Tab...")
        page.click('button[data-tab="shop"]')

        # We need to scroll or just check presence in DOM
        # Rice and Rose are crops, so they should be in 'seeds' tab (default)
        rice = page.locator('div[data-id="rice"]')
        if rice.count() > 0:
            print("Found Rice in shop.")
        else:
            print("ERROR: Rice NOT found in shop.")

        rose = page.locator('div[data-id="rose"]')
        if rose.count() > 0:
            print("Found Rose in shop.")
        else:
            print("ERROR: Rose NOT found in shop.")

        # Switch to Items tab for Pet Food
        page.click('button[data-shop-tab="items"]')
        pet_food = page.locator('div[data-id="pet_food"]')
        if pet_food.count() > 0:
            print("Found Pet Food in shop.")
        else:
            print("ERROR: Pet Food NOT found in shop.")

        page.screenshot(path="verification/shop_items.png")
        print("Captured verification/shop_items.png")

        browser.close()

if __name__ == "__main__":
    run()
