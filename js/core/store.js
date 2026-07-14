/**
 * js/core/store.js
 */

class Store {
    constructor() {
        // --- NEW: 1. Check for saved preferences ---
        // Go to LocalStorage, grab the saved string, and parse it back into a JavaScript object.
        // If there is nothing saved yet, default to an empty object (|| {}).
        const savedPrefs = JSON.parse(localStorage.getItem('taskMasterPrefs')) || {};

        this.data = {
            tasks: [],
            isLoading: true,
            
            // --- NEW: 2. Load saved data, or use defaults ---
            filters: savedPrefs.filters || {
                search: '',
                status: [],
                priority: [],
                assignee: [],
                label: [],
                dueState: 'all'
            },
            sort: savedPrefs.sort || 'due-date',
            viewMode: savedPrefs.viewMode || 'kanban',
            theme: savedPrefs.theme || 'light' 
        };

        this.watchers = [];
    }

    get() {
        return this.data;
    }

    watch(watcherFunction) {
        this.watchers.push(watcherFunction);
    }

    set(newData) {
        this.data = { 
            ...this.data, 
            ...newData 
        };


        const preferencesToSave = {
            filters: this.data.filters,
            sort: this.data.sort,
            viewMode: this.data.viewMode,
            theme: this.data.theme
        };
        
        // Convert the object to a string and save it to the browser
        localStorage.setItem('taskMasterPrefs', JSON.stringify(preferencesToSave));

        this.watchers.forEach(watcher => {
            watcher(this.data);
        });
    }
}

export const store = new Store();