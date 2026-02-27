from playwright.sync_api import sync_playwright
import os
import json
import time

def verify_modal_and_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        file_url = f"file://{os.getcwd()}/nongchang/index.html"

        # 1. Setup: One growing crop (Plot 0)
        plots = []
        for i in range(25):
            plots.append({
                "id": i,
                "status": "growing" if i == 0 else "empty",
                "cropId": "wheat" if i == 0 else None,
                "plantTime": int(time.time() * 1000),
                "growthDuration": 60000, # 1 minute
                "level": 1,
                "unlocked": True
            })

        save_data = {
            "level": 5,
            "gold": 10000,
            "exp": 0,
            "plots": plots
        }

        page.goto(file_url)
        page.evaluate(f"localStorage.setItem('nongchang_save_v3', '{json.dumps(save_data)}');")
        page.reload()
        page.wait_for_timeout(1000)

        # 2. Verify Card UI (Progress Bar Overlay)
        plot0 = page.locator("#farm-grid .plot-card").nth(0)
        progress_bar = plot0.locator(".plot-progress-bar")

        # Check style
        position = progress_bar.evaluate("el => getComputedStyle(el).position")
        bottom = progress_bar.evaluate("el => getComputedStyle(el).bottom")

        if position == "absolute" and bottom == "0px":
            print("Progress Bar is absolute/bottom (Correct).")
        else:
            print(f"Progress Bar style issue: {position}, {bottom}")

        # 3. Open Modal
        print("Clicking growing plot...")
        plot0.click()
        page.wait_for_timeout(500)

        modal = page.locator("#plot-modal")
        if modal.is_visible():
            print("Modal opened (Correct).")
            # Check content
            name = page.locator("#modal-crop-name").text_content()
            timer = page.locator("#modal-timer").text_content()
            print(f"Modal info: {name}, {timer}")

            if "小麦" in name:
                print("Modal shows correct crop info.")
            else:
                print("Modal shows WRONG crop info.")
        else:
            print("Modal did NOT open.")

        # 4. Close Modal
        close_btn = page.locator(".close-modal")
        close_btn.click()
        page.wait_for_timeout(300)

        if not modal.is_visible():
            print("Modal closed (Correct).")
        else:
            print("Modal did NOT close.")

        # Take screenshot
        page.screenshot(path="verification/nongchang_modal_ui.png")
        print("Screenshot saved to verification/nongchang_modal_ui.png")

        browser.close()

if __name__ == "__main__":
    verify_modal_and_ui()
