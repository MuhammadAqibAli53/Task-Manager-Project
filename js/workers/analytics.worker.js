/**
 * js/workers/analytics.worker.js
 * Runs expensive calculations on a separate background thread.
 */

// Listen for messages from the main app
self.onmessage = function(event) {
    const tasks = event.data;

    // Safety check
    if (!tasks || !Array.isArray(tasks)) return;

    const totalTasks = tasks.length;
    const today = new Date().toISOString().split('T')[0];

    let overdueCount = 0;
    let doneTasks = 0;
    let totalDaysToComplete = 0;

    // Loop through the data exactly once (highly optimized)
    tasks.forEach(task => {
        // 1. Count Completed Tasks
        if (task.status === 'done') {
            doneTasks++;
            
            // Calculate how many days it took (from creation to today)
            if (task.createdAt) {
                const start = new Date(task.createdAt);
                const end = new Date();
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                totalDaysToComplete += diffDays;
            }
        }

        // 2. Count Overdue Tasks
        if (task.dueDate && task.dueDate < today && task.status !== 'done') {
            overdueCount++;
        }
    });

    // 3. Calculate Final Percentages & Averages
    const completionPercent = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
    
    let averageTime = 'Pending';
    if (doneTasks > 0) {
        const avgDays = Math.round(totalDaysToComplete / doneTasks);
        averageTime = avgDays === 0 ? '< 1d' : `${avgDays}d`;
    }

    // Package the results and send them back to the main thread
    self.postMessage({
        totalTasks,
        overdueCount,
        completionPercent,
        averageTime
    });
};