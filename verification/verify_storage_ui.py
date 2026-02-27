import os
import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/nongchang/index.html")

        # Click Storage Tab
        page.click('button[data-tab="storage"]')
        page.wait_for_timeout(500)

        # 1. Screenshot Inventory View
        page.screenshot(path="verification/storage_inventory_view.png")
        print("Captured verification/storage_inventory_view.png")

        # 2. Click "Orders" Secondary Tab
        orders_btn = page.locator('button[data-storage-tab="orders"]')
        if orders_btn.count() > 0:
            print("Orders secondary tab found, clicking...")
            orders_btn.click()
            page.wait_for_timeout(500)

            # Check visibility of orders view
            orders_view = page.locator('#storage-orders-view')
            print("Orders View Display:", orders_view.evaluate("element => getComputedStyle(element).display"))

            page.screenshot(path="verification/storage_orders_view.png")
            print("Captured verification/storage_orders_view.png")
        else:
            print("ERROR: Orders secondary tab button NOT found.")

        browser.close()

if __name__ == "__main__":
    run()
