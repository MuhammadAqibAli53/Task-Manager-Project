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

        // 2. Select the main view wrappers using Classes 
        const statsPanel = document.querySelector('.stats-panel');
        const boardPanel = document.querySelector('.board-panel');

        if (!boardPanel || !statsPanel) return;

        // 3. Handle routing panels cleanly without touching the Kanban/List internals
        if (hash === '#analytics') {
            // Focus entirely on Stats, hide the board wrapper
            boardPanel.classList.add('is-hidden');
            statsPanel.classList.remove('is-hidden');
        } 
        else if (hash === '#board-view' || hash === '#tasks-panel') {
            // Focus entirely on the Board/List, hide the stats panel
            statsPanel.classList.add('is-hidden');
            boardPanel.classList.remove('is-hidden');
        } 
        else {
            // Default (#dashboard): Show BOTH side-by-side!
            statsPanel.classList.remove('is-hidden');
            boardPanel.classList.remove('is-hidden');
        }
    }

    // Listen to hash changes in the URL bar
    window.addEventListener('hashchange', navigate);
    
    // Trigger on initial page load
    navigate();
}