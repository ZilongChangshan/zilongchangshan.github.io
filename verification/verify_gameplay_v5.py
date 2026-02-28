import os
import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/nongchang/index.html")

        # 1. Verify Grid Height Reduction
        grid = page.locator('#farm-grid')
        height = grid.evaluate("element => getComputedStyle(element).height")
        print(f"Farm Grid Height: {height} (Should be 28vh)")

        # 2. Verify Tab Reset Logic
        # Shop
        page.click('button[data-tab="shop"]')
        page.wait_for_timeout(200)
        # Click Items secondary tab
        page.click('button[data-shop-tab="items"]')
        page.wait_for_timeout(200)

        # Switch to Storage
        page.click('button[data-tab="storage"]')
        page.wait_for_timeout(200)
        # Click Orders secondary tab
        page.click('button[data-storage-tab="orders"]')
        page.wait_for_timeout(200)

        # Switch BACK to Shop - should be on Seeds
        page.click('button[data-tab="shop"]')
        page.wait_for_timeout(200)

        active_shop_tab = page.locator('.secondary-tab-btn[data-shop-tab].active').get_attribute('data-shop-tab')
        print(f"Active Shop Secondary Tab after reset: {active_shop_tab}")
        if active_shop_tab == 'seeds':
            print("PASS: Shop tab resets to 'seeds'")
        else:
            print("FAIL: Shop tab reset failed")

        # Switch BACK to Storage - should be on Inventory
        page.click('button[data-tab="storage"]')
        page.wait_for_timeout(200)

        active_storage_tab = page.locator('.secondary-tab-btn[data-storage-tab].active').get_attribute('data-storage-tab')
        print(f"Active Storage Secondary Tab after reset: {active_storage_tab}")
        if active_storage_tab == 'inventory':
            print("PASS: Storage tab resets to 'inventory'")
        else:
            print("FAIL: Storage tab reset failed")

        page.screenshot(path="verification/tab_reset_check.png")
        print("Captured verification/tab_reset_check.png")

        browser.close()

if __name__ == "__main__":
    run()
