const template = document.getElementById('task-card-template');
export function renderBoard(tasks) {
       document.getElementById('list-backlog').innerHTML = '';
       document.getElementById('list-in-progress').innerHTML = '';
         document.getElementById('list-review').innerHTML = '';
        document.getElementById('list-done').innerHTML = '';

    tasks.forEach(task => {
        const card = template.content.cloneNode(true);

    const cardele = card.querySelector('.task-card');

    cardele.dataset.id = task.id;
        card.querySelector('.card-title').textContent =task.title;

        card.querySelector('.card-text').textContent =task.description;
        
        card.querySelector('.card-priority').textContent= task.priority;
        
        card.querySelector('.card-person').textContent =task.assignee;
        
        card.querySelector('.card-date').textContent =task.dueDate;
          card.querySelector('.card-tags').textContent = task.labels;

         const colId = `list-${task.status}`;
        const targetCol = document.getElementById(colId);

        if (targetCol) {
            targetCol.appendChild(card);
        }
    });
}
