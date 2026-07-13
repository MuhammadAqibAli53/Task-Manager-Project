const root = document.documentElement;

const themeButton = document.getElementById('theme-toggle');
const newTaskButton = document.getElementById('btn-new-task');
const emptyTaskButton = document.getElementById('empty-create-task');
const clearFiltersButton = document.getElementById('clear-filters');
const viewKanbanButton = document.getElementById('view-kanban');
const viewListButton = document.getElementById('view-list');
const refreshAnalyticsButton = document.getElementById('refresh-analytics');

const taskDialog = document.getElementById('task-dialog');
const confirmDialog = document.getElementById('confirm-dialog');
const taskForm = document.getElementById('task-form');

const taskSearch = document.getElementById('task-search');
const filterStatus = document.getElementById('filter-status');
const filterPriority = document.getElementById('filter-priority');
const filterAssignee = document.getElementById('filter-assignee');
const filterLabel = document.getElementById('filter-label');
const filterDueState = document.getElementById('filter-due-state');
const sortBy = document.getElementById('sort-by');

const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');
const emptyState = document.getElementById('empty-state');
const syncStatus = document.getElementById('sync-status');
const savedViewSummary = document.getElementById('saved-view-summary');

const boardColumns = document.getElementById('kanban-board');
const tasksPanel = document.getElementById('tasks-panel');
const taskTableBody = document.getElementById('task-table-body');
const taskTemplate = document.getElementById('task-card-template');

const summaryOpen = document.getElementById('summary-open');
const summaryDueToday = document.getElementById('summary-due-today');
const summaryOverdue = document.getElementById('summary-overdue');
const summaryCompletion = document.getElementById('summary-completion');

const analyticsStatusCount = document.getElementById('analytics-status-count');
const analyticsCompletion = document.getElementById('analytics-completion');
const analyticsAverageTime = document.getElementById('analytics-average-time');

const listBacklog = document.getElementById('list-backlog');
const listInProgress = document.getElementById('list-in-progress');
const listReview = document.getElementById('list-review');
const listDone = document.getElementById('list-done');

const countBacklog = document.getElementById('count-backlog');
const countInProgress = document.getElementById('count-in-progress');
const countReview = document.getElementById('count-review');
const countDone = document.getElementById('count-done');

const defaultPrefs = {
  search: '',
  status: [],
  priority: [],
  assignee: [],
  label: [],
  dueState: 'all',
  sortBy: 'due-date',
  view: 'kanban',
};

const state = {
  users: [],
  tasks: [],
  prefs: readPrefs(),
};

state.prefs = { ...defaultPrefs, ...state.prefs };

function readPrefs() {
  try {
    return JSON.parse(localStorage.getItem('taskmaster-prefs')) || {};
  } catch {
    return {};
  }
}

function savePrefs() {
  localStorage.setItem('taskmaster-prefs', JSON.stringify(state.prefs));
}

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem('taskmaster-theme', theme);
}

function openDialog(dialog) {
  if (dialog && dialog.showModal) dialog.showModal();
}

function closeDialog(dialog) {
  if (dialog && dialog.open) dialog.close();
}

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function userName(userId) {
  const user = state.users.find((item) => item.id === userId);
  return user ? user.name : 'Unassigned';
}

