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
        # Wait a bit
        time.sleep(1)

        # Force a screenshot of the orders area
        page.locator("#storage-tab").screenshot(path="verification/storage_full_view.png")
        print("Captured full storage view.")

        # Check orders count again
        orders = page.locator('#orders-list')
        print("Orders container count:", orders.count())

        # Check innerHTML
        html_content = orders.inner_html()
        print("Orders HTML content length:", len(html_content))
        print("Orders HTML content snippet:", html_content[:100])

        browser.close()

if __name__ == "__main__":
    run()
