import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    content = f.read()

# Fix 1: showFloatingText missing argument
# pattern: showFloatingText(index, , 'purple') -> showFloatingText(index, '+Bonus', 'purple')
content = content.replace("showFloatingText(index, , 'purple')", "showFloatingText(index, 'COMB!', 'purple')")
content = content.replace("showFloatingText(index, , 'gold')", "showFloatingText(index, '+' + bonusGold, 'gold')")
content = content.replace("showFloatingText(index, , 'white')", "showFloatingText(index, '+' + crop.exp + ' Exp', 'white')")

# Fix 2: showToast() empty
content = content.replace("showToast();", "showToast('全部收获完成！');")

with open(file_path, 'w') as f:
    f.write(content)

print("Fixed syntax errors in script.js")
