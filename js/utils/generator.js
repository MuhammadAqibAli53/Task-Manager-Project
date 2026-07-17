
import { store } from '../core/store.js';





export function generatePerformanceTasks() {
    const statuses = ['backlog', 'in-progress', 'review', 'done'];
    const priorities = ['low', 'medium', 'high'];
    const assignees = ['Unassigned', 'Amina Khan', 'Daniel Brooks', 'Priya Patel', 'Sofia Garcia'];
    
    const newTasks = [];
    const today = new Date();

    for (let i = 0; i < 1000; i++) {

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


    const currentTasks = store.getState().tasks;
    store.setState({ tasks: [...currentTasks, ...newTasks] });
    

    import('../core/event-bus.js').then(({ eventBus }) => {
        eventBus.emit('notification:show', {
            message: '1,000 tasks successfully generated!',
            type: 'success'
        });
    });
}

export function deletePerformanceTasks() {
    const currentTasks = store.getState().tasks;
    
    const realTasks = currentTasks.filter(task => !task.id.startsWith('perf-task-'));
    
    store.setState({ tasks: realTasks });
  
    import('../core/event-bus.js').then(({ eventBus }) => {
        eventBus.emit('notification:show', {
            message: 'All 1,000 performance tasks deleted!',
            type: 'success'
        });
    });
}


window.delete1000Tasks = deletePerformanceTasks;
window.generate1000Tasks = generatePerformanceTasks;