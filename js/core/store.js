
const Sp = JSON.parse(localStorage.getItem('taskMasterPrefs')) || {};


let state = {
    tasks: [],
    isLoading: true,
    filters: Sp.filters || {
        search: '',
        status: [],
        priority: [],
        assignee: [],
        label: [],
        dueState: 'all'
    },
    sort: Sp.sort || 'due-date',
    viewMode: Sp.viewMode || 'kanban',
    theme: Sp.theme || 'light' 
};


const Sub = new Set();

export const store = {
   
    getState: () => {
        return structuredClone(state);
    },

  
    setState: (updater) => {
        let newState;
        
        
        newState = { ...state, ...updater };
        

        
        if (JSON.stringify(state) !== JSON.stringify(newState)) {
            state = Object.freeze(newState); 
            
  
            const preftosave = {
                filters: state.filters,
                sort: state.sort,
                viewMode: state.viewMode,
                theme: state.theme
            };
            localStorage.setItem('taskMasterPrefs', JSON.stringify(preftosave));
            
            
            Sub.forEach(
                listener => 
                listener(state));
        }
    },

    subscribe: (listener) => {
        Sub.add(listener);
    },

    unsubscribe: (listener) => {
        Sub.delete(listener);
    }
};