from playwright.sync_api import sync_playwright
import os
import json
import time

def verify_modal_v3():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 400, "height": 800})
        file_url = f"file://{os.getcwd()}/nongchang/index.html"

        # 1. Setup: Center Plot Growing
        plots = []
        for i in range(25):
            plots.append({
                "id": i,
                "status": "growing" if i == 12 else "empty",
                "cropId": "wheat" if i == 12 else None,
                "plantTime": int(time.time() * 1000),
                "growthDuration": 60000,
                "level": 1,
                "unlocked": True
            })

        save_data = {
            "level": 5,
            "gold": 10000,
            "plots": plots
        }

        page.goto(file_url)
        page.evaluate(f"localStorage.setItem('nongchang_save_v3', '{json.dumps(save_data)}');")
        page.reload()
        page.wait_for_timeout(1000)

        # 2. Click Center
        page.locator("#farm-grid .plot-card").nth(12).click()
        page.wait_for_timeout(500)

        # 3. Check Info Content
        modal_content = page.locator("#plot-modal .modal-content").inner_html() # use inner_html to see structure
        print(f"Modal HTML: {modal_content}")

        if "预计" in modal_content and "生长中" in modal_content:
            print("Modal Info enriched correctly.")
        else:
            print("Modal Info missing details.")

        # 4. Check Arrow Position
        # Center plot -> Modal centered -> Arrow 50%
        content_el = page.locator("#plot-modal .modal-content")
        style = content_el.get_attribute("style")
        print(f"Center Arrow Style: {style}")
        if "--arrow-left: 50%" in style or "--arrow-left:50%" in style:
             print("Arrow logic correct for center.")
        else:
             print("Arrow logic dubious for center.")

        # 5. Check Corner Logic (Top Left)
        # Close
        page.locator("#modal-backdrop").click(position={"x": 10, "y": 10})
        page.wait_for_timeout(300)

        # Hack to make plot 0 growing too? Or just click empty?
        # Clicking empty plants or buys dog.
        # I need a growing plot at corner.
        # Let's just update the plot via JS for testing.
        page.evaluate("""
            state.plots[0].status = 'growing';
            state.plots[0].cropId = 'wheat';
            state.plots[0].plantTime = Date.now();
            updatePlotUI(0);
        """)

        page.locator("#farm-grid .plot-card").nth(0).click()
        page.wait_for_timeout(500)

        style_corner = content_el.get_attribute("style")
        print(f"Corner Arrow Style: {style_corner}")
        # For Top Left (0), modal is shifted right to fit screen (left=10).
        # Card center is at ~40px. Modal left is 10px. Diff 30px.
        # Modal width 180. 30/180 = 16.6%.
        # So arrow-left should be around 16.6%.

        # Extract arrow-left value
        import re
        match = re.search(r'--arrow-left:\s*([\d\.]+)%', style_corner)
        if match:
            val = float(match.group(1))
            if 10 <= val <= 25:
                print(f"Arrow logic correct for corner ({val}%).")
            else:
                print(f"Arrow logic unexpected for corner ({val}%).")
        else:
            print("Could not parse arrow style.")

        # Take screenshot
        page.screenshot(path="verification/nongchang_modal_final.png")
        print("Screenshot saved to verification/nongchang_modal_final.png")

        browser.close()

if __name__ == "__main__":
    verify_modal_v3()
