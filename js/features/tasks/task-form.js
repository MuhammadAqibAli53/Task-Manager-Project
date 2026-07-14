
import { store } from '../../core/store.js';

export function initTaskForm() {
   
    const newTaskBtn = document.getElementById('btn-new-task');
    const dialog = document.getElementById('task-dialog');
    const closeBtns = document.querySelectorAll('[data-close-dialog]');
    const form = document.getElementById('task-form');


    newTaskBtn.addEventListener('click', () => {
        form.reset();
        dialog.showModal(); 
    });


    closeBtns.forEach(button => {
        button.addEventListener('click', () => {
            dialog.close();
        });
    });

    form.addEventListener('submit', (event) => {
       
        event.preventDefault(); 

  
  
        const formData = new FormData(form);
 
        const currentTasks = store.get().tasks;
      
 
        const newTask = {
            id: 'task-' + crypto.randomUUID().split('-')[0],
            title: formData.get('title'),
            description: formData.get('description'),
            priority: formData.get('priority'),
            status: formData.get('status'),
            assignee: formData.get('assignee') || 'Unassigned',
            dueDate: formData.get('dueDate'),
            createdAt: new Date().toISOString().split('T')[0] // Today's date
        };


        store.set({
            tasks: [...currentTasks, newTask]
        });

        dialog.close();
    });
}