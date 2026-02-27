import re

with open('nongchang/script.js', 'r') as f:
    js = f.read()

errors = []

if "magic_bean" not in js:
    errors.append("Magic Bean crop missing")

if "clover" not in js:
    errors.append("Clover crop missing")

if "state.storage" not in js:
    errors.append("Storage state missing")

if "addToStorage" not in js:
    errors.append("addToStorage function missing")

if "initPetUI" not in js:
    errors.append("initPetUI function missing")

if "weatherOverlay" not in js:
    errors.append("weatherOverlay element missing")

if errors:
    print("FAIL:", errors)
else:
    print("PASS: All features present in script.js")

with open('nongchang/index.html', 'r') as f:
    html = f.read()

if "pet-tab" not in html:
    errors.append("Pet tab HTML missing")

if "storage-tab" not in html:
    errors.append("Storage tab HTML missing")

if "weather-overlay" not in html:
    errors.append("Weather overlay HTML missing")

if errors:
    print("FAIL:", errors)
else:
    print("PASS: All features present in index.html")
