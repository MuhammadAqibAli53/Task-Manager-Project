import { store } from '../../core/store.js';

export function initFilterBar() {

    const searchInput = document.getElementById('task-search');
    const clearfilter = document.getElementById('clear-filters');
    let Timer;
    

if (clearfilter) {
   clearfilter.addEventListener('click', (e) => {
      
        if (searchInput) searchInput.value = '';

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


        store.set({
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
} else {
    console.error("Could not find the 'clear-filters' button in the HTML.");
}


    searchInput.addEventListener('input', (event) => {
        clearTimeout(Timer);
        Timer = setTimeout(() => {


            const searchTerm = event.target.value.toLowerCase();

            const currentFilters = store.get().filters;

            store.set({
                filters: { ...currentFilters, search: searchTerm }
            });
        }, 300);
    });


    const filterTypes = ['status', 'priority', 'assignee', 'label'];

    filterTypes.forEach(filterName => {
        const selectElement = document.getElementById(`filter-${filterName}`);

        if (selectElement) {
            selectElement.addEventListener('change', (event) => {


                const selectedValues = Array.from(event.target.selectedOptions).map(option => option.value);

                const currentFilters = store.get().filters;

                store.set({
                    filters: {
                        ...currentFilters,
                        [filterName]: selectedValues
                    }
                });
            });
        }
    });

   
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
        sortSelect.addEventListener('change', (event) => {
            // Update the sort state in the store
            store.set({
                sort: event.target.value
            });
        });
    }
}