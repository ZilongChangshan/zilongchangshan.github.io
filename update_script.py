import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    content = f.read()

# Define the new function logic
new_function = r"""    function openPlotModal(index) {
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

# Regex to find the existing openPlotModal function
# It starts with 'function openPlotModal(index) {' and ends before the next function definition or logical block
# Since regex for nested braces is hard, we'll try to match the known structure or just the header and assume valid replacement.
# But actually, finding the exact start and end of the function in a huge file with pure regex is risky.
# However, the structure is relatively unique.

# Let's try to locate the function by name and replace until the end of its block.
# Since we know the function content from previous , we can verify.

# Actually, let's just use exact string replacement for the old function if we can construct the old string correctly.
# But indentation might differ.

# Safer approach: Match  where  matches everything up to the next  keyword or end of file, but that's too greedy.
# Let's try to match the signature and then find the closing brace by counting.

start_marker = "function openPlotModal(index) {"
start_idx = content.find(start_marker)

if start_idx != -1:
    # Find the matching closing brace
    brace_count = 0
    end_idx = -1
    for i in range(start_idx, len(content)):
        if content[i] == '{':
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                end_idx = i + 1
                break

    if end_idx != -1:
        new_content = content[:start_idx] + new_function + content[end_idx:]
        with open(file_path, 'w') as f:
            f.write(new_content)
        print("Updated openPlotModal successfully.")
    else:
        print("Could not find end of function.")
else:
    print("Could not find start of function.")
