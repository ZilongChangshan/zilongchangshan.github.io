import os
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the page
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/nongchang/index.html")

        # 1. Verify Pet Tab
        print("Clicking Pet Tab...")
        page.click("#pet-tab")
        page.wait_for_timeout(500) # Wait for UI update
        page.screenshot(path="verification/pet_tab.png")
        print("Saved verification/pet_tab.png")

        # 2. Verify Storage Tab
        print("Clicking Storage Tab...")
        page.click("#storage-tab")
        page.wait_for_timeout(500)
        page.screenshot(path="verification/storage_tab.png")
        print("Saved verification/storage_tab.png")

        # 3. Verify Weather Overlay (exists in DOM)
        weather = page.locator(".weather-overlay")
        if weather.count() > 0:
            print("Weather overlay found.")
        else:
            print("Weather overlay NOT found.")

        browser.close()

if __name__ == "__main__":
    run()
