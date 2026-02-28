import os
import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 375, "height": 812}) # mobile view
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/nongchang/index.html")

        # 1. Take screenshot of main grid
        page.screenshot(path="verification/grid_layout.png")
        print("Captured verification/grid_layout.png")

        # 2. Check Shop Sorting
        # The first items should be Wheat, Rice, Corn...
        shop_names = page.locator('#shop-items .shop-name').all_text_contents()

        # Clean up names (remove costs/levels)
        clean_names = [n.split(' ')[0] for n in shop_names]
        print(f"Shop Order: {clean_names[:5]}")

        if clean_names[:3] == ['小麦', '玉米', '水稻']:
            print("ERROR: Shop still not sorted properly.")
        elif clean_names[:3] == ['小麦', '水稻', '玉米']:
            print("PASS: Shop sorted correctly (Wheat, Rice, Corn).")

        page.screenshot(path="verification/shop_sort.png")
        print("Captured verification/shop_sort.png")

        browser.close()

if __name__ == "__main__":
    run()
