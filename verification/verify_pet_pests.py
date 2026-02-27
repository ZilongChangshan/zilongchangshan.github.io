from playwright.sync_api import sync_playwright
import os
import json
import time

def verify_pet_and_pests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        file_url = f"file://{os.getcwd()}/nongchang/index.html"

        # 1. Setup State: Own Dog, One plot with weeds, One plot with bugs
        plots = []
        for i in range(25):
            is_center = (1 <= i // 5 <= 2) and (1 <= i % 5 <= 3)
            plots.append({
                "id": i,
                "status": "growing" if i == 6 else "empty", # Plot 6 growing for bugs
                "cropId": "wheat" if i == 6 else None,
                "plantTime": int(time.time() * 1000),
                "hasWeeds": True if i == 7 else False, # Plot 7 has weeds
                "hasBugs": True if i == 6 else False,  # Plot 6 has bugs
                "level": 1,
                "unlocked": is_center
            })

        save_data = {
            "level": 5,
            "gold": 10000,
            "exp": 0,
            "hasDog": True,
            "weather": "sunny",
            "market": "normal",
            "stats": {"cropsHarvested": 0, "totalGold": 0, "adsWatched": 0},
            "plots": plots
        }

        page.goto(file_url)
        page.evaluate(f"localStorage.setItem('nongchang_save_v3', '{json.dumps(save_data)}');")
        page.reload()
        page.wait_for_timeout(1000)

        # 2. Check Visuals
        weeds = page.locator(".weed-overlay")
        bugs = page.locator(".bug-overlay")

        if weeds.count() > 0:
            print("Weeds visual found (Correct).")
        else:
            print("Weeds visual NOT found.")

        if bugs.count() > 0:
            print("Bugs visual found (Correct).")
        else:
            print("Bugs visual NOT found.")

        # 3. Check Shop Dog Status
        page.click("button[data-tab='shop']")
        page.click("button[data-shop-tab='items']")
        page.wait_for_timeout(500)

        dog_item = page.locator(".shop-item[data-id='dog']")
        if "owned" in dog_item.get_attribute("class"):
            print("Dog shows as owned in shop (Correct).")
        else:
            print("Dog does NOT show as owned.")

        # 4. Interact with Plot to Clean
        # Go back to grid
        # Clicking plot 7 (weeds) should clean it
        farm_grid = page.locator("#farm-grid")
        plot7 = farm_grid.locator(".plot-card").nth(7)

        print("Cleaning weeds...")
        plot7.click()
        page.wait_for_timeout(500)

        if page.locator(".weed-overlay").count() == 0:
            print("Weeds removed after click (Correct).")
        else:
            print("Weeds persisted after click.")

        # Take screenshot
        page.screenshot(path="verification/nongchang_pet_pests.png")
        print("Screenshot saved to verification/nongchang_pet_pests.png")

        browser.close()

if __name__ == "__main__":
    verify_pet_and_pests()
