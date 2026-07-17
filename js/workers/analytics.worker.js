self.onmessage = function(event) {
    const tasks = event.data;

    if (!tasks ) 
        {
            return;
        }

    const totalTasks = tasks.length;
    const today = new Date().toISOString().split('T')[0];

    let overdueCount = 0;
    let doneTasks = 0;
    let totalDaysToComplete = 0;

    tasks.forEach(task => {

        if (task.status === 'done') {
            doneTasks++;

            if (task.createdAt) {

                const start =new Date(task.createdAt);
                const end= new Date();
                const diffTime= Math.abs(end - start);
                const diffDays= Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                totalDaysToComplete += diffDays;
            }
        }


        if (task.dueDate && task.dueDate < today && task.status !== 'done') {
            overdueCount++;
        }
    });

    const completionPercent = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
    
    let averageTime = 'Pending';
    if (doneTasks > 0) {
        const avgDays = Math.round(totalDaysToComplete / doneTasks);
        averageTime = avgDays === 0 ? '< 1d' : `${avgDays}d`;
    }

    self.postMessage({
        totalTasks,
        overdueCount,
        completionPercent,
        averageTime
    });
};