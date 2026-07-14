
import { store } from './core/store.js';
import { fetchInitialTasks } from './services/api-client.js';
import { initTaskForm } from './features/tasks/task-form.js';
import { initDragAndDrop } from './features/board/drag-drop.js';
import { initFilterBar } from './features/filters/filter-bar.js';
import { initViewToggle } from './features/ui/view-toggle.js';
import { initThemeToggle } from './features/ui/theme.js';

// 1. Grab the template from your HTML
const template = document.getElementById('task-card-template');


function renderTable(tasks) {
    const tableBody = document.getElementById('task-table-body');
    tableBody.innerHTML = ''; // Clear old rows

    tasks.forEach(task => {
        // Create a new table row <tr>
        const row = document.createElement('tr');

        // Fill it with data cells <td>
        row.innerHTML = `
            <td><strong>${task.title}</strong></td>
            <td>${task.assignee}</td>
            <td><span class="status-pill">${task.priority}</span></td>
            <td>${task.dueDate}</td>
            <td>${task.status.replace('-', ' ')}</td>
            <td><button class="btn btn-ghost btn-sm">Edit</button></td>
        `;

        tableBody.appendChild(row);
    });
}

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

        cardElement.dataset.id = task.id;
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
    initThemeToggle();
    initTaskForm();
    initDragAndDrop();
    initFilterBar();
    initViewToggle();



    store.watch((data) => {
        const filters = data.filters;

        // DERIVED STATE: Apply all rules
        const filteredTasks = data.tasks.filter(task => {

            // Rule 1: Text Search (Now includes labels!)
            let matchesSearch = true;
            if (filters.search !== '') {
                const term = filters.search;
                const matchesTitle = task.title.toLowerCase().includes(term);
                const matchesDesc = task.description.toLowerCase().includes(term);
                const matchesAssignee = task.assignee.toLowerCase().includes(term);
                const matchesLabel = (task.labels || "").toLowerCase().includes(term); // Added labels check

                matchesSearch = matchesTitle || matchesDesc || matchesAssignee || matchesLabel;
            }


            if (filters.status.length > 0 && !filters.status.includes(task.status)) {
                return false;
            }

            if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
                return false;
            }

            if (filters.assignee.length > 0 && !filters.assignee.includes(task.assignee)) {
                return false;
            }

            return matchesSearch;
        });

        const priorityWeight = { high: 3, medium: 2, low: 1 };


        filteredTasks.sort((a, b) => {
            switch (data.sort) {
                case 'priority':

                    return priorityWeight[b.priority] - priorityWeight[a.priority];

                case 'title':

                    return a.title.localeCompare(b.title);

                case 'created-at':

                    return new Date(b.createdAt) - new Date(a.createdAt);

                case 'due-date':
                default:

                    return new Date(a.dueDate) - new Date(b.dueDate);
            }
        });


        const kanbanContainer = document.getElementById('kanban-board');
        const listContainer = document.getElementById('tasks-panel');


        if (data.viewMode === 'list') {

            kanbanContainer.classList.add('is-hidden');
            listContainer.classList.remove('is-hidden');


            renderTable(filteredTasks);
        } else {

            listContainer.classList.add('is-hidden');
            kanbanContainer.classList.remove('is-hidden');

            document.getElementById('count-backlog').textContent = filteredTasks.filter(t => t.status === 'backlog').length;
            document.getElementById('count-in-progress').textContent = filteredTasks.filter(t => t.status === 'in-progress').length;
            document.getElementById('count-review').textContent = filteredTasks.filter(t => t.status === 'review').length;
            document.getElementById('count-done').textContent = filteredTasks.filter(t => t.status === 'done').length;

            // 2. Main Analytics Summary Cards
            const today = new Date().toISOString().split('T')[0];

            document.getElementById('summary-open').textContent = filteredTasks.filter(t => t.status !== 'done').length;
            document.getElementById('summary-due-today').textContent = filteredTasks.filter(t => t.dueDate === today && t.status !== 'done').length;
            document.getElementById('summary-overdue').textContent = filteredTasks.filter(t => t.dueDate < today && t.status !== 'done').length;

            
            const doneCount = filteredTasks.filter(t => t.status === 'done').length;
            const completionPercent = filteredTasks.length === 0 ? 0 : Math.round((doneCount / filteredTasks.length) * 100);
            document.getElementById('summary-completion').textContent = `${completionPercent}%`;


            renderBoard(filteredTasks);
        }

    });


    const tasksFromDatabase = await fetchInitialTasks();


    store.set({
        tasks: tasksFromDatabase,
        isLoading: false
    });
}

// Start the app
initApp();