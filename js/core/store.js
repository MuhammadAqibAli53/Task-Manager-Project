/**
 * js/core/store.js
 * A simple place to keep our app data and tell the screen when it changes.
 */

class Store {
    constructor() {
        // 1. THE DATA: This is just a plain object holding our app's information.
        this.data = {
            tasks: [],
            isLoading: true
        };

        // 2. THE WATCHERS: A list of functions (like our UI components) 
        // that want to be notified whenever the data changes.
        this.watchers = [];
    }

    /**
     * Read the current data.
     */
    get() {
        return this.data;
    }

    /**
     * Add a watcher (a component that says "Tell me when data changes!")
     */
    watch(watcherFunction) {
        this.watchers.push(watcherFunction);
    }

    /**
     * Change the data and tell the watchers about it.
     */
    set(newData) {
        // Combine the old data with the new data
        this.data = { 
            ...this.data, 
            ...newData 
        };

        // Shout it out! Loop through every watcher and give them the new data.
        this.watchers.forEach(watcher => {
            watcher(this.data);
        });
    }
}

// Export one single store that the whole app shares
export const store = new Store();