import { store } from '../../core/store.js';

export function initTaskForm() {
    const newTaskBtn = document.getElementById('btn-new-task');
    const dialog = document.getElementById('task-dialog');
    const closeBtns = document.querySelectorAll('[data-close-dialog]');
    const form = document.getElementById('task-form');

    if (newTaskBtn) {
        newTaskBtn.addEventListener('click', () => {
            form.reset();
            document.getElementById('error-title').textContent = '';
            document.getElementById('error-date').textContent = '';
            dialog.showModal(); 
        });
    }

    closeBtns.forEach(button => {
        button.addEventListener('click', () => {
            dialog.close();
        });
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault(); 

        const formData = new FormData(form);
        const title = formData.get('title').trim();
        const dueDate = formData.get('dueDate');
        const today = new Date().toISOString().split('T')[0];

        document.getElementById('error-title').textContent = '';
        document.getElementById('error-date').textContent = '';
        
        let isValid = true;

        if (title.length < 3 || title.length > 100) {
            document.getElementById('error-title').textContent = 'Title must be between 3 and 100 characters.';
            isValid = false;
        }

           if (dueDate && dueDate < today) {
            document.getElementById('error-date').textContent = 'Due date cannot be in the past.';
            isValid = false;
        }

        if (!isValid) {
            return; 
        }

        const currentTasks = store.get().tasks;

        const newTask = {
            id: 'task-' + crypto.randomUUID().split('-')[0], // Keeping your clean UUID logic
            title: title,
            description: formData.get('description'),
            priority: formData.get('priority'),
            status: formData.get('status'),
            assignee: formData.get('assignee') || 'Unassigned',
            dueDate: dueDate,
            labels: formData.get('labels') || '',
            createdAt: today 
        };

        store.set({
            tasks: [...currentTasks, newTask]
        });

        dialog.close();
    });
}