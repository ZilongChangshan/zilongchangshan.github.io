import { state } from './state.js';
import { elements, formatTime } from './ui.js';
import { GAME_VERSION } from './data.js';

export function renderStats() {
    const playTime = formatTime(Date.now() - state.startTime);
    const landCount = state.plots.filter(p => p.unlocked).length;

    const statsData = [
        { icon: '🌾', label: '收获作物', value: state.stats.cropsHarvested },
        { icon: '💰', label: '累计金币', value: state.stats.totalGold },
        { icon: '🏞️', label: '拥有土地', value: `${landCount} / 25` },
        { icon: '⏳', label: '游玩时间', value: playTime },
        { icon: '⭐', label: '当前等级', value: `Lv.${state.level}` },
        { icon: 'ℹ️', label: '游戏版本', value: GAME_VERSION }
    ];

    let html = '<div class="stats-list">';
    statsData.forEach(item => {
        html += `
            <div class="stats-item">
                <div class="stats-icon">${item.icon}</div>
                <div class="stats-info">
                    <div class="stats-label">${item.label}</div>
                    <div class="stats-value">${item.value}</div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    elements.statsTab.innerHTML = html;
}
