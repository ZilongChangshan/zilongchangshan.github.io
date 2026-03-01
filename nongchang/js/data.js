export const CROPS = {
    rice: { id: 'rice', name: '水稻', emoji: '🌾', seedEmoji: '🌱', cost: 15, sellPrice: 20, growthTime: 4000, exp: 3, minLevel: 2, desc: '雨天生长极快' },
    rose: { id: 'rose', name: '玫瑰', emoji: '🌹', seedEmoji: '🌱', cost: 500, sellPrice: 1200, growthTime: 60000, exp: 60, minLevel: 7, desc: '美丽的爱情象征' },
    wheat: { id: 'wheat', name: '小麦', emoji: '🌾', seedEmoji: '🌱', cost: 10, sellPrice: 15, growthTime: 3000, exp: 2, minLevel: 1 },
    corn: { id: 'corn', name: '玉米', emoji: '🌽', seedEmoji: '🌱', cost: 20, sellPrice: 35, growthTime: 5000, exp: 4, minLevel: 2 },
    carrot: { id: 'carrot', name: '胡萝卜', emoji: '🥕', seedEmoji: '🌱', cost: 30, sellPrice: 55, growthTime: 8000, exp: 6, minLevel: 3 },
    potato: { id: 'potato', name: '土豆', emoji: '🥔', seedEmoji: '🌱', cost: 50, sellPrice: 90, growthTime: 12000, exp: 10, minLevel: 4 },
    tomato: { id: 'tomato', name: '番茄', emoji: '🍅', seedEmoji: '🌱', cost: 100, sellPrice: 180, growthTime: 20000, exp: 15, minLevel: 5 },
    strawberry: { id: 'strawberry', name: '草莓', emoji: '🍓', seedEmoji: '🌱', cost: 200, sellPrice: 380, growthTime: 45000, exp: 25, minLevel: 6 },
    pumpkin: { id: 'pumpkin', name: '南瓜', emoji: '🎃', seedEmoji: '🌱', cost: 500, sellPrice: 1000, growthTime: 90000, exp: 50, minLevel: 8 },
    sunflower: { id: 'sunflower', name: '向日葵', emoji: '🌻', seedEmoji: '🌱', cost: 1000, sellPrice: 2500, growthTime: 300000, exp: 100, minLevel: 10 },
    grapes: { id: 'grapes', name: '葡萄', emoji: '🍇', seedEmoji: '🌱', cost: 2000, sellPrice: 4500, growthTime: 120000, exp: 80, minLevel: 12 },
    melon: { id: 'melon', name: '甜瓜', emoji: '🍈', seedEmoji: '🌱', cost: 5000, sellPrice: 12000, growthTime: 300000, exp: 200, minLevel: 15 },
    clover: { id: 'clover', name: '幸运草', emoji: '🍀', seedEmoji: '🌱', cost: 300, sellPrice: 10, growthTime: 60000, exp: 50, minLevel: 5, desc: '低售价，高几率掉落宝物' },
    magic_bean: { id: 'magic_bean', name: '魔豆', emoji: '🫘', seedEmoji: '✨', cost: 10000, sellPrice: 0, growthTime: 600000, exp: 5000, minLevel: 20, desc: '不值钱，但蕴含巨量经验' },
    apple_tree: { id: 'apple_tree', name: '苹果树', emoji: '🍎', seedEmoji: '🌳', cost: 2000, sellPrice: 500, growthTime: 180000, exp: 100, minLevel: 10, desc: '多次收获，无需重种', isTree: true }
};

export const PRODUCTS = {
    bread: { id: 'bread', name: '面包', emoji: '🍞', sellPrice: 60, exp: 15, craftTime: 10000 },
    fries: { id: 'fries', name: '薯条', emoji: '🍟', sellPrice: 200, exp: 40, craftTime: 20000 },
    ketchup: { id: 'ketchup', name: '番茄酱', emoji: '🥫', sellPrice: 400, exp: 80, craftTime: 30000 },
    wine: { id: 'wine', name: '葡萄酒', emoji: '🍷', sellPrice: 10000, exp: 500, craftTime: 120000 }
};

export const RECIPES = {
    bread: { wheat: 3 },
    fries: { potato: 2 },
    ketchup: { tomato: 2 },
    wine: { grapes: 2 }
};

export const ITEMS = {
    fertilizer: { id: 'fertilizer', name: '强力化肥', emoji: '⚡', cost: 50, desc: '立刻成熟', type: 'item' },
    dog: { id: 'dog', name: '看门狗', emoji: '🐕', cost: 1000, desc: '自动捡钱 & 防虫', type: 'pet', max: 1 },
    pet_food: { id: 'pet_food', name: '高级狗粮', emoji: '🍖', cost: 50, desc: '恢复 50 体力', type: 'item' }
};

export const ENV_CONFIG = {
    sunny: { name: '晴朗', emoji: '☀️', effect: '作物生长正常' },
    rainy: { name: '小雨', emoji: '🌧️', effect: '生长速度 +30%' },
    rainbow: { name: '彩虹', emoji: '🌈', effect: '收获奖励 x2' },
    normal: { name: '平稳', emoji: '⚖️', effect: '物价正常' },
    boom: { name: '繁荣', emoji: '📈', effect: '售价 +50%' },
    crash: { name: '萧条', emoji: '📉', effect: '售价 -20%' }
};

export const PET_CONFIG = {
    adventureCost: 20,
    adventureTime: 180000, // 3 minutes
    maxEnergy: 100,
    energyRegen: 1, // per tick (10s)
    maxLogs: 10
};

export const GAME_VERSION = "2026.02.26.2";
export const LAND_COST_BASE = 100;
export const LAND_COST_MULTIPLIER = 1.3;
export const MAX_ORDERS = 3;
