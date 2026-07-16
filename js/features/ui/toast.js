import { eventBus } from '../../core/event-bus.js';

export function initToastSystem() {
    const toastContainer = document.getElementById('toast-region');
    if (!toastContainer) return;

    
    eventBus.on('notification:show', ({ message, type = 'info', duration = 3000 }) => {
        showToast(message, type, duration, toastContainer);
    });

    
    eventBus.on('notification:clear', () => {
        toastContainer.innerHTML = ''; 
    });

    
    toastContainer.addEventListener('click', (event) => {
        const closeBtn = event.target.closest('.toast-close');
        

        if (closeBtn) {

            const toastElement = closeBtn.closest('.toast');
            
            if (toastElement) {


                toastElement.classList.remove('toast--visible');

                setTimeout(() => {
                    toastElement.remove();
                }, 300);
            }
        }
    });
}

function showToast(message, type, duration, container) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    
    toast.innerHTML = `
        <div class="toast-content">${message}</div>
        <button type="button" class="toast-close" aria-label="Close notification">×</button>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('toast--visible');
    });

    if (duration > 0) {
        setTimeout(() => {

            if (document.body.contains(toast)) {
                toast.classList.remove('toast--visible');
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }
    

}