/**
 * js/core/store.js
 * Centralized, immutable state management.
 */

// 1. Check for saved UI preferences
const savedPrefs = JSON.parse(localStorage.getItem('taskMasterPrefs')) || {};

// 2. Initial application state
let state = {
    tasks: [],
    isLoading: true,
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

// 3. Array to hold all our listener functions
const subscribers = new Set();

export const store = {
    // Return a deeply cloned copy to prevent direct global variable modification
    getState: () => {
        return structuredClone(state);
    },

    // Accept either a partial object OR a function (updater) for immutable updates
    setState: (updater) => {
        let newState;
        
        if (typeof updater === 'function') {
            newState = updater(state);
        } else {
            newState = { ...state, ...updater };
        }

        // Only notify if the state actually changed
        if (JSON.stringify(state) !== JSON.stringify(newState)) {
            state = Object.freeze(newState); // Enforce immutability
            
            // Save preferences to local storage so they survive a refresh
            const preferencesToSave = {
                filters: state.filters,
                sort: state.sort,
                viewMode: state.viewMode,
                theme: state.theme
            };
            localStorage.setItem('taskMasterPrefs', JSON.stringify(preferencesToSave));
            
            // Notify subscribers only AFTER successful state change
            subscribers.forEach(listener => listener(state));
        }
    },

    // Add a listener
    subscribe: (listener) => {
        subscribers.add(listener);
        return () => subscribers.delete(listener);
    },

    // Remove a listener
    unsubscribe: (listener) => {
        subscribers.delete(listener);
    }
};