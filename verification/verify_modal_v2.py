from playwright.sync_api import sync_playwright
import os
import json
import time

def verify_modal_v2():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 400, "height": 800})
        file_url = f"file://{os.getcwd()}/nongchang/index.html"

        plots = []
        for i in range(25):
            plots.append({
                "id": i,
                "status": "growing" if i in [0, 12, 4] else "empty",
                "cropId": "wheat" if i in [0, 12, 4] else None,
                "plantTime": int(time.time() * 1000),
                "growthDuration": 60000,
                "level": 1,
                "unlocked": True
            })

        save_data = {
            "level": 5,
            "gold": 10000,
            "weather": "rainbow", # Bonus check
            "plots": plots
        }

        page.goto(file_url)
        page.evaluate(f"localStorage.setItem('nongchang_save_v3', '{json.dumps(save_data)}');")
        page.reload()
        page.wait_for_timeout(1000)

        # Click Center
        page.locator("#farm-grid .plot-card").nth(12).click()
        page.wait_for_timeout(300)

        # Check Info Content
        modal_content = page.locator("#plot-modal .modal-content").inner_text()
        print(f"Modal Content: {modal_content}")

        if "预计收益" in modal_content and "Exp" in modal_content:
            print("Modal Info enriched (Correct).")
        else:
            print("Modal Info missing details.")

        if "x2(彩虹)" in modal_content:
            print("Weather bonus info displayed (Correct).")
        else:
            print("Weather bonus info missing.")

        # Take screenshot
        page.screenshot(path="verification/nongchang_modal_v2.png")
        print("Screenshot saved to verification/nongchang_modal_v2.png")

        browser.close()

if __name__ == "__main__":
    verify_modal_v2()
