/**
 * js/features/board/drag-drop.js
 */
import { store } from '../../core/store.js';

export function initDragAndDrop() {
    const board = document.getElementById('kanban-board');
    let draggedTaskId = null;

    board.addEventListener('dragstart', (event) => {
        const card = event.target.closest('.task-card');
        if (card) {
            draggedTaskId = card.dataset.id;
            card.style.opacity = '0.5'; 
        }
    });

    board.addEventListener('dragend', (event) => {
        const card = event.target.closest('.task-card');
        if (card) {
            card.style.opacity = '1'; 
        }
        draggedTaskId = null; 
    });

    board.addEventListener('dragover', (event) => {
        event.preventDefault(); 
    });

    board.addEventListener('drop', (event) => {
        event.preventDefault();
        
        const targetColumn = event.target.closest('.column');
        const card = document.querySelector(`[data-id="${draggedTaskId}"]`); 
        
        if (targetColumn && draggedTaskId && card) {
            const newStatus = targetColumn.dataset.status;
            const currentTasks = store.get().tasks;
            
            // Find the actual task object from the database
            const draggedTask = currentTasks.find(t => t.id === draggedTaskId);

            // RULE 3: Cannot move to Done without an assignee
            if (newStatus === 'done' && (draggedTask.assignee === 'Unassigned' || draggedTask.assignee.trim() === '')) {
                showInlineCardError(card, 'Cannot complete: Assign someone first.');
                return;
            }

        
            if (newStatus === 'review' && draggedTask.description.trim() === '') {
                showInlineCardError(card, 'Cannot review: Add a description first.');
                return; 
            }
            
      
            const updatedTasks = currentTasks.map(task => {
                if (task.id === draggedTaskId) {
                    return { ...task, status: newStatus };
                }
                return task;
            });
            
            store.set({ tasks: updatedTasks });
        }
    });

    // --- HELPER FUNCTION: INLINE CARD ERRORS ---
    function showInlineCardError(cardElement, message) {
        // Prevent spamming multiple errors
        if (cardElement.querySelector('.card-error-msg')) return;

        const errorEl = document.createElement('div');
        errorEl.className = 'card-error-msg';
        errorEl.style.color = '#dc2626'; // Red text
        errorEl.style.fontSize = '0.75rem';
        errorEl.style.marginTop = '8px';
        errorEl.style.fontWeight = 'bold';
        errorEl.textContent = `⚠ ${message}`;

        cardElement.appendChild(errorEl);

        // Remove the error automatically after 3 seconds
        setTimeout(() => {
            errorEl.remove();
        }, 3000);
    }
}