function formatDate(value) {
  if (!value) return 'No date';
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function dueState(task) {
  if (task.status === 'done') return 'completed';
  if (!task.dueDate) return 'upcoming';

  const due = startOfDay(task.dueDate);
  const today = startOfDay(new Date());

  if (due < today) return 'overdue';
  if (due === today) return 'due-today';
  return 'upcoming';
}

function priorityRank(priority) {
  if (priority === 'high') return 0;
  if (priority === 'medium') return 1;
  if (priority === 'low') return 2;
  return 3;
}

function selectedValues(select) {
  return Array.from(select.selectedOptions).map((option) => option.value);
}

function setSelectedValues(select, values) {
  Array.from(select.options).forEach((option) => {
    option.selected = values.includes(option.value);
  });
}

function setLoading(isLoading) {
  loadingState.classList.toggle('is-hidden', !isLoading);
}

function showError(message) {
  errorMessage.textContent = message;
  errorState.classList.remove('is-hidden');
}

function hideError() {
  errorState.classList.add('is-hidden');
}

function updateSyncStatus() {
  syncStatus.textContent = navigator.onLine ? 'Online' : 'Offline';
}

function fillFilters() {
  filterAssignee.innerHTML = '';
  filterLabel.innerHTML = '';

  state.users.forEach((user) => {
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = user.name;
    filterAssignee.appendChild(option);
  });

  const labels = [...new Set(state.tasks.flatMap((task) => task.labels || []))];
  labels.forEach((label) => {
    const option = document.createElement('option');
    option.value = label;
    option.textContent = label;
    filterLabel.appendChild(option);
  });
}

function applyPrefsToControls() {
  taskSearch.value = state.prefs.search;
  setSelectedValues(filterStatus, state.prefs.status);
  setSelectedValues(filterPriority, state.prefs.priority);
  setSelectedValues(filterAssignee, state.prefs.assignee);
  setSelectedValues(filterLabel, state.prefs.label);
  filterDueState.value = state.prefs.dueState;
  sortBy.value = state.prefs.sortBy;
}

function updateSavedView() {
  const filters = [];

  if (state.prefs.search) filters.push('search');
  if (state.prefs.status.length) filters.push('status');
  if (state.prefs.priority.length) filters.push('priority');
  if (state.prefs.assignee.length) filters.push('assignee');
  if (state.prefs.label.length) filters.push('label');

  savedViewSummary.innerHTML = '';

  const first = document.createElement('span');
  first.textContent = `Filters: ${filters.length ? filters.join(', ') : 'none'}`;

  const second = document.createElement('span');
  second.textContent = `Sort: ${state.prefs.sortBy}`;

  const third = document.createElement('span');
  third.textContent = `Mode: ${state.prefs.view}`;

  savedViewSummary.append(first, second, third);
}

function taskMatches(task) {
  const search = state.prefs.search.trim().toLowerCase();

  if (search) {
    const text = [task.title, task.description, (task.labels || []).join(' '), userName(task.assignee)]
      .join(' ')
      .toLowerCase();

    if (!text.includes(search)) return false;
  }

  if (state.prefs.status.length && !state.prefs.status.includes(task.status)) return false;
  if (state.prefs.priority.length && !state.prefs.priority.includes(task.priority)) return false;
  if (state.prefs.assignee.length && !state.prefs.assignee.includes(task.assignee)) return false;
  if (state.prefs.label.length && !(task.labels || []).some((label) => state.prefs.label.includes(label))) return false;
  if (state.prefs.dueState !== 'all' && dueState(task) !== state.prefs.dueState) return false;

  return true;
}

function taskSort(a, b) {
  if (state.prefs.sortBy === 'priority') {
    return priorityRank(a.priority) - priorityRank(b.priority);
  }

  if (state.prefs.sortBy === 'created-at') {
    return startOfDay(b.createdAt) - startOfDay(a.createdAt);
  }

  if (state.prefs.sortBy === 'title') {
    return a.title.localeCompare(b.title);
  }

  const aDate = a.dueDate ? startOfDay(a.dueDate) : Number.MAX_SAFE_INTEGER;
  const bDate = b.dueDate ? startOfDay(b.dueDate) : Number.MAX_SAFE_INTEGER;
  return aDate - bDate;
}

function getVisibleTasks() {
  return state.tasks.filter(taskMatches).sort(taskSort);
}

function makeTaskCard(task) {
  const fragment = taskTemplate.content.cloneNode(true);

  fragment.querySelector('.task-card').dataset.id = task.id;
  fragment.querySelector('.task-card').dataset.state = dueState(task);
  fragment.querySelector('.card-priority').textContent = task.priority;
  fragment.querySelector('.card-title').textContent = task.title;
  fragment.querySelector('.card-text').textContent = task.description || 'No description';
  fragment.querySelector('.card-person').textContent = userName(task.assignee);
  fragment.querySelector('.card-date').textContent = formatDate(task.dueDate);
  fragment.querySelector('.card-tags').textContent = (task.labels || []).join(', ') || 'No labels';

  return fragment;
}

function makeTaskRow(task) {
  const row = document.createElement('tr');

  ['title', 'assignee', 'priority', 'due', 'status', 'actions'].forEach((column) => {
    const cell = document.createElement('td');

    if (column === 'title') cell.textContent = task.title;
    if (column === 'assignee') cell.textContent = userName(task.assignee);
    if (column === 'priority') cell.textContent = task.priority;
    if (column === 'due') cell.textContent = formatDate(task.dueDate);
    if (column === 'status') cell.textContent = task.status;
    if (column === 'actions') cell.textContent = 'Edit / Delete';

    row.appendChild(cell);
  });

  return row;
}

function renderSummary(tasks) {
  const open = tasks.filter((task) => task.status !== 'done').length;
  const dueToday = tasks.filter((task) => dueState(task) === 'due-today').length;
  const overdue = tasks.filter((task) => dueState(task) === 'overdue').length;
  const done = tasks.filter((task) => task.status === 'done').length;

  summaryOpen.textContent = open;
  summaryDueToday.textContent = dueToday;
  summaryOverdue.textContent = overdue;
  summaryCompletion.textContent = `${tasks.length ? Math.round((done / tasks.length) * 100) : 0}%`;
}

function renderAnalytics(tasks) {
  const done = tasks.filter((task) => task.status === 'done');
  const averageDays = done.length
    ? Math.round(
        done.reduce((total, task) => {
          return total + ((startOfDay(task.dueDate || task.createdAt) - startOfDay(task.createdAt)) / 86400000);
        }, 0) / done.length
      )
    : 0;

  analyticsStatusCount.textContent = tasks.length;
  analyticsCompletion.textContent = `${tasks.length ? Math.round((done.length / tasks.length) * 100) : 0}%`;
  analyticsAverageTime.textContent = `${averageDays}d`;
}

function renderTasks(tasks) {
  listBacklog.innerHTML = '';
  listInProgress.innerHTML = '';
  listReview.innerHTML = '';
  listDone.innerHTML = '';
  taskTableBody.innerHTML = '';

  const counts = {
    backlog: 0,
    'in-progress': 0,
    review: 0,
    done: 0,
  };

  tasks.forEach((task) => {
    counts[task.status] += 1;

    const card = makeTaskCard(task);

    if (task.status === 'backlog') listBacklog.appendChild(card);
    if (task.status === 'in-progress') listInProgress.appendChild(card);
    if (task.status === 'review') listReview.appendChild(card);
    if (task.status === 'done') listDone.appendChild(card);

    taskTableBody.appendChild(makeTaskRow(task));
  });

  countBacklog.textContent = counts.backlog;
  countInProgress.textContent = counts['in-progress'];
  countReview.textContent = counts.review;
  countDone.textContent = counts.done;
  emptyState.classList.toggle('is-hidden', tasks.length !== 0);
}

function render() {
  const visibleTasks = getVisibleTasks();
  renderSummary(visibleTasks);
  renderAnalytics(state.tasks);
  renderTasks(visibleTasks);
  updateSavedView();
  boardColumns.classList.toggle('is-hidden', state.prefs.view === 'list');
  tasksPanel.classList.toggle('is-hidden', state.prefs.view !== 'list');
}

function setView(view) {
  state.prefs.view = view;
  savePrefs();
  render();
}

function updateFiltersFromControls() {
  state.prefs.search = taskSearch.value.trim().toLowerCase();
  state.prefs.status = selectedValues(filterStatus);
  state.prefs.priority = selectedValues(filterPriority);
  state.prefs.assignee = selectedValues(filterAssignee);
  state.prefs.label = selectedValues(filterLabel);
  state.prefs.dueState = filterDueState.value;
  state.prefs.sortBy = sortBy.value;
  savePrefs();
  render();
}

async function loadData() {
  setLoading(true);
  hideError();

  try {
    const [usersResponse, tasksResponse] = await Promise.all([
      fetch('./data/users.json'),
      fetch('./data/tasks.json'),
    ]);

    if (!usersResponse.ok || !tasksResponse.ok) {
      throw new Error('Failed to load data');
    }

    state.users = await usersResponse.json();
    state.tasks = await tasksResponse.json();

    fillFilters();
    applyPrefsToControls();
    render();
    updateSyncStatus();
  } catch {
    showError('Could not load tasks.');
  } finally {
    setLoading(false);
  }
}

function clearFilters() {
  taskSearch.value = '';
  filterDueState.value = 'all';
  sortBy.value = 'due-date';

  [filterStatus, filterPriority, filterAssignee, filterLabel].forEach((select) => {
    Array.from(select.options).forEach((option) => {
      option.selected = false;
    });
  });

  state.prefs = {
    ...defaultPrefs,
    view: state.prefs.view,
  };

  savePrefs();
  render();
}

function setThemeFromStorage() {
  const savedTheme = localStorage.getItem('taskmaster-theme') || 'light';
  setTheme(savedTheme);
}

themeButton?.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);
});

