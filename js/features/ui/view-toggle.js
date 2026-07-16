/**
 * js/features/ui/view-toggle.js
 */
import { store } from '../../core/store.js';

export function initViewToggle() {
    const btnKanban = document.getElementById('view-kanban');
    const btnList = document.getElementById('view-list');

    // 1. Filter Bar Buttons: Update the Store AND the URL Hash
    if (btnKanban) {
        btnKanban.addEventListener('click', () => {
            store.setState({ viewMode: 'kanban' });
            window.location.hash = '#dashboard'; // Force the router to un-hide the board
        });
    }
    
    if (btnList) {
        btnList.addEventListener('click', () => {
            store.setState({ viewMode: 'list' });
            window.location.hash = '#tasks-panel'; // Force the router to go to list mode
        });
    }

    // 2. Sidebar Links: Just listen to the URL changing naturally!
    // Because we removed the old e.preventDefault(), clicking the 
    // sidebar links will now effortlessly trigger this listener.
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        if (hash === '#tasks-panel') {
            store.setState({ viewMode: 'list' });
        } else if (hash === '#board-view' || hash === '#dashboard' || hash === '') {
            store.setState({ viewMode: 'kanban' });
        }
    });
}