import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js_content = f.read()

# 1. Add Special Crops to CROPS object
new_crops = """
        melon: { id: 'melon', name: '甜瓜', emoji: '🍈', seedEmoji: '🌱', cost: 5000, sellPrice: 12000, growthTime: 300000, exp: 200, minLevel: 15 },
        clover: { id: 'clover', name: '幸运草', emoji: '🍀', seedEmoji: '🌱', cost: 300, sellPrice: 10, growthTime: 60000, exp: 50, minLevel: 5, desc: '低售价，高几率掉落宝物' },
        magic_bean: { id: 'magic_bean', name: '魔豆', emoji: '🫘', seedEmoji: '✨', cost: 10000, sellPrice: 0, growthTime: 600000, exp: 5000, minLevel: 20, desc: '不值钱，但蕴含巨量经验' }
"""
# Replace the last crop line to append new ones
js_content = js_content.replace("melon: { id: 'melon', name: '甜瓜', emoji: '🍈', seedEmoji: '🌱', cost: 5000, sellPrice: 12000, growthTime: 300000, exp: 200, minLevel: 15 }", new_crops.strip())

# 2. Modify harvestCrop logic for special effects
# Look for 'state.gold += goldGain;' and insert custom logic before it
harvest_logic_marker = "state.gold += goldGain;"
special_logic = """
        // Special Crop Effects
        if (crop.id === 'clover') {
            // Clover Logic: High chance for bonus
            if (Math.random() < 0.3) {
                const bonus = 500;
                goldGain += bonus;
                showToast('🍀 幸运草带来了额外的好运! (+500 💰)');
            }
        }
        if (crop.id === 'magic_bean') {
             // Magic Bean Logic: Massive EXP, no Gold usually (sellPrice is 0)
             // But let's add a random huge gold drop chance?
             if (Math.random() < 0.01) {
                 goldGain += 100000;
                 showToast('🫘 魔豆通往了巨人的宝库! (+10w 💰)');
             }
        }
"""
js_content = js_content.replace(harvest_logic_marker, special_logic + "\n        " + harvest_logic_marker)

with open(file_path, 'w') as f:
    f.write(js_content)

print("Updated script.js with Special Crops.")