newTaskButton?.addEventListener('click', () => openDialog(taskDialog));
emptyTaskButton?.addEventListener('click', () => openDialog(taskDialog));

newTaskButton?.addEventListener('click', resetDialogMode);
emptyTaskButton?.addEventListener('click', resetDialogMode);

document.querySelectorAll('[data-close-dialog]').forEach((button) => {
  button.addEventListener('click', () => {
    closeDialog(taskDialog);
    closeDialog(confirmDialog);
    resetDialogMode();
  });
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeDialog(taskDialog);
    closeDialog(confirmDialog);
  }
});

window.addEventListener('online', updateSyncStatus);
window.addEventListener('offline', updateSyncStatus);

taskSearch.addEventListener('input', updateFiltersFromControls);
[filterStatus, filterPriority, filterAssignee, filterLabel].forEach((select) => {
  select.addEventListener('change', updateFiltersFromControls);
});
filterDueState.addEventListener('change', updateFiltersFromControls);
sortBy.addEventListener('change', updateFiltersFromControls);

viewKanbanButton.addEventListener('click', () => setView('kanban'));
viewListButton.addEventListener('click', () => setView('list'));
clearFiltersButton.addEventListener('click', clearFilters);
refreshAnalyticsButton.addEventListener('click', render);

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  closeDialog(taskDialog);
});

