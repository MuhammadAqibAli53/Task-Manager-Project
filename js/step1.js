const ui = {
  pageCopy: document.querySelector('.page-copy'),
  taskDialog: document.getElementById('task-dialog'),
  taskForm: document.getElementById('task-form'),
  confirmDialog: document.getElementById('confirm-dialog'),
  confirmMessage: document.getElementById('confirm-message'),
  confirmAction: document.getElementById('confirm-action'),
  newTaskButton: document.getElementById('btn-new-task'),
  emptyTaskButton: document.getElementById('empty-create-task'),
  closeButtons: document.querySelectorAll('[data-close-dialog]'),
  taskTitle: document.getElementById('task-title'),
  taskDescription: document.getElementById('task-description'),
  taskPriority: document.getElementById('task-priority'),
  taskAssignee: document.getElementById('task-assignee'),
  taskDueDate: document.getElementById('task-due-date'),
  taskStatus: document.getElementById('task-status'),
  taskLabels: document.getElementById('task-labels'),
  taskCreatedAt: document.getElementById('task-created-at'),
  summaryOpen: document.getElementById('summary-open'),
  summaryDueToday: document.getElementById('summary-due-today'),
  summaryOverdue: document.getElementById('summary-overdue'),
  summaryCompletion: document.getElementById('summary-completion'),
  listBacklog: document.getElementById('list-backlog'),
  listInProgress: document.getElementById('list-in-progress'),
  listReview: document.getElementById('list-review'),
  listDone: document.getElementById('list-done'),
  countBacklog: document.getElementById('count-backlog'),
  countInProgress: document.getElementById('count-in-progress'),
  countReview: document.getElementById('count-review'),
  countDone: document.getElementById('count-done'),
  emptyState: document.getElementById('empty-state'),
  taskTemplate: document.getElementById('task-card-template'),
};

const {
  pageCopy,
  taskDialog,
  taskForm,
  confirmDialog,
  confirmMessage,
  confirmAction,
  newTaskButton,
  emptyTaskButton,
  closeButtons,
  taskTitle,
  taskDescription,
  taskPriority,
  taskAssignee,
  taskDueDate,
  taskStatus,
  taskLabels,
  taskCreatedAt,
  summaryOpen,
  summaryDueToday,
  summaryOverdue,
  summaryCompletion,
  listBacklog,
  listInProgress,
  listReview,
  listDone,
  countBacklog,
  countInProgress,
  countReview,
  countDone,
  emptyState,
  taskTemplate,
} = ui;

const storageKey = 'taskmaster-step1-tasks';
let users = [];
let tasks = [];
let editingTaskId = '';
let deleteTaskId = '';

// Opens the task dialog.
function openDialog(dialog = taskDialog) {
  if (dialog && dialog.showModal) {
    dialog.showModal();
  }
}


// Closes the task dialog.
function closeDialog(dialog = taskDialog) {
  if (dialog && dialog.open) {
    dialog.close();
  }
}

// Gets saved tasks from the browser.

function loadSavedTasks() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Saves the current tasks list.

function saveTasks() {
  localStorage.setItem(storageKey, JSON.stringify(tasks));
}

// Turns a user id into a display name.

function userName(userId) {
  const user = users.find((item) => item.id === userId);
  return user ? user.name : 'Unassigned';
}


// Formats a date for the card text.

function formatDate(value) {
  if (!value) return 'No date';
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
// Checks whether a task is overdue, due today, or upcoming.

function dueState(task) {
  if (task.status === 'done') return 'done';
  if (!task.dueDate) return 'upcoming';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);

  if (due.getTime() < today.getTime()) return 'overdue';
  if (due.getTime() === today.getTime()) return 'due-today';
  return 'upcoming';
}

// Builds the next task id.

function getNextId() {
  const numbers = tasks.map((task) => Number(task.id.replace('tsk-', '')) || 0);
  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return `tsk-${String(next).padStart(3, '0')}`;
}


// Fills the assignee dropdown with users.

function fillAssignees() {
  taskAssignee.innerHTML = '<option value="">Select person</option>';

  users.forEach((user) => {
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = user.name;
    taskAssignee.appendChild(option);
  });
}

