import { state, saveGame } from './state.js';
import { elements, showToast, updateStatsUI } from './ui.js';

export const ACHIEVEMENTS = [
    { id: 'first_harvest', name: '初次收获', desc: '收获第一个作物', check: (s) => s.stats.cropsHarvested >= 1, reward: 50 },
    { id: 'novice_farmer', name: '新手农夫', desc: '收获 50 个作物', check: (s) => s.stats.cropsHarvested >= 50, reward: 200 },
    { id: 'expert_farmer', name: '种植专家', desc: '收获 500 个作物', check: (s) => s.stats.cropsHarvested >= 500, reward: 1000 },
    { id: 'wealthy', name: '小有资产', desc: '累计获得 1,000 金币', check: (s) => s.stats.totalGold >= 1000, reward: 500 },
    { id: 'millionaire', name: '百万富翁', desc: '累计获得 10,000 金币', check: (s) => s.stats.totalGold >= 10000, reward: 5000 },
    { id: 'land_owner', name: '大地主', desc: '解锁 15 块土地', check: (s) => s.plots.filter(p => p.unlocked).length >= 15, reward: 1000 },
    { id: 'master_level', name: '大师等级', desc: '达到等级 5', check: (s) => s.level >= 5, reward: 800 },
    { id: 'grand_master', name: '传奇农场主', desc: '达到等级 10', check: (s) => s.level >= 10, reward: 2000 }
];

export function renderAchievements() {
    elements.achievementsTab.innerHTML = '';
    const list = document.createElement('div');
    list.className = 'achievement-list';

    ACHIEVEMENTS.forEach(ach => {
        const isUnlocked = state.achievements.includes(ach.id);
        const item = document.createElement('div');
        item.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;

        item.innerHTML = `
            <div class="ach-icon">${isUnlocked ? '🏆' : '🔒'}</div>
            <div class="ach-info">
                <div class="ach-name">${ach.name}</div>
                <div class="ach-desc">${ach.desc}</div>
                ${!isUnlocked ? `<div class="ach-reward">奖励: ${ach.reward}💰</div>` : '<div class="ach-reward">已领取</div>'}
            </div>
        `;
        list.appendChild(item);
    });
    elements.achievementsTab.appendChild(list);
}

export function checkAchievements() {
    let changed = false;
    ACHIEVEMENTS.forEach(ach => {
        if (!state.achievements.includes(ach.id)) {
            if (ach.check(state)) {
                state.achievements.push(ach.id);
                state.gold += ach.reward;
                showToast(`🏆 解锁成就: ${ach.name} (+${ach.reward}💰)`);
                changed = true;
            }
        }
    });
    if (changed) {
        updateStatsUI();
        saveGame();
    }
}