setThemeFromStorage();
updateSyncStatus();
loadData();

let editingTaskId = '';

const taskIdInput = document.getElementById('task-id');
const taskDialogTitle = document.getElementById('task-dialog-title');

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

function resetDialogMode() {
  editingTaskId = '';
  taskIdInput.value = '';
  taskDialogTitle.textContent = 'New task';
}

function openTaskForEdit(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);

  if (!task) return;

  editingTaskId = taskId;
  fillTaskForm(task);
  openDialog(taskDialog);
}

document.addEventListener('click', (event) => {
  const menuButton = event.target.closest('.card-menu');

  if (!menuButton) return;

  const card = menuButton.closest('.task-card');

  if (!card || !card.dataset.id) return;

  openTaskForEdit(card.dataset.id);
});

taskForm.addEventListener('submit', (event) => {
  if (!editingTaskId) return;

  event.preventDefault();

  const taskIndex = state.tasks.findIndex((item) => item.id === editingTaskId);
  if (taskIndex === -1) return;

  const updatedTask = {
    ...state.tasks[taskIndex],
    title: taskTitle.value.trim(),
    description: taskDescription.value.trim(),
    priority: taskPriority.value,
    assignee: taskAssignee.value,
    dueDate: taskDueDate.value,
    status: taskStatus.value,
    labels: taskLabels.value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    createdAt: taskCreatedAt.value || state.tasks[taskIndex].createdAt,
  };

  state.tasks[taskIndex] = updatedTask;
  render();
  closeDialog(taskDialog);
  resetDialogMode();
  taskForm.reset();
});