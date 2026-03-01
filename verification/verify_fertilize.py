import os
import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 375, "height": 812})
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/nongchang/index.html")

        # 1. Level up to 5 to unlock plant/harvest all
        page.evaluate("state.level = 5; state.gold = 1000; checkControlButtonsUnlock(); updateStatsUI();")

        # 2. Select Fertilizer
        page.click('button[data-tab="shop"]')
        page.wait_for_timeout(200)
        page.click('button[data-shop-tab="items"]')
        page.wait_for_timeout(200)
        page.click('.shop-item[data-id="fertilizer"]')
        page.wait_for_timeout(200)

        # 3. Check Plant All Button text and background color
        btn = page.locator('#plant-all-btn span')
        print(f"Button Text: {btn.text_content()}")

        btn_container = page.locator('#plant-all-btn')
        color = btn_container.evaluate("element => getComputedStyle(element).backgroundColor")
        print(f"Button Color: {color}")

        page.screenshot(path="verification/fertilize_btn.png")
        print("Captured verification/fertilize_btn.png")

        browser.close()

if __name__ == "__main__":
    run()
