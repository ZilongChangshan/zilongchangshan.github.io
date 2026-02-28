import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# Let's find the syntax error.
# A common issue is a stray newline in a template literal `\n` which might not be supported if we injected it weirdly.
# Wait, look at `checkOfflineProgress` in script.js (read_file output):
# showToast(`离线收益:
# ` + offlineMsgs.join('
# '));
# There is a literal newline! `离线收益:\n` and `\n` in python was injected as literal newlines inside JS template strings.
# Wait, JS supports literal newlines inside ` ` ticks.
# But `\n` injected by python `join('\n')` might have become `join('` then literal newline then `')`.
# Ah! Look closely at the injected code:
# showToast(`离线收益:\n` + offlineMsgs.join('\n')); -> Python executed `\n` if it was in a format string or `replace`?
# In my python script I used: `showToast(`离线收益:\n` + offlineMsgs.join('\n'));`
# Python replaces `\n` with an actual newline when reading string literals if not raw string?
# Wait, my script used `cat <<'EOF'`, so it's a raw literal bash string, but python interpreted `\n`.
# So the JS ended up with:
# offlineMsgs.join('
# ')
# Which is invalid JS because you can't have a newline in a single-quoted string `''`!

# Let's fix it by replacing the bad strings.
js = js.replace("offlineMsgs.join('\n')", r"offlineMsgs.join('\n')")
js = js.replace("showToast(`离线收益:\n`", r"showToast(`离线收益:\n`")

# Wait, `replace` in python:
js = js.replace("showToast(`离线收益:\n` + offlineMsgs.join('\n'));", "showToast(`离线收益:\\n` + offlineMsgs.join('\\n'));")

# Let's check `harvestAll` too:
# showToast(`一键收获 ${harvestedCount} 棵作物. 额外奖励: ${totalBonusGold} 💰
# ${specialMsgs.join(' ')}`);
# That's inside ` ` (template literal) so literal newline IS allowed in JS.
# BUT let's be safe and use \n.
js = js.replace("showToast(`一键收获 ${harvestedCount} 棵作物. 额外奖励: ${totalBonusGold} 💰\n${specialMsgs.join(' ')}`);", "showToast(`一键收获 ${harvestedCount} 棵作物. 额外奖励: ${totalBonusGold} 💰\\n${specialMsgs.join(' ')}`);")

with open(file_path, 'w') as f:
    f.write(js)

print("Syntax error fixed.")
