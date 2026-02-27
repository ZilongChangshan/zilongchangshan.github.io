import sys
import re

# Check CSS file (via index.html)
with open('nongchang/index.html', 'r') as f:
    html_content = f.read()
    if 'position: fixed; /* Viewport relative */' not in html_content:
        print("FAIL: .modal position not fixed in index.html")
        sys.exit(1)
    else:
        print("PASS: .modal position is fixed")

# Check JS file for dynamic measurement
with open('nongchang/script.js', 'r') as f:
    js_content = f.read()

    # Check for temporary display to measure
    if "elements.modal.style.opacity = '0'" not in js_content or        "elements.modal.style.display = 'block'" not in js_content:
        print("FAIL: Modal not shown temporarily for measurement")
        sys.exit(1)

    # Check for dynamic width/height retrieval
    if "elements.modal.offsetWidth" not in js_content or        "elements.modal.offsetHeight" not in js_content:
        print("FAIL: Dynamic offsetWidth/offsetHeight not used")
        sys.exit(1)

    print("PASS: JS dynamic measurement logic found")

print("Verification Successful!")
