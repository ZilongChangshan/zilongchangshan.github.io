export const state = {
    gold: 100,
    storage: {},
    orders: [],
    factory: [], // list of active crafting tasks

    pet: {
        unlocked: false,
        energy: 100,
        mood: 100,
        level: 1,
        exp: 0,
        adventureEndTime: 0,
        adventureStatus: 'idle',
        logs: []
    },
    startTime: Date.now(),
    lastSaveTime: Date.now(),
    level: 1,
    exp: 0,
    nextLevelExp: 100,
    selectedItemId: 'wheat',
    selectedItemType: 'crop',
    stats: {
        cropsHarvested: 0,
        totalGold: 0,
        adsWatched: 0
    },
    combo: 0,
    lastHarvestTime: 0,
    lastDailyReward: 0,
    weather: 'sunny',
    market: 'normal',
    hasDog: false,
    achievements: [],
    plots: Array(25).fill(null).map((_, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        const isCenter = row >= 1 && row <= 2 && col >= 1 && col <= 3; // Initial 6 plots (2x3)
        return {
            id: i,
            status: 'empty',
            cropId: null,
            plantTime: 0,
            level: 1,
            unlocked: isCenter,
            hasWeeds: false,
            hasBugs: false
        };
    }),

    // UI state that doesn't necessarily need saving but is global
    currentShopTab: 'seeds',
    currentStorageTab: 'inventory'
};

export function saveGame() {
    state.lastSaveTime = Date.now();
    localStorage.setItem('nongchang_save_v3', JSON.stringify(state));
}

export function loadGame() {
    const saved = localStorage.getItem('nongchang_save_v3');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Migration logic
            if (parsed.selectedCropId && !parsed.selectedItemId) {
                parsed.selectedItemId = parsed.selectedCropId;
                parsed.selectedItemType = 'crop';
                delete parsed.selectedCropId;
            }

            Object.assign(state, parsed);

            // Ensure defaults
            if (!state.selectedItemType) state.selectedItemType = 'crop';
            if (!state.stats) state.stats = { cropsHarvested: 0, totalGold: 0, adsWatched: 0 };
            if (!state.achievements) state.achievements = [];
            if (!state.startTime) state.startTime = Date.now();
            if (!state.lastSaveTime) state.lastSaveTime = Date.now();
            if (!state.factory) state.factory = [];
            if (!state.orders) state.orders = [];

            if (state.plots.length !== 25) {
                 // Try to keep as much old data as possible, or reset
                 // For simplicity, reset if length mismatch (rare unless early dev)
                 console.warn("Plot length mismatch, keeping existing if possible or resetting.");
            }
        } catch (e) {
            console.error("Save error", e);
        }
    }
}