// Creates one task card from the template.
function makeCard(task) {
  const fragment = taskTemplate.content.cloneNode(true);
  const card = fragment.querySelector('.task-card');

  card.dataset.state = dueState(task);
  card.querySelector('.card-priority').textContent = task.priority;
  card.querySelector('.card-title').textContent = task.title;
  card.querySelector('.card-text').textContent = task.description || 'No description';
  card.querySelector('.card-person').textContent = userName(task.assignee);
  card.querySelector('.card-date').textContent = formatDate(task.dueDate);
  card.querySelector('.card-tags').textContent = (task.labels || []).join(', ') || 'No labels';

  return fragment;
}

// Empties all task columns before render.


function clearLists() {
  listBacklog.innerHTML = '';
  listInProgress.innerHTML = '';
  listReview.innerHTML = '';
  listDone.innerHTML = '';
}

// Updates the small dashboard counters.
function renderStats() {
  const openTasks = tasks.filter((task) => task.status !== 'done');

  summaryOpen.textContent = openTasks.length;
  summaryDueToday.textContent = tasks.filter((task) => dueState(task) === 'due-today').length;
  summaryOverdue.textContent = tasks.filter((task) => dueState(task) === 'overdue').length;
  summaryCompletion.textContent = `${tasks.length ? Math.round((tasks.filter((task) => task.status === 'done').length / tasks.length) * 100) : 0}%`;
}


// Renders all task cards on the page.
function renderTasks() {
  clearLists();

  const counts = {
    backlog: 0,
    'in-progress': 0,
    review: 0,
    done: 0,
  };

  tasks.forEach((task) => {
    counts[task.status] += 1;

    const card = makeCard(task);

    if (task.status === 'backlog') listBacklog.appendChild(card);
    if (task.status === 'in-progress') listInProgress.appendChild(card);
    if (task.status === 'review') listReview.appendChild(card);
    if (task.status === 'done') listDone.appendChild(card);
  });

  countBacklog.textContent = counts.backlog;
  countInProgress.textContent = counts['in-progress'];
  countReview.textContent = counts.review;
  countDone.textContent = counts.done;

  emptyState.classList.toggle('is-hidden', tasks.length !== 0);
  renderStats();
}


// Clears the form before a new task is added.

function resetForm() {
  taskForm.reset();
  taskPriority.value = 'low';
  taskStatus.value = 'backlog';
  taskCreatedAt.value = new Date().toISOString().slice(0, 10);
}

// Clears edit mode and puts the form back to new task mode.
function resetDialogMode() {
  editingTaskId = '';
  if (taskIdInput) taskIdInput.value = '';
  if (taskDialogTitle) taskDialogTitle.textContent = 'New task';
}

// Hides every open card menu.
function closeCardMenus() {
  document.querySelectorAll('.card-menu-panel').forEach((panel) => {
    panel.classList.add('is-hidden');
  });
}

// Opens or closes the small menu on one task card.
function toggleCardMenu(card) {
  const menu = card.querySelector('.card-menu-panel');
  if (!menu) return;

  const isOpen = !menu.classList.contains('is-hidden');
  closeCardMenus();

  if (!isOpen) {
    menu.classList.remove('is-hidden');
  }
}

// Fills the form so a task can be edited.
function fillTaskForm(task) {
  taskIdInput.value = task.id;
  taskDialogTitle.textContent = 'Edit task';
  taskTitle.value = task.title;
  taskDescription.value = task.description || '';
  taskPriority.value = task.priority;
  taskAssignee.value = task.assignee || '';
  taskDueDate.value = task.dueDate || '';
  taskStatus.value = task.status;
  taskLabels.value = (task.labels || []).join(', ');
  taskCreatedAt.value = task.createdAt || new Date().toISOString().slice(0, 10);
}

// Opens one task in edit mode.
function openTaskForEdit(taskId) {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;

  editingTaskId = taskId;
  fillTaskForm(task);
  closeCardMenus();
  openDialog();
}

// Opens the delete confirmation dialog.
function askDeleteTask(taskId) {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;

  deleteTaskId = taskId;
  if (confirmMessage) {
    confirmMessage.textContent = `Delete "${task.title}"?`;
  }

  closeCardMenus();
  openDialog(confirmDialog);
}

