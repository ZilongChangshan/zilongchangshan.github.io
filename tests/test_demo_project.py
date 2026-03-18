import os
import sys
from playwright.sync_api import sync_playwright

def test_demo_project():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Get absolute path to the HTML file
        file_path = f"file://{os.path.abspath('demo-project/index.html')}"

        print(f"Navigating to {file_path}")
        page.goto(file_path)

        # Assert title
        title = page.title()
        assert title == "Demo Project", f"Expected title 'Demo Project', but got '{title}'"
        print("✅ Title is correct")

        # Assert h1 text
        h1_text = page.locator("h1").inner_text()
        assert h1_text == "Hello World", f"Expected h1 'Hello World', but got '{h1_text}'"
        print("✅ H1 text is correct")

        # Assert p text
        p_text = page.locator("p").inner_text()
        assert p_text == "This is a demo project.", f"Expected p 'This is a demo project.', but got '{p_text}'"
        print("✅ Paragraph text is correct")

        browser.close()
        print("✅ All tests passed!")

if __name__ == "__main__":
    try:
        test_demo_project()
    except AssertionError as e:
        print(f"❌ Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ An error occurred: {e}")
        sys.exit(1)
