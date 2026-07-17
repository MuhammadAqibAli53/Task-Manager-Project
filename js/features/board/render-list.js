export function renderTable(tasks) {
    const tableBody = document.getElementById('task-table-body');
    tableBody.innerHTML = '';

    tasks.forEach(task => {
            const row = document.createElement('tr');
        row.dataset.id = task.id;

        row.innerHTML = `
            <td><strong>${task.title}</strong>
            </td>
            <td>${task.assignee}
            </td>
            <td><span class="status-pill">
            ${task.priority}</span>
            </td>
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