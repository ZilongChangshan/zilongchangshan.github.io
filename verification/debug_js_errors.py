import os
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        cwd = os.getcwd()

        # Capture console logs
        page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Browser Error: {err}"))

        page.goto(f"file://{cwd}/nongchang/index.html")

        # Click Storage Tab
        print("Clicking storage...")
        page.click('button[data-tab="storage"]')
        page.wait_for_timeout(500)

        browser.close()

if __name__ == "__main__":
    run()
