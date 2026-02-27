import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# Make sure we didn't inject anything incorrectly due to bash variables (we used python, so bash errors are just from the terminal output parsing in my head? Oh wait, the bash errors were from my previous script. The python script ran successfully).
# Let's verify the JS has

if "setupStorageTabs()" in js:
    print("PASS: setupStorageTabs found.")
else:
    print("FAIL: setupStorageTabs missing.")

if "setupStorageTabs();" in js:
    print("PASS: setupStorageTabs called in init.")
else:
    print("FAIL: setupStorageTabs not called.")
