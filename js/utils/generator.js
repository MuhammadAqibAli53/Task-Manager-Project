
import { store } from '../core/store.js';





export function generatePerformanceTasks() {
    const statuses = ['backlog', 'in-progress', 'review', 'done'];
    const priorities = ['low', 'medium', 'high'];
    const assignees = ['Unassigned', 'Amina Khan', 'Daniel Brooks', 'Priya Patel', 'Sofia Garcia'];
    
    const newTasks = [];
    const today = new Date();

    for (let i = 0; i < 1000; i++) {
        // Create random future/past dates for testing due date logic
        const randomDays = Math.floor(Math.random() * 30) - 10; 
        const dueDate = new Date(today);
        dueDate.setDate(today.getDate() + randomDays);

        newTasks.push({
            id: 'perf-task-' + crypto.randomUUID().split('-')[0],
            title: `Performance Task ${i + 1}`,
            description: 'This is a bulk generated task to test Web Worker and UI rendering speed.',
            priority: priorities[Math.floor(Math.random() * priorities.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            assignee: assignees[Math.floor(Math.random() * assignees.length)],
            dueDate: dueDate.toISOString().split('T')[0],
            labels: 'performance, test',
            createdAt: today.toISOString().split('T')[0]
        });
    }

    // Grab current tasks and append the 1,000 new ones
    const currentTasks = store.getState().tasks;
    store.setState({ tasks: [...currentTasks, ...newTasks] });
    
    // Trigger a success toast
    import('../core/event-bus.js').then(({ eventBus }) => {
        eventBus.emit('notification:show', {
            message: '1,000 tasks successfully generated!',
            type: 'success'
        });
    });
}

export function deletePerformanceTasks() {
    const currentTasks = store.getState().tasks;
    
    // Filter out all tasks that have the 'perf-task-' prefix
    const realTasks = currentTasks.filter(task => !task.id.startsWith('perf-task-'));
    
    // Update the store with ONLY the real tasks
    store.setState({ tasks: realTasks });
    
    // Trigger a success toast
    import('../core/event-bus.js').then(({ eventBus }) => {
        eventBus.emit('notification:show', {
            message: 'All 1,000 performance tasks deleted!',
            type: 'success'
        });
    });
}

// Attach it to the window so you can run it from the console
window.delete1000Tasks = deletePerformanceTasks;

// Attach it to the global window object so you can trigger it from the browser console!
window.generate1000Tasks = generatePerformanceTasks;