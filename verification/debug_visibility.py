import os
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/nongchang/index.html")

        # Click Storage
        page.click('button[data-tab="storage"]')
        page.wait_for_timeout(500)

        # Check class of storage tab
        tab = page.locator('#storage-tab')
        print("Storage Tab Class:", tab.get_attribute("class"))
        print("Storage Tab Display:", tab.evaluate("element => getComputedStyle(element).display"))

        # Check if orders list is inside
        orders = page.locator('#orders-list')
        print("Orders List Count:", orders.count())
        if orders.count() > 0:
             print("Orders List Visibility:", orders.is_visible())
             print("Orders List Display:", orders.evaluate("element => getComputedStyle(element).display"))

        browser.close()

if __name__ == "__main__":
    run()
