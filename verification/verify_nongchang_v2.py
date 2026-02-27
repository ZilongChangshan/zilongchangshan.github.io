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

        # 1. Verify Pet Tab Button Exists
        pet_btn = page.locator('button[data-tab="pet"]')
        if pet_btn.count() > 0:
            print("Pet tab button found.")
            pet_btn.click()
            # Wait for content to be visible
            page.wait_for_selector("#pet-tab", state="visible", timeout=2000)
            page.screenshot(path="verification/pet_tab.png")
            print("Captured verification/pet_tab.png")
        else:
            print("ERROR: Pet tab button NOT found in DOM.")

        # 2. Verify Storage Tab
        storage_btn = page.locator('button[data-tab="storage"]')
        if storage_btn.count() > 0:
            print("Storage tab button found.")
            storage_btn.click()
            page.wait_for_selector("#storage-tab", state="visible", timeout=2000)
            page.screenshot(path="verification/storage_tab.png")
            print("Captured verification/storage_tab.png")
        else:
            print("ERROR: Storage tab button NOT found.")

        browser.close()

if __name__ == "__main__":
    run()
