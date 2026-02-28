import re

file_path = 'nongchang/script.js'

with open(file_path, 'r') as f:
    js = f.read()

# Add rejectOrder function
reject_logic = """
    function rejectOrder(orderId) {
        const orderIndex = state.orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;

        state.orders.splice(orderIndex, 1);
        showToast("🗑️ 订单已拒绝");
        updateOrdersUI();
        saveGame();
    }
"""

if "function rejectOrder" not in js:
    js = js.replace("function fulfillOrder(orderId) {", reject_logic + "\n    function fulfillOrder(orderId) {")

# Update renderOrders to include Reject button
render_orders_pattern = r"(\<button class=\"action-btn-order\"[\s\S]*?\</button\>)"
new_buttons = """
                <div style="display:flex; gap:5px;">
                    <button class="action-btn-reject" data-id="${order.id}" style="padding:4px 8px; font-size:0.8rem; background-color:#ff4444; color:white; border:none; border-radius:4px; cursor:pointer;">
                        🗑️
                    </button>
                    <button class="action-btn-order" data-id="${order.id}" style="width:auto; padding:4px 8px; font-size:0.8rem; background-color:${hasEnough ? '#4CAF50' : '#555'}; color:white; border:none; border-radius:4px; cursor:pointer;" ${hasEnough ? '' : 'disabled'}>
                        ${hasEnough ? '提交' : '缺货'}
                    </button>
                </div>
"""

# And update the click handler binding
click_handler_pattern = r"(if \(hasEnough\) \{[\s\S]*?\})"
new_click_handler = """
            div.querySelector('.action-btn-reject').onclick = () => rejectOrder(order.id);
            if (hasEnough) {
                div.querySelector('.action-btn-order').onclick = () => fulfillOrder(order.id);
            }
"""

if "action-btn-reject" not in js:
    js = re.sub(render_orders_pattern, new_buttons, js)
    js = re.sub(click_handler_pattern, new_click_handler, js)

with open(file_path, 'w') as f:
    f.write(js)

print("Order management enhanced with Reject button.")
