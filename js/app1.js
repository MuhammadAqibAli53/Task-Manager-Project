
import { store } from './core/store.js';
import { fetchInitialTasks } from './services/api-client.js';
import { initTaskForm } from './features/tasks/task-form.js';

// 1. Grab the template from your HTML
const template = document.getElementById('task-card-template');


function renderBoard(tasks) {
    // Clear all columns first so we don't get duplicates
    document.getElementById('list-backlog').innerHTML = '';
    document.getElementById('list-in-progress').innerHTML = '';
    document.getElementById('list-review').innerHTML = '';
    document.getElementById('list-done').innerHTML = '';

    


    // Loop through every task in our data
    tasks.forEach(task => {
        // Clone the HTML template
        const cardClone = template.content.cloneNode(true);
        const cardElement = cardClone.querySelector('.task-card');


        // Fill in the data
        cardClone.querySelector('.card-title').textContent = task.title;
        cardClone.querySelector('.card-text').textContent = task.description;
        cardClone.querySelector('.card-priority').textContent = task.priority;

        cardClone.querySelector('.card-person').textContent = task.assignee;
        cardClone.querySelector('.card-date').textContent = task.dueDate;
        cardClone.querySelector('.card-tags').textContent = task.labels;
        
        // Find the right column based on the task's status
        const columnId = `list-${task.status}`;
        const targetColumn = document.getElementById(columnId);

        // Attach the finished card to the column
        if (targetColumn) {
            targetColumn.appendChild(cardClone);
        }
    });
}

async function initApp() {
    initTaskForm();
    // Tell the store to run renderBoard whenever data changes
    store.watch((data) => {
        renderBoard(data.tasks);
    });

    // Fetch the data from the API client
    const tasksFromDatabase = await fetchInitialTasks();

    // Save the data to the store (This automatically triggers renderBoard!)
    store.set({ 
        tasks: tasksFromDatabase,
        isLoading: false 
    });
}

// Start the app
initApp();