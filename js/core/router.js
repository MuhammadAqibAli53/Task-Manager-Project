export function initRouter() {
    function navigate() {
        const hash = window.location.hash || '#dashboard';

        document.querySelectorAll('.panel-link').forEach(link => 
            {
            link.classList.toggle('panel-link--active', link.getAttribute('href') === hash);
        });

        const boardPanel = document.querySelector('.board-panel');
        if (boardPanel) {
            boardPanel.classList.remove('is-hidden');
        }
    }

    window.addEventListener('hashchange', navigate);
    navigate();
}