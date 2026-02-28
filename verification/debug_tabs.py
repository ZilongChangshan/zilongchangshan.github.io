import os
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/nongchang/index.html")

        page.click('button[data-tab="storage"]')
        page.wait_for_timeout(500)

        # Check why orders button is not visible
        orders_btn = page.locator('button[data-storage-tab="orders"]')
        print("Storage Orders Button Count:", orders_btn.count())
        if orders_btn.count() > 0:
            print("Storage Orders Button Visibility:", orders_btn.is_visible())
            print("Storage Orders Button Classes:", orders_btn.get_attribute('class'))

            # Print parent visibility
            parent = page.locator('.secondary-tabs').nth(1) # Shop has first one, Storage has second? Let's check
            print("Parent count:", page.locator('.secondary-tabs').count())

            storage_tab = page.locator('#storage-tab')
            print("Storage Tab Visibility:", storage_tab.is_visible())
            print("Storage Tab Display:", storage_tab.evaluate("element => getComputedStyle(element).display"))

        page.screenshot(path="verification/storage_debug.png")
        browser.close()

if __name__ == "__main__":
    run()
