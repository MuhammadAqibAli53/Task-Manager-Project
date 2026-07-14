
import { store } from '../../core/store.js';

export function initDragAndDrop() {

    const board = document.getElementById('kanban-board');
    
   
    let draggedTaskId = null;

    board.addEventListener('dragstart', (event) => {
        // Did they grab a task card?
        const card = event.target.closest('.task-card');
        
        if (card) {
            // Remember the ID of the card being dragged
            draggedTaskId = card.dataset.id;
            
            // Make the original card look slightly faded while dragging
            card.style.opacity = '0.5'; 
        }
    });

    // --- DRAG END ---
    // Fires when the user lets go of the mouse (whether successful or not)
    board.addEventListener('dragend', (event) => {
        const card = event.target.closest('.task-card');
        if (card) {
            card.style.opacity = '1'; // Return to full visibility
        }
        draggedTaskId = null; // Clear our temporary memory
    });

    // --- DRAG OVER ---
    // Fires continuously while hovering over a column. 
    // MANDATORY: You must prevent default here, or the browser will cancel the drop!
    board.addEventListener('dragover', (event) => {
        event.preventDefault(); 
    });

    // --- DROP ---
    // Fires when the user releases the card over a valid area
    board.addEventListener('drop', (event) => {
        event.preventDefault();
        
        // Figure out which column they dropped it into
        const targetColumn = event.target.closest('.column');
        
        // If they dropped it in a column AND we know what card it is...
        if (targetColumn && draggedTaskId) {
            
            // Read the data-status attribute from your HTML (e.g., "in-progress", "done")
            const newStatus = targetColumn.dataset.status;
            
            // Get the current list of tasks from the Store
            const currentTasks = store.get().tasks;
            
            // Create a brand new array where only the dragged task has its status changed
            const updatedTasks = currentTasks.map(task => {
                if (task.id === draggedTaskId) {
                    return { ...task, status: newStatus };
                }
                return task;
            });
            
            // Update the store! This automatically redraws the board.
            store.set({ tasks: updatedTasks });
        }
    });
}