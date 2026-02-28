import os
import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Using a typical mobile viewport size
        page = browser.new_page(viewport={"width": 375, "height": 812})
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/nongchang/index.html")

        # Take a screenshot specifically of the grid area
        grid_locator = page.locator('#farm-grid')

        # We should wait a tiny bit for render
        page.wait_for_timeout(500)

        # Take full screen and element specific shots
        page.screenshot(path="verification/full_mobile_view.png")
        grid_locator.screenshot(path="verification/grid_closeup.png")

        # Extract height and width for debug
        box = grid_locator.bounding_box()
        print(f"Grid Bounding Box: {box}")

        # Check a specific card's internal layout
        first_card = page.locator('.plot-card').first
        print("First Card HTML:")
        print(first_card.inner_html())

        browser.close()

if __name__ == "__main__":
    run()
