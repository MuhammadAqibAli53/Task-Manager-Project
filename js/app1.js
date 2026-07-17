import {store } from './core/store.js';
import  {fetchInitialTasks } from './services/api-client.js';

import {initTaskForm } from './features/tasks/task-form.js';
import {initDragAndDrop } from './features/board/drag-drop.js';
import {initFilterBar } from './features/filters/filter-bar.js';
import {initViewToggle } from './features/ui/view-toggle.js';
import {initThemeToggle } from './features/ui/theme.js';
import {loadTasksFromDB, saveTasksToDB } from './services/db.js';
import {initTaskActions } from './features/tasks/task-action.js';
import {initUndoRedo } from './features/history/undo-redo.js';
import {syncService } from './services/sync-service.js';
import {initToastSystem } from './features/ui/toast.js';
import {initRouter } from './core/router.js';
import './utils/generator.js'
import '../tests/app.test.js'
import {renderBoard } from './features/board/render-board.js';
import {renderTable } from './features/board/render-list.js';







async function initApp() {
    initRouter(); 
    initThemeToggle();
    await initTaskForm();
    initDragAndDrop();
    await initFilterBar();
    initViewToggle();
    initTaskActions();
    initUndoRedo();
    initToastSystem();
    await syncService.init();
    const countwork = new Worker('./js/workers/analytics.worker.js');



    
    countwork.onmessage = (event) => {
        const stats = event.data;

          const eledue = document.getElementById('summary-overdue');
     const elecomplete = document.getElementById('summary-completion');
         eledue.textContent = stats.overdueCount;
        elecomplete.textContent = `${stats.completionPercent}%`;

        document.getElementById('analytics-status-count').textContent =stats.totalTasks;
          document.getElementById('analytics-completion').textContent =`${stats.completionPercent}%`;
        document.getElementById('analytics-average-time').textContent= stats.averageTime;

    };

    

    store.subscribe((data) => {
       
    saveTasksToDB(data.tasks);

        countwork.postMessage(data.tasks);

        const filters = data.filters;

        const filtertask = data.tasks.filter(task => {
            let matchesSearch = true;
            
            if(filters.search !== '') {

                const term = filters.search.toLowerCase();

            const title = task.title.toLowerCase().includes(term);
            
                 const desc = task.description.toLowerCase().includes(term);
                const assigne = task.assignee.toLowerCase().includes(term);
                const label = (task.labels || "").toLowerCase().includes(term);
                
                matchesSearch = title || desc || assigne || label;
            }

             
            if(filters.status.length > 0 && !filters.status.includes(task.status)) return false;
            if(filters.priority.length > 0 && !filters.priority.includes(task.priority)) return false;
            if(filters.assignee.length > 0 && !filters.assignee.includes(task.assignee)) return false;
            console.log(matchesSearch)
            return matchesSearch;

        });


        const priorityWeight = { high: 3, medium: 2, low: 1 };

        filtertask.sort((a, b) => {

            switch(data.sort) {
                
                case 'priority': return priorityWeight[b.priority] - priorityWeight[a.priority];
                
                case 'title': return a.title.localeCompare(b.title);
                
                case 'created-at': return new Date(b.createdAt) - new Date(a.createdAt);
                
                case 'due-date':
                
                default: return new Date(a.dueDate) - new Date(b.dueDate);
            }
        });

        const today = new Date().toISOString().split('T')[0];

        document.getElementById('summary-open').textContent = data.tasks.filter(t => t.status !== 'done').length;
        document.getElementById('summary-due-today').textContent = data.tasks.filter(t => t.dueDate === today && t.status !== 'done').length;

        document.getElementById('count-backlog').textContent = filtertask.filter(t => t.status === 'backlog').length;
        document.getElementById('count-in-progress').textContent = filtertask.filter(t => t.status === 'in-progress').length;
        document.getElementById('count-review').textContent = filtertask.filter(t => t.status === 'review').length;
        document.getElementById('count-done').textContent = filtertask.filter(t => t.status === 'done').length;

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
            renderTable(filtertask);
        } else {
            listContainer.classList.add('is-hidden');
            kanbanContainer.classList.remove('is-hidden');
            renderBoard(filtertask);
        }
    });

    // Boot sequence
    let initialTasks = await loadTasksFromDB();
    if (initialTasks.length === 0) {
        initialTasks = await fetchInitialTasks();
    }

    store.setState({
        tasks: initialTasks,
        isLoading: false
    });
}

initApp();