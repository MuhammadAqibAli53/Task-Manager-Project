
import { store } from '../../core/store.js';


export function initTaskActions() {
    const board = document.getElementById('kanban-board');

    const tableBody = document.getElementById('task-table-body');
  const taskDialog = document.getElementById('task-dialog');

  const confirmDialog = document.getElementById('confirm-dialog');
    
       let DeleteId = null;

    function handleActionClick(event) {

        if (event.target.classList.contains('card-menu-toggle')) {
   
            const menuPanel = event.target.nextElementSibling;
   
            if (menuPanel) menuPanel.classList.toggle('is-hidden');
   
            return;
        }

        const actionBtn = event.target.closest('[data-action]');

        if (!actionBtn) return;

      
  const taskContainer = event.target.closest('.task-card') || event.target.closest('tr');

  if (!taskContainer) return;

        const taskId = taskContainer.dataset.id;
    
        const action = actionBtn.dataset.action;

        if (action === 'edit') {
            openEditModal(taskId);
        } else if (action === 'delete') {
            openDeleteConfirm(taskId);
        }
    }

    function openEditModal(taskId) {
        const currentTasks = store.getState().tasks;
        const task = currentTasks.find(t => t.id === taskId);
        if (!task) return;

        document.getElementById('task-dialog-title').textContent = 'Edit task';

        document.getElementById('task-id').value = task.id; 
        
        document.getElementById('task-title').value = task.title;
        
          document.getElementById('task-description').value = task.description;
        
    document.getElementById('task-priority').value = task.priority;
        
        document.getElementById('task-assignee').value = task.assignee !== 'Unassigned' ? task.assignee : '';
         document.getElementById('task-due-date').value = task.dueDate;
        
        document.getElementById('task-status').value = task.status;
 

         document.getElementById('task-labels').value = task.labels || '';
 
        document.getElementById('task-created-at').value = task.createdAt;
 
         document.getElementById('error-title').textContent = '';
         document.getElementById('error-date').textContent = '';
  
         taskDialog.showModal();
     }

     function openDeleteConfirm(taskId) {
        DeleteId = taskId;
     
        confirmDialog.showModal();
    }

    const confirmCloseBtns = confirmDialog.querySelectorAll('[data-close-dialog]');
    
    confirmCloseBtns.forEach(btn => {
     
        btn.addEventListener('click', () => {
     
            DeleteId = null; 
     
            confirmDialog.close();  
     
        });
    });

    const confirmBtn = document.getElementById('confirm-action');
    
    if (confirmBtn) {
         confirmBtn.addEventListener('click',async (e) => {
     
     
            e.preventDefault();

            if (DeleteId) {
                const currentTasks = store.getState().tasks;
     
                const taskToDelete = currentTasks.find(t => t.id === DeleteId);
      
                const updatedTasks = currentTasks.filter(task => task.id !== DeleteId);
                
      
                store.setState({ tasks: updatedTasks });
      
                confirmDialog.close();
      
                if (!navigator.onLine && taskToDelete) {
      
                    await syncService.queueOperation('DELETE_TASK', taskToDelete);
                }
                
                DeleteId = null;
            }
            
        });
    }

    if (board) board.addEventListener('click', handleActionClick);
    
    if (tableBody) tableBody.addEventListener('click', handleActionClick);

}
