import { CROPS, ITEMS, PRODUCTS } from './data.js';

export function getItemData(id) {
    if (CROPS[id]) return { ...CROPS[id], type: 'crop' };
    if (ITEMS[id]) return { ...ITEMS[id], type: 'item' };
    if (PRODUCTS[id]) return { ...PRODUCTS[id], type: 'product' };
    return null;
}
