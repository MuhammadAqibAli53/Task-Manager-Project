/**
 * js/core/router.js
 * Lightweight hash-based navigation for the SPA.
 */

export function initRouter() {
    function navigate() {
        const hash = window.location.hash || '#dashboard';

        // 1. Update active states on sidebar navigation links
        document.querySelectorAll('.panel-link').forEach(link => {
            if (link.getAttribute('href') === hash) {
                link.classList.add('panel-link--active');
            } else {
                link.classList.remove('panel-link--active');
            }
        });

        // 2. Select the main view wrappers from your index.html
        const analyticsSection = document.getElementById('analytics');
        const boardSection = document.getElementById('board-view');
        const tasksPanel = document.getElementById('tasks-panel');
        const kanbanBoard = document.getElementById('kanban-board');

        // Safety check if elements are still loading
        if (!boardSection) return;

        // 3. Handle routing views cleanly
        if (hash === '#analytics') {
            // Hide board views, focus on stats
            boardSection.classList.add('is-hidden');
            if (analyticsSection) analyticsSection.classList.remove('is-hidden');
        } 
        else if (hash === '#tasks-panel') {
            // Show board section, display List view, hide Kanban
            boardSection.classList.remove('is-hidden');
            if (analyticsSection) analyticsSection.classList.add('is-hidden');
            if (kanbanBoard) kanbanBoard.classList.add('is-hidden');
            if (tasksPanel) tasksPanel.classList.remove('is-hidden');
        } 
        else {
            // Default (Dashboard / Board): Show board and Kanban view
            boardSection.classList.remove('is-hidden');
            if (analyticsSection) analyticsSection.classList.remove('is-hidden');
            if (kanbanBoard) kanbanBoard.classList.remove('is-hidden');
            if (tasksPanel) tasksPanel.classList.add('is-hidden');
        }
    }

    // Listen to hash changes in the URL bar
    window.addEventListener('hashchange', navigate);
    
    // Trigger on initial page load
    navigate();
}