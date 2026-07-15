/**
 * js/features/tasks/task-form.js
 */
import { store } from '../../core/store.js';
import { syncService } from '../../services/sync-service.js';

export async function initTaskForm() {
    const newTaskBtn = document.getElementById('btn-new-task');
    const dialog = document.getElementById('task-dialog');
    const closeBtns = document.querySelectorAll('[data-close-dialog]');
    const form = document.getElementById('task-form');

    // --- FETCH AND POPULATE THE FORM DROPDOWN ---
    const assigneeSelect = document.getElementById('task-assignee');
    if (assigneeSelect) {
        try {
            const response = await fetch('./data/users.json');
            const users = await response.json();
            
            // Start with a default empty/unassigned option
            assigneeSelect.innerHTML = '<option value="">Unassigned</option>'; 
            
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.name;
                option.textContent = user.name;
                assigneeSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Could not load users for the form:", error);
        }
    }

    // --- DIALOG CONTROLS ---
    if (newTaskBtn) {
        newTaskBtn.addEventListener('click', () => {
            form.reset();
            document.getElementById('task-id').value = '';
            document.getElementById('task-dialog-title').textContent = 'New task';
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

    // --- FORM SUBMISSION & OFFLINE INTEGRATION ---
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        const formData = new FormData(form);
        const title = formData.get('title').trim();
        const dueDate = formData.get('dueDate');
        const today = new Date().toISOString().split('T')[0];
        
        const existingId = formData.get('task-id');

        // Reset errors
        document.getElementById('error-title').textContent = '';
        document.getElementById('error-date').textContent = '';
        let isValid = true;

        // Validation Rules
        if (title.length < 3 || title.length > 100) {
            document.getElementById('error-title').textContent = 'Title must be between 3 and 100 characters.';
            isValid = false;
        }

        if (!existingId && dueDate && dueDate < today) {
            document.getElementById('error-date').textContent = 'Due date cannot be in the past.';
            isValid = false;
        }

        if (!isValid) return; 

        // State Preparation
        const currentTasks = store.getState().tasks;
        let updatedTasks;
        let newlyCreatedTask = null; // Our hoisted bucket for new tasks

        if (existingId) {
            updatedTasks = currentTasks.map(task => {
                if (task.id === existingId) {
                    return {
                        ...task, 
                        title: title,
                        description: formData.get('description'),
                        priority: formData.get('priority'),
                        status: formData.get('status'),
                        assignee: formData.get('assignee') || 'Unassigned',
                        dueDate: dueDate,
                        labels: formData.get('labels') || ''
                    };
                }
                return task;
            });
        } else {
            // Build the new task object
            newlyCreatedTask = {
                id: 'task-' + crypto.randomUUID().split('-')[0],
                title: title,
                description: formData.get('description'),
                priority: formData.get('priority'),
                status: formData.get('status'),
                assignee: formData.get('assignee') || 'Unassigned',
                dueDate: dueDate,
                labels: formData.get('labels') || '',
                createdAt: today 
            };
            updatedTasks = [...currentTasks, newlyCreatedTask];
        }

        // 1. Optimistic Update: Instantly render to the local UI
        store.setState({ tasks: updatedTasks });
        dialog.close();

        // 2. Sync Queue: If offline, safely log the action in IndexedDB
        if (!navigator.onLine) {
            if (existingId) {
                // Find the task we just updated to send to the queue
                const editedTask = updatedTasks.find(t => t.id === existingId);
                await syncService.queueOperation('UPDATE_TASK', editedTask);
            } else {
                // Pass the brand new task down here safely
                await syncService.queueOperation('CREATE_TASK', newlyCreatedTask);
            }
        }
    });
}