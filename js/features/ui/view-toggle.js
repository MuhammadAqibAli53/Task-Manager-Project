/**
 * js/features/ui/view-toggle.js
 */
import { store } from '../../core/store.js';

export function initViewToggle() {
    // 1. Grab the buttons from the Filter Bar
    const btnKanban = document.getElementById('view-kanban');
    const btnList = document.getElementById('view-list');

    // 2. Grab the links from the Sidebar Navigation
    const navBoard = document.querySelector('a[href="#board-view"]');
    const navList = document.querySelector('a[href="#tasks-panel"]');
    
    // Grab all sidebar links so we can move the active highlight color
    const allNavLinks = document.querySelectorAll('.panel-link');

    // Helper function to handle sidebar clicks
    function handleSidebarNav(mode, clickedElement) {
        // Tell the central brain to flip the view
        store.setState({ viewMode: mode });

        // Move the "active" visual styling to the link you just clicked
        if (clickedElement) {
            allNavLinks.forEach(link => link.classList.remove('panel-link--active'));
            clickedElement.classList.add('panel-link--active');
        }
    }

    // --- ATTACH LISTENERS ---

    // Filter Bar Buttons
    if (btnKanban) {
        btnKanban.addEventListener('click', () => store.setState({ viewMode: 'kanban' }));
    }
    
    if (btnList) {
        btnList.addEventListener('click', () => store.setState({ viewMode: 'list' }));
    }

    // Sidebar Links
    if (navBoard) {
        navBoard.addEventListener('click', (e) => {
            // Stop HTML from just scrolling, let JS handle it!
            e.preventDefault(); 
            handleSidebarNav('kanban', navBoard);
        });
    }

    if (navList) {
        navList.addEventListener('click', (e) => {
            e.preventDefault();
            handleSidebarNav('list', navList);
        });
    }
}