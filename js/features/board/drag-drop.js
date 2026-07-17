
import { store } from '../../core/store.js';
import { syncService } from '../../services/sync-service.js';



export function initDragAndDrop() {



    const board = document.getElementById('kanban-board');

    
    let deagID = null;

    board.addEventListener('dragstart', (event) => {
        
        const card = event.target.closest('.task-card');
        
        if (card) {
         
            deagID = card.dataset.id;
               card.style.opacity = '0.5'; 
        }
    });

    board.addEventListener('dragend', (event) => {
        
        const card = event.target.closest('.task-card');
         
        if (card) {
        
                card.style.opacity = '1'; 
        }
    
        deagID = null; 
    });

    board.addEventListener('dragover',(event) => {
        
        event.preventDefault(); 
    });

    board.addEventListener('drop', async (event) => {
    
        event.preventDefault();
        
           const targetColumn = event.target.closest('.column');

 const card = document.querySelector(`[data-id="${deagID}"]`); 
        
        if (targetColumn && deagID && card) {
          
            const newStatus = targetColumn.dataset.status;

            const currentTasks = store.getState().tasks;
            
         
            const draggedTask = currentTasks.find(t => t.id === deagID);

            if (newStatus === 'done' && (draggedTask.assignee === 'Unassigned' || draggedTask.assignee.trim() === '')) {

                showInlineCardError(card, 'Cannot complete: Assign someone first.');
                return;
            }

            if (newStatus === 'review' && draggedTask.description.trim() === '') {

            showInlineCardError(card, 'Cannot review: Add a description first.');
                return; 
            }

            const updatedTaskData = { ...draggedTask, status: newStatus };

            const updatedTasks = currentTasks.map(task => {
            if (task.id === deagID) {
                    return updatedTaskData;
                }
                return task;
            });
            

            store.setState({ tasks: updatedTasks });

            if (!navigator.onLine) {
    
                await syncService.queueOperation('MOVE_TASK', updatedTaskData);
            }
        }
    });


    function showInlineCardError(cardElement, message) {
        
        
        
        if (cardElement.querySelector('.card-error-msg')) return;

        const errorEl = document.createElement('div');
        errorEl.className = 'card-error-msg';
    
        errorEl.style.color = '#dc2626'; 
    
        errorEl.style.fontSize = '0.75rem';
    
        errorEl.style.marginTop = '8px';
        errorEl.style.fontWeight = 'bold';
        errorEl.textContent = `⚠ ${message}`;


        
        cardElement.appendChild(errorEl);

        setTimeout(() => {
            errorEl.remove();
        }, 3000);
    }
}