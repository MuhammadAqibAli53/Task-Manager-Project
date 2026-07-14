
import { store } from '../../core/store.js';

export function initViewToggle() {
    const btnKanban = document.getElementById('view-kanban');
    const btnList = document.getElementById('view-list');

    if (btnKanban && btnList) {
        btnKanban.addEventListener('click', () => {
            store.set({ viewMode: 'kanban' }); // Update store to kanban
        });

        btnList.addEventListener('click', () => {
            store.set({ viewMode: 'list' }); // Update store to list
        });
    }
}