// Removes the selected task.
function deleteTask() {
  if (!deleteTaskId) return;

  tasks = tasks.filter((task) => task.id !== deleteTaskId);
  deleteTaskId = '';
  saveTasks();
  renderTasks();
  closeDialog(confirmDialog);
}

// Reads the form and adds a new task.

function addTask(event) {
  event.preventDefault();

  const title = taskTitle.value.trim();
  if (!title) return;

  const newTask = {
    id: getNextId(),
    title,
    description: taskDescription.value.trim(),
    priority: taskPriority.value,
    assignee: taskAssignee.value,
    dueDate: taskDueDate.value,
    labels: taskLabels.value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    createdAt: taskCreatedAt.value || new Date().toISOString().slice(0, 10),
    status: taskStatus.value,
  };

  tasks = [newTask, ...tasks];
  saveTasks();
  renderTasks();
  closeDialog();
  resetForm();
  resetDialogMode();
}

// Reads the form and adds a new task.

function loadData() {
  fetch('./data/users.json')
    .then((response) => response.json())
    .then((data) => {
      users = data;
      fillAssignees();

      return fetch('./data/tasks.json');
    })
    .then((response) => response.json())
    .then((data) => {
      const savedTasks = loadSavedTasks();
      tasks = savedTasks.length ? savedTasks : data;
      renderTasks();
    })
    .catch(() => {
      tasks = loadSavedTasks();
      renderTasks();
    });
}

// Loads the starter data and shows it.

if (pageCopy) {
  pageCopy.textContent = 'Step 1: task add, edit, and delete logic is ready.';
}

newTaskButton?.addEventListener('click', () => {
  resetForm();
  resetDialogMode();
  openDialog();
});

emptyTaskButton?.addEventListener('click', () => {
  resetForm();
  resetDialogMode();
  openDialog();
});

closeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const dialog = button.closest('dialog');
    closeDialog(dialog);

    if (dialog === taskDialog) {
      resetForm();
      resetDialogMode();
    }

    if (dialog === confirmDialog) {
      deleteTaskId = '';
    }
  });
});

function saveTask(event) {
  event.preventDefault();

  const title = taskTitle.value.trim();
  if (!title) return;

  const taskData = {
    title,
    description: taskDescription.value.trim(),
    priority: taskPriority.value,
    assignee: taskAssignee.value,
    dueDate: taskDueDate.value,
    labels: taskLabels.value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    createdAt: taskCreatedAt.value || new Date().toISOString().slice(0, 10),
    status: taskStatus.value,
  };

  if (editingTaskId) {
    const taskIndex = tasks.findIndex((item) => item.id === editingTaskId);

    if (taskIndex !== -1) {
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...taskData,
        id: editingTaskId,
      };
    }
  } else {
    tasks = [
      {
        id: getNextId(),
        ...taskData,
      },
      ...tasks,
    ];
  }

  saveTasks();
  renderTasks();
  closeDialog();
  taskForm.reset();
  resetForm();
  resetDialogMode();
}

document.addEventListener('click', (event) => {
  const menuToggle = event.target.closest('.card-menu-toggle');
  const menuAction = event.target.closest('.card-menu-item');

  if (menuToggle) {
    const card = menuToggle.closest('.task-card');
    if (card) toggleCardMenu(card);
    return;
  }

  if (menuAction) {
    const card = menuAction.closest('.task-card');
    if (!card || !card.dataset.id) return;

    if (menuAction.dataset.action === 'edit') {
      openTaskForEdit(card.dataset.id);
    }

    if (menuAction.dataset.action === 'delete') {
      askDeleteTask(card.dataset.id);
    }

    return;
  }

  if (!event.target.closest('.card-menu-wrap')) {
    closeCardMenus();
  }

  const card = event.target.closest('.task-card');

  if (!card || !card.dataset.id) return;
});

newTaskButton?.addEventListener('click', resetDialogMode);
emptyTaskButton?.addEventListener('click', resetDialogMode);

closeButtons.forEach((button) => {
  button.addEventListener('click', resetDialogMode);
});

taskForm?.removeEventListener('submit', addTask);
taskForm?.addEventListener('submit', saveTask);

confirmAction?.addEventListener('click', deleteTask);

loadData();