/**
 * js/features/ui/toast.js
 * A custom, library-free toast notification system using Event Delegation.
 */
import { eventBus } from '../../core/event-bus.js';

export function initToastSystem() {
    const toastContainer = document.getElementById('toast-region');
    if (!toastContainer) return;

    // Listen for new toasts from the system
    eventBus.on('notification:show', ({ message, type = 'info', duration = 3000 }) => {
        showToast(message, type, duration, toastContainer);
    });

    // Listen to clear all toasts instantly
    eventBus.on('notification:clear', () => {
        toastContainer.innerHTML = ''; 
    });

    // --- NEW: EVENT DELEGATION FOR CLOSING TOASTS ---
    // We listen to the whole container, so dynamically added buttons always work!
    toastContainer.addEventListener('click', (event) => {
        const closeBtn = event.target.closest('.toast-close');
        
        // If the user clicked the close button (or inside it)
        if (closeBtn) {
            // Find the parent toast of this specific button
            const toastElement = closeBtn.closest('.toast');
            
            if (toastElement) {
                // Hide it visually first
                toastElement.classList.remove('toast--visible');
                
                // Force delete it from the HTML after the 300ms CSS animation finishes.
                // This guarantees it vanishes even if the browser transition bugs out!
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

    // Slide it in
    requestAnimationFrame(() => {
        toast.classList.add('toast--visible');
    });

    // Auto-remove setup (only if duration > 0)
    if (duration > 0) {
        setTimeout(() => {
            // Only try to remove if it still exists (user didn't click close)
            if (document.body.contains(toast)) {
                toast.classList.remove('toast--visible');
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }
    
    // Notice: NO click listeners are attached here anymore!
}