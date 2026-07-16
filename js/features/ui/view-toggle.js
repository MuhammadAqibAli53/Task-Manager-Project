import { store } from '../../core/store.js';

export function initViewToggle() {
    const btnKanban = document.getElementById('view-kanban');
    const btnList = document.getElementById('view-list');


    if (btnKanban) {
        btnKanban.addEventListener('click', () => {
            store.setState({ viewMode: 'kanban' });
            window.location.hash = '#dashboard'; 
        });
    }
    
    if (btnList) {
        btnList.addEventListener('click', () => {
            store.setState({ viewMode: 'list' });
            window.location.hash = '#tasks-panel'; 
        });
    }

   
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        if (hash === '#tasks-panel') {
            store.setState({ viewMode: 'list' });
        } else if (hash === '#board-view' || hash === '#dashboard' || hash === '') {
            store.setState({ viewMode: 'kanban' });
        }
    });
}