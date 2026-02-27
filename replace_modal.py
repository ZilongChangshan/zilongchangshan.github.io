import os

file_path = 'nongchang/script.js'

new_function_code = r"""    function openPlotModal(index) {
        const plot = state.plots[index];
        const crop = CROPS[plot.cropId];
        if (!crop) return;

        // Populate Info
        elements.modalContent.icon.textContent = crop.emoji;
        elements.modalContent.name.textContent = `${crop.name} (Lv.${plot.level})`;

        const updateModal = () => {
            if (plot.status !== 'growing') {
                closeModal();
                return;
            }

            const elapsed = Date.now() - plot.plantTime;
            const duration = plot.growthDuration || crop.growthTime;
            const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));
            const progress = Math.min(100, (elapsed / duration) * 100);

            // Rich Info Text
            let projectedGold = Math.floor(crop.sellPrice * (state.market === 'boom' ? 1.5 : (state.market === 'crash' ? 0.8 : 1)));
            if (state.weather === 'rainbow') projectedGold *= 2;

            const totalTime = Math.ceil(duration / 1000);
            const statusText = plot.hasBugs || plot.hasWeeds ? '<span style="color:#ff9800">需照料</span>' : '<span style="color:#4CAF50">生长中</span>';

            elements.modalContent.timer.innerHTML = `
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#ccc; margin-bottom:4px;">
                    <span>${statusText}</span>
                    <span>${remaining}s / ${totalTime}s</span>
                </div>
                <div style="font-size:0.75rem; color:#aaa;">
                    预计: <span style="color:#FFD700">${projectedGold}💰</span> <span style="color:#00BCD4">+${crop.exp}⭐</span>
                </div>
            `;
            elements.modalContent.progress.style.width = `${progress}%`;

            // Action Button Logic
            const fertilizer = ITEMS['fertilizer'];
            elements.modalContent.actionBtn.textContent = `⚡ 加速 (${fertilizer.cost}💰)`;
            elements.modalContent.actionBtn.onclick = () => {
                useFertilizer(index);
                closeModal();
            };
        };

        // Render content first to measure size
        updateModal();

        // Show temporarily to measure (opacity 0 to avoid jump)
        elements.modal.style.opacity = '0';
        elements.modal.style.display = 'block';

        // Dynamic Measurement
        const modalWidth = elements.modal.offsetWidth;
        const modalHeight = elements.modal.offsetHeight;

        const card = elements.farmGrid.children[index];
        const rect = card.getBoundingClientRect();
        const windowWidth = window.innerWidth;

        // Horizontal Positioning
        let left = rect.left + (rect.width / 2) - (modalWidth / 2);

        // Clamp Left
        if (left < 10) left = 10;
        if (left + modalWidth > windowWidth - 10) left = windowWidth - modalWidth - 10;

        // Calculate Arrow Position
        // Arrow should point to the center of the card
        const cardCenterX = rect.left + (rect.width / 2);
        const modalLeftX = left;
        const arrowOffsetX = cardCenterX - modalLeftX;
        let arrowLeft = (arrowOffsetX / modalWidth) * 100;

        // Arrow Clamp
        arrowLeft = Math.max(10, Math.min(90, arrowLeft));

        // Vertical Positioning
        let top = rect.top - modalHeight - 10; // 10px spacing
        let isTop = true; // Modal is ABOVE the slot (arrow at bottom)

        // If too close to top (header area approx 60px + margin)
        if (top < 80) {
            top = rect.bottom + 10;
            isTop = false; // Modal is BELOW the slot (arrow at top)
        }

        // Apply Styles
        elements.modal.style.left = `${left}px`;
        elements.modal.style.top = `${top}px`;

        const content = elements.modal.querySelector('.modal-content');
        content.style.setProperty('--arrow-left', `${arrowLeft}%`);

        if (isTop) {
            content.classList.remove('arrow-top');
            content.classList.add('arrow-bottom');
        } else {
            content.classList.remove('arrow-bottom');
            content.classList.add('arrow-top');
        }

        // Make visible
        elements.modal.style.opacity = '1';
        elements.backdrop.style.display = 'block';
        state.openModalIndex = index; // Track open modal
    }"""

with open(file_path, 'r') as f:
    lines = f.readlines()

start_line = -1
end_line = -1
brace_count = 0
found_start = False

for i, line in enumerate(lines):
    if 'function openPlotModal(index) {' in line:
        start_line = i
        found_start = True
        brace_count = 1
    elif found_start:
        brace_count += line.count('{')
        brace_count -= line.count('}')
        if brace_count == 0:
            end_line = i
            break

if start_line != -1 and end_line != -1:
    new_lines = lines[:start_line] + [new_function_code + '\n'] + lines[end_line+1:]
    with open(file_path, 'w') as f:
        f.writelines(new_lines)
    print("Function replaced successfully.")
else:
    print("Function not found or matching braces failed.")
