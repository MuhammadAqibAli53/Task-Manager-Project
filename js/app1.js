import { store } from './core/store.js';
import { fetchInitialTasks } from './services/api-client.js';
import { initTaskForm } from './features/tasks/task-form.js';
import { initDragAndDrop } from './features/board/drag-drop.js';
import { initFilterBar } from './features/filters/filter-bar.js';
import { initViewToggle } from './features/ui/view-toggle.js';
import { initThemeToggle } from './features/ui/theme.js';
import { loadTasksFromDB, saveTasksToDB } from './services/db.js';
import { initTaskActions } from './features/tasks/task-action.js';
import { initUndoRedo } from './features/history/undo-redo.js';
import { syncService } from './services/sync-service.js';


// 1. Grab the template from your HTML
const template = document.getElementById('task-card-template');

function renderTable(tasks) {
    const tableBody = document.getElementById('task-table-body');
    tableBody.innerHTML = ''; 

    tasks.forEach(task => {
        const row = document.createElement('tr');
        row.dataset.id = task.id; 
        
        row.innerHTML = `
            <td><strong>${task.title}</strong></td>
            <td>${task.assignee}</td>
            <td><span class="status-pill">${task.priority}</span></td>
            <td>${task.dueDate}</td>
            <td>${task.status.replace('-', ' ')}</td>
            <td>
                <button type="button" class="btn btn-ghost btn-sm" data-action="edit">Edit</button>
                <button type="button" class="btn btn-ghost btn-sm" style="color: red;" data-action="delete">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function renderBoard(tasks) {
    document.getElementById('list-backlog').innerHTML = '';
    document.getElementById('list-in-progress').innerHTML = '';
    document.getElementById('list-review').innerHTML = '';
    document.getElementById('list-done').innerHTML = '';

    tasks.forEach(task => {
        const cardClone = template.content.cloneNode(true);
        const cardElement = cardClone.querySelector('.task-card');

        cardElement.dataset.id = task.id;
        cardClone.querySelector('.card-title').textContent = task.title;
        cardClone.querySelector('.card-text').textContent = task.description;
        cardClone.querySelector('.card-priority').textContent = task.priority;
        cardClone.querySelector('.card-person').textContent = task.assignee;
        cardClone.querySelector('.card-date').textContent = task.dueDate;
        cardClone.querySelector('.card-tags').textContent = task.labels;

        const columnId = `list-${task.status}`;
        const targetColumn = document.getElementById(columnId);

        if (targetColumn) {
            targetColumn.appendChild(cardClone);
        }
    });
}

async function initApp() {
    initThemeToggle();
    await initTaskForm();
    initDragAndDrop();
    await initFilterBar();
    initViewToggle();
    initTaskActions();
    initUndoRedo();
    await syncService.init();

    // --- NEW: INITIALIZE THE WEB WORKER ---
    const analyticsWorker = new Worker('./js/workers/analytics.worker.js');
    
    // Listen for the math results coming back from the background thread
    analyticsWorker.onmessage = (event) => {
        const stats = event.data;
        
        // Update the Heavy Summary Cards
        const overdueEl = document.getElementById('summary-overdue');
        const completionEl = document.getElementById('summary-completion');
        if (overdueEl) overdueEl.textContent = stats.overdueCount;
        if (completionEl) completionEl.textContent = `${stats.completionPercent}%`;

        // Update the Board Health Analytics
        const healthStatusCount = document.getElementById('analytics-status-count');
        const healthCompletion = document.getElementById('analytics-completion');
        const healthAvgTime = document.getElementById('analytics-average-time');
        
        if (healthStatusCount) healthStatusCount.textContent = stats.totalTasks;
        if (healthCompletion) healthCompletion.textContent = `${stats.completionPercent}%`;
        if (healthAvgTime) healthAvgTime.textContent = stats.averageTime;
    };
    // --------------------------------------

    // Make the Refresh button manually trigger a re-calculation
    const refreshBtn = document.getElementById('refresh-analytics');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            store.setState({}); // Changed to setState
        });
    }

    // Changed to subscribe()
    store.subscribe((data) => {
        saveTasksToDB(data.tasks);
        
        // Hand the entire task array to the Web Worker to do the heavy math
        analyticsWorker.postMessage(data.tasks);

        const filters = data.filters;

        // 1. FILTERING
        const filteredTasks = data.tasks.filter(task => {
            let matchesSearch = true;
            if (filters.search !== '') {
                const term = filters.search.toLowerCase();
                const matchesTitle = task.title.toLowerCase().includes(term);
                const matchesDesc = task.description.toLowerCase().includes(term);
                const matchesAssignee = task.assignee.toLowerCase().includes(term);
                const matchesLabel = (task.labels || "").toLowerCase().includes(term);
                matchesSearch = matchesTitle || matchesDesc || matchesAssignee || matchesLabel;
            }

            if (filters.status.length > 0 && !filters.status.includes(task.status)) return false;
            if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) return false;
            if (filters.assignee.length > 0 && !filters.assignee.includes(task.assignee)) return false;
            
            return matchesSearch;
        });

        // 2. SORTING
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        filteredTasks.sort((a, b) => {
            switch (data.sort) {
                case 'priority': return priorityWeight[b.priority] - priorityWeight[a.priority];
                case 'title': return a.title.localeCompare(b.title);
                case 'created-at': return new Date(b.createdAt) - new Date(a.createdAt);
                case 'due-date':
                default: return new Date(a.dueDate) - new Date(b.dueDate);
            }
        });

        // 3. LIGHTWEIGHT UI UPDATES (Fast math kept on main thread)
        const today = new Date().toISOString().split('T')[0];
        
        document.getElementById('summary-open').textContent = data.tasks.filter(t => t.status !== 'done').length;
        document.getElementById('summary-due-today').textContent = data.tasks.filter(t => t.dueDate === today && t.status !== 'done').length;

        // Column Counters 
        document.getElementById('count-backlog').textContent = filteredTasks.filter(t => t.status === 'backlog').length;
        document.getElementById('count-in-progress').textContent = filteredTasks.filter(t => t.status === 'in-progress').length;
        document.getElementById('count-review').textContent = filteredTasks.filter(t => t.status === 'review').length;
        document.getElementById('count-done').textContent = filteredTasks.filter(t => t.status === 'done').length;

        // Sidebar View Summary
        const activeFilters = [];
        if (filters.search) activeFilters.push(`"${filters.search}"`);
        if (filters.status.length) activeFilters.push(filters.status.join(', '));
        if (filters.priority.length) activeFilters.push(filters.priority.join(', '));
        if (filters.assignee.length) activeFilters.push(filters.assignee.join(', '));
        
        const filterText = activeFilters.length > 0 ? activeFilters.join(' + ') : 'none';
        const sortText = data.sort.replace('-', ' ');

        const savedViewSummary = document.getElementById('saved-view-summary');
        if (savedViewSummary) {
            savedViewSummary.innerHTML = `
                <span>Filters: ${filterText}</span>
                <span>Sort: ${sortText}</span>
                <span>Mode: ${data.viewMode}</span>
            `;
        }

        // 4. UI RENDERING
        const kanbanContainer = document.getElementById('kanban-board');
        const listContainer = document.getElementById('tasks-panel');

        if (data.viewMode === 'list') {
            kanbanContainer.classList.add('is-hidden');
            listContainer.classList.remove('is-hidden');
            renderTable(filteredTasks);
        } else {
            listContainer.classList.add('is-hidden');
            kanbanContainer.classList.remove('is-hidden');
            renderBoard(filteredTasks);
        }
    });

    // Boot sequence
    let initialTasks = await loadTasksFromDB();
    if (initialTasks.length === 0) {
        initialTasks = await fetchInitialTasks();
    }

    // Changed to setState()
    store.setState({
        tasks: initialTasks,
        isLoading: false
    });
}

initApp();