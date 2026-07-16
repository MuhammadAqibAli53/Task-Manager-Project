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

            const sort = document.getElementById('sort-by');
            if (sort) {
                sort.value = 'due-date';
            }

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

 
    if (searchIN) {
        searchIN.addEventListener('input', (event) => {
            clearTimeout(Timer);
            Timer = setTimeout(() => {
                const searchTerm = event.target.value.toLowerCase();
                const currfilter = store.getState().filters;

                store.setState({
                    filters: { ...currfilter, search: searchTerm }
                });
            }, 300);
        });
    }


    const filterTypes = ['status', 'priority', 'assignee', 'label'];

    filterTypes.forEach(filterName => {
        const selectElement = document.getElementById(`filter-${filterName}`);

        if (selectElement) {
            selectElement.addEventListener('change', (event) => {
                const selvalue = Array.from(event.target.selectedOptions).map(option => option.value);
                const currfilter = store.getState().filters;

                store.setState({
                    filters: {
                        ...currfilter,
                        [filterName]: selvalue
                    }
                });
            });
        }
    });


    const sort = document.getElementById('sort-by');
    if (sort) {
        sort.addEventListener('change', (event) => {
            store.setState({
                sort: event.target.value
            });
        });
    }
}