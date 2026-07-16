import { store } from '../../core/store.js';


export async function initFilterBar() {
    const searchIN = document.getElementById('task-search');
    const clearfil = document.getElementById('clear-filters');
    let Timer;

    try {
        const response = await fetch('./data/users.json'); 

        const users = await response.json();


        const assigneeSelect = document.getElementById('filter-assignee');

        if (assigneeSelect) {

            assigneeSelect.innerHTML = ''; 

            
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.name;        
                option.textContent = user.name;  
                assigneeSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Could not load users.json:", error);
    }

    if (clearfil) {
        clearfil.addEventListener('click', (e) => {

            if (searchIN) searchIN.value = '';

            const filterTypes = ['status', 'priority', 'assignee', 'label'];
           
           
            filterTypes.forEach(filterName => {
                const selectElement = document.getElementById(`filter-${filterName}`);
              
                if (selectElement) {
                    Array.from(selectElement.options).forEach(option => {
                        option.selected = false;
                    });
                }
            });

            const sortSelect = document.getElementById('sort-by');
            if (sortSelect) sortSelect.value = 'due-date';

            store.setState({
                filters: {
                    search: '',
                    status: [],
                    priority: [],
                    assignee: [],
                    label: [],
                    dueState: 'all'
                },
                sort: 'due-date'
            });
        });
    }

    // 3. THE SEARCH BAR LOGIC
    if (searchIN) {
        searchIN.addEventListener('input', (event) => {
            clearTimeout(Timer);
            Timer = setTimeout(() => {
                const searchTerm = event.target.value.toLowerCase();
                const currentFilters = store.getState().filters;

                store.setState({
                    filters: { ...currentFilters, search: searchTerm }
                });
            }, 300);
        });
    }

    // 4. THE DROPDOWN FILTER LOGIC (Handles Status, Priority, Assignee, Label)
    const filterTypes = ['status', 'priority', 'assignee', 'label'];

    filterTypes.forEach(filterName => {
        const selectElement = document.getElementById(`filter-${filterName}`);

        if (selectElement) {
            selectElement.addEventListener('change', (event) => {
                const selectedValues = Array.from(event.target.selectedOptions).map(option => option.value);
                const currentFilters = store.getState().filters;

                store.setState({
                    filters: {
                        ...currentFilters,
                        [filterName]: selectedValues
                    }
                });
            });
        }
    });

    // 5. THE SORTING LOGIC
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
        sortSelect.addEventListener('change', (event) => {
            store.setState({
                sort: event.target.value
            });
        });
    }
}